/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from "react";
import { UserProfile } from "../types";
import { Award, Trophy, Star, CheckCircle, Download, ShieldCheck, Heart, Sparkles } from "lucide-react";

interface GamifikasiProps {
  profile: UserProfile;
  totalDays: number;
  currentDay: number;
  onSimulateComplete: () => void;
}

export default function Gamifikasi({ profile, totalDays, currentDay, onSimulateComplete }: GamifikasiProps) {
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const progressPercent = Math.min(Math.round((currentDay / totalDays) * 100), 100);
  const isCompleted = progressPercent >= 100;

  const namaFaskes = profile.faskes || "Puskesmas";
  const namaKader  = profile.kaderNama || "Kader TB";
  const nomorSerti = `TB-MED/${new Date().getFullYear()}/${profile.id}`;
  const tanggalSelesai = (() => {
    if (profile.tanggalMulai && profile.durasiHari) {
      const d = new Date(profile.tanggalMulai);
      d.setDate(d.getDate() + profile.durasiHari);
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    }
    return new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  })();

  const handleDownload = () => {
    setDownloading(true);

    // Buat konten HTML sertifikat lalu cetak ke window baru
    const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"/>
<title>Sertifikat Kesembuhan TB — ${profile.nama}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@700;900&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Inter', sans-serif; background:#f0fdf4; display:flex; justify-content:center; align-items:center; min-height:100vh; padding:32px; }
  .cert { background:#fff; border:6px solid #059669; border-radius:24px; max-width:720px; width:100%; padding:48px; position:relative; box-shadow:0 20px 60px rgba(0,0,0,0.12); }
  .cert::before { content:''; position:absolute; inset:10px; border:2px dashed #a7f3d0; border-radius:18px; pointer-events:none; }
  .header { text-align:center; margin-bottom:32px; }
  .logo { font-size:48px; margin-bottom:8px; }
  .title { font-family:'Playfair Display',serif; font-size:28px; font-weight:900; color:#065f46; letter-spacing:2px; text-transform:uppercase; }
  .subtitle { font-size:13px; color:#6b7280; letter-spacing:4px; text-transform:uppercase; margin-top:4px; }
  .no-serti { font-size:11px; color:#9ca3af; font-family:monospace; margin-top:8px; }
  .divider { border:none; border-top:2px solid #d1fae5; margin:28px 0; }
  .intro { text-align:center; color:#6b7280; font-size:13px; font-style:italic; margin-bottom:20px; }
  .nama { text-align:center; font-family:'Playfair Display',serif; font-size:36px; font-weight:900; color:#065f46; margin-bottom:6px; }
  .detail-pasien { text-align:center; font-size:12px; color:#6b7280; margin-bottom:24px; }
  .keterangan { background:#f0fdf4; border:1px solid #a7f3d0; border-radius:12px; padding:20px; font-size:13px; color:#374151; line-height:1.8; text-align:center; margin-bottom:24px; }
  .keterangan strong { color:#065f46; }
  .ttd { display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-top:32px; }
  .ttd-item { text-align:center; padding-top:16px; border-top:2px solid #d1fae5; }
  .ttd-label { font-size:10px; color:#9ca3af; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px; }
  .ttd-nama { font-weight:700; color:#1f2937; font-size:14px; }
  .ttd-jabatan { font-size:11px; color:#6b7280; margin-top:2px; }
  .stempel { text-align:center; margin-top:28px; }
  .stempel-inner { display:inline-block; border:3px solid #059669; border-radius:50%; padding:16px 24px; color:#059669; font-weight:700; font-size:12px; letter-spacing:1px; }
  @media print {
    body { background:white; padding:0; }
    .cert { box-shadow:none; border-radius:0; max-width:100%; }
  }
</style>
</head>
<body>
<div class="cert">
  <div class="header">
    <div class="logo">🏥</div>
    <div class="title">Sertifikat Kesembuhan</div>
    <div class="subtitle">Tuberkulosis (TB) — Program OAT Nasional</div>
    <div class="no-serti">No. Sertifikat: ${nomorSerti}</div>
  </div>
  <hr class="divider"/>
  <p class="intro">Dengan penuh apresiasi dan rasa syukur, diberikan penghargaan setinggi-tingginya kepada:</p>
  <div class="nama">${profile.nama}</div>
  <div class="detail-pasien">TB ${profile.jenisTB || "Paru"} · Fase ${profile.fasePengobatan || "Intensif"} · ${namaFaskes}</div>
  <div class="keterangan">
    Telah dinyatakan <strong>LULUS & SELESAI</strong> menjalani terapi<br/>
    Obat Anti Tuberkulosis (OAT) standar selama<br/>
    <strong>${totalDays} hari</strong> berturut-turut tanpa putus<br/>
    di bawah pengawasan PMO dan Kader TB<br/>
    <strong>${namaFaskes}</strong><br/><br/>
    Diselesaikan pada tanggal: <strong>${tanggalSelesai}</strong>
  </div>
  <hr class="divider"/>
  <div class="ttd">
    <div class="ttd-item">
      <div class="ttd-label">Kader Pendamping</div>
      <div class="ttd-nama">${namaKader}</div>
      <div class="ttd-jabatan">Kader TB Terlatih</div>
    </div>
    <div class="ttd-item">
      <div class="ttd-label">Faskes</div>
      <div class="ttd-nama">${namaFaskes}</div>
      <div class="ttd-jabatan">Fasilitas Kesehatan Rujukan</div>
    </div>
  </div>
  <div class="stempel">
    <div class="stempel-inner">✓ SEMBUH TUNTAS OAT</div>
  </div>
</div>
<script>window.onload=()=>{window.print();}</script>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `Sertifikat_TB_${profile.nama.replace(/\s/g, "_")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloading(false);
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen font-sans pb-24">
      <div className="p-4 space-y-4 max-w-md mx-auto w-full">

        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-md space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-300 animate-bounce" />
            <h2 className="font-display font-bold text-base">Apresiasi & Motivasi Terapi</h2>
          </div>
          <p className="text-[10px] text-emerald-100 leading-normal">
            Setiap butir OAT membawa Anda selangkah lebih dekat menuju kesembuhan total.
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Kemajuan Menuju Sembuh</span>
            <span className="text-xs font-mono font-bold text-emerald-600">{currentDay} / {totalDays} Hari</span>
          </div>
          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex relative items-center border border-slate-200 shadow-inner">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            <span className="absolute right-3 text-[10px] font-mono font-black text-slate-700">{progressPercent}%</span>
          </div>
          <p className="text-[10px] text-slate-400 italic text-center">"Kuman TB mati secara bertahap. Pertahankan konsistensi OAT!"</p>
        </div>

        {/* Badges */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3.5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">🎖️ Lencana Pencapaian</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <CheckCircle className="w-5 h-5" />, bg: "bg-emerald-500", title: "Pejuang Pertama", desc: "Memulai terapi OAT secara sadar & berani", unlock: true },
              { icon: <Star className="w-5 h-5 fill-white" />, bg: "bg-amber-500", title: "Adheren 7 Hari", desc: "Minum OAT tanpa putus selama satu minggu", unlock: true },
              { icon: <ShieldCheck className="w-5 h-5" />, bg: currentDay >= 30 ? "bg-teal-600" : "bg-slate-200", title: "Benteng Intensif", desc: "Melewati 1 bulan fase tersulit terapi TB", unlock: currentDay >= 30 },
              { icon: <Trophy className="w-5 h-5" />, bg: isCompleted ? "bg-yellow-500" : "bg-slate-200", title: "Kampiun Bebas TB", desc: "Menyelesaikan pengobatan OAT penuh", unlock: isCompleted },
            ].map((b, i) => (
              <div key={i} className={`p-3 border rounded-2xl flex flex-col items-center text-center space-y-1.5 ${b.unlock ? "bg-slate-50 border-slate-100" : "bg-slate-50/40 border-slate-100 opacity-50"}`}>
                <div className={`${b.bg} text-white p-2.5 rounded-full ${b.unlock && isCompleted && i===3 ? "animate-bounce" : ""}`}>{b.icon}</div>
                <span className="text-xs font-bold text-slate-700">{b.title}</span>
                <span className="text-[9px] text-slate-400 leading-tight">{b.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Simulasi */}
        {!isCompleted && (
          <div className="p-4 bg-slate-900 text-white rounded-3xl space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-300" /> Demo & Simulasi Sembuh
            </h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              Anda di hari ke-{currentDay}. Tekan tombol di bawah untuk menyimulasikan 100% sembuh dan melihat sertifikat.
            </p>
            <button onClick={onSimulateComplete} className="w-full bg-emerald-600 hover:bg-emerald-700 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md">
              Simulasikan Hari Ke-{totalDays} (100% Sembuh)
            </button>
          </div>
        )}

        {/* Sertifikat */}
        {isCompleted ? (
          <div ref={certRef} className="bg-white rounded-3xl p-5 border-2 border-emerald-500 shadow-lg space-y-4 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-100 rounded-full opacity-30" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-emerald-100 rounded-full opacity-30" />

            <div className="text-center space-y-1.5 pt-2">
              <Award className="w-14 h-14 text-yellow-500 mx-auto fill-yellow-100" />
              <h3 className="font-display font-extrabold text-slate-800 text-base uppercase tracking-wider">Sertifikat Kesembuhan</h3>
              <p className="text-[9px] text-slate-400 tracking-widest font-mono">No: {nomorSerti}</p>
            </div>

            <div className="border border-slate-200 bg-slate-50 p-4 rounded-2xl text-center space-y-3">
              <p className="text-[10px] text-slate-500 italic">Diberikan kepada:</p>
              <h4 className="font-display font-black text-slate-800 text-lg">{profile.nama}</h4>
              <p className="text-[9px] text-slate-400">TB {profile.jenisTB||"Paru"} · Fase {profile.fasePengobatan||"Intensif"} · {namaFaskes}</p>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Telah <strong>LULUS & SELESAI</strong> menjalani terapi OAT selama <strong>{totalDays} hari</strong> berturut-turut di <strong>{namaFaskes}</strong>.<br/>
                Diselesaikan: <strong>{tanggalSelesai}</strong>
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[9px] text-slate-500 font-mono">
                <div>
                  <span className="block">Kader Pendamping:</span>
                  <span className="block font-bold text-slate-700 mt-0.5">{namaKader}</span>
                </div>
                <div>
                  <span className="block">Faskes:</span>
                  <span className="block font-bold text-slate-700 mt-0.5">{namaFaskes}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-100" />
              {downloading ? "Menyiapkan..." : "Unduh Sertifikat"}
            </button>
            <p className="text-[9px] text-slate-400 text-center">File HTML — buka di browser lalu Ctrl+P untuk cetak/simpan PDF</p>
          </div>
        ) : (
          <div className="bg-slate-100 border border-slate-200 rounded-3xl p-5 text-center flex flex-col items-center space-y-2 py-8">
            <Award className="w-12 h-12 text-slate-300" />
            <h4 className="text-xs font-bold text-slate-700">Sertifikat Belum Terbuka</h4>
            <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
              Sertifikat akan terbuka setelah terapi OAT mencapai 100% (hari ke-{totalDays}).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
