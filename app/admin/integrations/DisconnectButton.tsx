"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DisconnectButton({ provider }: { provider: "google" | "microsoft" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function disconnect() {
    if (!confirm("Disconnect this integration? Future bookings won't auto-generate links until you reconnect.")) return;
    setBusy(true);
    await fetch("/api/integrations/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });
    setBusy(false);
    router.refresh();
  }
  return (
    <button className="btn btn-ghost" onClick={disconnect} disabled={busy} style={{ fontSize: ".8125rem" }}>
      {busy ? "…" : "Disconnect"}
    </button>
  );
}
