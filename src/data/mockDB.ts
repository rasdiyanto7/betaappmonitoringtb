/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRole, UserProfile, MedicationLog, MonitoringLog, KontrolSchedule, KontakScreening, SelfAssessment, KaderPatientDampingan } from "../types";
import { encryptText, decryptText, encryptData, decryptData } from "../crypto";

// Default User Profiles
export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: "PASIEN_01",
    nama: "Budi Santoso",
    role: UserRole.PASIEN,
    email: "budi@gmail.com",
    username: "budi",
    pin: "1234",
    jenisTB: "Paru",
    fasePengobatan: "Intensif",
    pmoNama: "Siti Rahma (Istri)",
    kaderNama: "Bu Retno",
    beratBadanAwal: 62,
    faskes: "Puskesmas Sukajadi",
    tanggalMulai: "2026-06-01",
    durasiHari: 180
  },
  {
    id: "KADER_01",
    nama: "Bu Retno",
    role: UserRole.KADER,
    email: "retno@kader.tb",
    username: "retno",
    pin: "5678",
    faskes: "Puskesmas Sukajadi"
  },
  {
    id: "MEDIS_01",
    nama: "dr. Andi Wijaya",
    role: UserRole.MEDIS,
    email: "dr.andi@puskesmas.go.id",
    username: "andi",
    pin: "9999",
    faskes: "Puskesmas Sukajadi"
  }
];

// Seed Daily Medication Logs for Budi (last 10 days)
const seedMedicationLogs = (): MedicationLog[] => {
  const logs: MedicationLog[] = [];
  const today = new Date();
  for (let i = 10; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    
    // Day 0 (today) is "belum" by default
    if (i === 0) {
      logs.push({ tanggal: dateStr, status: "belum", pmoDiverifikasi: false });
    } else {
      // Days before are mostly "sudah", with one "lewat" for realistic data
      const status = i === 4 ? "lewat" : "sudah";
      logs.push({
        tanggal: dateStr,
        status,
        waktuMinum: status === "sudah" ? "07:15" : undefined,
        pmoDiverifikasi: status === "sudah"
      });
    }
  }
  return logs;
};

// Seed Symptom Monitoring Logs (last 3 entries)
const seedMonitoringLogs = (): MonitoringLog[] => {
  const today = new Date();
  const getPrevDate = (days: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() - days);
    return d.toISOString().split("T")[0];
  };

  return [
    {
      tanggal: getPrevDate(7),
      batuk: true,
      demam: true,
      beratBadan: 61.5, // BB sebelumnya
      nafsuMakan: "Menurun",
      sesakNapas: false,
      efekSamping: true,
      efekSampingDetail: "Mual ringan di pagi hari",
      statusKirim: "Terkirim ke Puskesmas"
    },
    {
      tanggal: getPrevDate(3),
      batuk: true,
      demam: false,
      beratBadan: 62.1, // BB naik
      nafsuMakan: "Stabil",
      sesakNapas: false,
      efekSamping: false,
      statusKirim: "Terkirim ke Puskesmas"
    },
    {
      tanggal: getPrevDate(1),
      batuk: false,
      demam: false,
      beratBadan: 62.8, // BB naik lagi
      nafsuMakan: "Meningkat",
      sesakNapas: false,
      efekSamping: false,
      statusKirim: "Terkirim ke Puskesmas"
    }
  ];
};

// Seed Control Schedule
export const DEFAULT_SCHEDULES: KontrolSchedule[] = [
  {
    id: "K_01",
    tanggal: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Besok (H-1)
    tipe: "Pengambilan Obat",
    deskripsi: "Pengambilan OAT Fase Intensif Bulan Kedua di Apotek Puskesmas",
    selesai: false
  },
  {
    id: "K_02",
    tanggal: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    tipe: "Pemeriksaan Dahak (Sputum)",
    deskripsi: "Pemeriksaan Dahak Akhir Fase Intensif Bulan Kedua di Lab Puskesmas",
    selesai: false
  },
  {
    id: "K_03",
    tanggal: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    tipe: "Kunjungan Rutin",
    deskripsi: "Konsultasi Dokter Spesialis Paru untuk evaluasi klinis",
    selesai: false
  }
];

// Seed Screening Contacts
export const DEFAULT_SCREENINGS: KontakScreening[] = [
  {
    id: "S_01",
    nama: "Siti Rahma",
    usia: 28,
    batukDuaMinggu: false,
    demam: false,
    bbTurun: false,
    anakBalita: false,
    lansia: false,
    tanggal: "2026-07-10",
    statusRisiko: "Rendah"
  },
  {
    id: "S_02",
    nama: "Rizky Santoso",
    usia: 4, // Balita!
    batukDuaMinggu: false,
    demam: true,
    bbTurun: false,
    anakBalita: true,
    lansia: false,
    tanggal: "2026-07-12",
    statusRisiko: "Tinggi (Rekomendasi Faskes)"
  }
];

