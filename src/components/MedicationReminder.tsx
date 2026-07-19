/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { MedicationLog } from "../types";
import { Bell, Check, AlertCircle, Calendar, Play, Square, Volume2, ShieldCheck, RefreshCw } from "lucide-react";

interface MedicationReminderProps {
  medicationLogs: MedicationLog[];
  onAddLog: (log: MedicationLog) => void;
  onRefresh: () => void;
}

export default function MedicationReminder({ medicationLogs, onAddLog, onRefresh }: MedicationReminderProps) {
  const [alarmActive, setAlarmActive] = useState(false);
  const [audioOscillator, setAudioOscillator] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const todayStr = new Date().toISOString().split("T")[0];

  // Get today's log status
  const todayLog = medicationLogs.find(l => l.tanggal === todayStr);
  const isAlreadyTaken = todayLog?.status === "sudah";

  // Trigger automated alarm on load if today's medication hasn't been taken
  useEffect(() => {
    if (!isAlreadyTaken) {
      const timer = setTimeout(() => {
        setAlarmActive(true);
        if (!isMuted) {
          playBeepAlarm();
        }
      }, 800); // Trigger after 800ms
      return () => clearTimeout(timer);
    }
  }, [isAlreadyTaken]);

  // Web Audio API custom synthesizer for the alarm bell
  const playBeepAlarm = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch alarm tone
      
      // Ringing pulse effect
      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);

      // Repeat alarm every 1.5 seconds while active
      const interval = setInterval(() => {
        if (!alarmActive) {
          clearInterval(interval);
          return;
        }
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(880, audioCtx.currentTime);
        g.gain.setValueAtTime(0.5, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start();
        o.stop(audioCtx.currentTime + 0.5);
      }, 1500);

      setAudioOscillator({ interval, audioCtx });
    } catch (e) {
      console.warn("AudioContext blocked or unsupported on this device.", e);
    }
  };

  const stopAlarm = () => {
    setAlarmActive(false);
    if (audioOscillator?.interval) {
      clearInterval(audioOscillator.interval);
    }
  };

  const handleConfirmDrink = () => {
    stopAlarm();
    
    // Create new log entry
    const timeNow = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const newLog: MedicationLog = {
      tanggal: todayStr,
      status: "sudah",
      waktuMinum: timeNow,
      pmoDiverifikasi: true // Auto verified by family on tap
    };

    onAddLog(newLog);
  };

  // Calculate live compliance
  const totalLogs = medicationLogs.length;
  const takenLogs = medicationLogs.filter(l => l.status === "sudah").length;
  const complianceRate = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 100;

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen font-sans pb-24">
      {/* Visual Alarm Banner */}
      {alarmActive && !isAlreadyTaken && (
        <div className="bg-rose-600 text-white p-4 text-center animate-pulse-subtle flex flex-col items-center justify-center space-y-2 relative">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 animate-bounce text-yellow-300" />
            <span className="font-display font-bold text-sm">
              WAKTUNYA MINUM OBAT OAT HARI INI!
            </span>
          </div>
          <p className="text-[10px] text-rose-100 max-w-xs leading-normal">
            Alarm otomatis berbunyi karena Anda belum menekan tombol konfirmasi. Silakan minum obat Anda dengan segelas air sekarang.
          </p>
          <div className="flex gap-2 w-full max-w-xs pt-1">
            <button
              onClick={handleConfirmDrink}
              className="flex-1 bg-white text-rose-700 font-bold py-2 rounded-xl text-xs hover:bg-rose-50 transition-all flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4 text-rose-700" /> Sudah Minum
            </button>
            <button
              onClick={stopAlarm}
              className="px-4 bg-rose-700 hover:bg-rose-800 font-medium py-2 rounded-xl text-xs transition-all"
            >
              Senapkan
            </button>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4 max-w-md mx-auto w-full">
        {/* Module Card Status */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Status Hari Ini
              </span>
              <h2 className="font-display font-bold text-slate-800 text-lg">
                Jadwal Minum OAT
              </h2>
            </div>
            <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold">
              Target Jam: 07:00 WIB
            </div>
          </div>

          {isAlreadyTaken ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 items-center">
              <div className="bg-emerald-500 text-white p-2.5 rounded-full flex-shrink-0">
                <Check className="w-5 h-5 font-bold" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-950">
                  Luar Biasa, Anda Sudah Patuh!
                </h4>
                <p className="text-[10px] text-emerald-700 mt-0.5 leading-relaxed">
                  Obat ditelan hari ini pada pukul <strong>{todayLog?.waktuMinum || "07:15"} WIB</strong> dan diverifikasi oleh PMO Anda. Tetap konsisten!
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div>
                  <h4 className="text-xs font-bold text-amber-950">
                    Belum Konfirmasi Minum Obat
                  </h4>
                  <p className="text-[10px] text-amber-700 leading-normal mt-0.5">
                    Silakan ambil obat Anda dari wadah berkunci, telan di hadapan PMO (Istri/Keluarga), lalu konfirmasi di bawah ini.
                  </p>
                </div>
                <button
                  onClick={handleConfirmDrink}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-white font-bold" /> Tandai "Sudah Minum Obat"
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Medication Compliance Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-4 space-y-1">
            <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider block">
              Skor Kepatuhan
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-display font-extrabold text-3xl">{complianceRate}%</span>
              <span className="text-xs text-emerald-100">Kepatuhan</span>
            </div>
            <div className="w-full bg-white/25 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${complianceRate}%` }}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-1 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Total Takaran OAT
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-display font-bold text-slate-800 text-xl">
                  {takenLogs}
                </span>
                <span className="text-xs text-slate-500">hari ditelan</span>
              </div>
            </div>
            <span className="text-[9px] text-slate-400 italic">
              dari total {totalLogs} hari terapi tercatat
            </span>
          </div>
        </div>

        {/* Warning Indicator */}
        {complianceRate < 90 && (
          <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl p-4 flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold leading-normal">
                Kepatuhan Anda di bawah 90%!
              </h4>
              <p className="text-[10px] text-rose-600 mt-0.5 leading-relaxed">
                Kader TB (Bu Retno) dan Dokter Anda telah menerima notifikasi enkripsi. Tetap minum obat Anda setiap hari untuk mencegah resistensi kuman TB-MDR yang berbahaya.
              </p>
            </div>
          </div>
        )}

        {/* History Log */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" /> Riwayat 10 Hari Terakhir
          </h3>
          
          <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
            {medicationLogs.slice().reverse().map((log, idx) => (
              <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block">
                    {new Date(log.tanggal).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "short"
                    })}
                  </span>
                  {log.waktuMinum && (
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Ditelan pukul {log.waktuMinum} WIB
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {log.status === "sudah" ? (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100 flex items-center gap-0.5">
                      ✓ Ditelan
                    </span>
                  ) : log.status === "lewat" ? (
                    <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded-full border border-red-100 flex items-center gap-0.5 animate-pulse">
                      ⚠️ Terlewat
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[10px] font-medium rounded-full border border-slate-100">
                      Belum
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test alarm simulator */}
        <button
          onClick={() => {
            setAlarmActive(true);
            playBeepAlarm();
          }}
          className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 py-3 rounded-2xl text-xs font-semibold text-slate-600 transition-all flex items-center justify-center gap-2"
        >
          <Volume2 className="w-4 h-4 text-slate-500" /> Simulasikan Bunyi Alarm Pengingat
        </button>
      </div>
    </div>
  );
}
