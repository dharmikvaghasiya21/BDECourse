import { Router } from 'express'
import authRouter from './auth'
import userRouter from './user'
import bannerRouter from './banner'
import categoryRouter from './category'
import courseRouter from './course'
import chatRouter from './chat'
import { aboutUsRoutes } from './about-us'
import { privacyPolicyRoutes } from './privacy-policy'
import { termsConditionRoutes } from './terms-condition'
import { blogRoutes } from './blog'
import { latestNewsRoutes } from './latestNews'
import { faqRoutes } from './faq'
import { uploadRoutes } from './upload'
import { lectureRouter } from './lecture'
import { adminJWT } from '../helper/jwt'

const router = Router()
// admin 
router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/banner', bannerRouter);
router.use('/about-us', aboutUsRoutes);
router.use('/privacy-policy', privacyPolicyRoutes);
router.use('/terms-condition', termsConditionRoutes);

router.use('/course', courseRouter);
router.use('/category', categoryRouter);
router.use('/lecture', lectureRouter);
router.use('/blog', blogRoutes);
router.use('/latest-news', latestNewsRoutes);
router.use('/faq', faqRoutes);
router.use('/chat', chatRouter);

router.use(adminJWT);
router.use('/upload', uploadRoutes);

export { router }
