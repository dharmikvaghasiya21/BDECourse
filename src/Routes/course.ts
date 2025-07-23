// routes/profileRoutes.ts
import express from 'express';
import { courseController } from '../controllers';

const router = express.Router();
// students
router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);

// admin
router.post('/add', courseController.addCourse);
router.post("/edit", courseController.editCourse);
router.delete("/delete/:id", courseController.deleteCourse);
export default router;
