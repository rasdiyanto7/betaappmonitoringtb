/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { KontakScreening } from "../types";
import { Users, Plus, Shield, CheckCircle, AlertTriangle, UserCheck, Calendar } from "lucide-react";

interface SkriningKontakProps {
  screenings: KontakScreening[];
  onAddScreening: (screening: KontakScreening) => void;
}

export default function SkriningKontak({ screenings, onAddScreening }: SkriningKontakProps) {
  const [nama, setNama] = useState("");
  const [usia, setUsia] = useState("");
  const [batukDuaMinggu, setBatukDuaMinggu] = useState(false);
  const [demam, setDemam] = useState(false);
  const [bbTurun, setBbTurun] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !usia) {
      alert("Harap lengkapi nama dan usia keluarga!");
      return;
    }

    const ageNum = parseInt(usia);
    const anakBalita = ageNum < 5;
    const lansia = ageNum >= 60;

    // Risk logic: if symptomatic (cough, fever, weight loss) OR vulnerable (balita/lansia in a house with active TB)
    const isHighRisk = batukDuaMinggu || demam || bbTurun || anakBalita || lansia;
    const statusRisiko = isHighRisk ? "Tinggi (Rekomendasi Faskes)" : "Rendah";

    const newScreening: KontakScreening = {
      id: "S_" + Date.now(),
      nama,
      usia: ageNum,
      batukDuaMinggu,
      demam,
      bbTurun,
      anakBalita,
      lansia,
      tanggal: new Date().toISOString().split("T")[0],
      statusRisiko
    };

    onAddScreening(newScreening);
    setSuccessMessage(`Hasil skrining untuk ${nama} berhasil disimpan dengan enkripsi!`);

    // Reset Form
    setNama("");
    setUsia("");
    setBatukDuaMinggu(false);
    setDemam(false);
    setBbTurun(false);

    setTimeout(() => {
      setSuccessMessage("");
    }, 4000);
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen font-sans pb-24">
      <div className="p-4 space-y-4 max-w-md mx-auto w-full">
        {/* Header Module */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-md flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-xl">
            <Users className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <h2 className="font-display font-bold text-base leading-tight">
              Skrining Kontak Serumah
            </h2>
            <p className="text-[10px] text-emerald-100 leading-normal mt-0.5">
              Lindungi keluarga terdekat. Daftarkan dan lakukan skrining gejala TB berkala bagi seluruh penghuni rumah.
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex gap-2.5 items-start">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Skrining Berhasil!</p>
              <p className="mt-0.5 leading-relaxed">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
            👪 Formulir Skrining Anggota Keluarga
          </h3>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Nama Lengkap</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama keluarga serumah"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Usia (Tahun)</label>
            <input
              type="number"
              value={usia}
              onChange={(e) => setUsia(e.target.value)}
              placeholder="Masukkan usia dalam angka"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs"
              required
            />
          </div>

          {/* Symptom Checklist */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
              Checklist Gejala (Dalam 2 Minggu Terakhir)
            </span>

            {/* Batuk > 2 Minggu */}
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer transition-all">
              <div className="text-xs">
                <span className="font-bold text-slate-700 block">Batuk terus menerus &gt; 2 minggu?</span>
                <span className="text-[10px] text-slate-400">Batuk kering/berdahak berkepanjangan</span>
              </div>
              <input
                type="checkbox"
                checked={batukDuaMinggu}
                onChange={(e) => setBatukDuaMinggu(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            {/* Demam */}
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer transition-all">
              <div className="text-xs">
                <span className="font-bold text-slate-700 block">Mengalami demam / meriang berulang?</span>
                <span className="text-[10px] text-slate-400">Terutama sore atau malam hari tanpa sebab</span>
              </div>
              <input
                type="checkbox"
                checked={demam}
                onChange={(e) => setDemam(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            {/* Berat Badan Turun */}
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer transition-all">
              <div className="text-xs">
                <span className="font-bold text-slate-700 block">Berat badan turun tanpa sebab jelas?</span>
                <span className="text-[10px] text-slate-400">Atau nafsu makan anjlok drastis</span>
              </div>
              <input
                type="checkbox"
                checked={bbTurun}
                onChange={(e) => setBbTurun(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Shield className="w-4 h-4 text-emerald-100" /> Simpan Hasil Skrining Terenkripsi
          </button>
        </form>

        {/* Screening History */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
            <UserCheck className="w-4 h-4 text-emerald-600" /> Hasil Skrining Kontak Serumah
          </h3>

          <div className="space-y-3 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
            {screenings.map((sc) => {
              const isHighRisk = sc.statusRisiko.includes("Tinggi");
              return (
                <div
                  key={sc.id}
                  className={`p-3.5 rounded-2xl border transition-all space-y-2 text-xs ${
                    isHighRisk
                      ? "bg-rose-50/50 border-rose-200"
                      : "bg-slate-50 border-slate-100"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800">{sc.nama} ({sc.usia} tahun)</h4>
                      <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" /> Diperiksa {new Date(sc.tanggal).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                      isHighRisk
                        ? "bg-rose-100 text-rose-800 border-rose-200 animate-pulse"
                        : "bg-emerald-100 text-emerald-800 border-emerald-200"
                    }`}>
                      {isHighRisk ? "Risiko Tinggi" : "Risiko Rendah"}
                    </span>
                  </div>

                  {isHighRisk ? (
                    <div className="bg-rose-100/60 p-2.5 rounded-xl text-[10px] text-rose-800 leading-relaxed flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <div>
                        <strong>Rekomendasi Faskes:</strong> Anggota keluarga ini masuk kelompok rentan atau bergejala TB. Harap segera bawa ke Puskesmas Sukajadi untuk pemeriksaan dahak TCM (Tes Cepat Molekuler) atau rontgen dada sedini mungkin!
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-100/40 p-2.5 rounded-xl text-[10px] text-emerald-800 leading-relaxed flex items-start gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div>
                        Anggota keluarga sehat tanpa gejala TB. Tetap terapkan ventilasi udara yang baik, biarkan sinar matahari masuk, dan latih etika batuk di rumah.
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
