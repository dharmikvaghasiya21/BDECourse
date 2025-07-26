import express from 'express';
import { blogController } from '../controllers';
import { adminJWT, verifyToken } from '../helper/jwt';
const router = express.Router();


router.get('/user', verifyToken, blogController.listUserBlogs);


router.use(adminJWT)
router.get('/', blogController.listBlogs);
router.post('/add', blogController.addBlog);
router.post('/edit', blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);
router.get('/:id', blogController.getBlog);

export const blogRoutes = router;