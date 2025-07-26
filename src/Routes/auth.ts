// routes/profileRoutes.ts
import express from 'express';
import { authController } from '../controllers';
import { adminJWT } from '../helper/jwt';

const router = express.Router();

router.post('/signUp', authController.signUp);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgot_password);
router.post('/verify-otp', authController.verify_otp);
router.post('/reset-password', authController.reset_password);

router.use(adminJWT)
router.post('/change-password', authController.change_password)

export default router;

