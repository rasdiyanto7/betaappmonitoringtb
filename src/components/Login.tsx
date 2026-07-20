/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserRole, UserProfile } from "../types";
import { PeduliTBStore } from "../data/mockDB";
import { Shield, Lock, Eye, EyeOff, Heart, User, Stethoscope, Users, ShieldCheck } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (user: UserProfile, pin: string) => void;
  onAdminLogin: () => void;
  activeProfiles?: UserProfile[];
}

type RoleTab = "PASIEN" | "KADER" | "MEDIS" | "ADMIN";

const ROLE_TABS: { key: RoleTab; label: string; icon: React.ReactNode; color: string }[] = [
  {
    key: "PASIEN",
    label: "Pasien",
    icon: <Heart className="w-4 h-4" />,
    color: "text-emerald-600 border-emerald-500 bg-emerald-50",
  },
  {
    key: "KADER",
    label: "Kader TB",
    icon: <Users className="w-4 h-4" />,
    color: "text-blue-600 border-blue-500 bg-blue-50",
  },
  {
    key: "MEDIS",
    label: "Tenaga Medis",
    icon: <Stethoscope className="w-4 h-4" />,
    color: "text-purple-600 border-purple-500 bg-purple-50",
  },
  {
    key: "ADMIN",
    label: "Super Admin",
    icon: <ShieldCheck className="w-4 h-4" />,
    color: "text-slate-700 border-slate-600 bg-slate-100",
  },
];

export default function Login({ onLoginSuccess, onAdminLogin, activeProfiles }: LoginProps) {
  const [activeTab, setActiveTab] = useState<RoleTab>("PASIEN");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [error, setError] = useState("");

  const handleTabChange = (tab: RoleTab) => {
    setActiveTab(tab);
    setUsername("");
    setPin("");
    setAdminPassword("");
    setError("");
  };

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username tidak boleh kosong!");
      return;
    }
    if (!pin.trim()) {
      setError("PIN / Kata sandi tidak boleh kosong!");
      return;
    }

    const db = PeduliTBStore.loadDatabase();
    const profiles: UserProfile[] = db?.profiles || (activeProfiles ?? []);

    const userRole = activeTab as unknown as UserRole;
    const match = profiles.find(p => {
      if (p.role !== userRole) return false;
      const inputVal = username.trim().toLowerCase();
      const isUsernameMatch = p.username?.toLowerCase() === inputVal;
      const isEmailMatch = p.email?.toLowerCase() === inputVal;
      const isPinMatch = p.pin === pin;
      return (isUsernameMatch || isEmailMatch) && isPinMatch;
    });

    if (match) {
      onLoginSuccess(match, pin);
    } else {
      setError("Username atau PIN salah. Silakan coba lagi.");
    }
  };

  const handleSubmitAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !adminPassword.trim()) {
      setError("Username dan kata sandi wajib diisi!");
      return;
    }

    const isValid = PeduliTBStore.verifyAdmin(username.trim(), adminPassword);
    if (isValid) {
      onAdminLogin();
    } else {
      setError("Username atau kata sandi admin tidak valid!");
    }
  };

  const activeTabConfig = ROLE_TABS.find(t => t.key === activeTab)!;
  const isAdminTab = activeTab === "ADMIN";

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col">

        {/* ── App Header ── */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 px-6 pt-8 pb-6 text-white text-center flex flex-col items-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3 border border-white/20 shadow-lg z-10">
            <Heart className="w-9 h-9 text-blue-100 fill-blue-200/50" />
          </div>
          <h1 className="font-black text-2xl tracking-tight z-10">JUDUL APP</h1>
          <p className="text-blue-200 text-xs mt-1 max-w-xs leading-relaxed z-10">
            Sistem Monitoring Terapi OAT Terintegrasi
          </p>
          <div className="mt-3 flex items-center gap-1.5 bg-blue-600/40 backdrop-blur border border-blue-400/30 text-blue-100 text-[10px] font-bold px-3 py-1.5 rounded-full z-10">
            <Lock className="w-3 h-3" /> Enkripsi End-to-End Aktif
          </div>
        </div>

        {/* ── Role Tabs ── */}
        <div className="grid grid-cols-4 border-b border-slate-100 bg-slate-50">
          {ROLE_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex flex-col items-center gap-1 py-3 px-1 text-center transition-all border-b-2 ${
                activeTab === tab.key
                  ? `border-blue-600 ${tab.color}`
                  : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.icon}
              <span className="text-[9px] font-black uppercase tracking-wide leading-tight">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Form Body ── */}
        <div className="p-6">
          {!isAdminTab ? (
            /* ── User Login Form (Pasien / Kader / Medis) ── */
            <form onSubmit={handleSubmitUser} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${activeTabConfig.color}`}>
                  {activeTabConfig.icon}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-700">Login sebagai {activeTabConfig.label}</p>
                  <p className="text-[10px] text-slate-400">Gunakan akun yang dibuat oleh Admin</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Username / Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Masukkan username Anda"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoComplete="username"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  PIN / Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder="Masukkan PIN keamanan Anda"
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono tracking-widest"
                    autoComplete="current-password"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPin(v => !v)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  PIN digunakan sebagai kunci kriptografi lokal untuk membuka data medis Anda.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-[0.98]"
              >
                Masuk &amp; Buka Data
              </button>
            </form>
          ) : (
            /* ── Admin Login Form ── */
            <form onSubmit={handleSubmitAdmin} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-700">Login Super Administrator</p>
                  <p className="text-[10px] text-slate-400">Akses penuh kelola akun pengguna</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Username Admin
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-500"
                    autoComplete="username"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Kata Sandi Admin
                </label>
                <div className="relative">
                  <input
                    type={showAdminPass ? "text" : "password"}
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder="Kata sandi admin"
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-500"
                    autoComplete="current-password"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(v => !v)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98]"
              >
                Masuk sebagai Admin
              </button>
            </form>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="bg-slate-50 px-6 py-4 text-center border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span>Data terenkripsi di perangkat Anda • APP v1.0</span>
        </div>
      </div>
    </div>
  );
}
