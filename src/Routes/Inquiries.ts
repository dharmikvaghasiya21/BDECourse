import express from "express";
import { InquiryController } from "../controllers";

const router = express.Router();

// Routes
router.post("/add",InquiryController.addInquiry);
router.get("/getall",InquiryController.getAllInquiries);

router.delete("/delete/:id",InquiryController.deleteInquiry);
router.get("/get/:id",InquiryController.getInquiryById);

export default router