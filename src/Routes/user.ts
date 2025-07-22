import express from 'express';
import { userController } from '../controllers';

const router = express.Router();

router.post('/add', userController.add_user);

export default router;
