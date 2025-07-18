// routes/profileRoutes.ts
import express from 'express';
import path from 'path';
import { bannerController } from '../controllers';

const router = express.Router();

router.post('/add', bannerController.addBanner);
router.put('/update', bannerController.updateBanner);
router.get('/get/:id', bannerController.getBannerById);
router.get('/getall', bannerController.getAllBanners);

router.delete('/delete/:id', bannerController.deleteBannerById);

export default router;