"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";


export const dynamic = "force-dynamic";
export default function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState({ name: "Alex Morgan", email: "alex@example.com", country: "United States", company: "" });
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [notif, setNotif] = useState({ email: true, sms: false, marketing: true });

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Profile updated");
  }
  function changePwd(e: React.FormEvent) {
    e.preventDefault();
    if (pwd.next !== pwd.confirm) return toast.error("Passwords don't match");
    toast.success("Password changed");
    setPwd({ current: "", next: "", confirm: "" });
  }

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Settings</h1>
      <p className="mt-1 text-slate-600">Manage your account preferences.</p>

      <div className="mt-8 border-b border-slate-200 flex gap-1 overflow-x-auto">
        {[
          { id: "profile", label: "Profile" },
          { id: "password", label: "Password" },
          { id: "notifications", label: "Notifications" },
          { id: "danger", label: "Account" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              tab === t.id ? "border-primary-700 text-primary-800" : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 max-w-2xl">
        {tab === "profile" && (
          <Card className="p-6">
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Name</label>
                  <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="mt-1 w-full h-11 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input value={profile.email} disabled className="mt-1 w-full h-11 rounded-lg border border-slate-300 px-3 text-sm bg-slate-50 text-slate-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Country</label>
                  <input value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })} className="mt-1 w-full h-11 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Company (optional)</label>
                  <input value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} className="mt-1 w-full h-11 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <Button type="submit">Save changes</Button>
            </form>
          </Card>
        )}

        {tab === "password" && (
          <Card className="p-6">
            <form onSubmit={changePwd} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Current password</label>
                <input type="password" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} className="mt-1 w-full h-11 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">New password</label>
                <input type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} className="mt-1 w-full h-11 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Confirm new password</label>
                <input type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} className="mt-1 w-full h-11 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <Button type="submit">Change password</Button>
            </form>
          </Card>
        )}

        {tab === "notifications" && (
          <Card className="p-6 space-y-4">
            {[
              { key: "email" as const, label: "Email notifications", desc: "Order updates, messages, payment receipts" },
              { key: "sms" as const, label: "SMS notifications", desc: "Time-sensitive updates only" },
              { key: "marketing" as const, label: "Marketing emails", desc: "Newsletters, product updates, expert spotlights" },
            ].map((n) => (
              <label key={n.key} className="flex items-start justify-between gap-4 cursor-pointer p-3 rounded-lg hover:bg-slate-50">
                <div>
                  <div className="font-medium text-slate-900">{n.label}</div>
                  <div className="text-sm text-slate-600">{n.desc}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotif({ ...notif, [n.key]: !notif[n.key] })}
                  className={`relative h-6 w-11 rounded-full transition ${notif[n.key] ? "bg-primary-700" : "bg-slate-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${notif[n.key] ? "translate-x-5" : ""}`} />
                </button>
              </label>
            ))}
          </Card>
        )}

        {tab === "danger" && (
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900">Delete account</h3>
            <p className="mt-2 text-sm text-slate-600">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <Button variant="danger" className="mt-4" onClick={() => toast.error("Please contact support to delete your account.")}>
              Delete my account
            </Button>
          </Card>
        )}
      </div>
    </>
  );
}
