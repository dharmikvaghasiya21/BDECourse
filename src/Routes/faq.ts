import express from 'express';
import { faqController } from "../controllers";
import { adminJWT, verifyToken } from '../helper/jwt';

const router = express.Router();


router.get('/', verifyToken, faqController.get_all_faqs)
router.get('/:id', verifyToken, faqController.get_faq_by_id)

// Admin routes
router.use(adminJWT);
router.post('/add', faqController.add_faq)
router.post('/edit', faqController.edit_faq)
router.delete('/:id', faqController.delete_faq)

export const faqRoutes = router; 