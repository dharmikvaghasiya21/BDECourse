// routes/profileRoutes.ts
import express from 'express';
import { adminController } from '../controllers';

const router = express.Router();

router.post('/signUp', adminController.signUp);
router.post('/login', adminController.login);

router.post('/forgot_password', adminController.forgot_password);
router.post('/verify_otp', adminController.verify_otp);
router.post('/reset_password', adminController.reset_password);

export default router;
