import express from 'express';
import { professorController } from '../controllers';
import { adminJWT } from '../helper/jwt';

const router = express.Router();


router.get('/:id', professorController.get_professor_by_id);
router.post('/add', professorController.add_professor);
router.post('/edit', professorController.edit_professor_by_id);

router.use(adminJWT)
router.get('/', professorController.get_all_professors);
router.delete('/delete/:id', professorController.delete_professor_by_id);

export default router;