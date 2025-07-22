// routes/profileRoutes.ts
import express from 'express';
import { bannerController } from '../controllers';

const router = express.Router();
// students
router.get("/getall", bannerController.getAllBanner);
router.get("/get/:id", bannerController.getBannerById);

// admin
router.post('/add', bannerController.addBanner);
router.put("/edit", bannerController.editBanner);
router.delete("/delete/:id", bannerController.deleteBanner);


export default router;
