/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { KaderPatientDampingan, UserRole, UserProfile, FamilySupportLog, MonitoringLog } from "../types";
import { exportLaporanKunjungan, exportLaporanMonitoring } from "../utils/exportUtils";
import {
  Users, BookOpen, Activity, FileText, Heart,
  Search, Download, Calendar as CalendarIcon,
  CheckCircle2, Edit, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Minus, AlertTriangle
} from "lucide-react";

interface ModulKaderProps {
  currentUser: UserProfile;
  patients: KaderPatientDampingan[];
  allProfiles: UserProfile[];
  familyLogs: FamilySupportLog[];
  monitoringLogs: MonitoringLog[];
  onAddPatientNote: (pasienId: string, note: string, tanggalKunjungan?: string) => void;
  onAddEdukasi: (pasienId: string, edukasi: string) => void;
  onCreatePatient: (newProfile: Omit<UserProfile, "id">) => void;
  onUpdatePatientPin: (pasienId: string, newPin: string) => void;
  onDeletePatient: (pasienId: string) => void;
  onUpdatePatientBaseline: (pasienId: string, baselineData: Partial<UserProfile>) => void;
}

export default function ModulKader({
  currentUser, patients, allProfiles, familyLogs, monitoringLogs,
  onAddPatientNote, onAddEdukasi, onUpdatePatientBaseline,
}: ModulKaderProps) {

  const isDoctor = currentUser.role === UserRole.MEDIS;

  // ── Tab Navigation ──
  const [activeTab, setActiveTab] = useState<"kunjungan" | "acuan" | "keluarga">("kunjungan");

  // ── Filter pasien: "mine" = terkait dengan kader/medis ini, "all" = semua ──
  const [patientFilter, setPatientFilter] = useState<"mine" | "all">("mine");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = useMemo(() => {
    let list = patients;
    if (patientFilter === "mine") {
      list = patients.filter(p => {
        const profile = allProfiles.find(pr => pr.id === p.pasienId);
        if (isDoctor) return profile?.faskes === currentUser.faskes;
        return profile?.kaderNama === currentUser.nama || profile?.faskes === currentUser.faskes;
      });
    }
    if (searchQuery.trim()) {
      list = list.filter(p =>
        p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.pasienId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [patients, patientFilter, searchQuery, currentUser, allProfiles, isDoctor]);

  const [selectedPasienId, setSelectedPasienId] = useState<string>("");
  useEffect(() => {
    if (filteredPatients.length > 0 && !filteredPatients.some(p => p.pasienId === selectedPasienId)) {
      setSelectedPasienId(filteredPatients[0].pasienId);
    } else if (filteredPatients.length === 0) {
      setSelectedPasienId("");
    }
  }, [filteredPatients]);

  const selectedPatient = patients.find(p => p.pasienId === selectedPasienId);
  const selectedProfile = allProfiles.find(p => p.id === selectedPasienId);

  // ── Kunjungan tab state ──
  const [catatan, setCatatan] = useState("");
  const [tanggalKunjungan, setTanggalKunjungan] = useState(new Date().toISOString().split("T")[0]);
  const [edukasiInput, setEdukasiInput] = useState("");
  const [filterBulan, setFilterBulan] = useState("Semua");
  const [isExported, setIsExported] = useState(false);

  // ── Baseline edit (medis only) ──
  const [editJenisTB, setEditJenisTB] = useState<"Paru" | "Ekstraparu">("Paru");
  const [editFase, setEditFase] = useState<"Intensif" | "Lanjutan">("Intensif");
  const [editBerat, setEditBerat] = useState("");
  const [editPmo, setEditPmo] = useState("");
  const [editMulai, setEditMulai] = useState("");
  const [editDurasi, setEditDurasi] = useState("180");
  const [msgBaseline, setMsgBaseline] = useState("");
  const [showBaselineEdit, setShowBaselineEdit] = useState(false);

  useEffect(() => {
    if (selectedProfile) {
      setEditJenisTB(selectedProfile.jenisTB || "Paru");
      setEditFase(selectedProfile.fasePengobatan || "Intensif");
      setEditBerat(selectedProfile.beratBadanAwal ? String(selectedProfile.beratBadanAwal) : "");
      setEditPmo(selectedProfile.pmoNama || "");
      setEditMulai(selectedProfile.tanggalMulai || new Date().toISOString().split("T")[0]);
      setEditDurasi(String(selectedProfile.durasiHari || 180));
    }
  }, [selectedPasienId, selectedProfile]);

  const handleVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catatan.trim() || !selectedPasienId) return;
    onAddPatientNote(selectedPasienId, catatan.trim(), tanggalKunjungan);
    setCatatan("");
    setTanggalKunjungan(new Date().toISOString().split("T")[0]);
  };

  const handleAddEdukasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edukasiInput.trim() || !selectedPasienId) return;
    onAddEdukasi(selectedPasienId, edukasiInput.trim());
    setEdukasiInput("");
  };

  const handleBaselineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPasienId) return;
    onUpdatePatientBaseline(selectedPasienId, {
      jenisTB: editJenisTB, fasePengobatan: editFase,
      beratBadanAwal: Number(editBerat) || undefined,
      pmoNama: editPmo.trim(),
      tanggalMulai: editMulai,
      durasiHari: Number(editDurasi) || 180
    });
    setMsgBaseline("Data acuan berhasil disimpan.");
    setShowBaselineEdit(false);
    setTimeout(() => setMsgBaseline(""), 3000);
  };

  // Monitoring logs untuk pasien terpilih (ambil berdasarkan userId context — shared db)
  const patientMonitoringLogs = monitoringLogs.slice().reverse();

  // Available months for export filter
  const availableMonths = useMemo(() => {
    const s = new Set<string>();
    patients.forEach(p => {
      p.riwayatKunjungan?.forEach(v => s.add(v.tanggal.substring(0, 7)));
    });
    return Array.from(s).sort().reverse();
  }, [patients]);

  const formatMonthIndo = (yyyyMm: string) => {
    const [year, month] = yyyyMm.split("-");
    const names = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    return `${names[parseInt(month,10)-1] || "Bulan"} ${year}`;
  };

  const handleExportData = () => {
    exportLaporanKunjungan(patients, allProfiles, filterBulan, currentUser.nama, currentUser.faskes);
    setIsExported(true); setTimeout(() => setIsExported(false), 3000);
  };

  const handleExportMonitoring = () => {
    const namaPasien = selectedProfile?.nama || selectedPatient?.nama || "Pasien";
    const namaFaskes = selectedProfile?.faskes || currentUser.faskes || "-";
    exportLaporanMonitoring(monitoringLogs, namaPasien, namaFaskes, filterBulan);
    setIsExported(true); setTimeout(() => setIsExported(false), 3000);
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen font-sans pb-24">
      <div className="p-4 space-y-4 max-w-md mx-auto w-full">

        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-5 shadow-md">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-100" />
            <h2 className="font-display font-bold text-base">
              {isDoctor ? "Dashboard Tenaga Medis" : "Modul Kader TB"}
            </h2>
          </div>
          <p className="text-[10px] text-blue-100 mt-1">
            {isDoctor ? "Pemantauan klinis & verifikasi data pasien" : "Pendampingan pasien TB & rekap kunjungan harian"}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border border-slate-100 rounded-2xl p-1.5 flex gap-1 shadow-xs">
          <button onClick={() => setActiveTab("kunjungan")} className={`flex-1 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${activeTab === "kunjungan" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"}`}>
            <Activity className="w-3.5 h-3.5" /> Kunjungan
          </button>
          <button onClick={() => setActiveTab("acuan")} className={`flex-1 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${activeTab === "acuan" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"}`}>
            <FileText className="w-3.5 h-3.5" /> Data Acuan
          </button>
          <button onClick={() => setActiveTab("keluarga")} className={`flex-1 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${activeTab === "keluarga" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"}`}>
            <Heart className="w-3.5 h-3.5" /> Laporan PMO
          </button>
        </div>

        {/* Patient Selector with Filter + Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Pilih Pasien ({filteredPatients.length})
            </label>
            {/* Filter: Pasien Saya / Semuanya */}
            <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setPatientFilter("mine")}
                className={`px-2.5 py-1 rounded-md text-[9px] font-black transition-all ${patientFilter === "mine" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}
              >
                Pasien Saya
              </button>
              <button
                onClick={() => setPatientFilter("all")}
                className={`px-2.5 py-1 rounded-md text-[9px] font-black transition-all ${patientFilter === "all" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}
              >
                Semuanya
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              type="text" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau ID pasien..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {filteredPatients.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-1">
              {patientFilter === "mine" ? "Tidak ada pasien yang terdaftar ke Anda. Coba filter 'Semuanya'." : "Belum ada pasien."}
            </p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
              {filteredPatients.map(p => (
                <button key={p.pasienId} onClick={() => setSelectedPasienId(p.pasienId)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex flex-col items-start gap-0.5 ${
                    selectedPasienId === p.pasienId ? "bg-blue-50 border-blue-500 text-blue-800 shadow-xs" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>{p.nama}</span>
                  <span className="text-[9px] text-slate-400">Kepatuhan: {p.kepatuhanPersen}%</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ══ TAB: KUNJUNGAN ══ */}
        {activeTab === "kunjungan" && selectedPatient && (
          <div className="space-y-4">
            {/* Info Pasien */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
              <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{selectedPatient.nama}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    TB {selectedProfile?.jenisTB || selectedPatient.jenisTB} • Fase {selectedProfile?.fasePengobatan || selectedPatient.fasePengobatan}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                  selectedPatient.kepatuhanPersen >= 90 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                }`}>
                  {selectedPatient.kepatuhanPersen >= 90 ? "Aman" : "Perhatian"}
                </span>
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                <span className="text-slate-600 font-semibold">Skor Kepatuhan:</span>
                <span className="font-mono font-extrabold text-blue-600 text-sm">{selectedPatient.kepatuhanPersen}%</span>
              </div>

              {/* Input Kunjungan — Kader only, Medis hanya lihat */}
              {!isDoctor ? (
                <form onSubmit={handleVisitSubmit} className="bg-slate-900 text-white p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                    <CalendarIcon className="w-4 h-4 text-blue-400" /> Input Kunjungan Rumah
                  </h4>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Tanggal</label>
                    <input type="date" value={tanggalKunjungan} onChange={e => setTanggalKunjungan(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold" required />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Catatan Kondisi</label>
                    <textarea value={catatan} onChange={e => setCatatan(e.target.value)}
                      placeholder="Kondisi fisik, kepatuhan OAT, sisa obat, nutrisi..."
                      rows={3} className="w-full p-2.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs" required />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs">
                    ✓ Simpan Kunjungan
                  </button>
                </form>
              ) : (
                /* Medis: input edukasi */
                <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600" /> Edukasi Diberikan
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPatient.edukasiDiberikan.length === 0 ? (
                      <p className="text-slate-400 text-xs italic">Belum ada catatan edukasi.</p>
                    ) : selectedPatient.edukasiDiberikan.map((ed, i) => (
                      <span key={i} className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-100">💡 {ed}</span>
                    ))}
                  </div>
                  <form onSubmit={handleAddEdukasi} className="flex gap-2 pt-1">
                    <input type="text" value={edukasiInput} onChange={e => setEdukasiInput(e.target.value)}
                      placeholder="Tambah materi edukasi" className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" required />
                    <button type="submit" className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-xl">Tambah</button>
                  </form>
                </div>
              )}

              {/* Riwayat Kunjungan */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">📋 Riwayat Kunjungan</h4>
                {(!selectedPatient.riwayatKunjungan || selectedPatient.riwayatKunjungan.length === 0) ? (
                  <p className="text-slate-400 text-xs italic">Belum ada riwayat kunjungan.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                    {selectedPatient.riwayatKunjungan.map((v, i) => (
                      <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-0.5">
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono font-bold">
                          <span>#{selectedPatient.riwayatKunjungan!.length - i}</span>
                          <span>{v.tanggal}</span>
                        </div>
                        <p className="text-slate-700">"{v.catatan}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Export */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">📊 Export Laporan</h3>
              <select value={filterBulan} onChange={e => setFilterBulan(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
                <option value="Semua">Semua Bulan</option>
                {availableMonths.map(m => <option key={m} value={m}>{formatMonthIndo(m)}</option>)}
              </select>
              {isExported ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> File berhasil diekspor!
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  <button onClick={handleExportData} className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                    <Download className="w-4 h-4 text-blue-400" /> Laporan Kunjungan (.csv)
                  </button>
                  {selectedPatient && (
                    <button onClick={handleExportMonitoring} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                      <Download className="w-4 h-4 text-emerald-200" /> Laporan Monitoring Kondisi (.csv)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ TAB: DATA ACUAN ══ */}
        {activeTab === "acuan" && (
          <div className="space-y-4">
            {selectedProfile ? (
              <>
                {/* Data Klinis (Read Only) */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" /> Data Klinis: {selectedProfile.nama}
                    </h3>
                    {/* Edit hanya untuk Medis */}
                    {isDoctor && (
                      <button onClick={() => setShowBaselineEdit(v => !v)} className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                        <Edit className="w-3 h-3" /> {showBaselineEdit ? "Tutup" : "Edit"}
                        {showBaselineEdit ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                  {msgBaseline && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> {msgBaseline}
                    </div>
                  )}

                  {/* Read-only grid */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    {[
                      { label: "Jenis TB", val: `TB ${selectedProfile.jenisTB || "—"}` },
                      { label: "Fase", val: selectedProfile.fasePengobatan || "—" },
                      { label: "Tanggal Mulai", val: selectedProfile.tanggalMulai || "—" },
                      { label: "Durasi Terapi", val: `${selectedProfile.durasiHari || 180} hari` },
                      { label: "BB Awal", val: selectedProfile.beratBadanAwal ? `${selectedProfile.beratBadanAwal} kg` : "—" },
                      { label: "PMO", val: selectedProfile.pmoNama || "—" },
                      { label: "Faskes", val: selectedProfile.faskes || "—" },
                      { label: "Kader", val: selectedProfile.kaderNama || "—" },
                    ].map(({ label, val }) => (
                      <div key={label} className="p-2.5 bg-slate-50 rounded-xl">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">{label}</span>
                        <span className="font-bold text-slate-700 mt-0.5 block text-xs">{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Inline edit form — Medis only */}
                  {isDoctor && showBaselineEdit && (
                    <form onSubmit={handleBaselineSubmit} className="space-y-3 pt-2 border-t border-slate-100">
                      <p className="text-[10px] font-black text-blue-700 uppercase tracking-wider">Edit Data Klinis</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">Jenis TB</label>
                          <select value={editJenisTB} onChange={e => setEditJenisTB(e.target.value as any)} className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                            <option value="Paru">Paru</option>
                            <option value="Ekstraparu">Ekstra Paru</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">Fase</label>
                          <select value={editFase} onChange={e => setEditFase(e.target.value as any)} className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                            <option value="Intensif">Intensif</option>
                            <option value="Lanjutan">Lanjutan</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">BB Awal (kg)</label>
                          <input type="number" step="0.1" value={editBerat} onChange={e => setEditBerat(e.target.value)} placeholder="60.0" className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">Nama PMO</label>
                          <input type="text" value={editPmo} onChange={e => setEditPmo(e.target.value)} placeholder="Nama PMO" className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">Tanggal Mulai</label>
                          <input type="date" value={editMulai} onChange={e => setEditMulai(e.target.value)} className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">Durasi</label>
                          <select value={editDurasi} onChange={e => setEditDurasi(e.target.value)} className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                            <option value="180">6 Bulan</option>
                            <option value="240">8 Bulan</option>
                            <option value="365">12 Bulan</option>
                          </select>
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all">Simpan Perubahan</button>
                    </form>
                  )}
                </div>

                {/* Monitoring Harian Pasien */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-600" /> Monitoring Kondisi Harian Pasien
                  </h3>

                  {patientMonitoringLogs.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs italic">
                      Pasien belum mengisi monitoring kondisi harian.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[400px] overflow-y-auto no-scrollbar">
                      {patientMonitoringLogs.map((log, idx) => {
                        const prevLog = patientMonitoringLogs[idx + 1];
                        const bbDiff = prevLog ? log.beratBadan - prevLog.beratBadan : 0;
                        return (
                          <div key={idx} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-2.5 text-xs">
                            <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                              <span className="font-bold text-slate-700">
                                {new Date(log.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                              </span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                (log.batuk || log.demam || log.sesakNapas || log.efekSamping)
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-100"
                              }`}>
                                {(log.batuk || log.demam || log.sesakNapas || log.efekSamping) ? "⚠ Perlu Perhatian" : "✓ Kondisi Baik"}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-[10px]">
                              <div className={`p-2 rounded-lg text-center ${log.batuk ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                                <p className="font-black">{log.batuk ? "Ya" : "Tidak"}</p>
                                <p className="text-[9px] opacity-70">Batuk</p>
                              </div>
                              <div className={`p-2 rounded-lg text-center ${log.demam ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                                <p className="font-black">{log.demam ? "Ya" : "Tidak"}</p>
                                <p className="text-[9px] opacity-70">Demam</p>
                              </div>
                              <div className={`p-2 rounded-lg text-center ${log.sesakNapas ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                                <p className="font-black">{log.sesakNapas ? "Ya" : "Tidak"}</p>
                                <p className="text-[9px] opacity-70">Sesak</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-3 py-2">
                              <div>
                                <span className="text-[9px] text-slate-400 uppercase font-bold block">Berat Badan</span>
                                <span className="font-black text-slate-800">{log.beratBadan} kg</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {bbDiff > 0 ? (
                                  <span className="flex items-center gap-0.5 text-emerald-600 text-[10px] font-bold"><TrendingUp className="w-3.5 h-3.5" /> +{bbDiff.toFixed(1)} kg</span>
                                ) : bbDiff < 0 ? (
                                  <span className="flex items-center gap-0.5 text-rose-600 text-[10px] font-bold"><TrendingDown className="w-3.5 h-3.5" /> {bbDiff.toFixed(1)} kg</span>
                                ) : (
                                  <span className="flex items-center gap-0.5 text-slate-400 text-[10px]"><Minus className="w-3.5 h-3.5" /> Stabil</span>
                                )}
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 uppercase font-bold block">Nafsu Makan</span>
                                <span className="font-bold text-slate-700">{log.nafsuMakan}</span>
                              </div>
                            </div>

                            {log.efekSamping && (
                              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-start gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-[9px] font-black text-amber-700 uppercase block">Efek Samping OAT</span>
                                  <p className="text-[10px] text-amber-800">{log.efekSampingDetail || "Ada efek samping (detail tidak diisi)"}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-center py-8 text-slate-400 italic text-xs">Pilih pasien terlebih dahulu.</p>
            )}
          </div>
        )}

        {/* ══ TAB: LAPORAN PMO ══ */}
        {activeTab === "keluarga" && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Heart className="w-4 h-4 text-rose-500" /> Laporan Keluarga / PMO
            </h3>
            <p className="text-[10px] text-slate-400">Checklist harian yang diisi keluarga/PMO pendamping di rumah.</p>

            {familyLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs italic">Belum ada laporan PMO.</div>
            ) : (
              <div className="space-y-3">
                {familyLogs.map(log => (
                  <div key={log.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span className="font-semibold text-slate-600">PMO: {log.pmoNama}</span>
                      <span>{log.tanggal}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100 text-slate-600">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Catatan:</span>
                      "{log.catatanKeluarga}"
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      {[
                        { label: "Tepat Waktu", val: log.obatTepatWaktu },
                        { label: "Dosis Sesuai", val: log.dosisSesuai },
                        { label: "Didampingi", val: log.didampingiLangsung },
                        { label: "Efek Samping", val: log.adaEfekSamping, invert: true },
                      ].map(({ label, val, invert }) => (
                        <div key={label} className="flex items-center gap-1">
                          <span className={(invert ? val : !val) ? "text-rose-600" : "text-emerald-600"}>{val ? "✓" : "✗"}</span>
                          <span className="text-slate-500">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
