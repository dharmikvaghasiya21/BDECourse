import { Server } from 'socket.io';
import { chatModel } from '../database';

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
      const newMsg = await chatModel.create({ senderId, receiverId, message });
      io.to(receiverId).emit('receive_message', newMsg);
    });

    socket.on('edit_message', async ({ messageId, newMessage }) => {
      const updated = await chatModel.findByIdAndUpdate(messageId, { message: newMessage }, { new: true });
      io.emit('message_updated', updated);
    });

    socket.on('delete_message', async ({ messageId }) => {
      await chatModel.findByIdAndUpdate(messageId, { isDeleted: true });
      io.emit('message_deleted', { messageId });
    });

    socket.on('delete_conversation', async ({ senderId, receiverId }) => {
      await chatModel.updateMany(
        {
          $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId }
          ]
        },
        { isDeleted: true }
      );
      io.to(senderId).emit('conversation_deleted', { receiverId });
    });

    socket.on('mark_seen', async ({ senderId, receiverId }) => {
      await chatModel.updateMany({ senderId, receiverId, seen: false }, { seen: true });
      io.to(senderId).emit('messages_seen', { receiverId });
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected:', socket.id);
    });
  });
};
