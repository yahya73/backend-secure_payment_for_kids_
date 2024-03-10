import express from 'express';
import { body } from 'express-validator';
import multer from '../middlewares/multer-config.js';

const router = express.Router();

import { registerParent, getAccountDetails, verifyEmail, getChildTransactionHistory } from '../controllers/parentController.js'

router.post('/register', registerParent);
router.get('/blockchainAccount', getAccountDetails);
router.get('/verifyEmail/:email', verifyEmail)

//get child's transactions 
router.get('/transactions/child/:parentId', getChildTransactionHistory);



export default router;