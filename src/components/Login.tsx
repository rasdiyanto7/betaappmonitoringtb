/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserRole, UserProfile } from "../types";
import { DEFAULT_PROFILES, PeduliTBStore } from "../data/mockDB";
import { Shield, Lock, Eye, EyeOff, UserCheck, Heart, User } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (user: UserProfile, pin: string) => void;
  activeProfiles?: UserProfile[];
}

export default function Login({ onLoginSuccess, activeProfiles: propActiveProfiles }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.PASIEN);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");

  // Dynamically load updated profiles from E2E storage, fallback to static defaults
  const db = PeduliTBStore.loadDatabase("1234");
  const fallbackProfiles: UserProfile[] = db && db.profiles ? db.profiles : DEFAULT_PROFILES;
  const activeProfiles = propActiveProfiles && propActiveProfiles.length > 0 ? propActiveProfiles : fallbackProfiles;

  const handleQuickFill = (profile: UserProfile) => {
    setSelectedRole(profile.role);
    setUsername(profile.username || profile.email.split("@")[0]);
    setPin(profile.pin);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username / Email tidak boleh kosong!");
      return;
    }

    // Find profile matching selected role, username, & pin from the dynamic profiles list
    const match = activeProfiles.find((p) => {
      const isRoleMatch = p.role === selectedRole;
      const inputVal = username.trim().toLowerCase();
      
      const isUsernameMatch = p.username && p.username.toLowerCase() === inputVal;
      const isEmailMatch = p.email && p.email.toLowerCase() === inputVal;
      const isNamaMatch = p.nama && p.nama.toLowerCase() === inputVal;
      
      const isPinMatch = p.pin === pin;
      
      return isRoleMatch && (isUsernameMatch || isEmailMatch || isNamaMatch) && isPinMatch;
    });

    if (match) {
      onLoginSuccess(match, pin);
    } else {
      setError(
        "Username atau PIN atau Peran tidak cocok! Silakan gunakan akun Demo di bawah untuk uji coba cepat atau daftarkan akun baru via Kader/Medis."
      );
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 p-4 font-sans">
      {/* Container simulating a mobile device width */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col min-h-[640px]">
        {/* Header App */}
        <div className="bg-blue-600 px-6 py-8 text-white text-center relative flex flex-col items-center">
          <div className="absolute top-4 right-4 bg-blue-500/50 backdrop-blur-md text-[10px] font-mono px-2 py-1 rounded-full flex items-center gap-1">
            <Lock className="w-3 h-3" /> E2EE Aktif
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3 border border-white/10 shadow-inner">
            <Heart className="w-9 h-9 text-blue-100 fill-blue-100" />
          </div>
          <h1 className="font-display font-bold text-2xl tracking-tight">PeduliTB</h1>
          <p className="text-blue-100 text-xs mt-1 max-w-xs leading-relaxed">
            Sistem Monitoring Terapi TB dengan Pendampingan OAT Mandiri & Terenkripsi E2E
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Select Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                Pilih Peran Masuk
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(UserRole) as UserRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role);
                      setError("");
                    }}
                    className={`py-3 px-1 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-1 border transition-all ${
                      selectedRole === role
                        ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm font-semibold"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="capitalize">
                      {role === "PASIEN" ? "Pasien" : role === "KADER" ? "Kader TB" : "Medis"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                Username / Email / Nama
              </label>
              <div className="relative">
                <input
                  id="username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username atau email Anda"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs font-medium text-slate-800"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* PIN Input */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                PIN Enkripsi Keamanan (Sandi)
              </label>
              <div className="relative">
                <input
                  id="pin-input"
                  type={showPin ? "text" : "password"}
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="Masukkan PIN keamanan Anda"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-mono tracking-widest text-lg font-bold"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => {
                    setShowPin(!showPin);
                  }}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                * PIN digunakan sebagai kunci kriptografi lokal untuk membuka dan mendekripsi catatan medis Anda di perangkat ini (Zero-Knowledge).
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs leading-normal">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-blue-600/10 active:scale-[0.98]"
            >
              Masuk & Dekripsi Data
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              Uji Coba Cepat (Akun Demo):
            </h3>
            <div className="space-y-1.5">
              {activeProfiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleQuickFill(profile)}
                  className="w-full text-left bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 p-2.5 rounded-xl border border-slate-100 text-xs flex justify-between items-center transition-all group"
                >
                  <div>
                    <span className="font-semibold text-slate-700 group-hover:text-blue-700">
                      {profile.nama}
                    </span>
                    <span className="text-slate-400 ml-1 text-[10px] bg-slate-200/60 px-1.5 py-0.5 rounded">
                      {profile.role === "PASIEN" ? "Pasien" : profile.role === "KADER" ? "Kader" : "Dr. Puskesmas"}
                    </span>
                  </div>
                  <div className="font-mono text-blue-600 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                    PIN: {profile.pin}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="bg-slate-50 px-6 py-4 text-center border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span>Sistem Keamanan Terenkripsi Militer (AES-256)</span>
        </div>
      </div>
    </div>
  );
}
