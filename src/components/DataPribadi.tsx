/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserProfile, UserRole } from "../types";
import { 
  User, Clipboard, Heart, Shield, RefreshCw, FileText, 
  CheckCircle2, Key, Edit, Lock, Mail, Tag, MapPin 
} from "lucide-react";

interface DataPribadiProps {
  profile: UserProfile;
  onResetDb: () => void;
  onLogout: () => void;
  onUpdateSelfProfile: (fields: { nama: string; username: string; pin: string }) => void;
}

export default function DataPribadi({ 
  profile, 
  onResetDb, 
  onLogout,
  onUpdateSelfProfile 
}: DataPribadiProps) {
  const [nama, setNama] = useState(profile.nama);
  const [username, setUsername] = useState(profile.username || profile.email.split("@")[0]);
  const [pin, setPin] = useState(profile.pin);
  const [msgUpdate, setMsgUpdate] = useState("");
  const [showPin, setShowPin] = useState(false);

  // Static mock diagnostic history (only applicable if role is PASIEN)
  const examHistory = [
    {
      tanggal: "2026-05-15",
      tipe: "Tes Cepat Molekuler (TCM) Dahak",
      hasil: "Positif (Rifampisin Sensitif)",
      lokasi: "Laboratorium Puskesmas Sukajadi"
    },
    {
      tanggal: "2026-05-18",
      tipe: "Rontgen Dada (Thorax)",
      hasil: "Infiltrat pada apeks paru kanan dengan kavitas kecil",
      lokasi: "Radiologi Rumah Sakit Umum Daerah"
    },
    {
      tanggal: "2026-07-01",
      tipe: "Mikroskopis Dahak Bulan Ke-1",
      hasil: "BTA Negatif (-) / Sputum Bersih",
      lokasi: "Laboratorium Puskesmas Sukajadi"
    }
  ];

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !username.trim() || !pin.trim()) {
      alert("Field Nama, Username, dan PIN tidak boleh kosong!");
      return;
    }
    
    onUpdateSelfProfile({
      nama: nama.trim(),
      username: username.trim(),
      pin: pin.trim()
    });

    setMsgUpdate("Profil & Sandi PIN Anda berhasil diperbarui!");
    setTimeout(() => setMsgUpdate(""), 4000);
  };

  const isPatient = profile.role === UserRole.PASIEN;
  const isKader = profile.role === UserRole.KADER;
  const isMedis = profile.role === UserRole.MEDIS;

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen font-sans pb-24">
      <div className="p-4 space-y-4 max-w-md mx-auto w-full">
        
        {/* Profile Card Summary */}
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-3xl p-5 shadow-md flex items-center gap-3.5">
          <div className="bg-white/15 text-white rounded-2xl p-3 flex-shrink-0">
            <User className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h2 className="font-display font-extrabold text-white text-base leading-tight">
              {profile.nama}
            </h2>
            <p className="text-[10px] text-emerald-100 font-semibold mt-1">
              {isPatient ? "Pasien Dampingan" : isKader ? "Kader TB Aktif" : "Tenaga Medis"}
            </p>
            <p className="text-[9px] text-emerald-200 font-mono mt-0.5">
              ID: {profile.id} • {profile.email}
            </p>
          </div>
        </div>

        {/* Edit Own Account Credentials Form */}
        <form onSubmit={handleUpdateSubmit} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Edit className="w-4 h-4 text-emerald-600" /> Ubah Data Diri & Keamanan PIN
          </h3>

          {msgUpdate && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{msgUpdate}</span>
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Lengkap Anda</label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama lengkap"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Username Login</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username baru"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sandi PIN (Untuk Login)</label>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="PIN baru Anda"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono font-bold tracking-widest text-emerald-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                >
                  {showPin ? "Sembunyikan" : "Intip"}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm"
          >
            Simpan Perubahan Profil
          </button>
        </form>

        {/* Medical Card Profile (Only for patients) */}
        {isPatient && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Clipboard className="w-4 h-4 text-emerald-600" /> Identitas Klinis TB
            </h3>

            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Jenis Penyakit TB</span>
                <span className="font-bold text-slate-700 mt-0.5 block">TB {profile.jenisTB || "Paru"}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Fase Pengobatan</span>
                <span className="font-bold text-slate-700 mt-0.5 block">Fase {profile.fasePengobatan || "Intensif"}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Faskes Rujukan</span>
                <span className="font-bold text-slate-700 mt-0.5 block">{profile.faskes || "Puskesmas Sukajadi"}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Kader Pendamping</span>
                <span className="font-bold text-slate-700 mt-0.5 block">{profile.kaderNama || "Bu Retno"}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl col-span-2">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Pendamping Minum Obat (PMO)</span>
                <span className="font-bold text-slate-700 mt-0.5 block">{profile.pmoNama || "Siti Rahma (Istri)"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Staff Card Profile (Only for Kader or Medis) */}
        {!isPatient && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Shield className="w-4 h-4 text-emerald-600" /> Informasi Penugasan
            </h3>

            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Peran Sistem</span>
                <span className="font-bold text-slate-700 mt-0.5 block">{isKader ? "Kader Lapangan" : "Tenaga Medis"}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Fasilitas Induk</span>
                <span className="font-bold text-slate-700 mt-0.5 block">{profile.faskes || "Puskesmas Sukajadi"}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl col-span-2 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Wilayah Kerja Puskesmas</span>
                  <span className="font-bold text-slate-700 mt-0.5 block text-[11px]">Sektor Sukajadi, Bandung</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exam history list (Only for patients) */}
        {isPatient && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3.5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" /> Riwayat Pemeriksaan Medis
            </h3>

            <div className="space-y-3">
              {examHistory.map((exam, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">{exam.tipe}</span>
                    <span className="text-[10px] text-slate-400">{new Date(exam.tanggal).toLocaleDateString("id-ID")}</span>
                  </div>
                  <p className="text-slate-600 leading-normal">
                    Hasil: <strong className="text-emerald-700">{exam.hasil}</strong>
                  </p>
                  <p className="text-[9px] text-slate-400">
                    Tempat: {exam.lokasi}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset and Logout controls */}
        <div className="space-y-2 pt-2">
          <button
            onClick={onLogout}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md active:scale-95 text-xs text-center"
          >
            Keluar (Logout Aman)
          </button>
          
          <button
            onClick={onResetDb}
            className="w-full bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-600 font-semibold py-3 px-4 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Bersihkan & Reset Database Demo
          </button>
        </div>
      </div>
    </div>
  );
}
