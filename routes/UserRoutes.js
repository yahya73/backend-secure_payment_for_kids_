import express from 'express';
import {signin } from '../controllers/UserController.js';

const router = express.Router(); 

router
    .route('/signin')
    .post(signin)
    



export default router ;