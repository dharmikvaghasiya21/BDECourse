import express from "express";
import { chatController } from '../controllers';
import { adminJWT } from "../helper/jwt";

const router = express.Router();

router.get("/get", chatController.get_chat_between_users);

router.use(adminJWT)
router.get("/getall", chatController.get_all_chats);
router.post("/delete", chatController.delete_chat);
router.post("/block", chatController.block_user);


export default router;
