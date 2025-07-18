import express from "express";
import { orderController } from "../controllers";

const router = express.Router();

// Routes
router.post("/add",orderController.createOrder);
router.get("/getall",orderController.getAllOrders);
router.put("/edit/:id",orderController.updateOrder);

router.delete("/delete/:id", orderController.deleteOrder);
router.get("/get/:id",orderController.getOrderById);

export default router