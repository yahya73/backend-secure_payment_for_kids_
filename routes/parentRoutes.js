import express from 'express';
import { body } from 'express-validator';
import multer from '../middlewares/multer-config.js';

const router = express.Router();

import { registerParent, getAccountDetails } from '../controllers/parentController.js'

router.post('/register', registerParent);
router.get('/blockchainAccount', getAccountDetails);

export default router;