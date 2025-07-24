import express from 'express';
import { lectureController } from "../controllers";

const router = express.Router();

// Admin routes
// router.post('/add', lectureController.add_lecture)

export const lectureRoutes = router;