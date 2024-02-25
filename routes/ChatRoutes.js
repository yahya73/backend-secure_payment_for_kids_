import express from 'express';
import { body } from 'express-validator';
import multer from '../middlewares/multer-config.js';

const router = express.Router();

import {  } from '../controllers/ChatController.js'

router.post('/send', sendMessage);
router.get('/getMessages/:room_id', getMessages);


export default router;