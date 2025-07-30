import { Server } from 'socket.io';
import { chatModel, userModel } from '../database';
import { countData, findAllWithPopulateWithSorting, getData, getDataWithSorting } from './database_sevice';
import { ADMIN_ROLES } from '../common';

let ObjectId = require("mongoose").Types.ObjectId;


export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {

    socket.on('join', (userId) => {
      socket.join(userId);
    });

    socket.on('send_message', async ({ senderId, receiverId, message }) => {
      try {
        const newMsg = await chatModel.create({ senderId, receiverId, message, seen: false });

        // Realtime message to receiver
        io.to(receiverId).emit('receive_message', newMsg);

        const unreadCount = await chatModel.countDocuments({
          receiverId, seen: false, isDeleted: { $ne: true },
        });
        io.to(receiverId).emit('unread_count', { count: unreadCount });
      } catch (err) {
        console.error(" Error in send_message:", err);
      }
    });

    socket.on('edit_message', async ({ messageId, newMessage }) => {
      try {
        const updated = await chatModel.findOneAndUpdate(
          { _id: new ObjectId(messageId) },
          { message: newMessage },
          { new: true }
        );
        io.emit('message_updated', updated);
      } catch (err) {
        console.error("Error in edit_message:", err);
      }
    });


    socket.on('delete_message', async ({ messageId }) => {
      try {
        if (!ObjectId.isValid(messageId)) { return socket.emit('message_deleted_error', { message: 'Invalid ID' }); }

        const deleted = await chatModel.deleteOne({ _id: new ObjectId(messageId) });
        if (!deleted) { return socket.emit('message_deleted_error', { message: 'Message not found' }); }

        io.emit('message_deleted', { messageId });
      } catch (err) {
        socket.emit('message_deleted_error', { message: 'Internal error', error: err.message });
      }
    });


    socket.on('get_all_chats', async ({ senderId, receiverId, page }) => {
      try {
        if (!senderId || !receiverId) {
          return socket.emit('get_all_chats_error', { message: 'senderId and receiverId is required' });
        }
        let options: any = {}, criteria: any = {}
        if (!page) page = 1
        let limit = 25;
        options.sort = { createdAt: -1 }

        if (page && limit) {
          options.skip = (parseInt(page) - 1) * limit;
          options.limit = limit;
        }

        criteria.$or = [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
        const populateModel = [
          { path: 'senderId', select: 'name role' },
          { path: 'receiverId', select: 'name role' }
        ];
        const allChats = await findAllWithPopulateWithSorting(chatModel, criteria, {}, options, populateModel);
        socket.emit('get_all_chats_response', allChats);
      } catch (error) {
        console.error("Socket get_all_chats error:", error);
        socket.emit('get_all_chats_error', { message: 'Internal server error', error });
      }
    });


    socket.on('delete_conversation', async ({ senderId, receiverId }) => {
      try {
        const result = await chatModel.deleteMany({
          $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        });

        io.to(senderId).emit('conversation_deleted', {
          receiverId,
          deletedCount: result.deletedCount,
        });
      } catch (err) {
        socket.emit('conversation_delete_error', { message: 'Internal error', error: err.message });
      }
    });



    socket.on('get_unread_count', async ({ receiverId }) => {
      try {
        const count = await chatModel.find({
          receiverId,
          seen: false,
          isDeleted: { $ne: true },
        });
        io.to(receiverId).emit('unread_count', { count });
      } catch (err) {
        console.error("Error in get_unread_count:", err);
      }
    });

    socket.on('mark_seen', async ({ senderId, receiverId }) => {
      try {
        let data = await chatModel.updateMany(
          { senderId: new ObjectId(senderId), receiverId: new ObjectId(receiverId), seen: false },
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

    socket.on('mark_seen_', async ({ senderId, receiverId }) => {
      try {
        let data = await chatModel.updateMany(
          { senderId: new ObjectId(senderId), receiverId: new ObjectId(receiverId), seen: false },
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

    socket.on('get_unread_users', async ({ userId }) => {
      try {
        if (!userId) return socket.emit('get_unread_users_error', { message: 'userId is required' });

        const userObjectId = new ObjectId(userId);

        const allChats = await chatModel.aggregate([
          {
            $match: {
              $or: [
                { senderId: userObjectId },
                { receiverId: userObjectId }
              ],
              isDeleted: { $ne: true }
            }
          },
          {
            $sort: { createdAt: -1 }
          },
          {
            $group: {
              _id: {
                $cond: [
                  { $eq: ["$senderId", userObjectId] },
                  "$receiverId",
                  "$senderId"
                ]
              },
              lastMessage: { $first: "$message" },
              lastMessageTime: { $first: "$createdAt" },
              lastMessageSeen: { $first: "$seen" },
              senderId: { $first: "$senderId" },
              receiverId: { $first: "$receiverId" },
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'userInfo'
            }
          },
          { $unwind: '$userInfo' },
          {
            $lookup: {
              from: 'chats',
              let: { chatUserId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$senderId', '$$chatUserId'] },
                        { $eq: ['$receiverId', userObjectId] },
                        { $eq: ['$seen', false] },
                        { $ne: ['$isDeleted', true] }
                      ]
                    }
                  }
                },
                { $count: 'unreadCount' }
              ],
              as: 'unreadMessages'
            }
          },
          {
            $addFields: {
              unreadCount: {
                $ifNull: [{ $arrayElemAt: ['$unreadMessages.unreadCount', 0] }, 0]
              }
            }
          },
          {
            $project: {
              userId: '$_id',
              name: {
                $concat: ['$userInfo.firstName', ' ', '$userInfo.lastName']
              },
              image: '$userInfo.image',
              role: '$userInfo.role',
              lastMessage: 1,
              lastMessageTime: 1,
              unreadCount: 1
            }
          },
          { $sort: { lastMessageTime: -1 } }
        ]);

        socket.emit('unread_users_list', allChats);
      } catch (err) {
        console.error("Error in get_unread_users:", err);
        socket.emit('get_unread_users_error', { message: 'Internal error', error: err.message });
      }
    });

    socket.on('search_users', async ({ senderId, search }) => {
      try {
        const userObjectId = new ObjectId(senderId);
        const searchRegex = search ? new RegExp(search, 'si') : null;
        if (search) {
          const users = await userModel.aggregate([
            {
              $match: {
                isDeleted: false,
                // role: ADMIN_ROLES.USER,
                _id: { $ne: userObjectId },
                $or: [
                  { firstName: { $regex: searchRegex } },
                  { lastName: { $regex: searchRegex } }
                ]
              }
            },
            {
              $lookup: {
                from: 'chats',
                let: { userId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$senderId', '$$userId'] }, // From this user
                          { $eq: ['$receiverId', userObjectId] }, // To current user
                          { $eq: ['$seen', false] },
                          { $ne: ['$isDeleted', true] }
                        ]
                      }
                    }
                  },
                  { $count: 'unreadCount' }
                ],
                as: 'unreadMessages'
              }
            },
            {
              $lookup: {
                from: 'chats',
                let: { userId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $or: [
                          {
                            $and: [
                              { $eq: ['$senderId', '$$userId'] },
                              { $eq: ['$receiverId', userObjectId] }
                            ]
                          },
                          {
                            $and: [
                              { $eq: ['$senderId', userObjectId] },
                              { $eq: ['$receiverId', '$$userId'] }
                            ]
                          }
                        ]
                      }
                    }
                  },
                  { $sort: { createdAt: -1 } },
                  { $limit: 1 }
                ],
                as: 'lastChat'
              }
            },
            {
              $addFields: {
                unreadCount: {
                  $ifNull: [{ $arrayElemAt: ['$unreadMessages.unreadCount', 0] }, 0]
                },
                lastMessage: { $arrayElemAt: ['$lastChat.message', 0] },
                lastMessageTime: { $arrayElemAt: ['$lastChat.createdAt', 0] }
              }
            },
            {
              $project: {
                _id: 1,
                name: { $concat: ['$firstName', ' ', '$lastName'] },
                image: 1,
                role: 1,
                unreadCount: 1,
                lastMessage: 1,
                lastMessageTime: 1
              }
            },
            {
              $sort: {
                unreadCount: -1,
                lastMessageTime: -1
              }
            }
          ]);

          socket.emit('search_users_result', users);
        }
      } catch (err) {
        console.error("Error in search_users:", err);
        socket.emit('search_users_error', { message: 'Internal error', error: err.message });
      }
    });


    socket.on('disconnect', () => {
      console.log('Disconnected:', socket.id);
    });
  });
};
