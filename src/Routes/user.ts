import express from 'express';
import { userController } from '../controllers';

const router = express.Router();

router.post('/add', userController.add_user);
router.post('/edit', userController.edit_user_by_id);
router.delete('/delete/:id', userController.delete_user_by_id);
router.get('/', userController.get_all_users);
router.get('/:id', userController.get_user_by_id);


export default router;
