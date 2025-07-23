import express from 'express';
import { userController } from '../controllers';

const router = express.Router();

router.post('/add', userController.add_user);
router.post('/edit', userController.edit_user_by_id);
router.post('/', userController.get_all_users);

export default router;
