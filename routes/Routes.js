import express from 'express';
import { body } from 'express-validator';
import multer from '../middlewares/multer-config.js';
import {banUser, getAll, unbanUser} from '../controllers/UserController.js';

const router = express.Router();

// Handling routes for the '/tests' endpoint
router.route('/users')
    .get(getAll)


router.route('/users/ban/:id')

    .put(banUser)
router.route('/users/unban/:id')

    .put(unbanUser)
   
// Exporting the router for use in other modules
export default router;
