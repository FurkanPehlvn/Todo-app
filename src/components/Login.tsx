import { useState } from "react";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../services/firebaseAuth";

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
      await signInWithEmailAndPassword(auth, email, password);
      onSuccess();
    } catch (err) {
      alert("Giriş başarısız: " + (err as Error).message);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      alert("Lütfen önce e-posta adresinizi girin.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
    } catch (err) {
      alert("Şifre sıfırlama hatası: " + (err as Error).message);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-center">Giriş Yap</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full border p-2 mb-3 rounded"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Şifre"
        className="w-full border p-2 mb-3 rounded"
      />

      <div className="flex items-center mb-4">
        <input
          id="rememberMe"
          type="checkbox"
          checked={rememberMe}
          onChange={() => setRememberMe(!rememberMe)}
          className="mr-2"
        />
        <label htmlFor="rememberMe" className="text-sm text-gray-700">
          Beni Hatırla
        </label>
      </div>

      <button
        onClick={handleLogin}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        Giriş Yap
      </button>
      <p className="text-sm text-center mt-3">
        <button
          onClick={handlePasswordReset}
          className="text-blue-500 hover:underline"
        >
          Şifremi Unuttum
        </button>
      </p>
    </>
  );
}