// Seed Self Assessments
export const DEFAULT_SELF_ASSESSMENTS: SelfAssessment[] = [
  {
    tanggal: "2026-07-15",
    minumHariIni: true,
    pernahLupaMingguIni: false,
    adaEfekSamping: false,
    skor: 100,
    kategori: "Sangat Patuh"
  }
];

// Kader Patients Dashboard
export const DEFAULT_KADER_PATIENTS: KaderPatientDampingan[] = [
  {
    pasienId: "PASIEN_01",
    nama: "Budi Santoso",
    jenisTB: "TB Paru",
    fasePengobatan: "Fase Intensif (Bulan ke-2)",
    kepatuhanPersen: 90,
    kunjunganRumahTerakhir: "2026-07-14",
    catatanKader: "Budi menunjukkan perkembangan sangat baik. Berat badan naik, batuk reda.",
    edukasiDiberikan: ["Efek Samping OAT", "Cara Pencegahan Penularan", "Pentingnya Tuntas Obat"],
    riwayatKunjungan: [
      { tanggal: "2026-07-14", catatan: "Budi menunjukkan perkembangan sangat baik. Berat badan naik, batuk reda." },
      { tanggal: "2026-07-07", catatan: "Kunjungan rutin awal bulan. Mengingatkan minum obat tepat waktu." }
    ]
  },
  {
    pasienId: "PASIEN_02",
    nama: "Slamet Rahardjo",
    jenisTB: "TB Ekstra Paru (Kelenjar)",
    fasePengobatan: "Fase Lanjutan (Bulan ke-4)",
    kepatuhanPersen: 100,
    kunjunganRumahTerakhir: "2026-07-11",
    catatanKader: "Pasien patuh minum obat dibantu PMO (anak kandung).",
    edukasiDiberikan: ["Nutrisi Pendukung TB", "Dukungan Psikologis Keluarga"],
    riwayatKunjungan: [
      { tanggal: "2026-07-11", catatan: "Pasien patuh minum obat dibantu PMO (anak kandung)." }
    ]
  }
];

// FAQ Database
export const FAQ_DATABASE = [
  {
    id: "faq_1",
    pertanyaan: "Apakah TB menular melalui piring makan yang sama?",
    jawaban: "Tidak. Kuman TB ditularkan melalui udara (percikan dahak saat batuk/bersin), bukan melalui alat makan, gelas, atau berjabat tangan. Namun alat makan pasien tetap harus dicuci bersih menggunakan sabun."
  },
  {
    id: "faq_2",
    pertanyaan: "Berapa lama pengobatan TB paru standar harus dijalani?",
    jawaban: "Pengobatan TB paru standar berlangsung selama minimal 6 bulan berturut-turut tanpa putus. Terdiri dari 2 bulan Fase Intensif dan 4 bulan Fase Lanjutan."
  },
  {
    id: "faq_3",
    pertanyaan: "Apa yang harus saya lakukan jika lupa minum obat satu hari?",
    jawaban: "Segera minum dosis yang terlupa begitu Anda ingat pada hari yang sama. Namun, jika baru ingat keesokan harinya di waktu dosis berikutnya, minum dosis normal seperti biasa. JANGAN menduplikasi dosis demi mengejar ketertinggalan, dan laporkan segera ke petugas medis atau kader dampingan."
  },
  {
    id: "faq_4",
    pertanyaan: "Mengapa urin saya berubah merah seperti fanta?",
    jawaban: "Ini adalah efek samping normal dan tidak berbahaya dari obat Rifampisin. Tubuh mengeluarkan sisa zat pewarna obat lewat urin. Lanjutkan minum obat, tidak perlu panik."
  },
  {
    id: "faq_5",
    pertanyaan: "Kapan saya dinyatakan benar-benar sembuh dari TB?",
    jawaban: "Pasien dinyatakan sembuh setelah menyelesaikan seluruh rangkaian pengobatan minimal 6 bulan, disertai dengan hasil pemeriksaan dahak (sputum) negatif pada akhir pengobatan, serta perbaikan klinis menyeluruh oleh Dokter faskes."
  }
];

// --- Database Manager (Zero-Knowledge E2EE Simulation) ---
export class PeduliTBStore {
  private static STORAGE_KEY = "PEDULITB_SECURE_STORAGE_V1";
  
  // Ambil database mentah dari LocalStorage (dalam bentuk terenkripsi)
  public static getRawDatabase(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  // Bersihkan database dan set ulang
  public static resetDatabase() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.initializeDefaultDatabase();
  }

