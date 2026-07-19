/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserProfile, MedicationLog, KontrolSchedule, SelfAssessment } from "../types";
import { Award, Bell, CheckSquare, Calendar, Heart, Shield, ArrowRight, User, Sparkles, AlertCircle, TrendingUp, Clock } from "lucide-react";

interface DashboardProps {
  profile: UserProfile;
  medicationLogs: MedicationLog[];
  schedules: KontrolSchedule[];
  assessments: SelfAssessment[];
  currentDay: number;
  totalDays: number;
  onNavigateToTab: (tabId: string) => void;
  onAddLog?: (log: any) => void;
}

// Curated daily motivational quotes for TB patients
const MOTIVATIONAL_QUOTES = [
  "Satu demi satu, setiap butir obat adalah senjata memusnahkan kuman TB. Anda pasti sembuh!",
  "Kedisiplinan hari ini adalah investasi kesehatan bagi anak dan pasangan Anda di rumah.",
  "Jangan lelah di tengah jalan. Sisa kuman yang tertidur sedang menunggu Anda lengah. Minum obat Anda dengan tuntas!",
  "TB adalah penyakit menular biasa, bukan aib atau kutukan. Medis bisa menyembuhkan Anda 100%!",
  "Keluarga Anda tersenyum melihat kesungguhan Anda bangun setiap pagi demi meminum OAT. Tetap semangat!",
  "Tubuh yang kuat dibangun dari pikiran yang tenang dan gizi yang baik. Yuk, penuhi piring Anda dengan protein tinggi hari ini!"
];

