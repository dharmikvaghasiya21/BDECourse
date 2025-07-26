import express from 'express';
import { privacyPolicyController } from "../controllers";
import { adminJWT, verifyToken } from '../helper/jwt';

const router = express.Router();

router.get('/', verifyToken, privacyPolicyController.get_privacy_policy)

router.use(adminJWT)
router.post('/add/edit',  privacyPolicyController.add_edit_privacy_policy)

export const privacyPolicyRoutes = router;