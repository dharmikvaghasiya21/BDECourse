import express from 'express';
import { lectureController } from "../controllers";
import { adminJWT,  } from '../helper/jwt';

const router = express.Router();

router.get('/', lectureController.getAllLectures);
router.get('/:id', lectureController.getLectureById);


// Admin 
router.use(adminJWT);
router.post('/add', lectureController.addLecture);
router.post('/edit', lectureController.editLecture);
router.delete('/delete/:id', lectureController.deleteLecture);

export const lectureRouter = router;