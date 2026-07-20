/**
 * Export Utility — format XLSX rapi menggunakan library SheetJS (xlsx)
 */

import * as XLSX from "xlsx";
import {
  UserProfile, KaderPatientDampingan,
  MonitoringLog, MedicationLog,
} from "../types";

// ─── Helper ──────────────────────────────────────────────────
function tanggalIndo(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch { return dateStr; }
}

function bulanIndo(yyyyMm: string): string {
  const [y, m] = yyyyMm.split("-");
  const names = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  return `${names[parseInt(m,10)-1] || ""} ${y}`;
}

/** Download blob XLSX */
function downloadXlsx(wb: XLSX.WorkBook, filename: string) {
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Buat sheet dengan header meta (judul, periode, dll) lalu data tabel */
function buildSheet(
  meta: string[][],
  headers: string[],
  rows: (string | number)[][]
): XLSX.WorkSheet {
  const allRows: (string | number)[][] = [
    ...meta,
    [],
    headers,
    ...rows,
  ];
  const ws = XLSX.utils.aoa_to_sheet(allRows);

  // Lebar kolom otomatis
  const colWidths = headers.map((h, colIdx) => {
    const maxLen = Math.max(
      h.length,
      ...rows.map(r => String(r[colIdx] ?? "").length)
    );
    return { wch: Math.min(Math.max(maxLen + 2, 12), 50) };
  });
  ws["!cols"] = colWidths;

  return ws;
}

// ─── 1. Laporan Kunjungan Kader ───────────────────────────────
export function exportLaporanKunjungan(
  patients: KaderPatientDampingan[],
  allProfiles: UserProfile[],
  filterBulan: string,
  namaKader: string,
  namaFaskes?: string,
) {
  const periode = filterBulan === "Semua" ? "Semua Bulan" : bulanIndo(filterBulan);
  const meta = [
    ["LAPORAN KUNJUNGAN KADER TB"],
    [`Kader`, namaKader],
    [`Faskes`, namaFaskes || "-"],
    [`Periode`, periode],
    [`Dicetak`, tanggalIndo(new Date().toISOString().split("T")[0])],
  ];
  const headers = [
    "No", "Nama Pasien", "Jenis TB", "Fase Pengobatan",
    "Faskes", "Skor Kepatuhan (%)",
    "Tanggal Kunjungan", "Catatan Kunjungan", "Edukasi Diberikan",
  ];
  const rows: (string | number)[][] = [];
  let no = 1;
  patients.forEach(p => {
    const prof = allProfiles.find(pr => pr.id === p.pasienId);
    const visits = (p.riwayatKunjungan || []).filter(v =>
      filterBulan === "Semua" || v.tanggal.startsWith(filterBulan)
    );
    const edukasi = p.edukasiDiberikan.join("; ") || "-";
    if (visits.length === 0 && filterBulan === "Semua") {
      rows.push([no++, p.nama, `TB ${prof?.jenisTB||p.jenisTB}`,
        p.fasePengobatan, prof?.faskes||"-", p.kepatuhanPersen,
        "Belum ada kunjungan", "-", edukasi]);
    } else {
      visits.forEach(v => {
        rows.push([no++, p.nama, `TB ${prof?.jenisTB||p.jenisTB}`,
          p.fasePengobatan, prof?.faskes||"-", p.kepatuhanPersen,
          tanggalIndo(v.tanggal), v.catatan, edukasi]);
      });
    }
  });

  const ws = buildSheet(meta, headers, rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Kunjungan");
  downloadXlsx(wb, `Laporan_Kunjungan_${namaKader.replace(/\s/g,"_")}_${filterBulan}.xlsx`);
}

// ─── 2. Laporan Monitoring Kondisi ────────────────────────────
export function exportLaporanMonitoring(
  monitoringLogs: MonitoringLog[],
  namaPasien: string,
  namaFaskes: string,
  filterBulan: string,
) {
  const filtered = filterBulan === "Semua"
    ? monitoringLogs
    : monitoringLogs.filter(l => l.tanggal.startsWith(filterBulan));

  const periode = filterBulan === "Semua" ? "Semua Bulan" : bulanIndo(filterBulan);
  const meta = [
    ["LAPORAN MONITORING KONDISI HARIAN"],
    ["Pasien", namaPasien],
    ["Faskes", namaFaskes || "-"],
    ["Periode", periode],
    ["Dicetak", tanggalIndo(new Date().toISOString().split("T")[0])],
  ];
  const headers = [
    "No", "Tanggal", "Batuk", "Demam", "Sesak Napas",
    "Berat Badan (kg)", "Nafsu Makan",
    "Efek Samping", "Detail Efek Samping", "Status Kirim",
  ];
  const rows: (string | number)[][] = filtered.slice().reverse().map((log, i) => [
    i + 1, tanggalIndo(log.tanggal),
    log.batuk ? "Ya" : "Tidak",
    log.demam ? "Ya" : "Tidak",
    log.sesakNapas ? "Ya" : "Tidak",
    log.beratBadan,
    log.nafsuMakan,
    log.efekSamping ? "Ada" : "Nihil",
    log.efekSampingDetail || "-",
    log.statusKirim,
  ]);

  const ws = buildSheet(meta, headers, rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Monitoring");
  downloadXlsx(wb, `Laporan_Monitoring_${namaPasien.replace(/\s/g,"_")}_${filterBulan}.xlsx`);
}

// ─── 3. Laporan Kepatuhan OAT ─────────────────────────────────
export function exportLaporanKepatuhan(
  medicationLogs: MedicationLog[],
  namaPasien: string,
  namaFaskes: string,
  filterBulan: string,
) {
  const filtered = filterBulan === "Semua"
    ? medicationLogs
    : medicationLogs.filter(l => l.tanggal.startsWith(filterBulan));

  const sudah = filtered.filter(l => l.status === "sudah").length;
  const lewat  = filtered.filter(l => l.status === "lewat").length;
  const belum  = filtered.filter(l => l.status === "belum").length;
  const pct    = filtered.length > 0 ? Math.round((sudah/filtered.length)*100) : 0;

  const periode = filterBulan === "Semua" ? "Semua Bulan" : bulanIndo(filterBulan);
  const meta = [
    ["LAPORAN KEPATUHAN MINUM OBAT (OAT)"],
    ["Pasien", namaPasien],
    ["Faskes", namaFaskes || "-"],
    ["Periode", periode],
    ["Dicetak", tanggalIndo(new Date().toISOString().split("T")[0])],
    [],
    ["Total Hari", filtered.length, "Sudah", sudah, "Terlewat", lewat, "Belum", belum, "Kepatuhan", `${pct}%`],
  ];
  const headers = ["No","Tanggal","Status","Waktu Minum","Diverifikasi PMO"];
  const rows: (string|number)[][] = filtered.slice().reverse().map((log, i) => [
    i+1, tanggalIndo(log.tanggal),
    log.status === "sudah" ? "✓ Sudah" : log.status === "lewat" ? "✗ Terlewat" : "○ Belum",
    log.waktuMinum || "-",
    log.pmoDiverifikasi ? "Ya" : "Tidak",
  ]);

  const ws = buildSheet(meta, headers, rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Kepatuhan OAT");
  downloadXlsx(wb, `Laporan_Kepatuhan_${namaPasien.replace(/\s/g,"_")}_${filterBulan}.xlsx`);
}

// ─── 4. Rekap Admin: multi-sheet ─────────────────────────────
export function exportRekapAdmin(
  patients: KaderPatientDampingan[],
  allProfiles: UserProfile[],
  monitoringLogs: MonitoringLog[],
  filterBulan: string,
) {
  const wb = XLSX.utils.book_new();
  const periode = filterBulan === "Semua" ? "Semua Bulan" : bulanIndo(filterBulan);
  const tglCetak = tanggalIndo(new Date().toISOString().split("T")[0]);

  // ── Sheet 1: Rekap Pasien ──
  const meta1 = [
    ["REKAP DATA PASIEN TB"],
    ["Periode", periode],
    ["Dicetak", tglCetak],
    ["Total Pasien", patients.length],
  ];
  const h1 = ["No","Nama Pasien","Username","Jenis TB","Fase",
    "Faskes","Tanggal Mulai","Durasi (hari)","BB Awal (kg)",
    "PMO","Kader Dampingan","Kepatuhan (%)","Kunjungan Terakhir"];
  const r1: (string|number)[][] = patients.map((p,i) => {
    const prof = allProfiles.find(pr => pr.id === p.pasienId);
    return [
      i+1, p.nama, prof?.username||"-",
      `TB ${prof?.jenisTB||p.jenisTB}`,
      prof?.fasePengobatan||p.fasePengobatan,
      prof?.faskes||"-",
      prof?.tanggalMulai ? tanggalIndo(prof.tanggalMulai) : "-",
      prof?.durasiHari||180,
      prof?.beratBadanAwal||"-",
      prof?.pmoNama||"-",
      prof?.kaderNama||"-",
      p.kepatuhanPersen,
      p.kunjunganRumahTerakhir ? tanggalIndo(p.kunjunganRumahTerakhir) : "Belum ada",
    ];
  });
  XLSX.utils.book_append_sheet(wb, buildSheet(meta1, h1, r1), "Rekap Pasien");

  // ── Sheet 2: Rekap Kunjungan ──
  const meta2 = [
    ["REKAP KUNJUNGAN KADER"],
    ["Periode", periode],
    ["Dicetak", tglCetak],
  ];
  const h2 = ["No","Nama Pasien","Faskes","Kepatuhan (%)","Tanggal Kunjungan","Catatan","Edukasi Diberikan"];
  const r2: (string|number)[][] = [];
  let no2 = 1;
  patients.forEach(p => {
    const prof = allProfiles.find(pr => pr.id === p.pasienId);
    const visits = (p.riwayatKunjungan||[]).filter(v =>
      filterBulan === "Semua" || v.tanggal.startsWith(filterBulan)
    );
    if (visits.length === 0) {
      if (filterBulan === "Semua")
        r2.push([no2++, p.nama, prof?.faskes||"-", p.kepatuhanPersen, "Belum ada", "-", p.edukasiDiberikan.join("; ")||"-"]);
    } else {
      visits.forEach(v => {
        r2.push([no2++, p.nama, prof?.faskes||"-", p.kepatuhanPersen, tanggalIndo(v.tanggal), v.catatan, p.edukasiDiberikan.join("; ")||"-"]);
      });
    }
  });
  XLSX.utils.book_append_sheet(wb, buildSheet(meta2, h2, r2), "Kunjungan Kader");

  // ── Sheet 3: Monitoring Kondisi ──
  const filtered3 = filterBulan === "Semua"
    ? monitoringLogs
    : monitoringLogs.filter(l => l.tanggal.startsWith(filterBulan));
  const meta3 = [
    ["REKAP MONITORING KONDISI HARIAN"],
    ["Periode", periode],
    ["Dicetak", tglCetak],
  ];
  const h3 = ["No","Tanggal","Nama Pasien (Context)","Batuk","Demam","Sesak Napas","BB (kg)","Nafsu Makan","Efek Samping","Detail Efek Samping"];
  const r3: (string|number)[][] = filtered3.slice().reverse().map((log,i) => [
    i+1, tanggalIndo(log.tanggal), "Pasien Aktif",
    log.batuk?"Ya":"Tidak", log.demam?"Ya":"Tidak",
    log.sesakNapas?"Ya":"Tidak", log.beratBadan, log.nafsuMakan,
    log.efekSamping?"Ada":"Nihil", log.efekSampingDetail||"-",
  ]);
  XLSX.utils.book_append_sheet(wb, buildSheet(meta3, h3, r3), "Monitoring Kondisi");

  downloadXlsx(wb, `Rekap_TB_Admin_${filterBulan}_${new Date().toISOString().split("T")[0]}.xlsx`);
}
