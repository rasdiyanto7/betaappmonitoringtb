/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  PASIEN = "PASIEN",
  KADER = "KADER",
  MEDIS = "MEDIS",
  SUPER_ADMIN = "SUPER_ADMIN"
}

export interface AdminCredential {
  username: string;
  password: string;
  role: UserRole.SUPER_ADMIN;
  nama: string;
}

export interface UserProfile {
  id: string;
  nama: string;
  role: UserRole;
  email?: string;  // optional — bisa dikosongkan saat pembuatan akun
  username?: string;
  pin: string; // pin/password for login and decryption key
  jenisTB?: "Paru" | "Ekstraparu";
  fasePengobatan?: "Intensif" | "Lanjutan";
  pmoNama?: string;
  kaderNama?: string;
  beratBadanAwal?: number;
  faskes?: string;
  tanggalMulai?: string; // YYYY-MM-DD
  durasiHari?: number; // e.g., 180 (6 months)
}

export interface MedicationLog {
  tanggal: string; // YYYY-MM-DD
  status: "sudah" | "lewat" | "belum";
  waktuMinum?: string; // HH:MM
  pmoDiverifikasi: boolean;
}

export interface MonitoringLog {
  tanggal: string; // YYYY-MM-DD
  batuk: boolean;
  demam: boolean;
  beratBadan: number;
  nafsuMakan: "Meningkat" | "Menurun" | "Stabil";
  sesakNapas: boolean;
  efekSamping: boolean;
  efekSampingDetail?: string;
  fotoObatUrl?: string;
  statusKirim: "Enkripsi Lokal" | "Terkirim ke Puskesmas";
}

export interface KontrolSchedule {
  id: string;
  tanggal: string; // YYYY-MM-DD
  tipe: "Kunjungan Rutin" | "Pemeriksaan Dahak (Sputum)" | "Pengambilan Obat";
  deskripsi: string;
  selesai: boolean;
}

export interface KontakScreening {
  id: string;
  nama: string;
  usia: number;
  batukDuaMinggu: boolean;
  demam: boolean;
  bbTurun: boolean;
  anakBalita: boolean;
  lansia: boolean;
  tanggal: string;
  statusRisiko: "Rendah" | "Tinggi (Rekomendasi Faskes)";
}

export interface SelfAssessment {
  tanggal: string;
  minumHariIni: boolean;
  pernahLupaMingguIni: boolean;
  adaEfekSamping: boolean;
  skor: number; // 0 - 100
  kategori: "Sangat Patuh" | "Cukup Patuh" | "Kurang Patuh";
}

export interface FamilySupportLog {
  id: string;
  tanggal: string; // YYYY-MM-DD
  obatTepatWaktu: boolean;
  dosisSesuai: boolean;
  didampingiLangsung: boolean;
  adaEfekSamping: boolean;
  maskerSiap: boolean;
  catatanKeluarga: string;
  pmoNama: string;
}

export interface KaderPatientDampingan {
  pasienId: string;
  nama: string;
  jenisTB: string;
  fasePengobatan: string;
  kepatuhanPersen: number;
  kunjunganRumahTerakhir?: string;
  catatanKader?: string;
  edukasiDiberikan: string[]; // e.g. ["Cara Minum Obat", "Etika Batuk"]
  riwayatKunjungan?: { tanggal: string; catatan: string }[];
}

export interface FAQItem {
  id: string;
  pertanyaan: string;
  jawaban: string;
}

export interface PatientQuestion {
  id: string;
  pasienId: string;
  pasienNama: string;
  pertanyaan: string;
  tanggal: string;
  status: "Belum Dijawab" | "Sudah Dijawab";
  jawaban?: string;
  tanggalDijawab?: string;
  kaderAtauMedisNama?: string;
}

export interface EncryptedContainer {
  iv: string;
  ciphertext: string;
  salt: string;
}

export interface DatabasePayload {
  profiles: UserProfile[];
  medications: MedicationLog[];
  monitoring: MonitoringLog[];
  schedules: KontrolSchedule[];
  screenings: KontakScreening[];
  selfAssessments: SelfAssessment[];
  kaderPatients: KaderPatientDampingan[];
  familyLogs?: FamilySupportLog[];
  questions?: PatientQuestion[];
  faskesList?: string[]; // daftar nama faskes yang dikelola admin
}

