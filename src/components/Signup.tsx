import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../services/firebaseAuth";

export default function Signup({
  onSuccess,
  goToLogin,
}: {
  onSuccess: () => void;
  goToLogin: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Kullanıcı adı (displayName) ayarla
      await updateProfile(userCredential.user, {
        displayName: username,
      });

      onSuccess();
    } catch (err) {
      alert("Kayıt başarısız: " + (err as Error).message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Kayıt Ol</h2>
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
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Kullanıcı Adı"
          className="w-full border p-2 mb-3 rounded"
        />
        <button
          onClick={handleSignup}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          Kayıt Ol
        </button>

        <p className="text-center mt-4">
          Zaten hesabınız var mı?{" "}
          <button onClick={goToLogin} className="text-blue-600 underline">
            Giriş Yap
          </button>
        </p>
      </div>
    </div>
  );
}
