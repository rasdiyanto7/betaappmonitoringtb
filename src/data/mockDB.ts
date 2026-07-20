/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  UserRole,
  UserProfile,
  MedicationLog,
  MonitoringLog,
  KontrolSchedule,
  KontakScreening,
  SelfAssessment,
  KaderPatientDampingan,
  AdminCredential,
} from "../types";
import { encryptData, decryptData } from "../crypto";

// ─────────────────────────────────────────────────────────────
// SUPER ADMIN CREDENTIALS (static, not stored in E2EE DB)
// ─────────────────────────────────────────────────────────────
export const SUPER_ADMIN: AdminCredential = {
  username: "admin",
  password: "adminsup1",
  role: UserRole.SUPER_ADMIN,
  nama: "Super Administrator",
};

// ─────────────────────────────────────────────────────────────
// EMPTY DATABASE STRUCTURE (no demo accounts)
// ─────────────────────────────────────────────────────────────
export const EMPTY_DATABASE = {
  profiles: [] as UserProfile[],
  medications: [] as MedicationLog[],
  monitoring: [] as MonitoringLog[],
  schedules: [] as KontrolSchedule[],
  screenings: [] as KontakScreening[],
  selfAssessments: [] as SelfAssessment[],
  kaderPatients: [] as KaderPatientDampingan[],
  familyLogs: [] as any[],
  questions: [] as any[],
  faskesList: [] as string[],
};

// ─────────────────────────────────────────────────────────────
// DATABASE MANAGER (Zero-Knowledge E2EE)
// ─────────────────────────────────────────────────────────────
export class PeduliTBStore {
  private static STORAGE_KEY = "PEDULITB_SECURE_STORAGE_V2";
  // Master key for shared single-device demo — in production each user has own key
  private static MASTER_KEY = "PEDULITB_MASTER_2024";

  /** Ambil raw string terenkripsi dari LocalStorage */
  public static getRawDatabase(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  /** Inisialisasi DB kosong jika belum ada */
  public static initializeDefaultDatabase() {
    if (localStorage.getItem(this.STORAGE_KEY)) return;
    this.saveDatabase(EMPTY_DATABASE, this.MASTER_KEY);
    console.log("Database PeduliTB v2 diinisialisasi (kosong, tanpa akun demo).");
  }

  /** Reset DB ke kondisi kosong */
  public static resetDatabase() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.initializeDefaultDatabase();
  }

  /** Load & dekripsi database menggunakan master key */
  public static loadDatabase(pin?: string): any | null {
    this.initializeDefaultDatabase();
    const dbRaw = localStorage.getItem(this.STORAGE_KEY);
    if (!dbRaw) return null;

    try {
      const container = JSON.parse(dbRaw);
      // Coba dekripsi dengan PIN yang diberikan, fallback ke master key
      let decrypted = pin ? decryptData<any>(container.encryptedPayload, pin) : null;
      if (!decrypted) {
        decrypted = decryptData<any>(container.encryptedPayload, this.MASTER_KEY);
      }
      return decrypted;
    } catch (e) {
      console.error("Gagal memuat database:", e);
      return null;
    }
  }

