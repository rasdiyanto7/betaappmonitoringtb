/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { KontrolSchedule } from "../types";
import { Calendar, Bell, Plus, CheckCircle, Clock, Trash, AlertTriangle } from "lucide-react";

interface JadwalKontrolProps {
  schedules: KontrolSchedule[];
  onAddSchedule: (schedule: KontrolSchedule) => void;
  onToggleSchedule: (id: string) => void;
}

export default function JadwalKontrol({ schedules, onAddSchedule, onToggleSchedule }: JadwalKontrolProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [tanggal, setTanggal] = useState("");
  const [tipe, setTipe] = useState<"Kunjungan Rutin" | "Pemeriksaan Dahak (Sputum)" | "Pengambilan Obat">("Kunjungan Rutin");
  const [deskripsi, setDeskripsi] = useState("");

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  // Identify H-1 (tomorrow) schedules to trigger alert notifications
  const h1Schedules = schedules.filter(s => s.tanggal === tomorrowStr && !s.selesai);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal || !deskripsi) {
      alert("Harap lengkapi tanggal dan deskripsi jadwal!");
      return;
    }

    const newSchedule: KontrolSchedule = {
      id: "K_" + Date.now(),
      tanggal,
      tipe,
      deskripsi,
      selesai: false
    };

    onAddSchedule(newSchedule);
    setTanggal("");
    setDeskripsi("");
    setShowAddForm(false);
  };

  const getTipeBadgeClass = (type: string) => {
    switch (type) {
      case "Pengambilan Obat":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Pemeriksaan Dahak (Sputum)":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-sky-100 text-sky-800 border-sky-200";
    }
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen font-sans pb-24">
      {/* H-1 Push Notifications */}
      {h1Schedules.length > 0 && (
        <div className="bg-amber-500 text-white p-4 animate-pulse-subtle flex flex-col items-center justify-center text-center space-y-1.5 shadow-sm">
          <div className="flex items-center gap-1.5">
            <Bell className="w-5 h-5 text-white animate-bounce" />
            <span className="font-display font-bold text-sm">NOTIFIKASI H-1 PENTING!</span>
          </div>
          {h1Schedules.map((s, idx) => (
            <p key={idx} className="text-xs text-amber-50 max-w-sm leading-normal">
              Besok Anda memiliki jadwal: <strong>{s.tipe}</strong> - {s.deskripsi}. Harap persiapkan keperluan faskes Anda!
            </p>
          ))}
        </div>
      )}

      <div className="p-4 space-y-4 max-w-md mx-auto w-full">
        {/* Module Header */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-slate-800 text-base leading-tight">
                  Jadwal & Agenda Kontrol
                </h2>
                <p className="text-[10px] text-slate-400">
                  Pantau tanggal penting kontrol, tes sputum, & pengambilan obat
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-2 shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add Schedule Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs space-y-3 animate-pulse-subtle">
            <h3 className="text-xs font-bold text-slate-800">Tambahkan Jadwal Baru</h3>
            
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">
                Tanggal Kontrol
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">
                Kategori Agenda
              </label>
              <select
                value={tipe}
                onChange={(e) => setTipe(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="Kunjungan Rutin">Kunjungan Rutin Dokter</option>
                <option value="Pemeriksaan Dahak (Sputum)">Pemeriksaan Dahak (Sputum)</option>
                <option value="Pengambilan Obat">Pengambilan Obat</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase">
                Keterangan / Lokasi
              </label>
              <input
                type="text"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Misal: Bertemu dr. Andi di Lab Puskesmas"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                Simpan Agenda
              </button>
            </div>
          </form>
        )}

        {/* Agenda list */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-4 h-4 text-emerald-600" /> Daftar Agenda Mendatang
          </h3>

          <div className="space-y-3">
            {schedules.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Tidak ada agenda kontrol terjadwal.
              </p>
            ) : (
              schedules
                .slice()
                .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
                .map((schedule) => {
                  const isTomorrow = schedule.tanggal === tomorrowStr;
                  return (
                    <div
                      key={schedule.id}
                      className={`p-4 rounded-2xl border transition-all flex justify-between items-start gap-3 ${
                        schedule.selesai
                          ? "bg-slate-50 border-slate-100 opacity-60"
                          : isTomorrow
                          ? "bg-amber-50/50 border-amber-300 shadow-xs"
                          : "bg-white border-slate-100 shadow-xs"
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wide ${getTipeBadgeClass(schedule.tipe)}`}>
                            {schedule.tipe}
                          </span>
                          {isTomorrow && !schedule.selesai && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-500 text-white animate-pulse flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" /> Besok!
                            </span>
                          )}
                        </div>
                        
                        <p className={`text-xs font-bold leading-normal ${schedule.selesai ? "line-through text-slate-500" : "text-slate-800"}`}>
                          {schedule.deskripsi}
                        </p>

                        <div className="text-[10px] text-slate-400 font-mono">
                          Tanggal: {new Date(schedule.tanggal).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </div>
                      </div>

                      {/* Check off button */}
                      <button
                        onClick={() => onToggleSchedule(schedule.id)}
                        className={`p-1.5 rounded-full transition-all flex-shrink-0 ${
                          schedule.selesai
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-slate-50 text-slate-400 hover:text-emerald-600 border border-slate-200"
                        }`}
                      >
                        <CheckCircle className="w-4 h-4 font-bold" />
                      </button>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
