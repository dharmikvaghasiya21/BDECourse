import { Server } from 'socket.io';
import { chatModel } from '../database';

let ObjectId = require("mongoose").Types.ObjectId;


export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log('🔌 Connected:', socket.id);

    socket.on('join', (userId) => {
      socket.join(userId);
    });

    socket.on('send_message', async ({ senderId, receiverId, message }) => {
      try {
        const newMsg = await chatModel.create({ senderId, receiverId, message, seen: false });

        // Realtime message to receiver
        io.to(receiverId).emit('receive_message', newMsg);

        const unreadCount = await chatModel.countDocuments({
          receiverId,
          seen: false,
          isDeleted: { $ne: true },
        });
        io.to(receiverId).emit('unread_count', { count: unreadCount });
      } catch (err) {
        console.error(" Error in send_message:", err);
      }
    });

    socket.on('edit_message', async ({ messageId, newMessage }) => {
      try {
        const updated = await chatModel.findByIdAndUpdate(
          messageId,
          { message: newMessage },
          { new: true }
        );
        io.emit('message_updated', updated);
      } catch (err) {
        console.error("Error in edit_message:", err);
      }
    });

    socket.on('delete_message', async ({ messageId }) => {
      if (!ObjectId)
        return socket.emit('message_deleted_error', { message: 'Invalid ID' });

      const deleted = await chatModel.findByIdAndUpdate(messageId, { isDeleted: true });
      socket.emit('message_deleted_error', !deleted ? { message: 'Not found' } : null);
      if (deleted) io.emit('message_deleted', { messageId });
    });



    socket.on('get_all_chats', async ({ senderId, receiverId }) => {
      try {
        if (!senderId || !receiverId) {
          return socket.emit('get_all_chats_error', { message: 'senderId અને receiverId જરૂરી છે' });
        }

        const allChats = await chatModel.find({
          $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId }
          ],
          isDeleted: { $ne: true }
        })
          .sort({ createdAt: 1 })
          .populate('senderId', 'name role')
          .populate('receiverId', 'name role');

        socket.emit('get_all_chats_response', allChats);
      } catch (error) {
        console.error("Socket get_all_chats error:", error);
        socket.emit('get_all_chats_error', { message: 'Internal server error', error });
      }
    });


    socket.on('delete_conversation', async ({ senderId, receiverId }) => {
      try {
        await chatModel.updateMany(
          {
            $or: [
              { senderId, receiverId },
              { senderId: receiverId, receiverId: senderId },
            ],
          },
          { isDeleted: true }
        );
        io.to(senderId).emit('conversation_deleted', { receiverId });
      } catch (err) {
        console.error("Error in delete_conversation:", err);
      }
    });

    socket.on('mark_seen', async ({ senderId, receiverId }) => {
      try {
        await chatModel.updateMany(
          { senderId, receiverId, seen: false },
          { seen: true }
        );

        io.to(senderId).emit('messages_seen', { receiverId });

        const unreadCount = await chatModel.countDocuments({
          receiverId,
          seen: false,
          isDeleted: { $ne: true },
        });
        io.to(receiverId).emit('unread_count', { count: unreadCount });
      } catch (err) {
        console.error(" Error in mark_seen:", err);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected:', socket.id);
    });
  });
};