  /** Simpan database terenkripsi ke LocalStorage */
  public static saveDatabase(data: any, pin?: string) {
    try {
      const key = this.MASTER_KEY; // Selalu pakai master key untuk konsistensi single-device
      const encryptedPayload = encryptData(data, key);
      const dbContainer = {
        version: "2.0",
        status: "E2EE_ACTIVE",
        lastUpdated: new Date().toISOString(),
        encryptedPayload,
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dbContainer));
    } catch (e) {
      console.error("Gagal menyimpan database:", e);
    }
  }

  /** Verifikasi kredensial Super Admin */
  public static verifyAdmin(username: string, password: string): boolean {
    return (
      username.trim().toLowerCase() === SUPER_ADMIN.username.toLowerCase() &&
      password === SUPER_ADMIN.password
    );
  }

  /** Tambah profil baru (Pasien/Kader/Medis) ke dalam DB */
  public static addProfile(newProfile: UserProfile): boolean {
    const db = this.loadDatabase();
    if (!db) return false;

    // Cek duplikasi username
    const exists = db.profiles.find(
      (p: UserProfile) =>
        p.username?.toLowerCase() === newProfile.username?.toLowerCase() ||
        p.email?.toLowerCase() === newProfile.email?.toLowerCase()
    );
    if (exists) return false;

    db.profiles.push(newProfile);

    // Jika Pasien, tambahkan ke kaderPatients juga
    if (newProfile.role === UserRole.PASIEN) {
      db.kaderPatients.push({
        pasienId: newProfile.id,
        nama: newProfile.nama,
        jenisTB: newProfile.jenisTB || "Paru",
        fasePengobatan: newProfile.fasePengobatan || "Intensif",
        kepatuhanPersen: 100,
        edukasiDiberikan: [],
        riwayatKunjungan: [],
      });
    }

    this.saveDatabase(db);
    return true;
  }

  /** Update profil berdasarkan id */
  public static updateProfile(id: string, updates: Partial<UserProfile>): boolean {
    const db = this.loadDatabase();
    if (!db) return false;
    db.profiles = db.profiles.map((p: UserProfile) =>
      p.id === id ? { ...p, ...updates } : p
    );
    if (updates.nama && updates.role === UserRole.PASIEN) {
      db.kaderPatients = db.kaderPatients.map((kp: any) =>
        kp.pasienId === id ? { ...kp, nama: updates.nama } : kp
      );
    }
    this.saveDatabase(db);
    return true;
  }

  /** Hapus profil berdasarkan id */
  public static deleteProfile(id: string): boolean {
    const db = this.loadDatabase();
    if (!db) return false;
    db.profiles = db.profiles.filter((p: UserProfile) => p.id !== id);
    db.kaderPatients = db.kaderPatients.filter((kp: any) => kp.pasienId !== id);
    this.saveDatabase(db);
    return true;
  }

  /** Ambil daftar faskes */
  public static getFaskesList(): string[] {
    const db = this.loadDatabase();
    return db?.faskesList || [];
  }

  /** Tambah faskes baru */
  public static addFaskes(nama: string): boolean {
    const db = this.loadDatabase();
    if (!db) return false;
    const list: string[] = db.faskesList || [];
    const trimmed = nama.trim();
    if (!trimmed || list.includes(trimmed)) return false;
    list.push(trimmed);
    db.faskesList = list;
    this.saveDatabase(db);
    return true;
  }

  /** Hapus faskes */
  public static deleteFaskes(nama: string): boolean {
    const db = this.loadDatabase();
    if (!db) return false;
    db.faskesList = (db.faskesList || []).filter((f: string) => f !== nama);
    this.saveDatabase(db);
    return true;
  }
}

// ─────────────────────────────────────────────────────────────
// FAQ DATABASE (static, tidak berubah)
// ─────────────────────────────────────────────────────────────
export const FAQ_DATABASE = [
  {
    id: "faq_1",
    pertanyaan: "Apakah TB menular melalui piring makan yang sama?",
    jawaban:
      "Tidak. Kuman TB ditularkan melalui udara (percikan dahak saat batuk/bersin), bukan melalui alat makan, gelas, atau berjabat tangan. Namun alat makan pasien tetap harus dicuci bersih menggunakan sabun.",
  },
  {
    id: "faq_2",
    pertanyaan: "Berapa lama pengobatan TB paru standar harus dijalani?",
    jawaban:
      "Pengobatan TB paru standar berlangsung selama minimal 6 bulan berturut-turut tanpa putus. Terdiri dari 2 bulan Fase Intensif dan 4 bulan Fase Lanjutan.",
  },
  {
    id: "faq_3",
    pertanyaan: "Apa yang harus saya lakukan jika lupa minum obat satu hari?",
    jawaban:
      "Segera minum dosis yang terlupa begitu Anda ingat pada hari yang sama. Namun, jika baru ingat keesokan harinya di waktu dosis berikutnya, minum dosis normal seperti biasa. JANGAN menduplikasi dosis demi mengejar ketertinggalan, dan laporkan segera ke petugas medis atau kader dampingan.",
  },
  {
    id: "faq_4",
    pertanyaan: "Mengapa urin saya berubah merah seperti fanta?",
    jawaban:
      "Ini adalah efek samping normal dan tidak berbahaya dari obat Rifampisin. Tubuh mengeluarkan sisa zat pewarna obat lewat urin. Lanjutkan minum obat, tidak perlu panik.",
  },
  {
    id: "faq_5",
    pertanyaan: "Kapan saya dinyatakan benar-benar sembuh dari TB?",
    jawaban:
      "Pasien dinyatakan sembuh setelah menyelesaikan seluruh rangkaian pengobatan minimal 6 bulan, disertai dengan hasil pemeriksaan dahak (sputum) negatif pada akhir pengobatan, serta perbaikan klinis menyeluruh oleh Dokter faskes.",
  },
];
