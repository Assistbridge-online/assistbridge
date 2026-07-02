"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DisconnectButton({
  accountId,
  label,
}: {
  accountId: string;
  label: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);

  function onClick() {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/admin/social/accounts/${accountId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to disconnect");
        setConfirm(false);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      title={confirm ? "Click again to confirm" : `Disconnect ${label}`}
      className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition ${
        confirm
          ? "bg-red-600 text-white hover:bg-red-700"
          : "text-slate-500 hover:bg-red-50 hover:text-red-700"
      }`}
    >
      <Trash2 className="h-3.5 w-3.5" />
      {confirm ? "Confirm?" : ""}
    </button>
  );
}