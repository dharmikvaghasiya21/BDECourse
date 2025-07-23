import { Router } from 'express'
import authRouter from './auth'
import userRouter from './user'
import bannerRouter from './banner'
import categoryRouter from './category' 
import courseRouter from './course'
import { aboutUsRoutes } from './about-us'
import { privacyPolicyRoutes } from './privacy-policy'
import { termsConditionRoutes } from './terms-condition'
import { blogRoutes } from './blog'
import { faqRoutes } from './faq'
import { uploadRoutes } from './upload'
import { adminJWT } from '../helper/jwt'

const router = Router()
// admin 
router.use('/auth', authRouter);
router.use('/user', userRouter);

router.use('/banner', bannerRouter);
router.use('/about-us', aboutUsRoutes);
router.use('/privacy-policy', privacyPolicyRoutes);
router.use('/terms-condition', termsConditionRoutes);

router.use(adminJWT);
router.use('/course', courseRouter);
router.use('/upload',uploadRoutes);
router.use('/category', categoryRouter);
router.use('/blog', blogRoutes);
router.use('/faq', faqRoutes);

export { router }