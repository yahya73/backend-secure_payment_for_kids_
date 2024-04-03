import Task from '../models/task.js'


// Add a task
export const addTask = async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all ongoing tasks (status: false)
export const getOngoingTasks = async (req, res) => {
    try {
      const ongoingTasks = await Task.find({ status: false });
      res.status(200).json(ongoingTasks);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};
  
// Get all finished tasks (status: true)
export const getFinishedTasks = async (req, res) => {
try {
    const finishedTasks = await Task.find({ status: true });
    res.status(200).json(finishedTasks);
} catch (error) {
    res.status(400).json({ message: error.message });
}
};


// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await task.remove();
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Find the task by ID
    const task = await Task.findOne({ _id: taskId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update the task's status
    task.status = true ; // Assuming the status field exists in your Task model
    await task.save(); // Save the updated task

    res.status(200).json({ message: 'Task status updated successfully', task });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTaskAnswer = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { answer } = req.body; // Assuming the answer is provided in the request body

    // Find the task by ID
    const task = await Task.findOne({ _id: taskId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update the task's answer
    task.Answer = answer; // Assuming the answer field exists in your Task model
    await task.save(); // Save the updated task

    res.status(200).json({ message: 'Task answer updated successfully', task });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTaskPhoto = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { photoUrl } = req.body; // Assuming the photo URL is provided in the request body

    // Find the task by ID
    const task = await Task.findOne({ _id: taskId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update the task's photo
    task.photoUrl = photoUrl; // Assuming the photoUrl field exists in your Task model
    await task.save(); // Save the updated task

    res.status(200).json({ message: 'Task photo updated successfully', task });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllTasksByUsername = async (req, res) => {
  const { username } = req.params; // Assuming the username is provided in the request parameters

  try {
      // Find tasks by the childUsername
      const tasks = await Task.find({ childUsername: username });

      if (tasks.length === 0) {
          return res.status(404).json({ message: 'No tasks found for the specified username' });
      }

      res.status(200).json(tasks);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

export const getAllTasksByParentname = async (req, res) => {
  const { Parentname } = req.params; // Assuming the username is provided in the request parameters

  try {
      // Find tasks by the childUsername
      const tasks = await Task.find({ parentUsername: Parentname });

      if (tasks.length === 0) {
          return res.status(404).json({ message: 'No tasks found for the specified username' });
      }

      res.status(200).json(tasks);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};
export const updateTaskScore = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the task by ID
    const task = await Task.findOne({ _id: id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update the task's score (assuming score field exists in Task model)
    task.score = req.body.score; // Assuming the score is provided in the request body
    await task.save(); // Save the updated task

    res.status(200).json({ message: 'Task score updated successfully', task });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
