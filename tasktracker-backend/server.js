require('dotenv').config();

const mongoose = require('mongoose');

const express = require('express');
const cors = require('cors');
const app = express();

const Task = require('./models/Task');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send("TaskTracker Backend is running successfully"));

// connect mongoDb
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.log('MongoDB connection error:', err);
    process.exit(1);
  });

// GET
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error });
  }
});

// CREATE
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ message: 'Title is reqired' });

    const task = new Task({
      title: title.trim(),
      description: description ? description.trim() : ''
    });
    const saved = await task.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating task', error);
    res.status(500).json({ message: 'Error creating task', error });
  }
});

// Update a task (title, description, completed)
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // { title?, description?, completed? }

    // Optional: simple validation if title provided
    if (updates.title && !updates.title.trim()) {
      return res.status(400).json({ message: 'If provided, title cannot be empty' });
    }

    const updated = await Task.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Task not found' });

    res.json(updated);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task', error });
  }
});


// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Task.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task', error });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

