// routes/profileRoutes.ts
import express from 'express';
import { authController } from '../controllers';
import { adminJWT } from '../helper/jwt';

const router = express.Router();

router.post('/signUp', authController.signUp);
router.post('/login', authController.login);
router.post('/forgot_password', authController.forgot_password);
router.post('/verify_otp', authController.verify_otp);
router.post('/reset_password', authController.reset_password);

router.use(adminJWT)
router.put('/change_password', authController.change_password)

export default router;
