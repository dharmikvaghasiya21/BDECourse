import { Request, Response } from "express";
import { chatModel, studentsModel } from "../../database";
import { responseMessage } from "../../helper";
import { object } from "joi";
import { apiResponse } from "../../common";

let ObjectId = require("mongoose").Types.ObjectId;


export const send_message = async (req, res) => {
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
export const get_all_chats = async (req, res) => {
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
  try {
    const { id } = req.body
    await chatModel.findOneAndDelete({ _id: new ObjectId(id) });
    return res.status(200).json(new apiResponse(200, "Chat deleted successfully.", {}, {}));
  } catch (error) {
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
  }
};

export const block_user = async (req, res) => {
  try {
    const { id } = req.body;
    await studentsModel.findOneAndUpdate({ _id: new ObjectId(id) }, { isBlocked: true });
    return res.status(200).json(new apiResponse(200, "User blocked successfully.", {}, {}));
  } catch (error) {
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
  }
};
