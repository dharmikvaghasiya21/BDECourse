// routes/profileRoutes.ts
import express from 'express';
import { courseController } from '../controllers';

const router = express.Router();
// students
router.get("/getall", courseController.getAllCourses);
router.get("/get/:id", courseController.getCourseById);

// admin
router.post('/add', courseController.addCourse);
router.put("/edit", courseController.editCourse);
router.delete("/delete/:id", courseController.deleteCourse);
export default router;
