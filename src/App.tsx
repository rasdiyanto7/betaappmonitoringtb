/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserProfile, DatabasePayload, UserRole, MedicationLog, PatientQuestion } from "./types";
import { PeduliTBStore } from "./data/mockDB";

// Components
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import Dashboard from "./components/Dashboard";
import EduTB from "./components/EduTB";
import MedicationReminder from "./components/MedicationReminder";
import MonitoringKondisi from "./components/MonitoringKondisi";
import JadwalKontrol from "./components/JadwalKontrol";
import Konsultasi from "./components/Konsultasi";
import SkriningKontak from "./components/SkriningKontak";
import SelfAssessment from "./components/SelfAssessment";
import Gamifikasi from "./components/Gamifikasi";
import DataPribadi from "./components/DataPribadi";
import ModulKader from "./components/ModulKader";
import KelolaAkunPasien from "./components/KelolaAkunPasien";
import ModulKeluarga from "./components/ModulKeluarga";

// Icons
import { Home, BookOpen, Clock, Activity, Calendar, MessageSquare, Users, Shield, User, Heart, UserPlus } from "lucide-react";

const SESSION_KEY = "PEDULITB_SESSION_V2";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentPin, setCurrentPin] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("home");
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  // Loaded decrypted payload
  const [payload, setPayload] = useState<DatabasePayload | null>(null);

  // Simulated day offset to allow unlocking 100% cure certificate
  const [simulatedDayOffset, setSimulatedDayOffset] = useState<number>(0);

  // Active profiles list state to pass to Login
  const [activeProfiles, setActiveProfiles] = useState<UserProfile[]>([]);

  // Notifikasi jadwal kontrol
  const [scheduleNotifs, setScheduleNotifs] = useState<string[]>([]);
  const [notifDismissed, setNotifDismissed] = useState(false);

  // Auto-init local store dan restore session jika ada
  useEffect(() => {
    PeduliTBStore.initializeDefaultDatabase();
    const db = PeduliTBStore.loadDatabase();
    if (db && db.profiles) setActiveProfiles(db.profiles);

    // Coba restore session
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const sess = JSON.parse(raw);
        if (sess.isAdminMode) {
          setIsAdminMode(true);
          return;
        }
        if (sess.userId && db) {
          const user = db.profiles.find((p: UserProfile) => p.id === sess.userId);
          if (user) {
            setCurrentUser(user);
            setCurrentPin(sess.pin || "");
            setPayload(db);
            setActiveTab(sess.activeTab || (user.role === UserRole.KADER || user.role === UserRole.MEDIS ? "kader" : "home"));
          }
        }
      }
    } catch {}
  }, []);

  // Simpan session setiap kali user atau tab berubah
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        userId: currentUser.id, pin: currentPin, activeTab
      }));
    } else if (isAdminMode) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ isAdminMode: true }));
    }
  }, [currentUser, currentPin, activeTab, isAdminMode]);

  // Cek notifikasi jadwal kontrol saat payload pertama kali dimuat
  useEffect(() => {
    if (!payload || !currentUser || currentUser.role !== UserRole.PASIEN) return;
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const in7Days = new Date(today);
    in7Days.setDate(today.getDate() + 7);

    const upcoming = payload.schedules.filter(s => {
      if (s.selesai) return false;
      const d = new Date(s.tanggal);
      return d >= today && d <= in7Days;
    });

    if (upcoming.length > 0) {
      setScheduleNotifs(upcoming.map(s => {
        const d = new Date(s.tanggal);
        const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const label = diffDays === 0 ? "HARI INI" : diffDays === 1 ? "BESOK" : `${diffDays} hari lagi`;
        return `${s.tipe} — ${s.deskripsi} (${label})`;
      }));
    }
  }, [payload, currentUser]);

  // Handle successful login
  const handleLoginSuccess = (user: UserProfile, pin: string) => {
    const db = PeduliTBStore.loadDatabase(pin);
    if (db) {
      setCurrentUser(user);
      setCurrentPin(pin);
      setPayload(db);
      setIsAdminMode(false);
      setNotifDismissed(false);
      const tab = user.role === UserRole.KADER || user.role === UserRole.MEDIS ? "kader" : "home";
      setActiveTab(tab);
    } else {
      alert("Enkripsi Database Gagal. Harap periksa kembali PIN Anda!");
    }
  };

  // Handle admin login
  const handleAdminLogin = () => {
    setIsAdminMode(true);
    setCurrentUser(null);
    setCurrentPin("");
    setPayload(null);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ isAdminMode: true }));
  };

  // Sync state changes back to encrypted localStorage
  const handleSavePayload = (updatedPayload: DatabasePayload) => {
    setPayload(updatedPayload);
    if (updatedPayload.profiles) {
      setActiveProfiles(updatedPayload.profiles);
    }
    PeduliTBStore.saveDatabase(updatedPayload);
  };

  // Callback to add a medication taken log
  const handleAddMedicationLog = (log: MedicationLog) => {
    if (!payload) return;
    
    const existingLogIdx = payload.medications.findIndex(l => l.tanggal === log.tanggal);
    let updatedLogs = [...payload.medications];

    if (existingLogIdx >= 0) {
      updatedLogs[existingLogIdx] = { ...updatedLogs[existingLogIdx], status: "sudah", pmoDiverifikasi: true };
    } else {
      updatedLogs.push(log);
    }

    handleSavePayload({
      ...payload,
      medications: updatedLogs
    });
  };

  // Callback to add a symptoms/weight monitoring log
  const handleAddMonitoringLog = (log: any) => {
    if (!payload) return;
    const updatedLogs = [...payload.monitoring, log];
    handleSavePayload({
      ...payload,
      monitoring: updatedLogs
    });
  };

  // Callback to add control schedule
  const handleAddSchedule = (schedule: any) => {
    if (!payload) return;
    const updatedSchedules = [...payload.schedules, schedule];
    handleSavePayload({
      ...payload,
      schedules: updatedSchedules
    });
  };

  // Callback to toggle control schedule complete
  const handleToggleSchedule = (id: string) => {
    if (!payload) return;
    const updatedSchedules = payload.schedules.map(s => {
      if (s.id === id) {
        return { ...s, selesai: !s.selesai };
      }
      return s;
    });
    handleSavePayload({
      ...payload,
      schedules: updatedSchedules
    });
  };

  // Callback to add screening
  const handleAddScreening = (screening: any) => {
    if (!payload) return;
    const updatedScreenings = [...payload.screenings, screening];
    handleSavePayload({
      ...payload,
      screenings: updatedScreenings
    });
  };

  // Callback to add self-assessment
  const handleAddAssessment = (assessment: any) => {
    if (!payload) return;
    const updatedAssessments = [...payload.selfAssessments, assessment];
    handleSavePayload({
      ...payload,
      selfAssessments: updatedAssessments
    });
  };

  // Callback to simulate 100% treatment complete
  const handleSimulateComplete = () => {
    if (!payload) return;
    const patientProfile = payload.profiles.find(p => p.role === UserRole.PASIEN) || payload.profiles[0];
    const totalDays = patientProfile.durasiHari || 180;
    const currentNatural = getNaturalTreatmentDay(patientProfile);
    setSimulatedDayOffset(totalDays - currentNatural);
  };

  // Kader: add Patient Note with visit date and append to history
  const handleAddPatientNote = (pasienId: string, note: string, tanggalKunjungan: string = new Date().toISOString().split("T")[0]) => {
    if (!payload) return;
    const updatedPatients = payload.kaderPatients.map(p => {
      if (p.pasienId === pasienId) {
        const history = p.riwayatKunjungan || [];
        const newHistoryItem = { tanggal: tanggalKunjungan, catatan: note };
        return {
          ...p,
          catatanKader: note,
          kunjunganRumahTerakhir: tanggalKunjungan,
          riwayatKunjungan: [newHistoryItem, ...history]
        };
      }
      return p;
    });
    handleSavePayload({
      ...payload,
      kaderPatients: updatedPatients
    });
  };

  // Kader: add Edukasi
  const handleAddEdukasi = (pasienId: string, edukasi: string) => {
    if (!payload) return;
    const updatedPatients = payload.kaderPatients.map(p => {
      if (p.pasienId === pasienId) {
        return {
          ...p,
          edukasiDiberikan: [...p.edukasiDiberikan, edukasi]
        };
      }
      return p;
    });
    handleSavePayload({
      ...payload,
      kaderPatients: updatedPatients
    });
  };

  // Keluarga: add Family Support Log
  const handleAddFamilyLog = (log: Omit<any, "id">) => {
    if (!payload) return;
    const newLog = {
      id: "FL_" + Math.random().toString(36).substr(2, 9),
      ...log
    };
    const updatedLogs = [...(payload.familyLogs || []), newLog];
    handleSavePayload({
      ...payload,
      familyLogs: updatedLogs
    });
  };

  // Medis/Kader: create new Patient Account
  const handleCreatePatient = (newProfileFields: any) => {
    if (!payload) return;
    const newPasienId = "PASIEN_" + (payload.profiles.length + 1) + "_" + Math.floor(100 + Math.random() * 900);
    const newProfile = {
      id: newPasienId,
      ...newProfileFields
    };
    const newKaderPatient = {
      pasienId: newPasienId,
      nama: newProfileFields.nama,
      jenisTB: newProfileFields.jenisTB || "Paru",
      fasePengobatan: newProfileFields.fasePengobatan || "Intensif",
      kepatuhanPersen: 100,
      edukasiDiberikan: [],
      riwayatKunjungan: []
    };
    handleSavePayload({
      ...payload,
      profiles: [...payload.profiles, newProfile],
      kaderPatients: [...payload.kaderPatients, newKaderPatient]
    });
  };

  // Medis/Kader: update Patient PIN
  const handleUpdatePatientPin = (pasienId: string, newPin: string) => {
    if (!payload) return;
    const updatedProfiles = payload.profiles.map(p => {
      if (p.id === pasienId) {
        return { ...p, pin: newPin };
      }
      return p;
    });
    handleSavePayload({
      ...payload,
      profiles: updatedProfiles
    });
  };

  // Medis/Kader: delete Patient Account
  const handleDeletePatient = (pasienId: string) => {
    if (!payload) return;
    const updatedProfiles = payload.profiles.filter(p => p.id !== pasienId);
    const updatedKaderPatients = payload.kaderPatients.filter(p => p.pasienId !== pasienId);
    handleSavePayload({
      ...payload,
      profiles: updatedProfiles,
      kaderPatients: updatedKaderPatients
    });
  };

  // Medis/Kader: update baseline patient credentials
  const handleUpdatePatientBaseline = (pasienId: string, baselineData: any) => {
    if (!payload) return;
    const updatedProfiles = payload.profiles.map(p => {
      if (p.id === pasienId) {
        return { ...p, ...baselineData };
      }
      return p;
    });
    const updatedKaderPatients = payload.kaderPatients.map(p => {
      if (p.pasienId === pasienId) {
        return {
          ...p,
          jenisTB: baselineData.jenisTB || p.jenisTB,
          fasePengobatan: baselineData.fasePengobatan || p.fasePengobatan
        };
      }
      return p;
    });
    handleSavePayload({
      ...payload,
      profiles: updatedProfiles,
      kaderPatients: updatedKaderPatients
    });
  };

  // Profile: update own user credentials (name, username, pin)
  const handleUpdateSelfProfile = (fields: { nama: string; username: string; pin: string }) => {
    if (!payload || !currentUser) return;
    const updatedProfiles = payload.profiles.map(p => {
      if (p.id === currentUser.id) {
        return { ...p, ...fields };
      }
      return p;
    });
    const updatedPayload: DatabasePayload = {
      ...payload,
      profiles: updatedProfiles
    };
    if (currentUser.role === UserRole.PASIEN) {
      updatedPayload.kaderPatients = payload.kaderPatients.map(kp => {
        if (kp.pasienId === currentUser.id) {
          return { ...kp, nama: fields.nama };
        }
        return kp;
      });
    }
    const nextPin = fields.pin;
    setPayload(updatedPayload);
    setCurrentPin(nextPin);
    setCurrentUser({ ...currentUser, ...fields });
    PeduliTBStore.saveDatabase(updatedPayload);
  };

  // Consultation: add a new question
  const handleAddQuestion = (text: string) => {
    if (!payload || !currentUser) return;
    const newQuestion: PatientQuestion = {
      id: "Q_" + Math.random().toString(36).substr(2, 9),
      pasienId: currentUser.id,
      pasienNama: currentUser.nama,
      pertanyaan: text,
      tanggal: new Date().toISOString().split("T")[0],
      status: "Belum Dijawab"
    };
    const updatedQuestions = [...(payload.questions || []), newQuestion];
    handleSavePayload({
      ...payload,
      questions: updatedQuestions
    });
  };

  // Consultation: answer a patient's question
  const handleAnswerQuestion = (questionId: string, answer: string, authorName: string) => {
    if (!payload) return;
    const updatedQuestions = (payload.questions || []).map((q) => {
      if (q.id === questionId) {
        return {
          ...q,
          status: "Sudah Dijawab" as const,
          jawaban: answer,
          tanggalDijawab: new Date().toISOString().split("T")[0],
          kaderAtauMedisNama: authorName
        };
      }
      return q;
    });
    handleSavePayload({
      ...payload,
      questions: updatedQuestions
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPin("");
    setPayload(null);
    setSimulatedDayOffset(0);
    setActiveTab("home");
    setIsAdminMode(false);
    setScheduleNotifs([]);
    setNotifDismissed(false);
    sessionStorage.removeItem(SESSION_KEY);

    const db = PeduliTBStore.loadDatabase();
    if (db && db.profiles) setActiveProfiles(db.profiles);
  };

  const handleResetDb = () => {
    localStorage.removeItem("PEDULITB_SECURE_STORAGE_V2");
    sessionStorage.removeItem(SESSION_KEY);
    PeduliTBStore.initializeDefaultDatabase();
    const db = PeduliTBStore.loadDatabase();
    if (db && db.profiles) setActiveProfiles(db.profiles);
    handleLogout();
  };

  // Admin mode — render admin dashboard fullscreen (before user check)
  if (isAdminMode) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // Loading or Login gate
  if (!currentUser || !payload) {
    return <Login onLoginSuccess={handleLoginSuccess} onAdminLogin={handleAdminLogin} activeProfiles={activeProfiles} />;
  }

  // Find current patient's own profile (for Pasien role, use currentUser directly; for Kader/Medis, use first patient or currentUser)
  const patientProfile = currentUser.role === UserRole.PASIEN
    ? (payload.profiles.find(p => p.id === currentUser.id) || currentUser)
    : (payload.profiles.find(p => p.role === UserRole.PASIEN) || currentUser);

  // Dynamic day calculation based on treatment start
  const getNaturalTreatmentDay = (profile: UserProfile): number => {
    if (!profile.tanggalMulai) return 45;
    const start = new Date(profile.tanggalMulai);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(diffDays, profile.durasiHari || 180);
  };

  const currentDay = Math.min(getNaturalTreatmentDay(patientProfile) + simulatedDayOffset, patientProfile.durasiHari || 180);
  const totalDays = patientProfile.durasiHari || 180;

  // Active view router
  const renderContent = () => {
    switch (activeTab) {
      // Patient tabs
      case "home":
        return (
          <Dashboard
            profile={patientProfile}
            medicationLogs={payload.medications}
            schedules={payload.schedules}
            assessments={payload.selfAssessments}
            currentDay={currentDay}
            totalDays={totalDays}
            onNavigateToTab={(tabId) => setActiveTab(tabId)}
            onAddLog={handleAddMedicationLog}
          />
        );
      case "edu":
        return <EduTB />;
      case "keluarga":
        return (
          <ModulKeluarga
            currentUser={patientProfile}
            familyLogs={payload.familyLogs || []}
            onAddFamilyLog={handleAddFamilyLog}
          />
        );
      case "reminder":
        return (
          <MedicationReminder
            medicationLogs={payload.medications}
            onAddLog={handleAddMedicationLog}
            onRefresh={() => {}}
          />
        );
      case "monitoring":
        return (
          <MonitoringKondisi
            monitoringLogs={payload.monitoring}
            beratBadanAwal={patientProfile.beratBadanAwal}
            onAddLog={handleAddMonitoringLog}
          />
        );
      case "calendar":
        return (
          <JadwalKontrol
            schedules={payload.schedules}
            onAddSchedule={handleAddSchedule}
            onToggleSchedule={handleToggleSchedule}
          />
        );
      case "consultation":
        return (
          <Konsultasi
            currentUser={currentUser!}
            questions={payload.questions || []}
            onAddQuestion={handleAddQuestion}
            onAnswerQuestion={handleAnswerQuestion}
          />
        );
      case "screening":
        return (
          <SkriningKontak
            screenings={payload.screenings}
            onAddScreening={handleAddScreening}
          />
        );
      case "assessment":
        return (
          <SelfAssessment
            assessments={payload.selfAssessments}
            onAddAssessment={handleAddAssessment}
          />
        );
      case "achievements":
        return (
          <Gamifikasi
            profile={patientProfile}
            totalDays={totalDays}
            currentDay={currentDay}
            onSimulateComplete={handleSimulateComplete}
          />
        );
      case "profile":
        return (
          <DataPribadi
            profile={currentUser}
            onResetDb={handleResetDb}
            onLogout={handleLogout}
            onUpdateSelfProfile={handleUpdateSelfProfile}
          />
        );
      case "kader":
        return (
          <ModulKader
            currentUser={currentUser}
            patients={payload.kaderPatients}
            allProfiles={payload.profiles}
            familyLogs={payload.familyLogs || []}
            monitoringLogs={payload.monitoring}
            onAddPatientNote={handleAddPatientNote}
            onAddEdukasi={handleAddEdukasi}
            onCreatePatient={handleCreatePatient}
            onUpdatePatientPin={handleUpdatePatientPin}
            onDeletePatient={handleDeletePatient}
            onUpdatePatientBaseline={handleUpdatePatientBaseline}
          />
        );
      case "kelola_pasien":
        return (
          <KelolaAkunPasien
            currentUser={currentUser}
            allProfiles={payload.profiles}
            onCreatePatient={handleCreatePatient}
            onUpdatePatientPin={handleUpdatePatientPin}
            onDeletePatient={handleDeletePatient}
            onUpdatePatientBaseline={handleUpdatePatientBaseline}
          />
        );
      default:
        return <div>Tab tidak ditemukan</div>;
    }
  };

  const isKaderOrMedis = currentUser.role === UserRole.KADER || currentUser.role === UserRole.MEDIS;

  return (
    <div className="min-h-screen bg-slate-100 lg:bg-slate-200 flex items-center justify-center p-0 lg:p-6 font-sans select-none">
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-stretch">
        
        {/* --- SLEEK SIDE PANEL (Visible on lg desktop screen) --- */}
        <div className="hidden lg:flex flex-col gap-6 text-slate-800">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md flex flex-col gap-4">
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mb-3 text-xl shadow-xs">
                🏥
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">TBCare Mobile</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Monitoring Terapi OAT Terintegrasi untuk Pasien, Kader, dan Tenaga Medis.
              </p>
            </div>
            
            <div className="flex flex-col gap-2 pt-2">
              <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 w-fit">
                ✓ End-to-End Encrypted
              </span>
              <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 w-fit">
                ✓ Health Data Privacy Law
              </span>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-4">Fitur Unggulan</h3>
              <div className="flex flex-col gap-3.5">
                {[
                  { num: "01", text: "Pelacakan Kepatuhan Real-time" },
                  { num: "02", text: "Chat Langsung Kader & Medis" },
                  { num: "03", text: "Monitoring Efek Samping" },
                  { num: "04", text: "Gamifikasi Sertifikat Sembuh" },
                  { num: "05", text: "Skrining Kontak Serumah" }
                ].map((f) => (
                  <div key={f.num} className="flex gap-2.5 items-start">
                    <span className="font-extrabold text-blue-600 text-[11px] tracking-tight">{f.num}</span>
                    <span className="text-slate-600 text-xs font-semibold">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-4 flex justify-between">
              <span>Sandi E2EE Aktif</span>
              <span>v2.0.0</span>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN / PHONE CONTAINER FRAME --- */}
        <div className="w-full flex items-center justify-center">
          <div className="w-full h-screen lg:h-[812px] lg:max-w-[375px] bg-slate-50 lg:rounded-[40px] lg:shadow-2xl lg:border-[10px] lg:border-slate-900 overflow-hidden flex flex-col relative lg:ring-1 lg:ring-white/10">
            
            {/* Status Bar inside mockup */}
            <div className="hidden lg:flex justify-between items-center px-6 pt-3 pb-1 text-[11px] font-semibold text-slate-500 bg-white select-none border-b border-slate-100/40">
              <span>9:41</span>
              <div className="flex gap-1 items-center">
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>

            {/* Main scrollable app area */}
            <main className="flex-1 overflow-y-auto no-scrollbar pb-16 bg-slate-50">
              {/* ── Notifikasi Jadwal Kontrol (Pasien) ── */}
              {scheduleNotifs.length > 0 && !notifDismissed && currentUser.role === UserRole.PASIEN && (
                <div className="bg-amber-500 text-white px-4 py-3 flex gap-2 items-start shadow-md">
                  <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-100">Pengingat Jadwal Kontrol</p>
                    {scheduleNotifs.map((n, i) => (
                      <p key={i} className="text-xs font-semibold leading-snug mt-0.5">• {n}</p>
                    ))}
                  </div>
                  <button
                    onClick={() => setNotifDismissed(true)}
                    className="text-amber-200 hover:text-white flex-shrink-0 mt-0.5 text-xs font-bold px-2 py-0.5 bg-amber-600/50 rounded-lg"
                  >
                    ✕
                  </button>
                </div>
              )}
              {renderContent()}
            </main>

            {/* --- PREMIUM BOTTOM NAVIGATION BAR --- */}
            <nav className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 flex justify-around items-center z-50 shadow-lg">
              {isKaderOrMedis ? (
                // Navigation layout for Kaders/Doctors
                <>
                  <button
                    onClick={() => setActiveTab("kader")}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                      activeTab === "kader" ? "text-blue-600 font-bold scale-105" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span className="text-[9px] font-bold">Pasien</span>
                  </button>

                  {currentUser.role === UserRole.MEDIS && (
                    <button
                      onClick={() => setActiveTab("consultation")}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                        activeTab === "consultation" ? "text-blue-600 font-bold scale-105" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span className="text-[9px] font-bold">Konsultasi</span>
                    </button>
                  )}

                  {currentUser.role === UserRole.MEDIS && (
                    <button
                      onClick={() => setActiveTab("kelola_pasien")}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                        activeTab === "kelola_pasien" ? "text-blue-600 font-bold scale-105" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <UserPlus className="w-5 h-5" />
                      <span className="text-[9px] font-bold">Kelola Akun</span>
                    </button>
                  )}

                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                      activeTab === "profile" ? "text-blue-600 font-bold scale-105" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span className="text-[9px] font-bold">Profil</span>
                  </button>
                </>
              ) : (
                // Navigation layout for Patient users
                <>
                  <button
                    onClick={() => setActiveTab("home")}
                    className={`flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl transition-all ${
                      activeTab === "home" ? "text-blue-600 font-bold scale-105" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span className="text-[8px] font-bold">Beranda</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("keluarga")}
                    className={`flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl transition-all ${
                      activeTab === "keluarga" ? "text-blue-600 font-bold scale-105" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500/10" />
                    <span className="text-[8px] font-bold text-rose-600">Keluarga</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("edu")}
                    className={`flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl transition-all ${
                      activeTab === "edu" ? "text-blue-600 font-bold scale-105" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="text-[8px] font-bold">Edukasi</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("reminder")}
                    className={`flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl transition-all ${
                      activeTab === "reminder" ? "text-blue-600 font-bold scale-105" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span className="text-[8px] font-bold">Alarm</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("monitoring")}
                    className={`flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl transition-all ${
                      activeTab === "monitoring" ? "text-blue-600 font-bold scale-105" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    <span className="text-[8px] font-bold">Monitor</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("calendar")}
                    className={`flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl transition-all ${
                      activeTab === "calendar" ? "text-blue-600 font-bold scale-105" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-[8px] font-bold">Kontrol</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("consultation")}
                    className={`flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl transition-all ${
                      activeTab === "consultation" ? "text-blue-600 font-bold scale-105" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-[8px] font-bold">Tanya AI</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl transition-all ${
                      activeTab === "profile" ? "text-blue-600 font-bold scale-105" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-[8px] font-bold">Profil</span>
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>

      </div>
    </div>
  );
}
