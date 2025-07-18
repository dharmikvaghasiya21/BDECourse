"use strict"
import { Router } from 'express'
import bannerRouter from './banner'
import productRouter from './product'
import adminRouter from './admin'
import usersRouter from './users'
import { uploadRoutes } from './upload'
import InquiryRouter from './Inquiries'
import orderRouter from './order'
import { downloadContact } from './contact'


const router = Router()
// admin 
router.use('/admin', adminRouter);

// users
router.use('/users', usersRouter);


// website page
router.use('/banner', bannerRouter);
router.use('/upload', uploadRoutes)
router.use('/product', productRouter);
router.use('/inquiry', InquiryRouter);
router.use('/order', orderRouter);
router.use('/contact', downloadContact);

export { router }