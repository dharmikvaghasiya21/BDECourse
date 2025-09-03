// routes/profileRoutes.ts
import express from 'express';
import { courseController } from '../controllers';
import { adminJWT  } from '../helper/jwt';

const router = express.Router();
// admin
router.use(adminJWT);
router.get("/purchased", courseController.getPurchasedCourses);
router.get("/unpurchased", courseController.getUnpurchasedCourses);
router.post('/add', courseController.addCourse);
router.post("/edit", courseController.editCourse);
router.delete("/delete/:id", courseController.deleteCourse);

// students
router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);

export default router;
