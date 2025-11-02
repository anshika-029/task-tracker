import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");

  const BASE = "http://localhost:5000/api/tasks";

  // load tasks once when app starts
  useEffect(() => {
    fetch(BASE)
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, []);

  // save new or update old
  const handleSave = async () => {
    if (!title.trim()) return; // skip empty title
    const body = JSON.stringify({ title, description });

    if (editingId) {
      await fetch(`${BASE}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body,
      });
    } else {
      await fetch(BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
    }

    // reload and clear form
    const res = await fetch(BASE);
    setTasks(await res.json());
    setTitle("");
    setDescription("");
    setEditingId(null);
  };

  // edit (just show in input fields)
  const handleEdit = (task) => {
    setTitle(task.title);
    setDescription(task.description);
    setEditingId(task._id);
  };

  // delete task
  const handleDelete = async (id) => {
    await fetch(`${BASE}/${id}`, { method: "DELETE" });
    const res = await fetch(BASE);
    setTasks(await res.json());
  };

  // toggle complete
  const toggleComplete = async (task) => {
    await fetch(`${BASE}/${task._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });
    const res = await fetch(BASE);
    setTasks(await res.json());
  };

  // filter logic
  const filtered = tasks.filter((t) =>
    filter === "completed" ? t.completed : filter === "pending" ? !t.completed : true
  );

  return (
    <div className="app">  
      <h1>TASK TRACKER</h1>

      <div className="form">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <button onClick={handleSave}>{editingId ? "Update" : "Save"}</button>
      </div>

      <div className="filter-buttons">
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("pending")}>Pending</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
      </div>

      <h2>Tasks</h2>
      {filtered.length === 0 && <p>No tasks to show</p>}

      {filtered.map((task) => (
        <div key={task._id} className="task">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleComplete(task)}
          />
          <div
            style={{ textDecoration: task.completed ? "line-through" : "none" }}
          >
            <h3>{task.title}</h3>
            <p>{task.description}</p>
          </div>
          <div>
            <button onClick={() => handleEdit(task)}>Edit</button>
            <button onClick={() => handleDelete(task._id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
