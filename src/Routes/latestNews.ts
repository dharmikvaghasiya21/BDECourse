import express from 'express';
import { latestNewsController } from '../controllers';
import { adminJWT } from '../helper/jwt';
const router = express.Router();


router.get('/user', latestNewsController.listUserLatestNews);

router.use(adminJWT)
router.get('/', latestNewsController.listLatestNews);
router.post('/add', latestNewsController.addLatestNews);
router.post('/edit', latestNewsController.updateLatestNews);
router.delete('/:id', latestNewsController.deleteLatestNews);
router.get('/:id', latestNewsController.getLatestNews);

export const latestNewsRoutes = router;