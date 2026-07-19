/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SelfAssessment as SelfAssessmentType } from "../types";
import { ShieldCheck, ClipboardList, CheckCircle, AlertTriangle, RefreshCw, BarChart2 } from "lucide-react";

interface SelfAssessmentProps {
  assessments: SelfAssessmentType[];
  onAddAssessment: (assessment: SelfAssessmentType) => void;
}

export default function SelfAssessment({ assessments, onAddAssessment }: SelfAssessmentProps) {
  const [minumHariIni, setMinumHariIni] = useState<boolean | null>(null);
  const [pernahLupaMingguIni, setPernahLupaMingguIni] = useState<boolean | null>(null);
  const [adaEfekSamping, setAdaEfekSamping] = useState<boolean | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const latestAssessment = assessments[assessments.length - 1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (minumHariIni === null || pernahLupaMingguIni === null || adaEfekSamping === null) {
      alert("Harap jawab semua kuesioner sebelum mengirim!");
      return;
    }

    // Adherence scoring calculation:
    // - Drink today: Yes (50 pts), No (0 pts)
    // - Forgot this week: No (35 pts), Yes (0 pts)
    // - Side effects: No (15 pts), Yes (5 pts - because side effects lower adherence but are reported)
    let score = 0;
    if (minumHariIni) score += 50;
    if (!pernahLupaMingguIni) score += 35;
    if (!adaEfekSamping) score += 15;
    else score += 5;

    let kategori: "Sangat Patuh" | "Cukup Patuh" | "Kurang Patuh" = "Kurang Patuh";
    if (score >= 90) kategori = "Sangat Patuh";
    else if (score >= 60) kategori = "Cukup Patuh";

    const newAssessment: SelfAssessmentType = {
      tanggal: new Date().toISOString().split("T")[0],
      minumHariIni,
      pernahLupaMingguIni,
      adaEfekSamping,
      skor: score,
      kategori
    };

    onAddAssessment(newAssessment);
    setSuccessMessage("Penilaian Mandiri berhasil dihitung! Skor Kepatuhan Anda telah terupdate.");

    // Reset Form
    setMinumHariIni(null);
    setPernahLupaMingguIni(null);
    setAdaEfekSamping(null);

    setTimeout(() => {
      setSuccessMessage("");
    }, 4000);
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen font-sans pb-24">
      <div className="p-4 space-y-4 max-w-md mx-auto w-full">
        {/* Header Module */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-md flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-xl flex-shrink-0">
            <ClipboardList className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <h2 className="font-display font-bold text-base leading-tight">
              Self Assessment Kepatuhan
            </h2>
            <p className="text-[10px] text-emerald-100 leading-normal mt-0.5">
              Evaluasi kepatuhan terapi mandiri Anda secara berkala. Skor ini akan menentukan peringkat kesehatan Anda!
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex gap-2.5 items-start">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Penilaian Selesai!</p>
              <p className="mt-0.5 leading-relaxed">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Adherence Gauge (Latest score) */}
        {latestAssessment && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                Hasil Penilaian Terakhir
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display font-black text-3xl text-emerald-600">
                  {latestAssessment.skor}
                </span>
                <span className="text-xs text-slate-400">/ 100 poin</span>
              </div>
              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border inline-block ${
                latestAssessment.kategori === "Sangat Patuh"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : latestAssessment.kategori === "Cukup Patuh"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}>
                {latestAssessment.kategori}
              </span>
            </div>

            {/* Micro bar graph symbol */}
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-2xl flex items-center justify-center">
              <BarChart2 className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
        )}

        {/* Assessment Questionnaire Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
            📊 Kuesioner Evaluasi Terapi Singkat
          </h3>

          {/* Q1: Drink Today */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              1. Apakah hari ini Anda sudah meminum seluruh obat OAT sesuai dosis?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMinumHariIni(true)}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  minumHariIni === true
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                Ya, Sudah Ditelan
              </button>
              <button
                type="button"
                onClick={() => setMinumHariIni(false)}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  minumHariIni === false
                    ? "bg-rose-500 text-white shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                Belum Minum
              </button>
            </div>
          </div>

          {/* Q2: Forgot this week */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              2. Apakah dalam satu minggu ini Anda pernah lupa/terlewat meminum obat?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPernahLupaMingguIni(true)}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pernahLupaMingguIni === true
                    ? "bg-rose-500 text-white shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                Ya, Pernah Lupa
              </button>
              <button
                type="button"
                onClick={() => setPernahLupaMingguIni(false)}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pernahLupaMingguIni === false
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                Tidak, Selalu Patuh
              </button>
            </div>
          </div>

          {/* Q3: Side effects */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              3. Apakah Anda sedang merasakan adanya efek samping OAT saat ini?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdaEfekSamping(true)}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  adaEfekSamping === true
                    ? "bg-rose-500 text-white shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                Ya, Ada Keluhan
              </button>
              <button
                type="button"
                onClick={() => setAdaEfekSamping(false)}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  adaEfekSamping === false
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                Tidak, Sehat Saja
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-100" /> Proses & Hitung Kepatuhan
          </button>
        </form>

        {/* Score Guidance */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-2.5">
          <h4 className="text-xs font-bold text-slate-700">💡 Penjelasan Kategori Skor:</h4>
          <div className="space-y-2 text-[10px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full flex-shrink-0" />
              <span><strong>Sangat Patuh (90 - 100):</strong> Terapi berada dalam jalur hijau. Terus pertahankan!</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full flex-shrink-0" />
              <span><strong>Cukup Patuh (60 - 89):</strong> Waspadai lupa obat, segera hubungi Kader jika kesulitan.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full flex-shrink-0" />
              <span><strong>Kurang Patuh (&lt; 60):</strong> Berisiko mengalami kegagalan terapi TB. Hubungi dokter segera.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
