"use client";

import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await register(username, email, password);
      if (success) {
        router.push("/admin"); // Редирект на страницу админ-панели
      } else {
        setError("Ошибка регистрации");
      }
    } catch (err) {
      setError("Ошибка регистрации");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl mb-4 text-center">Регистрация</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <input
          type="text"
          placeholder="Имя пользователя"
          className="border p-2 w-full mb-4"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          className="border p-2 w-full mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white p-2 w-full rounded mb-4">
          Зарегистрироваться
        </button>
        <p className="text-center">
          Уже есть аккаунт?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-blue-500 hover:underline"
          >
            Войти
          </button>
        </p>
      </form>
    </div>
  );
}