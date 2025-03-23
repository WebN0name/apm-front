import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const token = localStorage.getItem("access-token");
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);


  async function login(email: string, password: string): Promise<boolean> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("access-token", data.tokens.accessToken.token);
      setUser(data.admin);
      setLoading(false);
      return true;
    } else {
      setLoading(false);
      return false;
    }
  }

  async function register(username: string, email: string, password: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/sign-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("access-token", data.tokens.accessToken.token);
      setUser(data.admin);
      setLoading(false);
      return true;
    } else {
      throw new Error("Ошибка регистрации");
    }
  }

  async function logout() {
    localStorage.removeItem("access-token");
    setUser(null);
    setLoading(false);
  }

  return { user, loading, login, register, logout };
}