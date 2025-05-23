import { useEffect, useState } from "react";

type Task = {
  text: string;
  completed: boolean;
  createdAt: string;
};

function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"all" | "completed" | "active">("all");

  useEffect(() => {
    const stored = localStorage.getItem("tasks");
    if (stored) {
      setTasks(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    if (task.trim() === "") return;
    const newTask: Task = {
      text: task.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
    setTask("");
  };

  const handleDeleteTask = (index: number) => {
    const updated = tasks.filter((_, i) => i !== index);
    setTasks(updated);
  };

  const toggleTaskCompleted = (index: number) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "completed") return t.completed;
    if (filter === "active") return !t.completed;
    return true;
  });

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
            Todo list
          </h1>

          <div className="flex space-between">
            <input
              type="text"
              placeholder="Yeni görev ekle..."
              value={task}
              className="flex-1 border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setTask(e.target.value)}
            />
            <button
              onClick={handleAddTask}
              className="bg-blue-500 text-white px-4 py-2 ml-2 rounded-md hover:bg-blue-600"
            >
              Ekle
            </button>
          </div>

          <div className="flex justify-center gap-3 m-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded ${
                filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-3 py-1 rounded ${
                filter === "active" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              Yapılacaklar
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-3 py-1 rounded ${
                filter === "completed"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              Tamamlananlar
            </button>
          </div>
          <ul className="space-y-2">
            {filteredTasks.map((t, index) => (
              <li
                key={index}
                className="bg-gray-100 px-3 py-2 rounded-md flex justify-between items-center"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => toggleTaskCompleted(index)}
                >
                  <span
                    className={`${
                      t.completed ? "line-through text-gray-400" : ""
                    }`}
                  >
                    {t.text}
                  </span>
                  <div className="text-xs text-gray-500">
                    {new Date(t.createdAt).toLocaleDateString("tr-TR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTask(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Sil
                </button>
              </li>
            ))}
            {tasks.length === 0 && (
              <p className="text-gray-400 text-center">
                Henüz görev eklenmedi{" "}
              </p>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}

export default App;
