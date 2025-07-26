import express from 'express';
import { privacyPolicyController } from "../controllers";
import { adminJWT, verifyToken } from '../helper/jwt';

const router = express.Router();

router.get('/', privacyPolicyController.get_privacy_policy)

router.use(adminJWT)
router.use(verifyToken);
router.post('/add/edit',  privacyPolicyController.add_edit_privacy_policy)

export const privacyPolicyRoutes = router;