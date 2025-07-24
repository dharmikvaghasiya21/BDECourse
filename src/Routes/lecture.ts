import express from 'express';
import { lectureController } from "../controllers";

const router = express.Router();

// Admin 
router.post('/add', lectureController.addLecture);
router.post('/edit', lectureController.editLecture);
router.delete('/:id', lectureController.deleteLecture);

// Users
router.get('/', lectureController.getAllLectures);
router.get('/:id', lectureController.getLectureById);

export const lectureRouter = router; 