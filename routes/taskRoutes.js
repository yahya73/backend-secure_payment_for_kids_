import express from 'express';
import {getAllTasksByParentname,getAllTasksByUsername,updateTaskAnswer,updateTaskPhoto,updateTaskStatus,updateTaskScore} from "../controllers/taskController.js";
const router = express.Router();

router.get('/alltaskschild/:username',getAllTasksByUsername);
router.get('/alltasksparent/:Parentname',getAllTasksByParentname);
router.put('/addAnswer/:taskId',updateTaskAnswer);
router.put('/addPhoto/:taskId',updateTaskPhoto);
router.put('/updatestat/:taskId',updateTaskStatus);
router.put('/updateScore/:id',updateTaskScore);

export default router;