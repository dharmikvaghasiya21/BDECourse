import express from 'express';
import { blogController } from '../controllers';
import { adminJWT } from '../helper/jwt';
const router = express.Router();


router.get('/user', blogController.listUserBlogs);


router.use(adminJWT)
router.get('/', blogController.listBlogs);
router.post('/add', blogController.addBlog);
router.post('/edit', blogController.updateBlog);
router.delete('/delete/:id', blogController.deleteBlog);
router.get('/:id', blogController.getBlog);

export const blogRoutes = router;