/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserProfile, UserRole } from "../types";
import { 
  UserPlus, Edit, Trash2, Users, Key, Mail, User, Shield, 
  CheckCircle, Plus, AlertTriangle, FileText, CheckCircle2 
} from "lucide-react";

interface KelolaAkunPasienProps {
  currentUser: UserProfile;
  allProfiles: UserProfile[];
  onCreatePatient: (newProfileFields: any) => void;
  onUpdatePatientPin: (pasienId: string, newPin: string) => void;
  onDeletePatient: (pasienId: string) => void;
  onUpdatePatientBaseline: (pasienId: string, baselineData: any) => void;
}

export default function KelolaAkunPasien({
  currentUser,
  allProfiles,
  onCreatePatient,
  onUpdatePatientPin,
  onDeletePatient,
  onUpdatePatientBaseline
}: KelolaAkunPasienProps) {
  const [activeTab, setActiveTab] = useState<"tambah" | "edit" | "hapus">("tambah");

  // Filter to show only patients
  const patientProfiles = allProfiles.filter(p => p.role === UserRole.PASIEN);

  // States for Tambah Akun
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newJenisTB, setNewJenisTB] = useState<"Paru" | "Ekstraparu">("Paru");
  const [newFase, setNewFase] = useState<"Intensif" | "Lanjutan">("Intensif");
  const [newBerat, setNewBerat] = useState("");
  const [newPmo, setNewPmo] = useState("");
  const [newFaskes, setNewFaskes] = useState("");
  const [newMulai, setNewMulai] = useState(new Date().toISOString().split("T")[0]);
  const [newDurasi, setNewDurasi] = useState("180");
  const [msgCreate, setMsgCreate] = useState("");

  // States for Edit Akun
  const [selectedEditPasienId, setSelectedEditPasienId] = useState("");
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPin, setEditPin] = useState("");
  const [msgEdit, setMsgEdit] = useState("");

  // Sync selected patient edit form inputs
  useEffect(() => {
    if (selectedEditPasienId) {
      const profile = allProfiles.find(p => p.id === selectedEditPasienId);
      if (profile) {
        setEditName(profile.nama);
        setEditUsername(profile.username || profile.email.split("@")[0]);
        setEditEmail(profile.email);
        setEditPin(profile.pin);
      }
    } else {
      setEditName("");
      setEditUsername("");
      setEditEmail("");
      setEditPin("");
    }
  }, [selectedEditPasienId, allProfiles]);

  // Actions
  const handleCreatePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPin.trim()) {
      alert("Nama dan PIN tidak boleh kosong!");
      return;
    }
    const finalUsername = newUsername.trim() || newName.toLowerCase().replace(/\s+/g, "");
    onCreatePatient({
      nama: newName.trim(),
      username: finalUsername,
      role: UserRole.PASIEN,
      email: newEmail.trim() || `${finalUsername}@pedulitb.id`,
      pin: newPin.trim(),
      jenisTB: newJenisTB,
      fasePengobatan: newFase,
      pmoNama: newPmo.trim() || "Keluarga Dampingan",
      kaderNama: currentUser.nama,
      beratBadanAwal: Number(newBerat) || 50,
      faskes: newFaskes.trim() || "Puskesmas Rujukan",
      tanggalMulai: newMulai,
      durasiHari: Number(newDurasi) || 180
    });

    setNewName("");
    setNewUsername("");
    setNewEmail("");
    setNewPin("");
    setNewBerat("");
    setNewPmo("");
    setNewFaskes("");
    setMsgCreate(`Akun pasien "${newName}" dengan username "${finalUsername}" berhasil didaftarkan!`);
    setTimeout(() => setMsgCreate(""), 5000);
  };

  const handleEditPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditPasienId || !editName.trim() || !editPin.trim()) {
      alert("Lengkapi semua field edit!");
      return;
    }

    // Call updates to PIN and other profile fields
    onUpdatePatientPin(selectedEditPasienId, editPin.trim());
    onUpdatePatientBaseline(selectedEditPasienId, {
      nama: editName.trim(),
      username: editUsername.trim(),
      email: editEmail.trim()
    });

    setMsgEdit(`Data login pasien "${editName}" berhasil diperbarui.`);
    setTimeout(() => setMsgEdit(""), 4000);
  };

  const handleDeletePatientClick = (pasienId: string, nama: string) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus akun pasien "${nama}" secara permanen dari server terenkripsi E2EE? Seluruh riwayat akan lenyap.`);
    if (confirmDelete) {
      onDeletePatient(pasienId);
      if (selectedEditPasienId === pasienId) {
        setSelectedEditPasienId("");
      }
    }
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen font-sans pb-24">
      {/* Title Header */}
      <div className="p-4 bg-white border-b border-slate-200/80 sticky top-0 z-10 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-display font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" /> Kelola Akun Pasien
          </h2>
          <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-100">
            {currentUser.role === UserRole.KADER ? "Kader TB" : "Medis"}
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("tambah")}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "tambah"
                ? "bg-white text-slate-800 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Tambah Akun
          </button>
          <button
            onClick={() => setActiveTab("edit")}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "edit"
                ? "bg-white text-slate-800 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Edit className="w-3.5 h-3.5" /> Edit Akun
          </button>
          <button
            onClick={() => setActiveTab("hapus")}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "hapus"
                ? "bg-white text-slate-800 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" /> Daftar & Hapus
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-md mx-auto w-full">
        {/* --- TAB 1: TAMBAH PASIEN BARU --- */}
        {activeTab === "tambah" && (
          <form onSubmit={handleCreatePatientSubmit} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <UserPlus className="w-4 h-4 text-blue-600" /> Daftarkan Pasien Baru
            </h3>

            {msgCreate && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{msgCreate}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Lengkap Pasien</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Budi Santoso"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Username Login</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. budisantoso"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-semibold text-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">PIN Login (4-6 Digit)</label>
                  <input
                    type="text"
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 1234"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono font-bold tracking-widest text-emerald-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Pasien (Opsional)</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. budi@gmail.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Jenis Diagnosa TB</label>
                  <select
                    value={newJenisTB}
                    onChange={(e) => setNewJenisTB(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Paru">TB Paru</option>
                    <option value="Ekstraparu">TB Ekstra Paru</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fase Pengobatan</label>
                  <select
                    value={newFase}
                    onChange={(e) => setNewFase(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Intensif">Intensif (Harian)</option>
                    <option value="Lanjutan">Lanjutan (3x Seminggu)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Berat Badan (kg)</label>
                  <input
                    type="number"
                    value={newBerat}
                    onChange={(e) => setNewBerat(e.target.value)}
                    placeholder="e.g. 52"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama PMO (Keluarga)</label>
                  <input
                    type="text"
                    value={newPmo}
                    onChange={(e) => setNewPmo(e.target.value)}
                    placeholder="e.g. Siti Rahma"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tanggal Mulai Terapi</label>
                  <input
                    type="date"
                    value={newMulai}
                    onChange={(e) => setNewMulai(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Durasi Terapi</label>
                  <select
                    value={newDurasi}
                    onChange={(e) => setNewDurasi(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="180">6 Bulan (180 hari)</option>
                    <option value="240">8 Bulan (240 hari)</option>
                    <option value="365">12 Bulan (365 hari)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Puskesmas Rujukan</label>
                <input
                  type="text"
                  value={newFaskes}
                  onChange={(e) => setNewFaskes(e.target.value)}
                  placeholder="e.g. Puskesmas Sukajadi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-blue-600/10"
            >
              + Simpan & Enkripsi Akun Pasien
            </button>
          </form>
        )}

        {/* --- TAB 2: EDIT DATA LOGIN PASIEN --- */}
        {activeTab === "edit" && (
          <form onSubmit={handleEditPatientSubmit} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Edit className="w-4 h-4 text-blue-600" /> Edit Detail Login Pasien
            </h3>

            {msgEdit && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{msgEdit}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pilih Pasien</label>
                <select
                  value={selectedEditPasienId}
                  onChange={(e) => setSelectedEditPasienId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-800"
                  required
                >
                  <option value="">-- Pilih Pasien Dampingan --</option>
                  {patientProfiles.map(p => (
                    <option key={p.id} value={p.id}>{p.nama} (ID: {p.id})</option>
                  ))}
                </select>
              </div>

              {selectedEditPasienId && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Nama lengkap"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-medium"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Username Login</label>
                      <input
                        type="text"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        placeholder="Username"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sandi PIN (4-6 Digit)</label>
                      <input
                        type="text"
                        maxLength={6}
                        pattern="[0-9]*"
                        inputMode="numeric"
                        value={editPin}
                        onChange={(e) => setEditPin(e.target.value.replace(/\D/g, ""))}
                        placeholder="PIN Kunci"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono font-bold tracking-widest text-emerald-600 focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Pasien</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-medium"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm"
                  >
                    Simpan Perubahan Akun
                  </button>
                </>
              )}
            </div>
          </form>
        )}

        {/* --- TAB 3: DAFTAR AKUN & HAPUS PASIEN --- */}
        {activeTab === "hapus" && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Users className="w-4 h-4 text-blue-600" /> Daftar Pengguna Pasien ({patientProfiles.length})
              </h3>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 no-scrollbar">
                {patientProfiles.length === 0 ? (
                  <p className="text-center py-8 text-slate-400 italic text-xs">Belum ada pasien terdaftar.</p>
                ) : (
                  patientProfiles.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl transition-all">
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-slate-800 leading-none">{p.nama}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">
                          Username: <span className="text-blue-700 font-bold">"{p.username || p.email.split("@")[0]}"</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          ID: {p.id} • PIN: <span className="font-bold text-emerald-600">"{p.pin}"</span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeletePatientClick(p.id, p.nama)}
                        className="p-2 bg-white text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-100 hover:border-rose-600 rounded-xl transition-all flex items-center justify-center shadow-xs"
                        title="Hapus Akun Pasien secara Permanen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Warning Area */}
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 flex gap-3 text-xs leading-relaxed text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-bold">Keamanan Enkripsi Lokal:</p>
                <p className="text-[10px] text-amber-800/95 leading-normal">
                  Sistem ini menggunakan Zero-Knowledge Encryption. Mengubah PIN atau menghapus pasien akan mereset dan membersihkan seluruh riwayat rekap medis lokal yang terkait dengan kunci enkripsi tersebut.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
