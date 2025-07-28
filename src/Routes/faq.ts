import express from 'express';
import { faqController } from "../controllers";
import { adminJWT,  } from '../helper/jwt';

const router = express.Router();


router.get('/',  faqController.get_all_faqs)
router.get('/:id',  faqController.get_faq_by_id)

// Admin routes
router.use(adminJWT);
router.post('/add', faqController.add_faq)
router.post('/edit', faqController.edit_faq)
router.delete('/delete/:id', faqController.delete_faq)

export const faqRoutes = router;