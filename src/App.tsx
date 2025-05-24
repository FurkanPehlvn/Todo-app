import { useEffect, useState } from "react";
import {
  getTodos,
  addTodo,
  deleteTodo,
  toggleComplete,
  type FirestoreTask,
} from "./services/todoService";
import Login from "./components/Login";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { auth } from "./services/firebaseAuth";
import Signup from "./components/Signup";
import { addList, getLists, type FirestoreList } from "./services/listService";

function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState<FirestoreTask[]>([]);
  const [filter, setFilter] = useState<"all" | "completed" | "active">("all");
  const [user, setUser] = useState<any>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [newName, setNewName] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [lists, setLists] = useState<FirestoreList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");

  // Firebase kullanıcı oturumunu dinle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setTasks([]);
      setLists([]);
      setSelectedListId(null);
    });
    return () => unsubscribe();
  }, []);

  // Görevleri getir (kullanıcı giriş yaptıysa)
  useEffect(() => {
    if (user) {
      fetchLists();
    }
  }, [user]);

  useEffect(() => {
    if (user && selectedListId) {
      fetchTasks();
    }
  }, [selectedListId]);

  const fetchLists = async () => {
    const data = await getLists(user.uid);
    setLists(data);
    if (data.length > 0) {
      setSelectedListId(data[0].id); // İlk listeyi seç
    }
  };
  const handleAddList = async () => {
    if (!newListName.trim()) return;
    await addList(newListName.trim(), user.uid);
    setNewListName("");
    fetchLists(); // Liste yenile
  };
  const fetchTasks = async () => {
    if (!selectedListId) return;
    const data = await getTodos(user.uid, selectedListId);
    setTasks(data);
  };
  const handleAddTask = async () => {
    if (task.trim() === "" || !selectedListId) return;
    await addTodo(task.trim(), user.uid, selectedListId);
    setTask("");
    fetchTasks();
  };
  const handleDeleteTask = async (id: string) => {
    await deleteTodo(id);
    fetchTasks();
  };

  const toggleTaskCompleted = async (task: FirestoreTask) => {
    await toggleComplete(task.id, task.completed);
    fetchTasks();
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "completed") return t.completed;
    if (filter === "active") return !t.completed;
    return true;
  });

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
          {showSignup ? (
            <Signup
              onSuccess={() => setUser(auth.currentUser)}
              goToLogin={() => setShowSignup(false)}
            />
          ) : (
            <>
              <Login onSuccess={() => setUser(auth.currentUser)} hideWrapper />
              <p className="text-center mt-6 text-sm text-gray-600">
                Hesabınız yok mu?{" "}
                <button
                  onClick={() => setShowSignup(true)}
                  className="text-blue-500 hover:underline"
                >
                  Kayıt Ol
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {user && (
        <div className="absolute top-4 left-4 bg-white shadow px-4 py-3 rounded-md w-fit">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
              {user.displayName?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {user.displayName || "Kullanıcı"}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* Kullanıcı adını güncelleme bölümü */}
          {showEdit ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newName.trim()) return;
                try {
                  await updateProfile(auth.currentUser!, {
                    displayName: newName,
                  });
                  setUser({ ...auth.currentUser }); // Refresh user state
                  setNewName("");
                  setShowEdit(false);
                  alert("Kullanıcı adı güncellendi.");
                } catch (err) {
                  alert("Güncelleme başarısız: " + (err as Error).message);
                }
              }}
              className="mt-3 flex gap-2"
            >
              <input
                type="text"
                placeholder="Yeni ad"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border px-2 py-1 text-sm rounded"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600"
              >
                Kaydet
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewName("");
                  setShowEdit(false);
                }}
                className="text-sm text-gray-500 hover:text-red-500"
              >
                Vazgeç
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowEdit(true)}
              className="text-blue-500 text-sm mt-2 hover:underline"
            >
              Kullanıcı adını değiştir
            </button>
          )}
        </div>
      )}

      <button
        onClick={() => signOut(auth)}
        className="absolute top-4 right-4 bg-red-400 text-white px-2 py-1 rounded"
      >
        Çıkış
      </button>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Listeni Seç
            </h2>
            <select
              value={selectedListId || ""}
              onChange={(e) => setSelectedListId(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>

            <div className="flex mt-3 gap-2">
              <input
                type="text"
                placeholder="Yeni liste adı"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="flex-1 border px-2 py-1 rounded"
              />
              <button
                onClick={handleAddList}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Ekle
              </button>
            </div>
          </div>
          {selectedListId ? (
            <>
              <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
                {lists.find((list) => list.id === selectedListId)?.name ||
                  "Seçili Liste Yok"}
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
                    filter === "active"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
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
                {filteredTasks.map((t) => (
                  <li
                    key={t.id}
                    className="bg-gray-100 px-3 py-2 rounded-md flex justify-between items-center"
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => toggleTaskCompleted(t)}
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
                      onClick={() => handleDeleteTask(t.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Sil
                    </button>
                  </li>
                ))}
                {tasks.length === 0 && (
                  <p className="text-gray-400 text-center">
                    Henüz görev eklenmedi
                  </p>
                )}
              </ul>
            </>
          ) : (
            <p className="text-center text-gray-500">
              Lütfen bir liste oluştur veya seç.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
