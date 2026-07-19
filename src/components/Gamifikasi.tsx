/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserProfile } from "../types";
import { Award, Trophy, Star, CheckCircle, Download, ShieldCheck, Heart, Sparkles, AlertCircle } from "lucide-react";

interface GamifikasiProps {
  profile: UserProfile;
  totalDays: number;
  currentDay: number;
  onSimulateComplete: () => void;
}

export default function Gamifikasi({ profile, totalDays, currentDay, onSimulateComplete }: GamifikasiProps) {
  const [downloading, setDownloading] = useState(false);
  const progressPercent = Math.min(Math.round((currentDay / totalDays) * 100), 100);
  const isCompleted = progressPercent >= 100;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert("Sertifikat Berhasil Diunduh!\n\nSertifikat Kesembuhan TB Anda telah diunduh sebagai file PDF aman (PEDULITB_SERTIFIKAT_BUDI.pdf).");
    }, 1500);
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen font-sans pb-24">
      <div className="p-4 space-y-4 max-w-md mx-auto w-full">
        {/* Header Gamifikasi */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-md space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-300 animate-bounce" />
            <h2 className="font-display font-bold text-base leading-tight">
              Apresiasi & Motivasi Terapi
            </h2>
          </div>
          <p className="text-[10px] text-emerald-100 leading-normal">
            Setiap butir obat OAT yang Anda telan membawa Anda selangkah lebih dekat menuju kesembuhan total dan kembalinya keceriaan keluarga.
          </p>
        </div>

        {/* Progress Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Kemajuan Menuju Sembuh
            </span>
            <span className="text-xs font-mono font-bold text-emerald-600">
              {currentDay} / {totalDays} Hari
            </span>
          </div>

          {/* Progress bar container */}
          <div className="space-y-1">
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex relative items-center border border-slate-200 shadow-inner">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
              <span className="absolute right-3 text-[10px] font-mono font-black text-slate-700">
                {progressPercent}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 italic text-center pt-1">
              "Kuman TB mati secara bertahap. Pertahankan konsistensi konsumsi OAT!"
            </p>
          </div>
        </div>

        {/* Badges Achievements */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3.5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            🎖️ Lencana Pencapaian Terapi Anda
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Badge 1: Mulai Terapi */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center text-center space-y-1.5">
              <div className="bg-emerald-500 text-white p-2.5 rounded-full">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700">Pejuang Pertama</span>
              <span className="text-[9px] text-slate-400 leading-tight">Memulai terapi OAT secara sadar & berani</span>
            </div>

            {/* Badge 2: 7-Day Adherence */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center text-center space-y-1.5">
              <div className="bg-amber-500 text-white p-2.5 rounded-full">
                <Star className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xs font-bold text-slate-700">Adheren 7 Hari</span>
              <span className="text-[9px] text-slate-400 leading-tight">Minum OAT tanpa putus selama satu minggu</span>
            </div>

            {/* Badge 3: 1 Month Intensif */}
            <div className={`p-3 border rounded-2xl flex flex-col items-center text-center space-y-1.5 ${
              currentDay >= 30 ? "bg-slate-50 border-slate-100" : "bg-slate-50/40 border-slate-100 opacity-50"
            }`}>
              <div className={`p-2.5 rounded-full ${
                currentDay >= 30 ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-400"
              }`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700">Benteng Intensif</span>
              <span className="text-[9px] text-slate-400 leading-tight">Melewati 1 bulan fase tersulit terapi TB</span>
            </div>

            {/* Badge 4: Sembuh Total */}
            <div className={`p-3 border rounded-2xl flex flex-col items-center text-center space-y-1.5 ${
              isCompleted ? "bg-amber-50 border-amber-200 shadow-sm" : "bg-slate-50/40 border-slate-100 opacity-50"
            }`}>
              <div className={`p-2.5 rounded-full ${
                isCompleted ? "bg-yellow-500 text-white animate-bounce" : "bg-slate-200 text-slate-400"
              }`}>
                <Trophy className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700">Kampiun Bebas TB</span>
              <span className="text-[9px] text-slate-400 leading-tight">Menyelesaikan 6 bulan pengobatan OAT</span>
            </div>
          </div>
        </div>

        {/* Simulation trigger */}
        {!isCompleted && (
          <div className="p-4 bg-slate-900 text-white rounded-3xl space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-300" /> Demo & Simulasi Sembuh
            </h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              Saat ini Anda berada di hari ke-{currentDay} pengobatan. Tekan tombol di bawah untuk menyimulasikan kemajuan 100% sembuh agar dapat melihat dan mengunduh sertifikat resmi kesembuhan Anda!
            </p>
            <button
              onClick={onSimulateComplete}
              className="w-full bg-emerald-600 hover:bg-emerald-700 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              Simulasikan Hari Ke-180 (100% Sembuh)
            </button>
          </div>
        )}

        {/* --- CERTIFICATE DISPLAY --- */}
        {isCompleted ? (
          <div className="bg-white rounded-3xl p-5 border-2 border-emerald-500 shadow-lg space-y-5 relative overflow-hidden animate-pulse-subtle">
            {/* Visual Gold Seals decoration */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-100 rounded-full opacity-30" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-emerald-100 rounded-full opacity-30" />

            <div className="text-center space-y-1.5 pt-2">
              <Award className="w-14 h-14 text-yellow-500 mx-auto fill-yellow-100" />
              <h3 className="font-display font-extrabold text-slate-800 text-base uppercase tracking-wider">
                Sertifikat Kesembuhan
              </h3>
              <p className="text-[9px] text-slate-400 tracking-widest font-mono">
                NOMOR SERTI: TB-MED/2026/{profile.id}
              </p>
            </div>

            {/* Certificate content paper */}
            <div className="border border-slate-200 bg-slate-50 p-4 rounded-2xl text-center space-y-3">
              <p className="text-[10px] text-slate-500 italic">
                Dengan penuh apresiasi, diberikan penghargaan setinggi-tingginya kepada:
              </p>
              
              <div>
                <h4 className="font-display font-black text-slate-800 text-lg leading-tight">
                  {profile.nama}
                </h4>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  Pasien Terapi TB {profile.jenisTB || "Paru"} (Fase {profile.fasePengobatan || "Intensif"})
                </p>
              </div>

              <p className="text-[10px] text-slate-600 leading-relaxed max-w-xs mx-auto">
                Telah dinyatakan <strong>LULUS & SELESAI</strong> menjalani terapi Obat Anti Tuberkulosis (OAT) standar selama <strong>{totalDays} hari</strong> berturut-turut tanpa putus di bawah pengawasan PMO dan Kader TB Puskesmas Sukajadi.
              </p>

              {/* Virtual stamp signature */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[9px] text-slate-500 font-mono">
                <div>
                  <span>Kader Dampingan:</span>
                  <span className="block font-bold text-slate-700 mt-1">{profile.kaderNama || "Bu Retno"}</span>
                </div>
                <div>
                  <span>Kepala Faskes:</span>
                  <span className="block font-bold text-slate-700 mt-1">dr. Andi Wijaya</span>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              {downloading ? (
                <span>Menghasilkan PDF...</span>
              ) : (
                <>
                  <Download className="w-4 h-4 text-emerald-100" />
                  Unduh Sertifikat PDF Aman
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-slate-100 border border-slate-200 rounded-3xl p-5 text-center flex flex-col items-center justify-center space-y-2 py-8">
            <Award className="w-12 h-12 text-slate-300" />
            <h4 className="text-xs font-bold text-slate-700">Sertifikat Belum Terbuka</h4>
            <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
              Sertifikat apresiasi kesembuhan resmi akan otomatis terbuka dan dapat diunduh setelah terapi OAT Anda mencapai 100% (hari ke-180).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
