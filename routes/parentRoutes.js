import express from 'express';
import { body } from 'express-validator';
import multer from '../middlewares/multer-config.js';

const router = express.Router();

import { registerParent } from '../controllers/partenaireController.js'

router.post('/register', registerParent);

export default router;