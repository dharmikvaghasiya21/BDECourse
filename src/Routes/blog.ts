import express from 'express';
import { blogController } from '../controllers';
import { adminJWT, verifyToken } from '../helper/jwt';
const router = express.Router();

router.get('/user', blogController.listUserBlogs);


router.use(adminJWT)
router.use(verifyToken);
router.get('/', blogController.listBlogs);
router.post('/add', blogController.addBlog);
router.post('/edit', blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);
router.get('/:id', blogController.getBlog);

export const blogRoutes = router;