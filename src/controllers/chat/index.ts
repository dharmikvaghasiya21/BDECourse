import { chatModel, studentsModel } from "../../database";

export const get_chat_between_users = async (req, res) => {
    const { senderId, receiverId } = req.query;
    const messages = await studentsModel.find({
        $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId }
        ]
    }).sort({ createdAt: 1 });
    return res.status(200).json({ success: true, messages });
};



// Get all chat conversations
export const get_all_chats = async (req, res) => {
    const allChats = await chatModel.find().populate("senderId receiverId", "name role");
    return res.status(200).json({ success: true, allChats });
};

// Delete specific chat
export const delete_chat = async (req, res) => {
    const { chatId } = req.body;
    await chatModel.findByIdAndDelete(chatId);
    return res.status(200).json({ success: true, message: "Chat deleted" });
};

// Block user
export const block_user = async (req, res) => {
    const { userId } = req.body;
    await studentsModel.findByIdAndUpdate(userId, { isBlocked: true });
    return res.status(200).json({ message: "User Blocked" });
};

