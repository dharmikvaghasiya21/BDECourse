// routes/profileRoutes.ts
import express from 'express';
import { courseController } from '../controllers';
import { adminJWT, verifyToken } from '../helper/jwt';

const router = express.Router();
// students
router.get("/", verifyToken, courseController.getAllCourses);
router.get("/:id", verifyToken, courseController.getCourseById);

// admin
router.use(adminJWT);
router.post('/add', courseController.addCourse);
router.post("/edit", courseController.editCourse);
router.delete("/delete/:id", courseController.deleteCourse);
export default router;
