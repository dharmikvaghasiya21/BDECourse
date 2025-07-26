// routes/profileRoutes.ts
import express from 'express';
import { bannerController } from '../controllers';
import { adminJWT, verifyToken } from '../helper/jwt';

const router = express.Router();
// students
router.get("/", verifyToken, bannerController.getAllBanner);
router.get("/:id", verifyToken,bannerController.getBannerById);

// admin
router.use(adminJWT)
router.post('/add', bannerController.addBanner);
router.post("/edit", bannerController.editBanner);
router.delete("/delete/:id", bannerController.deleteBanner);

export default router;
