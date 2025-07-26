import express from 'express';
import { userController } from '../controllers';
import { adminJWT, verifyToken } from '../helper/jwt';

const router = express.Router();


router.get('/:id', verifyToken, userController.get_user_by_id);
router.post('/add', verifyToken, userController.add_user);
router.post('/edit', verifyToken, userController.edit_user_by_id);

router.use(adminJWT)
router.get('/', userController.get_all_users);
router.delete('/delete/:id', userController.delete_user_by_id);

export default router;