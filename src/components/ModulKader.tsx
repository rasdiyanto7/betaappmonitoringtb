/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { KaderPatientDampingan, UserRole, UserProfile, FamilySupportLog } from "../types";
import { 
  Users, CheckSquare, Plus, BookOpen, Shield, Clipboard, RefreshCw, 
  Send, AlertCircle, Heart, UserPlus, Key, Trash2, Edit, Activity, 
  FileText, CheckCircle2, Search, Download, Calendar as CalendarIcon
} from "lucide-react";

interface ModulKaderProps {
  currentUser: UserProfile;
  patients: KaderPatientDampingan[];
  allProfiles: UserProfile[];
  familyLogs: FamilySupportLog[];
  onAddPatientNote: (pasienId: string, note: string, tanggalKunjungan?: string) => void;
  onAddEdukasi: (pasienId: string, edukasi: string) => void;
  onCreatePatient: (newProfile: Omit<UserProfile, "id">) => void;
  onUpdatePatientPin: (pasienId: string, newPin: string) => void;
  onDeletePatient: (pasienId: string) => void;
  onUpdatePatientBaseline: (pasienId: string, baselineData: Partial<UserProfile>) => void;
}

export default function ModulKader({ 
  currentUser, 
  patients, 
  allProfiles,
  familyLogs, 
  onAddPatientNote, 
  onAddEdukasi,
  onCreatePatient,
  onUpdatePatientPin,
  onDeletePatient,
  onUpdatePatientBaseline
}: ModulKaderProps) {
  // Navigation Workspaces
  const [activeTab, setActiveTab] = useState<"kunjungan" | "baseline" | "keluarga">("kunjungan");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Filter patients by search query
  const filteredPatients = useMemo(() => {
    return patients.filter(p => 
      p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pasienId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [patients, searchQuery]);

  // Selection state (default to first of filtered list, or keep existing if possible)
  const [selectedPasienId, setSelectedPasienId] = useState<string>("");

  useEffect(() => {
    if (filteredPatients.length > 0) {
      if (!filteredPatients.some(p => p.pasienId === selectedPasienId)) {
        setSelectedPasienId(filteredPatients[0].pasienId);
      }
    } else {
      setSelectedPasienId("");
    }
  }, [filteredPatients, selectedPasienId]);

  // Selected Patient objects
  const selectedPatient = patients.find(p => p.pasienId === selectedPasienId);
  const selectedProfile = allProfiles.find(p => p.id === selectedPasienId);

  // Kunjungan Tab States
  const [catatan, setCatatan] = useState("");
  const [tanggalKunjungan, setTanggalKunjungan] = useState(new Date().toISOString().split("T")[0]);
  const [edukasiInput, setEdukasiInput] = useState("");
  const [filterBulan, setFilterBulan] = useState("Semua");
  const [isExported, setIsExported] = useState(false);

  // Manajemen Tab - Edit Baseline Form States
  const [editJenisTB, setEditJenisTB] = useState<"Paru" | "Ekstraparu">("Paru");
  const [editFase, setEditFase] = useState<"Intensif" | "Lanjutan">("Intensif");
  const [editBerat, setEditBerat] = useState("");
  const [editPmo, setEditPmo] = useState("");
  const [editFaskes, setEditFaskes] = useState("");
  const [editMulai, setEditMulai] = useState("");
  const [editDurasi, setEditDurasi] = useState("180");
  const [msgBaseline, setMsgBaseline] = useState("");

  // Sync baseline inputs when patient selection changes
  useEffect(() => {
    if (selectedProfile) {
      setEditJenisTB(selectedProfile.jenisTB || "Paru");
      setEditFase(selectedProfile.fasePengobatan || "Intensif");
      setEditBerat(selectedProfile.beratBadanAwal ? String(selectedProfile.beratBadanAwal) : "");
      setEditPmo(selectedProfile.pmoNama || "");
      setEditFaskes(selectedProfile.faskes || "");
      setEditMulai(selectedProfile.tanggalMulai || new Date().toISOString().split("T")[0]);
      setEditDurasi(String(selectedProfile.durasiHari || 180));
    }
  }, [selectedPasienId, selectedProfile]);

  // Actions
  const handleVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catatan.trim() || !selectedPasienId) return;
    onAddPatientNote(selectedPasienId, catatan.trim(), tanggalKunjungan);
    setCatatan("");
    // Reset visitation date input to today
    setTanggalKunjungan(new Date().toISOString().split("T")[0]);
    alert(`Kunjungan rumah untuk "${selectedPatient?.nama}" berhasil dicatat!`);
  };

  const handleAddEdukasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edukasiInput.trim() || !selectedPasienId) return;
    onAddEdukasi(selectedPasienId, edukasiInput.trim());
    setEdukasiInput("");
  };

  const handleUpdateBaselineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPasienId) return;
    onUpdatePatientBaseline(selectedPasienId, {
      jenisTB: editJenisTB,
      fasePengobatan: editFase,
      beratBadanAwal: Number(editBerat) || 50,
      pmoNama: editPmo.trim(),
      faskes: editFaskes.trim(),
      tanggalMulai: editMulai,
      durasiHari: Number(editDurasi) || 180
    });

    setMsgBaseline("Data acuan & baseline klinis berhasil disimpan.");
    setTimeout(() => setMsgBaseline(""), 4000);
  };

  const isDoctor = currentUser.role === UserRole.MEDIS;
  const filteredFamilyLogs = familyLogs.filter(log => selectedPasienId ? true : false);

  // Available months extractor for filtering visit report exports
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    patients.forEach(p => {
      const profile = allProfiles.find(prof => prof.id === p.pasienId);
      if (profile?.tanggalMulai) {
        monthsSet.add(profile.tanggalMulai.substring(0, 7)); // YYYY-MM
      }
      p.riwayatKunjungan?.forEach(v => {
        monthsSet.add(v.tanggal.substring(0, 7));
      });
    });
    return Array.from(monthsSet).sort().reverse();
  }, [patients, allProfiles]);

  const formatMonthIndo = (yyyyMm: string) => {
    const [year, month] = yyyyMm.split("-");
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const mIdx = parseInt(month, 10) - 1;
    return `${monthNames[mIdx] || "Bulan"} ${year}`;
  };

  // Export Visitation Report to Excel CSV format
  const handleExportData = () => {
    // CSV Header with Byte Order Mark (BOM) to ensure correct Excel UTF-8 display
    let csvContent = "\uFEFF";
    
    // Header columns
    const headers = [
      "Nama Pasien",
      "Jenis TB",
      "Fase Pengobatan",
      "Progres Pengobatan",
      "Skor Kepatuhan",
      "Tanggal Kunjungan",
      "Catatan Kunjungan"
    ];
    csvContent += headers.join(",") + "\n";

    patients.forEach(p => {
      const profile = allProfiles.find(prof => prof.id === p.pasienId);
      const jenisTb = profile?.jenisTB || p.jenisTB;
      const fase = profile?.fasePengobatan || p.fasePengobatan;
      
      // Calculate treatment progress
      let progres = "N/A";
      if (profile?.tanggalMulai) {
        const start = new Date(profile.tanggalMulai);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const currentDayVal = Math.min(diffDays, profile.durasiHari || 180);
        progres = `Hari ke-${currentDayVal} dari ${profile.durasiHari || 180}`;
      }
      
      const kepatuhan = `${p.kepatuhanPersen}%`;

      // Filter visits by selected month
      const visits = p.riwayatKunjungan || [];
      const filteredVisits = visits.filter(v => {
        if (filterBulan === "Semua") return true;
        return v.tanggal.substring(0, 7) === filterBulan;
      });

      if (filteredVisits.length === 0) {
        // Only include in filtered export if "Semua" or if patient is registered
        if (filterBulan === "Semua") {
          const row = [
            `"${p.nama}"`,
            `"TB ${jenisTb}"`,
            `"${fase}"`,
            `"${progres}"`,
            `"${kepatuhan}"`,
            `"Belum ada kunjungan"`,
            `"-"`
          ];
          csvContent += row.join(",") + "\n";
        }
      } else {
        filteredVisits.forEach(v => {
          const cleanNote = v.catatan.replace(/"/g, '""');
          const row = [
            `"${p.nama}"`,
            `"TB ${jenisTb}"`,
            `"${fase}"`,
            `"${progres}"`,
            `"${kepatuhan}"`,
            `"${v.tanggal}"`,
            `"${cleanNote}"`
          ];
          csvContent += row.join(",") + "\n";
        });
      }
    });

    // Download flow
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    const fileName = filterBulan === "Semua" 
      ? "Laporan_Kunjungan_Kader_Semua_Bulan.csv"
      : `Laporan_Kunjungan_Kader_${filterBulan}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExported(true);
    setTimeout(() => setIsExported(false), 3500);
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen font-sans pb-24">
      <div className="p-4 space-y-4 max-w-md mx-auto w-full">
        
        {/* Module Title */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-5 shadow-md space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-100" />
            <h2 className="font-display font-bold text-base leading-tight">
              {isDoctor ? "Dashboard Tenaga Medis" : "Modul Kerja Kader TB"}
            </h2>
          </div>
          <p className="text-[10px] text-blue-100 leading-normal">
            {isDoctor
              ? "Sistem Pemantauan Klinis Puskesmas. Atur data acuan pasien, kelola akun, dan verifikasi kepatuhan OAT."
              : "Portal Pendampingan Kader TB. Input hasil kunjungan rumah, ekspor laporan rekap harian, dan tinjau laporan keluarga."}
          </p>
        </div>

        {/* Workspace Menu Tabs */}
        <div className="bg-white border border-slate-100 rounded-2xl p-1.5 flex gap-1 shadow-xs">
          <button
            onClick={() => setActiveTab("kunjungan")}
            className={`flex-1 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
              activeTab === "kunjungan"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Kunjungan
          </button>
          <button
            onClick={() => setActiveTab("baseline")}
            className={`flex-1 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
              activeTab === "baseline"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Data Acuan
          </button>
          <button
            onClick={() => setActiveTab("keluarga")}
            className={`flex-1 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
              activeTab === "keluarga"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> Laporan PMO
          </button>
        </div>

        {/* Patients Selection Section with Patient Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Pilih Pasien Dampingan ({filteredPatients.length})
            </label>
            {patients.length !== filteredPatients.length && (
              <span className="text-[9px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                Ditemukan {filteredPatients.length}
              </span>
            )}
          </div>

          {/* Patient Search Input Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau ID pasien..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {filteredPatients.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              {patients.length === 0 
                ? "Belum ada pasien terdaftar." 
                : "Tidak ada pasien yang cocok dengan pencarian."}
            </p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
              {filteredPatients.map((p) => (
                <button
                  key={p.pasienId}
                  onClick={() => setSelectedPasienId(p.pasienId)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex flex-col items-start gap-0.5 ${
                    selectedPasienId === p.pasienId
                      ? "bg-blue-50 border-blue-500 text-blue-800 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>{p.nama}</span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    Kepatuhan: {p.kepatuhanPersen}%
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- TAB 1: KUNJUNGAN & PEMANTAUAN --- */}
        {activeTab === "kunjungan" && selectedPatient && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
              <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-display font-extrabold text-slate-800 text-sm">
                    {selectedPatient.nama}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Diagnosis: TB {selectedProfile?.jenisTB || selectedPatient.jenisTB} • Fase {selectedProfile?.fasePengobatan || selectedPatient.fasePengobatan}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                  selectedPatient.kepatuhanPersen >= 90
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-rose-50 text-rose-700 border-rose-100"
                }`}>
                  {selectedPatient.kepatuhanPersen >= 90 ? "Aman" : "Butuh Perhatian"}
                </span>
              </div>

              {/* Adherence Rate Card */}
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                <span className="text-slate-600 font-semibold">Skor Kepatuhan Terapi TB:</span>
                <span className="font-mono font-extrabold text-blue-600 text-sm">
                  {selectedPatient.kepatuhanPersen}%
                </span>
              </div>

              {/* Last Home Visit Note (Quick View) */}
              {selectedPatient.kunjunganRumahTerakhir && (
                <div className="text-xs space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Kunjungan Rumah Terakhir
                  </span>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <p className="italic text-slate-600">"{selectedPatient.catatanKader}"</p>
                    <span className="text-[9px] text-slate-400 block font-mono">
                      Tanggal Kunjungan: {selectedPatient.kunjunganRumahTerakhir}
                    </span>
                  </div>
                </div>
              )}

              {/* Input Kunjungan Rumah Form - Only for Kader */}
              {!isDoctor && (
                <form onSubmit={handleVisitSubmit} className="bg-slate-900 text-white p-4 rounded-2xl space-y-3.5 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                    <CalendarIcon className="w-4 h-4 text-blue-400" /> Input Kunjungan Rumah
                  </h4>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Tanggal Kunjungan harian
                      </label>
                      <input
                        type="date"
                        value={tanggalKunjungan}
                        onChange={(e) => setTanggalKunjungan(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:border-blue-400 text-xs font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Catatan & Kondisi Pasien
                      </label>
                      <textarea
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        placeholder="Tulis kondisi fisik, kepatuhan OAT, sisa obat atau saran nutrisi..."
                        rows={3}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:border-blue-400 text-xs"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-sm text-xs flex items-center justify-center gap-1"
                    >
                      ✓ Simpan Kunjungan & Catatan
                    </button>
                  </div>
                </form>
              )}

              {/* Edukasi yang Sudah Diberikan - Medis Only */}
              {isDoctor && (
                <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3.5 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600" /> Edukasi yang Sudah Diberikan (Medis)
                  </h4>
                  
                  {selectedPatient.edukasiDiberikan.length === 0 ? (
                    <p className="text-slate-400 text-xs italic">Belum ada catatan materi edukasi.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPatient.edukasiDiberikan.map((ed, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-100">
                          💡 {ed}
                        </span>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleAddEdukasi} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={edukasiInput}
                      onChange={(e) => setEdukasiInput(e.target.value)}
                      placeholder="Materi baru (misal: Etika Batuk)"
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      required
                    />
                    <button type="submit" className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-xl">
                      Tambah
                    </button>
                  </form>
                </div>
              )}

              {/* Visitation History list */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3 shadow-xs">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-600" /> Tabel Riwayat Kunjungan & Catatan
                </h4>
                
                {!selectedPatient.riwayatKunjungan || selectedPatient.riwayatKunjungan.length === 0 ? (
                  <p className="text-slate-400 text-xs italic">Belum ada riwayat kunjungan rumah.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                    {selectedPatient.riwayatKunjungan.map((v, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-bold">
                          <span>Kunjungan #{selectedPatient.riwayatKunjungan!.length - idx}</span>
                          <span>{v.tanggal}</span>
                        </div>
                        <p className="text-slate-700 font-medium">"{v.catatan}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Export data kunjungan (with filter by month) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clipboard className="w-4 h-4 text-blue-600" /> Export Data Rekap Kunjungan
              </h3>
              <p className="text-slate-500 text-[10px] leading-relaxed">
                Unduh rekapitulasi data kepatuhan terapi dan rincian riwayat kunjungan kader ke dalam format file Excel (.csv) yang siap dicetak/analisis.
              </p>

              <div className="grid grid-cols-1 gap-2.5 text-xs pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Saring Berdasarkan Bulan
                  </label>
                  <select
                    value={filterBulan}
                    onChange={(e) => setFilterBulan(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:bg-white text-xs"
                  >
                    <option value="Semua">Semua Bulan (Tampilkan Semua)</option>
                    {availableMonths.map(m => (
                      <option key={m} value={m}>{formatMonthIndo(m)}</option>
                    ))}
                  </select>
                </div>

                {isExported ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-xl flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>File laporan berhasil diekspor dan diunduh!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleExportData}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-blue-400" />
                    Unduh Laporan Kerja (.csv / Excel)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: DATA ACUAN MONITORING --- */}
        {activeTab === "baseline" && (
          <div className="space-y-4">
            {selectedProfile ? (
              <form onSubmit={handleUpdateBaselineSubmit} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Edit className="w-4 h-4 text-blue-600" /> Atur Acuan Awal Monitoring: {selectedProfile.nama}
                </h3>

                {msgBaseline && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold rounded-xl">
                    ✓ {msgBaseline}
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Jenis TB</label>
                      <select
                        value={editJenisTB}
                        onChange={(e) => setEditJenisTB(e.target.value as any)}
                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                      >
                        <option value="Paru">Paru</option>
                        <option value="Ekstraparu">Ekstra Paru</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fase Pengobatan</label>
                      <select
                        value={editFase}
                        onChange={(e) => setEditFase(e.target.value as any)}
                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                      >
                        <option value="Intensif">Intensif (Harian)</option>
                        <option value="Lanjutan">Lanjutan (3x Seminggu)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">BB Awal (kg)</label>
                      <input
                        type="number"
                        value={editBerat}
                        onChange={(e) => setEditBerat(e.target.value)}
                        placeholder="e.g. 52"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama PMO</label>
                      <input
                        type="text"
                        value={editPmo}
                        onChange={(e) => setEditPmo(e.target.value)}
                        placeholder="e.g. Siti (Istri)"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fasilitas Kesehatan (Faskes)</label>
                    <input
                      type="text"
                      value={editFaskes}
                      onChange={(e) => setEditFaskes(e.target.value)}
                      placeholder="e.g. Puskesmas Sukajadi"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tanggal Mulai</label>
                      <input
                        type="date"
                        value={editMulai}
                        onChange={(e) => setEditMulai(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Durasi Terapi</label>
                      <select
                        value={editDurasi}
                        onChange={(e) => setEditDurasi(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs"
                      >
                        <option value="180">6 Bulan (180 hari)</option>
                        <option value="240">8 Bulan (240 hari)</option>
                        <option value="365">12 Bulan (365 hari)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-xs"
                >
                  Simpan Data Acuan Monitoring
                </button>
              </form>
            ) : (
              <p className="text-center py-8 text-slate-400 italic text-xs">Pilih pasien terlebih dahulu untuk mengedit data acuan.</p>
            )}
          </div>
        )}

        {/* --- TAB 3: AUDIT LAPORAN KELUARGA (PMO) --- */}
        {activeTab === "keluarga" && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Heart className="w-4 h-4 text-blue-600" /> Laporan Pendampingan Keluarga
              </h3>
              <p className="text-slate-500 text-[10px] leading-relaxed">
                Aggregator checklist harian yang diisi secara mandiri oleh keluarga/PMO pendamping di rumah. Gunakan data ini untuk mengonfirmasi kepatuhan real pasien.
              </p>

              {filteredFamilyLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 italic text-xs">
                  Belum ada laporan PMO keluarga yang dienkripsi untuk pasien terpilih.
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {familyLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                        <span className="font-semibold text-slate-600">PMO: {log.pmoNama}</span>
                        <span>{log.tanggal}</span>
                      </div>
                      
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100/60 leading-normal text-slate-600">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Catatan Keluarga:</span>
                        "{log.catatanKeluarga}"
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                        <div className="flex items-center gap-1">
                          <span className={log.obatTepatWaktu ? "text-emerald-600" : "text-rose-600"}>
                            {log.obatTepatWaktu ? "✓" : "✗"}
                          </span>
                          <span className="text-slate-500">Tepat Waktu</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={log.dosisSesuai ? "text-emerald-600" : "text-rose-600"}>
                            {log.dosisSesuai ? "✓" : "✗"}
                          </span>
                          <span className="text-slate-500">Dosis Sesuai</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={log.didampingiLangsung ? "text-emerald-600" : "text-rose-600"}>
                            {log.didampingiLangsung ? "✓" : "✗"}
                          </span>
                          <span className="text-slate-500">Didampingi Dilihat</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={log.adaEfekSamping ? "text-amber-600 font-bold" : "text-emerald-600"}>
                            {log.adaEfekSamping ? "⚠" : "✓"}
                          </span>
                          <span className="text-slate-500">
                            {log.adaEfekSamping ? "Ada Efek Samping" : "Efek Samping (-)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
