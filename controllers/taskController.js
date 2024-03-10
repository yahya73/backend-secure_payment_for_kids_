import Task from '../models/task'


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