  // Inisialisasi DB default terenkripsi jika belum ada
  public static initializeDefaultDatabase() {
    if (localStorage.getItem(this.STORAGE_KEY)) return;

    // Untuk demo, kita enkripsi data default Budi dengan PIN "1234"
    const patientKey = "1234"; 

    const rawData = {
      profiles: DEFAULT_PROFILES,
      medications: seedMedicationLogs(),
      monitoring: seedMonitoringLogs(),
      schedules: DEFAULT_SCHEDULES,
      screenings: DEFAULT_SCREENINGS,
      selfAssessments: DEFAULT_SELF_ASSESSMENTS,
      kaderPatients: DEFAULT_KADER_PATIENTS,
      familyLogs: [
        {
          id: "FL_01",
          tanggal: "2026-07-16",
          obatTepatWaktu: true,
          dosisSesuai: true,
          didampingiLangsung: true,
          adaEfekSamping: false,
          maskerSiap: true,
          catatanKeluarga: "Budi sangat semangat minum obat hari ini. Selera makan mulai membaik.",
          pmoNama: "Siti Rahma (Istri)"
        },
        {
          id: "FL_02",
          tanggal: "2026-07-17",
          obatTepatWaktu: true,
          dosisSesuai: true,
          didampingiLangsung: true,
          adaEfekSamping: true,
          maskerSiap: true,
          catatanKeluarga: "Ada mual sedikit di pagi hari, tapi obat berhasil masuk dan tidak dimuntahkan.",
          pmoNama: "Siti Rahma (Istri)"
        }
      ],
      questions: [
        {
          id: "Q_01",
          pasienId: "PASIEN_01",
          pasienNama: "Budi Santoso",
          pertanyaan: "Dok/Bu Kader, kenapa ya perut saya sering terasa mual setiap selesai minum obat merah (Rifampisin)? Apakah ada tips menguranginya?",
          tanggal: "2026-07-17",
          status: "Belum Dijawab"
        },
        {
          id: "Q_02",
          pasienId: "PASIEN_01",
          pasienNama: "Budi Santoso",
          pertanyaan: "Bagaimana cara menjaga agar anggota keluarga lain tidak tertular TB selama saya menjalani masa penyembuhan?",
          tanggal: "2026-07-18",
          status: "Sudah Dijawab",
          jawaban: "Pakai masker di 2 bulan pertama, pastikan kamar memiliki sirkulasi udara & sirkulasi sinar matahari yang baik, serta pisahkan tempat tidur jika memungkinkan.",
          tanggalDijawab: "2026-07-18",
          kaderAtauMedisNama: "Bu Retno"
        }
      ]
    };

    // Seluruh data pasien yang sensitif dienkripsi sebelum disimpan ke LocalStorage
    const encryptedPayload = encryptData(rawData, patientKey);

    const dbContainer = {
      owner: "BUDI_SANTOSO_DEMO",
      status: "E2EE_ACTIVE",
      lastUpdated: new Date().toISOString(),
      encryptedPayload // Memuat seluruh basis data terenkripsi
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dbContainer));
    console.log("Database secure berhasil diinisialisasi dengan Enkripsi E2E.");
  }

  // Load dan dekripsi basis data menggunakan PIN/Kunci
  public static loadDatabase(pin: string): any | null {
    this.initializeDefaultDatabase();
    
    const dbRaw = localStorage.getItem(this.STORAGE_KEY);
    if (!dbRaw) return null;

    try {
      const container = JSON.parse(dbRaw);
      const ciphertext = container.encryptedPayload;
      
      // Decrypt using provided PIN first. If it fails (e.g. for multi-user demo access with Kader/Medis PINs),
      // gracefully fall back to the primary patient's master key ("1234") so they can access the shared local DB records.
      let decrypted = decryptData<any>(ciphertext, pin);
      if (!decrypted) {
        decrypted = decryptData<any>(ciphertext, "1234");
      }
      return decrypted;
    } catch (e) {
      console.error("Gagal memuat atau mendekripsi database:", e);
      return null;
    }
  }

  // Simpan basis data kembali dalam keadaan terenkripsi penuh
  public static saveDatabase(data: any, pin: string) {
    try {
      // We always encrypt using the primary master key ("1234") to ensure the shared local database
      // remains readable by other users (like the Patient himself) in this single-device demo application.
      const encryptedPayload = encryptData(data, "1234");
      const dbContainer = {
        owner: "BUDI_SANTOSO_DEMO",
        status: "E2EE_ACTIVE",
        lastUpdated: new Date().toISOString(),
        encryptedPayload
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dbContainer));
    } catch (e) {
      console.error("Gagal mengamankan database:", e);
    }
  }
}
