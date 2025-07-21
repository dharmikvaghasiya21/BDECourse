// routes/profileRoutes.ts
import express from 'express';
import { categoryController } from '../controllers';

const router = express.Router();

// Student Routes
router.get("/getall", categoryController.getAllCategories);
router.get("/get/:id", categoryController.getCategoryById);


// Admin Routes
router.post("/add",  categoryController.addCategory);
router.put("/edit", categoryController.editCategory);
router.delete("/delete/:id", categoryController.deleteCategory);
export default router;