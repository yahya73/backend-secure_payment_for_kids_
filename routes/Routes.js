import express from 'express';
import { body } from 'express-validator';
import multer from '../middlewares/multer-config.js';

const router = express.Router();

// Handling routes for the '/tests' endpoint
router.route('/')
    // Handling GET requests to retrieve all tests
   
// Exporting the router for use in other modules
export default router;
