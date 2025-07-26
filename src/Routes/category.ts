// routes/profileRoutes.ts
import express from 'express';
import { categoryController } from '../controllers';
import { adminJWT } from '../helper/jwt';

const router = express.Router();

// Student Routes
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

// Admin Routes
router.use(adminJWT);
router.post("/add",  categoryController.addCategory);
router.post("/edit", categoryController.editCategory);
router.delete("/delete/:id", categoryController.deleteCategory);
export default router;