export default function Dashboard({
  profile,
  medicationLogs,
  schedules,
  assessments,
  currentDay,
  totalDays,
  onNavigateToTab,
  onAddLog
}: DashboardProps) {
  // Real-time clock state
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " WIB";
  const formattedDate = time.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  
  // Calculate recovery progress
  const progressPercent = Math.min(Math.round((currentDay / totalDays) * 100), 100);

  // Get daily compliance rate
  const totalLogs = medicationLogs.length;
  const takenLogs = medicationLogs.filter(l => l.status === "sudah").length;
  const historicCompliance = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 100;

  // Get compliance score from Self Assessment (latest) or fallback to historic
  const latestAssessment = assessments[assessments.length - 1];
  const complianceScore = latestAssessment ? latestAssessment.skor : historicCompliance;

  // Get motivational quote based on day
  const dailyQuote = MOTIVATIONAL_QUOTES[currentDay % MOTIVATIONAL_QUOTES.length];

  // Today's medication status
  const todayStr = new Date().toISOString().split("T")[0];
  const todayLog = medicationLogs.find(l => l.tanggal === todayStr);
  const takenToday = todayLog?.status === "sudah";

  // Upcoming nearest control appointment
  const nextControl = schedules
    .filter(s => !s.selesai)
    .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())[0];

  const handleQuickTakeObat = () => {
    if (onAddLog) {
      onAddLog({
        id: "ML_" + Math.random().toString(36).substr(2, 9),
        tanggal: todayStr,
        waktu: new Date().toTimeString().split(" ")[0].substring(0, 5),
        status: "sudah",
        efekSamping: "tidak ada",
        pmoDiverifikasi: true
      });
    }
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen font-sans pb-24">
      {/* Top Welcome Bar */}
      <div className="bg-white px-5 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-100 text-blue-800 p-2.5 rounded-xl font-bold text-sm">
            {profile.nama.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">
              {formattedDate} • {formattedTime}
            </span>
            <h1 className="font-display font-extrabold text-slate-800 text-sm leading-tight">
              {profile.nama}
            </h1>
          </div>
        </div>

        {/* E2EE Shield badge */}
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-blue-100">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span>E2EE Aktif</span>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-md mx-auto w-full">
        {/* DIRECT CRITICAL NOTIFICATION BANNER IF NOT TAKEN YET */}
        {!takenToday && (
          <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-3xl p-5 shadow-lg border border-red-400/20 animate-pulse-slow space-y-3">
            <div className="flex gap-2.5 items-start">
              <div className="bg-white/20 p-2 rounded-xl text-white">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-black tracking-widest text-red-100 block">PENGINGAT MINUM OAT</span>
                <h4 className="text-sm font-extrabold leading-snug">Hari Ini Anda Belum Menelan Obat!</h4>
                <p className="text-[11px] text-red-100 leading-normal">
                  Jangan tunda atau terlewat demi mencegah resistensi kuman. Setiap dosis adalah kunci kesembuhan Anda.
                </p>
              </div>
            </div>

            <button
              onClick={handleQuickTakeObat}
              className="w-full bg-white hover:bg-slate-100 text-red-600 text-xs font-extrabold py-3 px-4 rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5"
            >
              <CheckSquare className="w-4 h-4 text-red-600" />
              Saya Sudah Minum Obat Sekarang!
            </button>
          </div>
        )}
        {/* Daily Motivation Card */}
        <div className="bg-blue-600 text-white rounded-3xl p-5 shadow-md relative overflow-hidden">
          {/* Subtle decoration vector */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full translate-x-3 -translate-y-3" />
          <div className="flex gap-2 items-center text-xs text-blue-100 font-bold tracking-wide uppercase">
            <Sparkles className="w-4 h-4 text-yellow-300" /> Motivasi Hari Ini
          </div>
          <p className="text-xs font-medium leading-relaxed mt-2 italic">
            "{dailyQuote}"
          </p>
        </div>

        {/* Progress Menuju Sembuh */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3.5">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Target Pengobatan</span>
              <h3 className="text-xs font-bold text-slate-800">Progress Menuju Sembuh</h3>
            </div>
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg">
              Hari ke-{currentDay} dari {totalDays}
            </span>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-slate-100 h-4.5 rounded-full overflow-hidden flex relative items-center border border-slate-200">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
              <span className="absolute right-3.5 text-[10px] font-mono font-black text-slate-700">
                {progressPercent}% Selesai
              </span>
            </div>
          </div>
        </div>

        {/* Adherence and Medication Status Combined Widget */}
        <div className="grid grid-cols-2 gap-3">
          {/* Adherence Score Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-4 flex flex-col justify-between h-[120px]">
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                Skor Kepatuhan
              </span>
              <span className="font-display font-black text-3xl text-blue-400 block mt-1">
                {complianceScore}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] text-blue-400 font-bold">Kondisi Patuh</span>
            </div>
          </div>

          {/* Today's OAT reminder widget */}
          <div
            onClick={() => onNavigateToTab("reminder")}
            className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col justify-between h-[120px] shadow-xs cursor-pointer hover:bg-slate-50 transition-all"
          >
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                Obat Hari Ini
              </span>
              {takenToday ? (
                <span className="text-blue-600 font-bold text-xs block mt-1.5 leading-tight">
                  ✓ Sudah Ditelan
                </span>
              ) : (
                <span className="text-rose-500 font-bold text-xs block mt-1.5 leading-tight animate-pulse flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> Belum Konfirmasi
                </span>
              )}
            </div>
            <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5">
              Klik Detail <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Control Reminder */}
        {nextControl && (
          <div
            onClick={() => onNavigateToTab("calendar")}
            className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-2.5 cursor-pointer hover:bg-slate-50 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4.5 h-4.5 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-800">Pengingat Kontrol Terdekat</h4>
              </div>
              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                {nextControl.tipe}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-normal">
              {nextControl.deskripsi}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              Jadwal: {new Date(nextControl.tanggal).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long"
              })}
            </p>
          </div>
        )}

        {/* Quick Menu Grid for 12 Modules Navigation */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            🚀 Menu Modul Layanan Mandiri
          </h4>

          <div className="grid grid-cols-2 gap-2.5 text-xs font-semibold">
            <button
              onClick={() => onNavigateToTab("edu")}
              className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 rounded-xl transition-all text-left flex items-center justify-between"
            >
              <span>📚 Apa itu TB?</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateToTab("monitoring")}
              className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 rounded-xl transition-all text-left flex items-center justify-between"
            >
              <span>📈 Monitor Gejala</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateToTab("screening")}
              className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 rounded-xl transition-all text-left flex items-center justify-between"
            >
              <span>👪 Skrining Kontak</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateToTab("assessment")}
              className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 rounded-xl transition-all text-left flex items-center justify-between"
            >
              <span>📊 Cek Adheren</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateToTab("achievements")}
              className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 rounded-xl transition-all text-left flex items-center justify-between"
            >
              <span>🏆 Sembuh & Lencana</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateToTab("security")}
              className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 rounded-xl transition-all text-left flex items-center justify-between"
            >
              <span>🔒 Konsol E2EE</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
