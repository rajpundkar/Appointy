"use client";
import { useRouter } from "next/navigation";

export default function LogoutLink() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <button onClick={logout} style={{ color: "var(--text-secondary)", textDecoration: "underline" }}>
      Sign out
    </button>
  );
}
