/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserRole, UserProfile } from "../types";
import { PeduliTBStore } from "../data/mockDB";
import { exportRekapAdmin } from "../utils/exportUtils";
import {
  Users, UserPlus, Trash2, Edit2, Shield, LogOut,
  ChevronDown, ChevronUp, Eye, EyeOff, Check, X,
  AlertCircle, RefreshCw, Building2, Plus, MapPin, Download, FileSpreadsheet
} from "lucide-react";

interface AdminDashboardProps {
  onLogout: () => void;
}

type AdminTab = "akun" | "faskes" | "export";
type FormMode = "idle" | "add" | "edit";

const ROLE_LABELS: Record<string, string> = {
  [UserRole.PASIEN]: "Pasien",
  [UserRole.KADER]: "Kader TB",
  [UserRole.MEDIS]: "Tenaga Medis",
};
const ROLE_COLORS: Record<string, string> = {
  [UserRole.PASIEN]: "bg-emerald-100 text-emerald-700 border-emerald-200",
  [UserRole.KADER]: "bg-blue-100 text-blue-700 border-blue-200",
  [UserRole.MEDIS]: "bg-purple-100 text-purple-700 border-purple-200",
};
const generateId = (role: UserRole) => {
  const prefix = role === UserRole.PASIEN ? "P" : role === UserRole.KADER ? "K" : "M";
  return `${prefix}_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
};
const EMPTY_FORM = {
  nama: "", username: "", email: "", pin: "",
  role: UserRole.PASIEN as UserRole,
  faskes: "",
  kaderPenanggungJawabId: "",
  medisPenanggungJawabId: "",
  jenisTB: "Paru" as "Paru" | "Ekstraparu",
  fasePengobatan: "Intensif" as "Intensif" | "Lanjutan",
  tanggalMulai: "", durasiHari: 180, beratBadanAwal: 0, pmoNama: "",
};

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [adminTab, setAdminTab] = useState<AdminTab>("akun");
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [faskesList, setFaskesList] = useState<string[]>([]);
  const [monitoringLogs, setMonitoringLogs] = useState<any[]>([]);
  const [exportBulan, setExportBulan] = useState("Semua");
  const [exportDone, setExportDone] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("idle");
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [showPin, setShowPin] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Faskes tab state
  const [newFaskesName, setNewFaskesName] = useState("");
  const [deleteFaskesConfirm, setDeleteFaskesConfirm] = useState<string | null>(null);

  const loadData = () => {
    const db = PeduliTBStore.loadDatabase();
    setProfiles(db?.profiles || []);
    setFaskesList(db?.faskesList || []);
    setMonitoringLogs(db?.monitoring || []);
  };

  useEffect(() => { loadData(); }, []);

  const showFeedback = (type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  };

  const kaderList = profiles.filter(p => p.role === UserRole.KADER);
  const medisList = profiles.filter(p => p.role === UserRole.MEDIS);

  const handleOpenAdd = () => {
    setForm({ ...EMPTY_FORM });
    setEditTarget(null);
    setFormMode("add");
  };
  const handleOpenEdit = (profile: UserProfile) => {
    setForm({
      nama: profile.nama, username: profile.username || "",
      email: profile.email || "", pin: profile.pin,
      role: profile.role as UserRole, faskes: profile.faskes || "",
      kaderPenanggungJawabId: "", medisPenanggungJawabId: "",
      jenisTB: profile.jenisTB || "Paru",
      fasePengobatan: profile.fasePengobatan || "Intensif",
      tanggalMulai: profile.tanggalMulai || "",
      durasiHari: profile.durasiHari || 180,
      beratBadanAwal: profile.beratBadanAwal || 0,
      pmoNama: profile.pmoNama || "",
    });
    setEditTarget(profile.id);
    setFormMode("edit");
  };
  const handleCancel = () => {
    setFormMode("idle");
    setEditTarget(null);
    setForm({ ...EMPTY_FORM });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim() || !form.username.trim() || !form.pin.trim()) {
      showFeedback("error", "Nama, Username, dan PIN wajib diisi!"); return;
    }
    if (form.pin.length < 4) {
      showFeedback("error", "PIN minimal 4 karakter!"); return;
    }

    // Resolve kaderNama & medisPenanggungJawab dari ID yang dipilih
    const kaderProfile = profiles.find(p => p.id === form.kaderPenanggungJawabId);
    const medisProfile = profiles.find(p => p.id === form.medisPenanggungJawabId);

    if (formMode === "add") {
      const newProfile: UserProfile = {
        id: generateId(form.role),
        nama: form.nama.trim(),
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase() || undefined,
        pin: form.pin,
        role: form.role,
        faskes: form.faskes || undefined,
        ...(form.role === UserRole.PASIEN && {
          jenisTB: form.jenisTB,
          fasePengobatan: form.fasePengobatan,
          tanggalMulai: form.tanggalMulai || new Date().toISOString().split("T")[0],
          durasiHari: Number(form.durasiHari) || 180,
          beratBadanAwal: Number(form.beratBadanAwal) || undefined,
          pmoNama: form.pmoNama.trim() || undefined,
          kaderNama: kaderProfile?.nama || undefined,
        }),
      };
      const success = PeduliTBStore.addProfile(newProfile);
      if (success) {
        loadData(); handleCancel();
        showFeedback("success", `Akun "${newProfile.nama}" berhasil dibuat!`);
      } else {
        showFeedback("error", "Username atau email sudah digunakan.");
      }
    } else if (formMode === "edit" && editTarget) {
      PeduliTBStore.updateProfile(editTarget, {
        nama: form.nama.trim(),
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase() || undefined,
        pin: form.pin, faskes: form.faskes || undefined,
        ...(form.role === UserRole.PASIEN && {
          jenisTB: form.jenisTB, fasePengobatan: form.fasePengobatan,
          tanggalMulai: form.tanggalMulai,
          durasiHari: Number(form.durasiHari) || 180,
          beratBadanAwal: Number(form.beratBadanAwal) || undefined,
          pmoNama: form.pmoNama.trim() || undefined,
          kaderNama: kaderProfile?.nama || undefined,
        }),
      });
      loadData(); handleCancel();
      showFeedback("success", `Akun "${form.nama}" berhasil diperbarui!`);
    }
  };

  const handleDelete = (id: string) => {
    PeduliTBStore.deleteProfile(id);
    loadData(); setDeleteConfirm(null);
    showFeedback("success", "Akun berhasil dihapus.");
  };

  const handleAddFaskes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaskesName.trim()) return;
    const ok = PeduliTBStore.addFaskes(newFaskesName.trim());
    if (ok) {
      loadData(); setNewFaskesName("");
      showFeedback("success", `Faskes "${newFaskesName.trim()}" berhasil ditambahkan.`);
    } else {
      showFeedback("error", "Nama faskes sudah ada atau kosong.");
    }
  };

  const handleDeleteFaskes = (nama: string) => {
    PeduliTBStore.deleteFaskes(nama);
    loadData(); setDeleteFaskesConfirm(null);
    showFeedback("success", `Faskes "${nama}" dihapus.`);
  };

  const filtered = filterRole === "ALL" ? profiles : profiles.filter(p => p.role === filterRole);
  const countByRole = (role: UserRole) => profiles.filter(p => p.role === role).length;

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white px-5 py-5 flex justify-between items-center sticky top-0 z-20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-200" />
          </div>
          <div>
            <h1 className="font-black text-base tracking-tight">Panel Admin</h1>
            <p className="text-blue-200 text-[10px] font-medium">PeduliTB • Super Administrator</p>
          </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl text-xs font-bold transition-all">
          <LogOut className="w-3.5 h-3.5" /> Keluar
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {/* ── Feedback ── */}
        {feedback && (
          <div className={`flex items-center gap-2.5 p-3.5 rounded-2xl text-sm font-semibold border ${
            feedback.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"
          }`}>
            {feedback.type === "success" ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {feedback.msg}
          </div>
        )}

        {/* ── Admin Tab Navigation ── */}
        <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-1.5">
          <button onClick={() => setAdminTab("akun")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${adminTab === "akun" ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:bg-slate-100"}`}>
            <Users className="w-4 h-4" /> Kelola Akun
          </button>
          <button onClick={() => setAdminTab("faskes")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${adminTab === "faskes" ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:bg-slate-100"}`}>
            <Building2 className="w-4 h-4" /> Faskes ({faskesList.length})
          </button>
          <button onClick={() => setAdminTab("export")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${adminTab === "export" ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:bg-slate-100"}`}>
            <FileSpreadsheet className="w-4 h-4" /> Tarik Data
          </button>
        </div>

        {/* ══════════════════════ TAB: FASKES ══════════════════════ */}
        {adminTab === "faskes" && (
          <div className="space-y-4">
            <form onSubmit={handleAddFaskes} className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-2">
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={newFaskesName}
                  onChange={e => setNewFaskesName(e.target.value)}
                  placeholder="Nama faskes baru (mis: Puskesmas Sukajadi)"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button type="submit" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all">
                <Plus className="w-4 h-4" /> Tambah
              </button>
            </form>

            <div className="space-y-2">
              {faskesList.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                  <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Belum ada faskes terdaftar</p>
                  <p className="text-slate-300 text-xs mt-1">Tambahkan faskes di atas agar bisa dipilih saat membuat akun</p>
                </div>
              ) : (
                faskesList.map((f, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{f}</span>
                    </div>
                    {deleteFaskesConfirm === f ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-700">
                        <span>Hapus?</span>
                        <button onClick={() => handleDeleteFaskes(f)} className="underline">Ya</button>
                        <button onClick={() => setDeleteFaskesConfirm(null)} className="text-slate-400">/ Batal</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteFaskesConfirm(f)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════ TAB: AKUN ══════════════════════ */}
        {adminTab === "akun" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {([UserRole.PASIEN, UserRole.KADER, UserRole.MEDIS] as UserRole[]).map(role => (
                <div key={role} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs text-center">
                  <p className="text-2xl font-black text-slate-800">{countByRole(role)}</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-wide">{ROLE_LABELS[role]}</p>
                </div>
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex gap-2 items-center flex-wrap">
              <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 flex-1 min-w-[220px]">
                {["ALL", UserRole.PASIEN, UserRole.KADER, UserRole.MEDIS].map(r => (
                  <button key={r} onClick={() => setFilterRole(r)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all ${filterRole === r ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}>
                    {r === "ALL" ? "Semua" : ROLE_LABELS[r]}
                  </button>
                ))}
              </div>
              <button onClick={handleOpenAdd} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all">
                <UserPlus className="w-4 h-4" /> Tambah Akun
              </button>
              <button onClick={loadData} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all" title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Add/Edit Form */}
            {formMode !== "idle" && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
                  <h2 className="font-bold text-sm flex items-center gap-2">
                    {formMode === "add" ? <UserPlus className="w-4 h-4 text-blue-300" /> : <Edit2 className="w-4 h-4 text-amber-300" />}
                    {formMode === "add" ? "Tambah Akun Baru" : "Edit Akun"}
                  </h2>
                  <button onClick={handleCancel} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  {/* Role selector */}
                  {formMode === "add" && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Peran Akun</label>
                      <div className="grid grid-cols-3 gap-2">
                        {([UserRole.PASIEN, UserRole.KADER, UserRole.MEDIS] as UserRole[]).map(role => (
                          <button key={role} type="button" onClick={() => setForm(f => ({ ...f, role }))}
                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${form.role === role ? "bg-blue-600 text-white border-blue-600 shadow" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"}`}>
                            {ROLE_LABELS[role]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Nama Lengkap *</label>
                      <input type="text" value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} placeholder="Nama lengkap" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Username *</label>
                      <input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value.replace(/\s/g, "").toLowerCase() }))} placeholder="username" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">PIN / Kata Sandi *</label>
                      <div className="relative">
                        <input type={showPin ? "text" : "password"} value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value }))} placeholder="Min. 4 karakter" className="w-full px-3 py-2.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" required minLength={4} />
                        <button type="button" onClick={() => setShowPin(v => !v)} className="absolute right-2.5 top-3 text-slate-400">
                          {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Email (opsional)</label>
                      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@contoh.com" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>

                    {/* Faskes — dropdown dari database */}
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Faskes / Puskesmas</label>
                      {faskesList.length === 0 ? (
                        <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                          ⚠ Belum ada faskes. Tambahkan dulu di tab <strong>Data Faskes</strong>.
                        </p>
                      ) : (
                        <select value={form.faskes} onChange={e => setForm(f => ({ ...f, faskes: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                          <option value="">-- Pilih Faskes --</option>
                          {faskesList.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Pasien-only fields */}
                  {form.role === UserRole.PASIEN && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Data Klinis Pasien</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Jenis TB</label>
                          <select value={form.jenisTB} onChange={e => setForm(f => ({ ...f, jenisTB: e.target.value as any }))} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                            <option value="Paru">TB Paru</option>
                            <option value="Ekstraparu">TB Ekstraparu</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Fase Pengobatan</label>
                          <select value={form.fasePengobatan} onChange={e => setForm(f => ({ ...f, fasePengobatan: e.target.value as any }))} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                            <option value="Intensif">Intensif</option>
                            <option value="Lanjutan">Lanjutan</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Tanggal Mulai OAT</label>
                          <input type="date" value={form.tanggalMulai} onChange={e => setForm(f => ({ ...f, tanggalMulai: e.target.value }))} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Durasi (Hari)</label>
                          <input type="number" value={form.durasiHari} min={60} max={730} onChange={e => setForm(f => ({ ...f, durasiHari: Number(e.target.value) }))} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">BB Awal (kg)</label>
                          <input type="number" step="0.1" value={form.beratBadanAwal || ""} onChange={e => setForm(f => ({ ...f, beratBadanAwal: Number(e.target.value) }))} placeholder="60.0" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Nama PMO</label>
                          <input type="text" value={form.pmoNama} onChange={e => setForm(f => ({ ...f, pmoNama: e.target.value }))} placeholder="Nama PMO keluarga" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                        </div>
                        {/* Dropdown Kader dari database */}
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Kader Pendamping</label>
                          {kaderList.length === 0 ? (
                            <p className="text-[10px] text-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">Belum ada akun Kader terdaftar</p>
                          ) : (
                            <select value={form.kaderPenanggungJawabId} onChange={e => setForm(f => ({ ...f, kaderPenanggungJawabId: e.target.value }))} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                              <option value="">-- Pilih Kader --</option>
                              {kaderList.map(k => <option key={k.id} value={k.id}>{k.nama} {k.faskes ? `(${k.faskes})` : ""}</option>)}
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={handleCancel} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all">Batal</button>
                    <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-600/20">
                      {formMode === "add" ? "Buat Akun" : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Account List */}
            <div className="space-y-2">
              {filtered.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-medium">Belum ada akun {filterRole !== "ALL" ? ROLE_LABELS[filterRole] : ""}</p>
                  <button onClick={handleOpenAdd} className="mt-3 text-blue-600 text-xs font-bold hover:underline">+ Tambah sekarang</button>
                </div>
              ) : (
                filtered.map(profile => (
                  <div key={profile.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all" onClick={() => setExpandedId(expandedId === profile.id ? null : profile.id)}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-700 text-sm">
                          {profile.nama.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800 leading-tight">{profile.nama}</p>
                          <p className="text-[10px] text-slate-400">@{profile.username || "—"} {profile.faskes ? `• ${profile.faskes}` : ""}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-wide px-2 py-1 rounded-full border ${ROLE_COLORS[profile.role]}`}>{ROLE_LABELS[profile.role]}</span>
                        {expandedId === profile.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>
                    {expandedId === profile.id && (
                      <div className="border-t border-slate-100 px-4 py-4 space-y-3 bg-slate-50/50">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                          <div><span className="text-slate-400">Email:</span> <span className="font-medium text-slate-700">{profile.email || "—"}</span></div>
                          <div><span className="text-slate-400">PIN:</span> <span className="font-mono font-bold text-slate-700">{"•".repeat(profile.pin.length)}</span></div>
                          <div><span className="text-slate-400">Faskes:</span> <span className="font-medium text-slate-700">{profile.faskes || "—"}</span></div>
                          {profile.role === UserRole.PASIEN && (
                            <>
                              <div><span className="text-slate-400">Jenis TB:</span> <span className="font-medium text-slate-700">{profile.jenisTB || "—"}</span></div>
                              <div><span className="text-slate-400">Fase:</span> <span className="font-medium text-slate-700">{profile.fasePengobatan || "—"}</span></div>
                              <div><span className="text-slate-400">Kader:</span> <span className="font-medium text-slate-700">{profile.kaderNama || "—"}</span></div>
                            </>
                          )}
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => handleOpenEdit(profile)} className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-2 rounded-xl text-xs font-bold transition-all">
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          {deleteConfirm === profile.id ? (
                            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-3 py-2 rounded-xl text-xs font-bold text-red-700">
                              <span>Hapus?</span>
                              <button onClick={() => handleDelete(profile.id)} className="underline">Ya</button>
                              <button onClick={() => setDeleteConfirm(null)} className="text-slate-500">/ Batal</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(profile.id)} className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-2 rounded-xl text-xs font-bold transition-all">
                              <Trash2 className="w-3.5 h-3.5" /> Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="text-center text-[10px] text-slate-400 pb-4 pt-2">
              PeduliTB Admin Panel • {profiles.length} akun • {faskesList.length} faskes
            </div>
          </>
        )}

        {/* ══════════════════════ TAB: TARIK DATA ══════════════════════ */}
        {adminTab === "export" && (() => {
          const db = PeduliTBStore.loadDatabase();
          const kaderPatients = db?.kaderPatients || [];

          // Kumpulkan semua bulan tersedia dari kunjungan dan monitoring
          const bulanSet = new Set<string>();
          kaderPatients.forEach((p: any) => {
            (p.riwayatKunjungan||[]).forEach((v: any) => bulanSet.add(v.tanggal.substring(0,7)));
          });
          (db?.monitoring||[]).forEach((l: any) => bulanSet.add(l.tanggal.substring(0,7)));
          (db?.profiles||[]).forEach((p: any) => { if (p.tanggalMulai) bulanSet.add(p.tanggalMulai.substring(0,7)); });
          const bulanList = Array.from(bulanSet).sort().reverse();

          const bulanLabel = (ym: string) => {
            const [y, m] = ym.split("-");
            const names = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
            return `${names[parseInt(m,10)-1]||""} ${y}`;
          };

          const handleExport = () => {
            exportRekapAdmin(kaderPatients, db?.profiles||[], db?.monitoring||[], exportBulan);
            setExportDone(true);
            setTimeout(() => setExportDone(false), 3000);
          };

          return (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">Tarik Data Laporan</h3>
                    <p className="text-[10px] text-slate-400">Export 3 sheet: Rekap Pasien, Kunjungan Kader, Monitoring Kondisi</p>
                  </div>
                </div>

                {/* Filter Bulan */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Filter Periode</label>
                  <select
                    value={exportBulan}
                    onChange={e => setExportBulan(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Semua">Semua Periode</option>
                    {bulanList.map(b => (
                      <option key={b} value={b}>{bulanLabel(b)}</option>
                    ))}
                  </select>
                </div>

                {/* Ringkasan data */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-emerald-700">{profiles.filter(p => p.role === "PASIEN").length}</p>
                    <p className="text-[9px] font-bold text-emerald-600 uppercase mt-0.5">Pasien</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-blue-700">
                      {kaderPatients.reduce((acc: number, p: any) => acc + (p.riwayatKunjungan?.length||0), 0)}
                    </p>
                    <p className="text-[9px] font-bold text-blue-600 uppercase mt-0.5">Kunjungan</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-purple-700">{(db?.monitoring||[]).length}</p>
                    <p className="text-[9px] font-bold text-purple-600 uppercase mt-0.5">Monitoring</p>
                  </div>
                </div>

                {/* Info sheet */}
                <div className="space-y-2">
                  {[
                    { sheet: "Sheet 1", label: "Rekap Pasien", desc: "Data profil, faskes, kader, kepatuhan semua pasien", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                    { sheet: "Sheet 2", label: "Kunjungan Kader", desc: "Riwayat kunjungan rumah & edukasi per pasien", color: "bg-blue-50 border-blue-200 text-blue-700" },
                    { sheet: "Sheet 3", label: "Monitoring Kondisi", desc: "Log harian: batuk, demam, BB, efek samping", color: "bg-purple-50 border-purple-200 text-purple-700" },
                  ].map(s => (
                    <div key={s.sheet} className={`flex items-start gap-3 p-3 rounded-xl border ${s.color}`}>
                      <span className="text-[10px] font-black uppercase tracking-wide mt-0.5">{s.sheet}</span>
                      <div>
                        <p className="text-xs font-bold">{s.label}</p>
                        <p className="text-[10px] opacity-80">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {exportDone ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4 flex-shrink-0" /> File XLSX berhasil diunduh!
                  </div>
                ) : (
                  <button
                    onClick={handleExport}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    Unduh Laporan XLSX ({exportBulan === "Semua" ? "Semua Periode" : bulanLabel(exportBulan)})
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
