import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase.ts";

const todosRef = collection(db, "todos");

// Firestore'daki belge yapısına uygun tip
export type FirestoreTask = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  userId: string;
};

// Kullanıcıya ait görevleri getir
export async function getTodos(userId: string): Promise<FirestoreTask[]> {
  const q = query(
    todosRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<FirestoreTask, "id">),
  }));
}

// Yeni görev ekle (kullanıcıya özel)
export async function addTodo(taskText: string, userId: string): Promise<void> {
  await addDoc(todosRef, {
    text: taskText,
    completed: false,
    createdAt: new Date().toISOString(),
    userId: userId,
  });
}

// Görev sil
export async function deleteTodo(id: string): Promise<void> {
  const docRef = doc(db, "todos", id);
  await deleteDoc(docRef);
}

// Görev tamamlandı durumunu değiştir
export async function toggleComplete(
  id: string,
  currentStatus: boolean
): Promise<void> {
  const docRef = doc(db, "todos", id);
  await updateDoc(docRef, { completed: !currentStatus });
}
