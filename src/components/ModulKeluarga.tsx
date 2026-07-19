/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { FamilySupportLog, UserProfile } from "../types";
import { KELUARGA_GUIDELINES } from "../data/eduData";
import { Heart, CheckCircle2, ShieldCheck, HelpCircle, FileText, ClipboardList, AlertCircle, Sparkles } from "lucide-react";

interface ModulKeluargaProps {
  currentUser: UserProfile;
  familyLogs: FamilySupportLog[];
  onAddFamilyLog: (log: Omit<FamilySupportLog, "id">) => void;
}

export default function ModulKeluarga({ currentUser, familyLogs, onAddFamilyLog }: ModulKeluargaProps) {
  const [activeTab, setActiveTab] = useState<"laporan" | "panduan">("laporan");
  
  // Checklist form states
  const [obatTepatWaktu, setObatTepatWaktu] = useState(true);
  const [dosisSesuai, setDosisSesuai] = useState(true);
  const [didampingiLangsung, setDidampingiLangsung] = useState(true);
  const [adaEfekSamping, setAdaEfekSamping] = useState(false);
  const [maskerSiap, setMaskerSiap] = useState(true);
  const [catatanKeluarga, setCatatanKeluarga] = useState("");
  const [pmoNama, setPmoNama] = useState(currentUser.pmoNama || "");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmitLog = (e: React.FormEvent) => {
    e.preventDefault();
    onAddFamilyLog({
      tanggal: new Date().toISOString().split("T")[0],
      obatTepatWaktu,
      dosisSesuai,
      didampingiLangsung,
      adaEfekSamping,
      maskerSiap,
      catatanKeluarga: catatanKeluarga.trim(),
      pmoNama: pmoNama.trim() || "Keluarga Dampingan"
    });

    setCatatanKeluarga("");
    setSuccessMsg("Laporan pendampingan keluarga berhasil dikirim & disimpan ke database!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen font-sans pb-24">
      {/* Header Tab */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 p-3 flex gap-1 shadow-xs">
        <button
          onClick={() => setActiveTab("laporan")}
          className={`flex-1 py-2.5 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "laporan"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <ClipboardList className="w-4 h-4" /> Kirim Laporan PMO
        </button>
        <button
          onClick={() => setActiveTab("panduan")}
          className={`flex-1 py-2.5 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "panduan"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Heart className="w-4 h-4" /> Panduan & Gizi
        </button>
      </div>

      <div className="p-4 space-y-4 max-w-md mx-auto w-full">
        {/* Intro Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-5 shadow-md space-y-1.5">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-white text-blue-600" />
            <h2 className="font-display font-bold text-base leading-tight">
              Modul Mandiri Keluarga & PMO
            </h2>
          </div>
          <p className="text-[10px] text-blue-100 leading-normal">
            Keluarga bertindak sebagai Pendamping Minum Obat (PMO) untuk mengawal kepatuhan OAT harian, asupan gizi, dan melaporkan kondisi pasien agar terpantau langsung oleh Kader & Tenaga Medis.
          </p>
        </div>

        {/* --- TAB 1: FORM LAPORAN PMO --- */}
        {activeTab === "laporan" && (
          <div className="space-y-4">
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitLog} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <FileText className="w-4 h-4 text-blue-600" /> Checklist Harian Pendamping (PMO)
              </h3>

              {/* Checklist Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-700 font-semibold leading-tight">Obat ditelan tepat waktu?</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setObatTepatWaktu(true)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        obatTepatWaktu ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      Ya
                    </button>
                    <button
                      type="button"
                      onClick={() => setObatTepatWaktu(false)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        !obatTepatWaktu ? "bg-red-600 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      Tidak
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-700 font-semibold leading-tight">Dosis tablet sudah sesuai?</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDosisSesuai(true)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        dosisSesuai ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      Ya
                    </button>
                    <button
                      type="button"
                      onClick={() => setDosisSesuai(false)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        !dosisSesuai ? "bg-red-600 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      Tidak
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-700 font-semibold leading-tight">Didampingi & dilihat ditelan langsung?</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDidampingiLangsung(true)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        didampingiLangsung ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      Ya
                    </button>
                    <button
                      type="button"
                      onClick={() => setDidampingiLangsung(false)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        !didampingiLangsung ? "bg-red-600 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      Tidak
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-700 font-semibold leading-tight">Ada efek samping (gatal, muntah)?</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAdaEfekSamping(true)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        adaEfekSamping ? "bg-red-600 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      Ya
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdaEfekSamping(false)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        !adaEfekSamping ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      Tidak
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-700 font-semibold leading-tight">Masker & ventilasi rumah siap?</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setMaskerSiap(true)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        maskerSiap ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      Ya
                    </button>
                    <button
                      type="button"
                      onClick={() => setMaskerSiap(false)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        !maskerSiap ? "bg-red-600 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      Tidak
                    </button>
                  </div>
                </div>
              </div>

              {/* Name and Textarea input */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Nama Pendamping (PMO)
                  </label>
                  <input
                    type="text"
                    value={pmoNama}
                    onChange={(e) => setPmoNama(e.target.value)}
                    placeholder="Nama Istri / Suami / Orang tua / Anak"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Catatan Perkembangan Pasien Hari Ini
                  </label>
                  <textarea
                    value={catatanKeluarga}
                    onChange={(e) => setCatatanKeluarga(e.target.value)}
                    placeholder="Contoh: Pasien hari ini makan dengan lahap, mual reda, dan tidak ada keluhan sesak napas."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    rows={3}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-blue-600/10"
              >
                Kirim & Enkripsi Laporan Keluarga (E2EE)
              </button>
            </form>

            {/* History of submissions */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3.5">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                ⏳ Histori Laporan Pendampingan Keluarga
              </h3>

              {familyLogs.length === 0 ? (
                <p className="text-slate-400 text-xs italic text-center py-4">
                  Belum ada laporan yang dikirimkan.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                  {familyLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                        <span>Oleh: <strong>{log.pmoNama}</strong></span>
                        <span>{log.tanggal}</span>
                      </div>
                      <p className="text-slate-600 italic leading-normal">
                        "{log.catatanKeluarga}"
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          log.obatTepatWaktu ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700"
                        }`}>
                          {log.obatTepatWaktu ? "✓ Tepat Waktu" : "✗ Terlambat"}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          log.dosisSesuai ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700"
                        }`}>
                          {log.dosisSesuai ? "✓ Dosis Sesuai" : "✗ Dosis Salah"}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          log.didampingiLangsung ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700"
                        }`}>
                          {log.didampingiLangsung ? "✓ Didampingi" : "✗ Mandiri"}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          log.adaEfekSamping ? "bg-red-50 text-red-700 border border-red-100" : "bg-slate-100 text-slate-600"
                        }`}>
                          {log.adaEfekSamping ? "⚠ Ada Efek Samping" : "✓ Efek Samping (-)"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 2: PANDUAN KELUARGA --- */}
        {activeTab === "panduan" && (
          <div className="space-y-4">
            {/* Cara Merawat */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-4 bg-blue-500 rounded-sm" /> Cara Merawat Pasien TB
              </h3>
              <ul className="space-y-2">
                {KELUARGA_GUIDELINES.caraMerawat.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-600 flex gap-2 items-start leading-normal">
                    <span className="font-mono text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold mt-0.5 flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mencegah Penularan */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-4 bg-rose-500 rounded-sm" /> Cara Mencegah Penularan
              </h3>
              <ul className="space-y-2">
                {KELUARGA_GUIDELINES.mencegahPenularan.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-600 flex gap-2 items-start leading-normal">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Gizi Pendukung */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 space-y-2.5">
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" /> Nutrisi Tinggi Kalori Tinggi Protein (TKTP)
              </h3>
              <p className="text-[11px] text-amber-800 leading-normal">
                Pasien TB membutuhkan asupan gizi yang kaya protein untuk meregenerasi jaringan paru-paru yang rusak dan memulihkan massa otot akibat berat badan turun.
              </p>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-amber-900">
                <div className="bg-white/60 p-2 rounded-lg text-center">🥚 Telur & Daging</div>
                <div className="bg-white/60 p-2 rounded-lg text-center">🥛 Susu & Yogurt</div>
                <div className="bg-white/60 p-2 rounded-lg text-center">🥜 Kacang & Tempe</div>
                <div className="bg-white/60 p-2 rounded-lg text-center">🍌 Buah-buahan Segar</div>
              </div>
            </div>

            {/* Ventilasi Rumah */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-4 bg-emerald-500 rounded-sm" /> Ventilasi & Lingkungan Sehat
              </h3>
              <ul className="space-y-2">
                {KELUARGA_GUIDELINES.ventilasiRumah.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-600 flex gap-2 items-start leading-normal">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
