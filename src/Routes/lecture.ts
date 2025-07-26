import express from 'express';
import { lectureController } from "../controllers";
import { adminJWT, verifyToken } from '../helper/jwt';

const router = express.Router();

router.get('/', verifyToken, lectureController.getAllLectures);
router.get('/:id', verifyToken, lectureController.getLectureById);


// Admin 
router.use(adminJWT);
router.post('/add', lectureController.addLecture);
router.post('/edit', lectureController.editLecture);
router.delete('/:id', lectureController.deleteLecture);

export const lectureRouter = router;