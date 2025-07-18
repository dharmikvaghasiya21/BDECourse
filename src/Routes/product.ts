import express from "express";
import { productController } from "../controllers";

const router = express.Router();

// Routes
router.post("/add",productController.addProduct);
router.get("/get/:id", productController.getProductById);
router.put("/update", productController.updateProductById);
router.delete("/delete/:id", productController.deleteProductById);

router.get("/getall",productController.get_all_users)

export default router