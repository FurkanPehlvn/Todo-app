import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase.ts";

const todosRef = collection(db, "todos");

// Firestore'daki belge yapısına uygun tip
export type FirestoreTask = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
};

// Tüm görevleri getir
export async function getTodos(): Promise<FirestoreTask[]> {
  const snapshot = await getDocs(todosRef);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<FirestoreTask, "id">),
  }));
}

// Yeni görev ekle
export async function addTodo(taskText: string): Promise<void> {
  await addDoc(todosRef, {
    text: taskText,
    completed: false,
    createdAt: new Date().toISOString(),
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
