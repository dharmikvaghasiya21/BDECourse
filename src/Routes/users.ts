// routes/profileRoutes.ts
import express from 'express';
import { usersController } from '../controllers';

const router = express.Router();

router.post('/add', usersController.add_user);
router.put('/update', usersController.update_user);
router.delete('/delete/:id', usersController.delete_user);

router.get('/get/:id',usersController.getUserById);
router.get('/getall',usersController.get_all_users);
export default router;
