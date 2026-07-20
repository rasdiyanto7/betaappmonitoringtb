/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserProfile, UserRole } from "../types";
import { PeduliTBStore } from "../data/mockDB";
import { UserPlus, Edit, Trash2, Users, CheckCircle, AlertTriangle } from "lucide-react";

interface KelolaAkunPasienProps {
  currentUser: UserProfile;
  allProfiles: UserProfile[];
  onCreatePatient: (newProfileFields: any) => void;
  onUpdatePatientPin: (pasienId: string, newPin: string) => void;
  onDeletePatient: (pasienId: string) => void;
  onUpdatePatientBaseline: (pasienId: string, baselineData: any) => void;
}

export default function KelolaAkunPasien({
  currentUser, allProfiles, onCreatePatient,
  onUpdatePatientPin, onDeletePatient, onUpdatePatientBaseline
}: KelolaAkunPasienProps) {

  const [activeTab, setActiveTab] = useState<"tambah" | "edit" | "hapus">("tambah");
  const patientProfiles = allProfiles.filter(p => p.role === UserRole.PASIEN);
  const kaderList = allProfiles.filter(p => p.role === UserRole.KADER);
  const [faskesList, setFaskesList] = useState<string[]>([]);

  useEffect(() => {
    setFaskesList(PeduliTBStore.getFaskesList());
  }, []);

  // Tambah Akun state
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newJenisTB, setNewJenisTB] = useState<"Paru"|"Ekstraparu">("Paru");
  const [newFase, setNewFase] = useState<"Intensif"|"Lanjutan">("Intensif");
  const [newBerat, setNewBerat] = useState("");
  const [newPmo, setNewPmo] = useState("");
  const [newFaskes, setNewFaskes] = useState("");
  const [newKaderId, setNewKaderId] = useState("");
  const [newMulai, setNewMulai] = useState(new Date().toISOString().split("T")[0]);
  const [newDurasi, setNewDurasi] = useState("180");
  const [msgCreate, setMsgCreate] = useState("");

  // Edit Akun state
  const [selectedEditId, setSelectedEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPin, setEditPin] = useState("");
  const [msgEdit, setMsgEdit] = useState("");

  useEffect(() => {
    if (selectedEditId) {
      const p = allProfiles.find(pr => pr.id === selectedEditId);
      if (p) {
        setEditName(p.nama);
        setEditUsername(p.username || "");
        setEditEmail(p.email || "");
        setEditPin(p.pin);
      }
    }
  }, [selectedEditId, allProfiles]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPin.trim()) { alert("Nama dan PIN tidak boleh kosong!"); return; }
    const kaderProfile = allProfiles.find(p => p.id === newKaderId);
    const finalUsername = newUsername.trim() || newName.toLowerCase().replace(/\s+/g, "");
    onCreatePatient({
      nama: newName.trim(), username: finalUsername,
      role: UserRole.PASIEN,
      email: newEmail.trim() || `${finalUsername}@pedulitb.id`,
      pin: newPin.trim(),
      jenisTB: newJenisTB, fasePengobatan: newFase,
      pmoNama: newPmo.trim() || "Keluarga Dampingan",
      kaderNama: kaderProfile?.nama || currentUser.nama,
      beratBadanAwal: Number(newBerat) || 50,
      faskes: newFaskes || currentUser.faskes || "Puskesmas",
      tanggalMulai: newMulai, durasiHari: Number(newDurasi) || 180
    });
    setNewName(""); setNewUsername(""); setNewEmail(""); setNewPin(""); setNewBerat(""); setNewPmo(""); setNewFaskes(""); setNewKaderId("");
    setMsgCreate(`Akun pasien "${newName.trim()}" berhasil didaftarkan!`);
    setTimeout(() => setMsgCreate(""), 5000);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditId || !editName.trim() || !editPin.trim()) { alert("Lengkapi semua field!"); return; }
    onUpdatePatientPin(selectedEditId, editPin.trim());
    onUpdatePatientBaseline(selectedEditId, { nama: editName.trim(), username: editUsername.trim(), email: editEmail.trim() });
    setMsgEdit(`Data pasien "${editName}" berhasil diperbarui.`);
    setTimeout(() => setMsgEdit(""), 4000);
  };

  const handleDelete = (id: string, nama: string) => {
    if (window.confirm(`Hapus akun pasien "${nama}" secara permanen?`)) {
      onDeletePatient(id);
      if (selectedEditId === id) setSelectedEditId("");
    }
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen font-sans pb-24">
      <div className="p-4 bg-white border-b border-slate-200/80 sticky top-0 z-10 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-display font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" /> Kelola Akun Pasien
          </h2>
          <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-100">
            {currentUser.role === UserRole.KADER ? "Kader TB" : "Tenaga Medis"}
          </span>
        </div>
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 text-xs font-semibold">
          {(["tambah", "edit", "hapus"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${activeTab === tab ? "bg-white text-slate-800 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"}`}>
              {tab === "tambah" ? <><UserPlus className="w-3.5 h-3.5" /> Tambah</> : tab === "edit" ? <><Edit className="w-3.5 h-3.5" /> Edit</> : <><Trash2 className="w-3.5 h-3.5" /> Hapus</>}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-md mx-auto w-full">

        {/* ── TAB TAMBAH ── */}
        {activeTab === "tambah" && (
          <form onSubmit={handleCreateSubmit} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <UserPlus className="w-4 h-4 text-blue-600" /> Daftarkan Pasien Baru
            </h3>
            {msgCreate && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" /> {msgCreate}
              </div>
            )}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Lengkap *</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nama pasien" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Username</label>
                  <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value.toLowerCase())} placeholder="username" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">PIN Login *</label>
                  <input type="text" maxLength={8} value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="Min. 4 karakter" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono font-bold tracking-widest text-emerald-600" required />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email (opsional)</label>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@contoh.com" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>

              {/* Faskes dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Faskes / Puskesmas</label>
                {faskesList.length === 0 ? (
                  <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">⚠ Faskes belum diisi Admin. Akan otomatis menggunakan faskes Anda.</p>
                ) : (
                  <select value={newFaskes} onChange={e => setNewFaskes(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold">
                    <option value="">-- Pilih Faskes --</option>
                    {faskesList.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                )}
              </div>

              {/* Kader dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kader Pendamping</label>
                {kaderList.length === 0 ? (
                  <p className="text-[10px] text-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">Belum ada kader terdaftar</p>
                ) : (
                  <select value={newKaderId} onChange={e => setNewKaderId(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold">
                    <option value="">-- Pilih Kader --</option>
                    {kaderList.map(k => <option key={k.id} value={k.id}>{k.nama} {k.faskes ? `(${k.faskes})` : ""}</option>)}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Jenis TB</label>
                  <select value={newJenisTB} onChange={e => setNewJenisTB(e.target.value as any)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold">
                    <option value="Paru">TB Paru</option>
                    <option value="Ekstraparu">TB Ekstra Paru</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fase</label>
                  <select value={newFase} onChange={e => setNewFase(e.target.value as any)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold">
                    <option value="Intensif">Intensif (Harian)</option>
                    <option value="Lanjutan">Lanjutan (3x/Minggu)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">BB Awal (kg)</label>
                  <input type="number" value={newBerat} onChange={e => setNewBerat(e.target.value)} placeholder="52" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama PMO</label>
                  <input type="text" value={newPmo} onChange={e => setNewPmo(e.target.value)} placeholder="Nama PMO keluarga" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tanggal Mulai</label>
                  <input type="date" value={newMulai} onChange={e => setNewMulai(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Durasi</label>
                  <select value={newDurasi} onChange={e => setNewDurasi(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold">
                    <option value="180">6 Bulan</option>
                    <option value="240">8 Bulan</option>
                    <option value="365">12 Bulan</option>
                  </select>
                </div>
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md shadow-blue-600/10">
              + Simpan Akun Pasien
            </button>
          </form>
        )}

        {/* ── TAB EDIT ── */}
        {activeTab === "edit" && (
          <form onSubmit={handleEditSubmit} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Edit className="w-4 h-4 text-blue-600" /> Edit Data Login Pasien
            </h3>
            {msgEdit && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" /> {msgEdit}
              </div>
            )}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pilih Pasien</label>
                <select value={selectedEditId} onChange={e => setSelectedEditId(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold" required>
                  <option value="">-- Pilih Pasien --</option>
                  {patientProfiles.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                </select>
              </div>
              {selectedEditId && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama</label>
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Username</label>
                      <input type="text" value={editUsername} onChange={e => setEditUsername(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">PIN Baru</label>
                      <input type="text" maxLength={8} value={editPin} onChange={e => setEditPin(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono font-bold text-emerald-600" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email</label>
                    <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all">Simpan Perubahan</button>
                </>
              )}
            </div>
          </form>
        )}

        {/* ── TAB HAPUS ── */}
        {activeTab === "hapus" && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Users className="w-4 h-4 text-blue-600" /> Daftar Pasien ({patientProfiles.length})
              </h3>
              <div className="space-y-2 max-h-[360px] overflow-y-auto no-scrollbar">
                {patientProfiles.length === 0 ? (
                  <p className="text-center py-8 text-slate-400 italic text-xs">Belum ada pasien.</p>
                ) : patientProfiles.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-slate-800">{p.nama}</p>
                      <p className="text-[10px] text-slate-500">@{p.username || "—"} {p.faskes ? `• ${p.faskes}` : ""}</p>
                    </div>
                    <button onClick={() => handleDelete(p.id, p.nama)} className="p-2 bg-white text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-100 rounded-xl transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 flex gap-3 text-xs text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-[10px] text-amber-800 leading-normal">Menghapus akun akan menghapus seluruh riwayat medis pasien secara permanen dari enkripsi lokal.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
