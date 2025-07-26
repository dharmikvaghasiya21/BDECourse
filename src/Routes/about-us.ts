import express from 'express';
import { aboutUsController } from "../controllers";
import { adminJWT, verifyToken } from '../helper/jwt';


const router = express.Router();

router.get('/', verifyToken, aboutUsController.get_about_us)

router.use(adminJWT)
router.post('/add/edit', aboutUsController.add_edit_about_us)
export const aboutUsRoutes = router;