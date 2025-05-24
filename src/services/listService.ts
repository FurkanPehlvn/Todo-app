import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "../firebase";

const listsRef = collection(db, "lists");

export type FirestoreList = {
  id: string;
  name: string;
  userId: string;
};

// Kullanıcının tüm listelerini getir
export async function getLists(userId: string): Promise<FirestoreList[]> {
  const q = query(listsRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<FirestoreList, "id">),
  }));
}

// Yeni liste oluştur
export async function addList(name: string, userId: string): Promise<void> {
  await addDoc(listsRef, {
    name,
    userId,
  });
}
