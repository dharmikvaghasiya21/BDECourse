import { Request, Response } from "express";
import { chatModel, studentsModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";
import { apiResponse } from "../../common";

let ObjectId = require("mongoose").Types.ObjectId;

export const send_message = async (req, res) => {
  reqInfo(req);
  try {
    const { senderId, receiverId, message } = req.body;

    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }
    const chat = await new chatModel({ senderId, receiverId, message }).save();
    return res.status(200).json(new apiResponse(200, "Message sent successfully.", { chat }, {}));
  } catch (error) {
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
  }
};

export const edit_chat = async (req, res) => {
  reqInfo(req);
  try {
    const body = req.body;

    if (!body.id || !body.message) { return res.status(400).json(new apiResponse(400, "ID and message are required.", {}, {})); }

    const updatedChat = await chatModel.findOneAndUpdate({ _id: new ObjectId(body.id) }, { message: body.message }, { new: true });
    if (!updatedChat) return res.status(404).json(new apiResponse(404, "Chat not found.", {}, {}));
    return res.status(200).json(new apiResponse(200, "Message updated.", { updatedChat }, {}));
  } catch (error) {
    console.error("Edit Chat Error:", error);
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
  }
};


export const get_all_chats = async (req, res) => {
  reqInfo(req);
  try {
    const { senderId, receiverId } = req.query;

    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: "Both senderId and receiverId are required."
      });
    }

    const allChats = await chatModel.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "name role")
      .populate("receiverId", "name role");

    return res.status(200).json(new apiResponse(200, "All chats retrieved successfully.", { allChats }, {}));
  } catch (error) {
    console.error("Get all chats error:", error);
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
  };
};


export const delete_chat = async (req, res) => {
  reqInfo(req);
  try {
    const { id } = req.params;
    const deleted = await chatModel.findOneAndUpdate({ _id: new ObjectId(id), isDeleted: false }, { isDeleted: true }, { new: true });
    if (!deleted) return res.status(404).json(new apiResponse(404, "Chat not found", {}, {}));

    return res.status(200).json(new apiResponse(200, "Chat deleted (soft)", deleted, {}));
  } catch (error) {
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
  }
};

// export const block_user = async (req, res) => {
//   reqInfo(req);
//   try {
//     const { id } = req.params;

//     const user = await studentsModel.findOneAndUpdate({ _id: new ObjectId(id), isBlocked: false, isDeleted: false },{ isBlocked: true },{ new: true });

//     if (!user) {return res.status(404).json(new apiResponse(404, "User not found or already blocked.", {}, {}));}

//     return res.status(200).json(new apiResponse(200, "User blocked successfully.", { isBlocked: true }, {}));
//   } catch (error) {
//     return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
//   }
// };