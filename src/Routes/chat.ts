import express from "express";
import { chatController } from '../controllers';
import { adminJWT } from "../helper/jwt";

const router = express.Router();

router.get("/get", chatController.get_chat_between_users);
router.post("/send", chatController.send_message);

router.use(adminJWT)
router.get("/getall", chatController.get_all_chats);
router.delete("/delete/:id", chatController.delete_chat);
router.post("/block", chatController.block_user);


export default router;
