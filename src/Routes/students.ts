import express from 'express';
import { studentsController } from '../controllers';
import { adminJWT } from '../helper/jwt';

const router = express.Router();

router.get('/:id', studentsController.get_students_by_id);
router.post('/add', studentsController.add_students);
router.post('/edit', studentsController.edit_students_by_id);

router.use(adminJWT)
router.get('/', studentsController.get_all_students);
router.delete('/delete/:id', studentsController.delete_students_by_id);

export default router;
