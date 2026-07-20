/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MonitoringLog } from "../types";
import { Activity, Camera, Plus, TrendingUp, TrendingDown, CheckCircle, Shield, AlertTriangle, Scale } from "lucide-react";

interface MonitoringKondisiProps {
  monitoringLogs: MonitoringLog[];
  beratBadanAwal?: number;
  onAddLog: (log: MonitoringLog) => void;
}

export default function MonitoringKondisi({ monitoringLogs, beratBadanAwal, onAddLog }: MonitoringKondisiProps) {
  const [batuk, setBatuk] = useState<boolean>(false);
  const [demam, setDemam] = useState<boolean>(false);
  const [beratBadan, setBeratBadan] = useState<string>("");
  const [nafsuMakan, setNafsuMakan] = useState<"Meningkat" | "Menurun" | "Stabil">("Stabil");
  const [sesakNapas, setSesakNapas] = useState<boolean>(false);
  const [efekSamping, setEfekSamping] = useState<boolean>(false);
  const [efekSampingDetail, setEfekSampingDetail] = useState<string>("");
  const [photoSelected, setPhotoSelected] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Get previous weight — fallback ke beratBadanAwal dari profil, bukan hardcode 62
  const prevLog = monitoringLogs.length > 0 ? monitoringLogs[monitoringLogs.length - 1] : null;
  const prevWeight = prevLog ? prevLog.beratBadan : (beratBadanAwal || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!beratBadan) {
      alert("Harap isi berat badan Anda saat ini!");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const newLog: MonitoringLog = {
      tanggal: todayStr,
      batuk,
      demam,
      beratBadan: parseFloat(beratBadan),
      nafsuMakan,
      sesakNapas,
      efekSamping,
      efekSampingDetail: efekSamping ? efekSampingDetail : undefined,
      fotoObatUrl: photoSelected ? "data:image/png;base64,mocked_drug_photo_captured" : undefined,
      statusKirim: "Terkirim ke Puskesmas" // Sync simulation
    };

    onAddLog(newLog);
    setSuccessMessage("Laporan kondisi harian berhasil dienksripsi dan dikirim ke Puskesmas!");
    
    // Clear form
    setBatuk(false);
    setDemam(false);
    setBeratBadan("");
    setNafsuMakan("Stabil");
    setSesakNapas(false);
    setEfekSamping(false);
    setEfekSampingDetail("");
    setPhotoSelected(false);

    setTimeout(() => {
      setSuccessMessage("");
    }, 4000);
  };

  const handleSimulatePhoto = () => {
    setPhotoSelected(true);
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen font-sans pb-24">
      <div className="p-4 space-y-4 max-w-md mx-auto w-full">
        {/* Module Title */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-md flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <Activity className="w-6 h-6 text-emerald-100" />
          </div>
          <div>
            <h2 className="font-display font-bold text-base leading-tight">
              Monitoring Kondisi Harian
            </h2>
            <p className="text-[10px] text-emerald-100 leading-normal mt-0.5">
              Isi data berikut secara berkala agar Kader TB dan Tenaga Medis memantau perkembangan klinis Anda.
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex gap-2.5 items-start animate-pulse-subtle">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Sukses!</p>
              <p className="mt-0.5 leading-relaxed">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Monitoring Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
            📝 Formulir Gejala & Berat Badan
          </h3>

          {/* Batuk */}
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
            <div className="text-xs">
              <span className="font-bold text-slate-700 block">Apakah hari ini batuk?</span>
              <span className="text-[10px] text-slate-400">Batuk berdahak atau kering</span>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setBatuk(true)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  batuk ? "bg-rose-500 text-white" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                Ya
              </button>
              <button
                type="button"
                onClick={() => setBatuk(false)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !batuk ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                Tidak
              </button>
            </div>
          </div>

          {/* Demam */}
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
            <div className="text-xs">
              <span className="font-bold text-slate-700 block">Apakah hari ini demam?</span>
              <span className="text-[10px] text-slate-400">Badan meriang atau terasa panas</span>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setDemam(true)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  demam ? "bg-rose-500 text-white" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                Ya
              </button>
              <button
                type="button"
                onClick={() => setDemam(false)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !demam ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                Tidak
              </button>
            </div>
          </div>

          {/* Sesak Napas */}
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
            <div className="text-xs">
              <span className="font-bold text-slate-700 block">Apakah sesak napas?</span>
              <span className="text-[10px] text-slate-400">Napas berat atau tersengal-sengal</span>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setSesakNapas(true)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sesakNapas ? "bg-rose-500 text-white" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                Ya
              </button>
              <button
                type="button"
                onClick={() => setSesakNapas(false)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !sesakNapas ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                Tidak
              </button>
            </div>
          </div>

          {/* Berat Badan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Berat Badan Hari Ini (kg)
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.1"
                  value={beratBadan}
                  onChange={(e) => setBeratBadan(e.target.value)}
                  placeholder="Isi angka saja (misal: 62.5)"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs font-bold"
                />
                <Scale className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              
              {/* Previous Weight Viewer */}
              <div className="bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200 flex flex-col justify-center text-center">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block">
                  {prevLog ? "BB Sebelumnya" : "BB Awal"}
                </span>
                <span className="text-xs font-mono font-extrabold text-slate-700 block">
                  {prevWeight > 0 ? `${prevWeight} kg` : "—"}
                </span>
              </div>
            </div>

            {/* Live comparison note */}
            {beratBadan && (
              <div className="flex items-center gap-1.5 text-[10px] font-medium pt-1">
                {parseFloat(beratBadan) > prevWeight ? (
                  <span className="text-emerald-600 flex items-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" /> Berat naik {(parseFloat(beratBadan) - prevWeight).toFixed(1)} kg dari pekan lalu. Pertanda nutrisi Anda membaik!
                  </span>
                ) : parseFloat(beratBadan) < prevWeight ? (
                  <span className="text-rose-600 flex items-center gap-0.5">
                    <TrendingDown className="w-3.5 h-3.5" /> Berat turun {(prevWeight - parseFloat(beratBadan)).toFixed(1)} kg. Laporkan ke dokter jika turun drastis.
                  </span>
                ) : (
                  <span className="text-slate-500">Berat badan stabil (sama seperti pekan lalu).</span>
                )}
              </div>
            )}
          </div>

          {/* Nafsu Makan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Kondisi Nafsu Makan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Menurun", "Stabil", "Meningkat"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setNafsuMakan(opt)}
                  className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                    nafsuMakan === opt
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Efek Samping Obat */}
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
              <div className="text-xs">
                <span className="font-bold text-slate-700 block">Merasakan efek samping OAT?</span>
                <span className="text-[10px] text-slate-400">Mual, gatal, sendi kaku, dsb.</span>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setEfekSamping(true)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    efekSamping ? "bg-rose-500 text-white" : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  Ya
                </button>
                <button
                  type="button"
                  onClick={() => setEfekSamping(false)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    !efekSamping ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  Tidak
                </button>
              </div>
            </div>

            {efekSamping && (
              <div className="space-y-1 animate-pulse-subtle">
                <textarea
                  value={efekSampingDetail}
                  onChange={(e) => setEfekSampingDetail(e.target.value)}
                  placeholder="Deskripsikan efek samping (misal: mual hebat pagi hari, gatal bintik merah, urin jingga)"
                  rows={2}
                  className="w-full p-3 bg-rose-50/50 border border-rose-200 rounded-xl focus:ring-1 focus:ring-rose-500 text-xs"
                />
                <p className="text-[9px] text-rose-600 flex items-start gap-1 leading-normal">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Jika mengalami efek samping berat seperti kulit menguning, telinga berdenging keras, atau pandangan kabur, segera ke UGD faskes terdekat!</span>
                </p>
              </div>
            )}
          </div>

          {/* Foto Obat (Opsional) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Unggah Foto Obat (Opsional)
            </label>
            <div className="border border-dashed border-slate-300 rounded-2xl p-4 text-center flex flex-col items-center justify-center space-y-2 bg-slate-50 hover:bg-slate-100 transition-all">
              {photoSelected ? (
                <div className="text-xs text-emerald-700 flex flex-col items-center space-y-1">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                  <span className="font-bold">✓ Foto Blister Obat Terlampir</span>
                  <span className="text-[9px] text-slate-400">Akan dienkripsi bersama log harian</span>
                  <button
                    type="button"
                    onClick={() => setPhotoSelected(false)}
                    className="text-[10px] text-rose-500 underline mt-1"
                  >
                    Hapus Foto
                  </button>
                </div>
              ) : (
                <>
                  <Camera className="w-8 h-8 text-slate-400" />
                  <div className="text-xs text-slate-600">
                    <button
                      type="button"
                      onClick={handleSimulatePhoto}
                      className="font-bold text-emerald-600 hover:underline"
                    >
                      Buka Kamera HP
                    </button>{" "}
                    atau seret file ke sini
                  </div>
                  <p className="text-[9px] text-slate-400">
                    Mendukung JPG, PNG, maks 5MB. Enkripsi lokal otomatis.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Shield className="w-4 h-4 text-emerald-100" /> Kirim Laporan Terenkripsi
          </button>
        </form>

        {/* History of monitoring */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            📊 Riwayat Klinis Terakhir
          </h3>
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
            {monitoringLogs.slice().reverse().map((log, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between items-center pb-1 border-b border-slate-200">
                  <span className="font-bold text-slate-700">
                    {new Date(log.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </span>
                  <span className="text-[9px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                    <Shield className="w-2.5 h-2.5" /> Terenkripsi
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                  <div>
                    • Batuk: <span className={log.batuk ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>{log.batuk ? "Ya" : "Tidak"}</span>
                  </div>
                  <div>
                    • Demam: <span className={log.demam ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>{log.demam ? "Ya" : "Tidak"}</span>
                  </div>
                  <div>
                    • Berat Badan: <span className="font-bold text-slate-800">{log.beratBadan} kg</span>
                  </div>
                  <div>
                    • Nafsu Makan: <span className="font-bold text-slate-800">{log.nafsuMakan}</span>
                  </div>
                  <div>
                    • Sesak: <span className={log.sesakNapas ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>{log.sesakNapas ? "Ya" : "Tidak"}</span>
                  </div>
                  <div>
                    • Efek Samping: <span className={log.efekSamping ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>{log.efekSamping ? "Ada" : "Nihil"}</span>
                  </div>
                </div>

                {log.efekSampingDetail && (
                  <div className="bg-rose-50/50 p-2 rounded-lg border border-rose-100 text-[10px] text-rose-700">
                    <strong>Keluhan:</strong> {log.efekSampingDetail}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
