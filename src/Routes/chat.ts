import express from "express";
import { chatController } from '../controllers';
import { adminJWT } from "../helper/jwt";

const
    router = express.Router();

    // router.get('/', chatController.getChats);
    // router.post("/block/:id", chatController.block_user);

router.use(adminJWT)
router.post("/send", chatController.send_message);
router.get("/getall", chatController.get_all_chats);
router.delete("/delete/:id", chatController.delete_chat);
router.delete("/delete", chatController.delete_all_chats);
router.post("/edit", chatController.edit_chat);


export default router;
