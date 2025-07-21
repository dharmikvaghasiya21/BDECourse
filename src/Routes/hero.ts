// routes/profileRoutes.ts
import express from 'express';
import { heroController } from '../controllers';

const router = express.Router();
// students
router.get("/getall", heroController.getAllHero);
router.get("/get/:id", heroController.getHeroById);

// admin
router.post('/add', heroController.addHero);
router.put("/edit", heroController.editHero);
router.delete("/delete/:id", heroController.deleteHero);


export default router;
