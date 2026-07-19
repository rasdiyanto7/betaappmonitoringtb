/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EduSubMenu {
  id: string;
  title: string;
  icon: string; // lucide icon identifier
  content: string[]; // paragraph list
  points?: string[]; // bullet points list
}

export interface MitosFaktaItem {
  pernyataan: string;
  tipe: "MITOS" | "FAKTA";
  penjelasan: string;
}

export const EDU_TB_SUBMENUS: EduSubMenu[] = [
  {
    id: "apa-itu-tb",
    title: "Apa itu Tuberkulosis (TB)?",
    icon: "Info",
    content: [
      "Tuberkulosis (TB) adalah penyakit menular yang disebabkan oleh kuman Mycobacterium tuberculosis. Sebagian besar kuman TB menyerang paru-paru, tetapi dapat juga menyerang organ tubuh lainnya seperti kelenjar getah bening, tulang, kulit, dan otak (dikenal sebagai TB Ekstra Paru).",
      "Penting untuk dipahami bahwa TB BUKAN penyakit keturunan, BUKAN disebabkan oleh guna-guna, kutukan, atau racun. TB adalah penyakit infeksi bakteri murni yang sepenuhnya BISA DISEMBUHKAN jika diobati dengan benar, tepat waktu, dan tuntas."
    ],
    points: [
      "Disebabkan kuman/bakteri Mycobacterium tuberculosis.",
      "Utamanya menyerang paru-paru (TB Paru), namun bisa menyerang organ lain (TB Ekstra Paru).",
      "Dapat disembuhkan secara total dengan konsumsi OAT yang teratur."
    ]
  },
  {
    id: "cara-penularan",
    title: "Cara Penularan TB",
    icon: "Users",
    content: [
      "Kuman TB menular melalui udara (airborne transmission). Ketika seorang pasien TB paru aktif batuk, bersin, atau berbicara, mereka menyemburkan percikan dahak lembut (droplet nuclei) yang mengandung bakteri TB ke udara bebas.",
      "Orang di sekitar dapat menghirup droplet tersebut ke dalam paru-paru mereka. Namun, penularan ini tidak terjadi secara instan lewat kontak sekali lewat biasa. Penularan umumnya membutuhkan kontak erat yang cukup sering atau tinggal serumah dengan pasien dalam jangka waktu tertentu.",
      "Kuman TB TIDAK menular lewat berbagi alat makan (piring, sendok), berjabat tangan, menggunakan toilet bersama, atau menyentuh sprei/pakaian pasien."
    ],
    points: [
      "Penularan utama lewat percikan dahak (droplet) saat batuk atau bersin.",
      "Menular melalui pernapasan, bukan saluran pencernaan atau kulit.",
      "Kontak erat (tinggal serumah) memiliki risiko penularan tertinggi."
    ]
  },
  {
    id: "gejala-tb",
    title: "Gejala-Gejala Utama TB",
    icon: "Activity",
    content: [
      "Gejala utama dari penyakit TB Paru adalah batuk berdahak secara terus-menerus selama 2 minggu atau lebih. Batuk ini seringkali disertai dengan gejala-gejala penyerta lainnya yang menurunkan kualitas fisik pasien.",
      "Jika Anda atau anggota keluarga mengalami kombinasi dari gejala-gejala ini, segera datangi Puskesmas atau rumah sakit terdekat untuk melakukan pemeriksaan dahak (tes cepat molekuler/TCM)."
    ],
    points: [
      "Batuk berdahak secara terus-menerus selama >= 2 minggu (bisa bercampur darah).",
      "Demam sub-febris (meriang ringan) berulang terutama pada malam hari.",
      "Nafsu makan menurun drastis.",
      "Berat badan menurun tanpa penyebab yang jelas.",
      "Keluar keringat malam hari secara berlebihan walaupun tanpa aktivitas fisik.",
      "Rasa lelah dan lemas sepanjang hari."
    ]
  },
  {
    id: "lama-pengobatan",
    title: "Lama Pengobatan TB",
    icon: "Clock",
    content: [
      "Pengobatan TB membutuhkan waktu minimal 6 bulan berturut-turut tanpa putus. Proses pengobatan ini dibagi menjadi dua fase penting:",
      "1. FASE INTENSIF (2 Bulan Pertama): Pasien harus minum obat (biasanya kombinasi 4 jenis OAT) setiap hari. Tujuannya adalah membunuh kuman secara cepat, menghentikan penularan, dan memperbaiki kondisi fisik umum pasien.",
      "2. FASE LANJUTAN (4 Bulan Berikutnya): Pasien meminum obat (biasanya 2 jenis OAT) sebanyak 3 kali seminggu atau setiap hari sesuai petunjuk regimen dokter. Tujuannya adalah memusnahkan kuman-kuman TB sisa yang 'tertidur' (persister) agar penyakit tidak kambuh kembali di masa depan."
    ],
    points: [
      "Regimen Standard: Minimal 6 bulan pengobatan.",
      "Fase Intensif: 2 bulan pertama (minum obat setiap hari).",
      "Fase Lanjutan: 4 bulan berikutnya (membersihkan kuman sisa agar tidak kambuh)."
    ]
  },
  {
    id: "mengapa-harus-selesai",
    title: "Mengapa Obat Harus Diminum Sampai Selesai?",
    icon: "AlertTriangle",
    content: [
      "Seringkali setelah 1 atau 2 bulan meminum OAT, pasien merasa tubuhnya sudah sehat, batuk mereda, nafsu makan naik, dan berat badan bertambah. Hal ini memicu pasien untuk menghentikan pengobatan secara mandiri sebelum waktunya. Ini adalah KESALAHAN FATAL.",
      "Meskipun gejala fisik sudah hilang, bakteri TB dalam tubuh belum mati total. Jika obat dihentikan di tengah jalan, bakteri yang tersisa akan bermutasi dan menjadi kebal terhadap OAT standar. Kondisi ini disebut TB-MDR (Multi-Drug Resistant TB) atau TB Resisten Obat.",
      "TB Resisten Obat membutuhkan waktu pengobatan jauh lebih lama (9 hingga 24 bulan), menggunakan suntikan, obat yang jauh lebih keras dengan efek samping lebih berat, serta biaya yang sangat tinggi."
    ],
    points: [
      "Menghentikan obat sebelum waktunya membuat bakteri TB bermutasi menjadi kebal (resisten).",
      "Bakteri resisten memicu TB-MDR yang sangat sulit disembuhkan.",
      "Kepatuhan 100% adalah satu-satunya jaminan kesembuhan total."
    ]
  },
  {
    id: "efek-samping-oat",
    title: "Efek Samping Obat & Solusinya",
    icon: "ShieldAlert",
    content: [
      "Sebagian besar pasien dapat menjalani terapi OAT tanpa keluhan berarti. Namun, beberapa pasien mungkin merasakan efek samping. Penting untuk mengetahui mana efek samping ringan (yang bisa diatasi di rumah) dan mana efek samping berat (yang memerlukan tindakan medis segera)."
    ],
    points: [
      "Air seni (urin) berwarna kemerahan: Ini adalah efek samping NORMAL dan aman akibat obat Rifampisin. Lanjutkan minum obat.",
      "Mual, kembung, atau nyeri ulu hati ringan: Atasi dengan meminum OAT sebelum tidur atau 2 jam setelah makan, atau konsultasikan obat anti-mual ringan.",
      "Nyeri sendi: Sering disebabkan oleh Pirazinamid. Redakan dengan kompres hangat atau konsultasikan pereda nyeri ringan.",
      "Kesemutan atau mati rasa pada kaki/tangan: Biasanya diatasi dengan pemberian vitamin B6 (Piridoksin) oleh petugas medis.",
      "Gejala BERAT (Harus Segera ke Dokter): Kulit atau mata berwarna kuning (kerusakan hati/hepatitis imbas obat), gangguan penglihatan (kabur), gangguan pendengaran/keseimbangan (telinga berdenging), gatal-gatal hebat dan ruam merah di seluruh kulit."
    ]
  },
  {
    id: "pencegahan-rumah",
    title: "Pencegahan Penularan di Rumah",
    icon: "Home",
    content: [
      "Pasien TB tidak perlu diisolasi secara ekstrem di ruangan terpisah yang gelap. Yang diperlukan adalah langkah pencegahan penularan yang rasional dan efektif guna melindungi anggota keluarga serumah."
    ],
    points: [
      "Pasien selalu menerapkan Etika Batuk dan Bersin dengan benar.",
      "Gunakan masker medis, terutama pada 2 bulan pertama pengobatan (fase intensif).",
      "Jangan membuang dahak sembarangan; tampung dahak di wadah tertutup yang diberi cairan disinfektan (seperti karbol/pemutih) sebelum dibuang ke toilet.",
      "Pastikan rumah memiliki sirkulasi udara yang baik: jendela kamar dibuka lebar setiap pagi agar udara segar mengalir.",
      "Biarkan sinar matahari masuk secara langsung ke dalam rumah, karena kuman TB cepat mati jika terkena sinar ultraviolet (UV) matahari langsung."
    ]
  },
  {
    id: "nutrisi-pasien-tb",
    title: "Nutrisi Penting Pasien TB",
    icon: "Apple",
    content: [
      "Kuman TB menyebabkan metabolisme tubuh meningkat sehingga pasien sering kehilangan berat badan drastis. Untuk mempercepat proses penyembuhan jaringan paru yang rusak, pasien TB memerlukan asupan nutrisi yang kaya, bergizi seimbang, tinggi kalori, dan tinggi protein (TKTP)."
    ],
    points: [
      "Sumber Protein Tinggi: Telur rebus (sangat disarankan, minimal 2 butir sehari), ikan, daging ayam, tempe, tahu, dan susu hangat.",
      "Karbohidrat Cukup: Nasi, kentang, atau ubi untuk cadangan energi tubuh.",
      "Sari Vitamin & Mineral: Konsumsi buah-buahan segar (pisang, jeruk, pepaya) dan sayuran hijau untuk memperkuat sistem imun alami tubuh.",
      "Hidrasi Cukup: Minum air putih minimal 2-2.5 liter per hari.",
      "Hindari: Makanan terlalu berminyak/gorengan, rokok (mutlak harus dihentikan!), dan minuman beralkohol karena memperberat kinerja hati yang sedang memproses OAT."
    ]
  }
];

export const MITOS_FAKTA_TB: MitosFaktaItem[] = [
  {
    pernyataan: "Tuberkulosis (TB) adalah penyakit kutukan, guna-guna, atau keturunan.",
    tipe: "MITOS",
    penjelasan: "TB 100% adalah penyakit infeksi bakteri Mycobacterium tuberculosis. Siapa pun bisa terkena tanpa memandang silsilah keluarga atau mitos mistis, dan penyakit ini dapat disembuhkan medis."
  },
  {
    pernyataan: "Jika air seni berwarna oranye atau kemerahan setelah minum OAT, tandanya ginjal rusak.",
    tipe: "MITOS",
    penjelasan: "Warna urin kemerahan adalah efek normal dan aman dari konsumsi obat Rifampisin. Zat warna obat keluar lewat urin dan sama sekali tidak merusak ginjal. Terapi harus terus dilanjutkan!"
  },
  {
    pernyataan: "Penyakit TB hanya menyerang paru-paru saja.",
    tipe: "MITOS",
    penjelasan: "Meskipun TB Paru paling sering terjadi, kuman TB juga dapat menyebar ke organ lain seperti kelenjar getah bening, selaput otak, ginjal, tulang belakang, dan kulit (TB Ekstra Paru)."
  },
  {
    pernyataan: "Pasien TB yang sudah merasa sehat setelah 2 bulan minum obat boleh menghentikan minum obat.",
    tipe: "MITOS",
    penjelasan: "Sangat berbahaya! Kuman TB di dalam tubuh belum sepenuhnya mati. Menghentikan obat memicu kuman kebal (TB resisten obat) yang pengobatannya jauh lebih sulit dan mahal."
  },
  {
    pernyataan: "Sinar matahari dan ventilasi udara yang baik di rumah dapat membantu membunuh kuman TB.",
    tipe: "FAKTA",
    penjelasan: "Kuman TB sangat rentan terhadap sinar ultraviolet (UV) matahari langsung dan aliran udara segar. Membuka jendela kamar di pagi hari membantu mengurangi konsentrasi kuman di ruangan secara signifikan."
  },
  {
    pernyataan: "Penyakit TB menular melalui penggunaan sendok atau piring makan secara bergantian.",
    tipe: "MITOS",
    penjelasan: "TB ditularkan melalui percikan udara (airborne droplet) saat pasien batuk/bersin yang terhirup ke pernapasan. Kuman tidak menyebar melalui air liur pada peralatan makan yang dicuci bersih."
  }
];

export const KELUARGA_GUIDELINES = {
  caraMerawat: [
    "Pastikan pasien meminum OAT setiap hari di waktu yang sama (sebagai Pendamping Minum Obat / PMO).",
    "Ingatkan dan temani pasien untuk kontrol ke faskes sesuai jadwal yang disepakati.",
    "Bantu sediakan makanan tinggi kalori dan tinggi protein guna menopang kesembuhan fisik pasien.",
    "Pantau adanya efek samping obat yang dirasakan pasien dan laporkan ke kader atau petugas kesehatan."
  ],
  mencegahPenularan: [
    "Dorong pasien untuk selalu menggunakan masker medis atau kain saat berinteraksi, terutama pada 2 bulan pertama pengobatan.",
    "Bantu pasien menampung dahak di tempat tertutup dengan cairan disinfektan (sabun/karbol).",
    "Pisahkan tempat tidur pasien untuk sementara waktu selama fase intensif (2 bulan pertama), setelah itu dapat bergabung kembali jika hasil pemeriksaan dahak sudah negatif."
  ],
  etikaBatuk: [
    "Jangan menutup batuk atau bersin dengan telapak tangan terbuka, karena kuman akan menempel pada tangan Anda dan menyebar ke benda-benda lain.",
    "Gunakan tisu untuk menutup hidung dan mulut saat batuk/bersin, lalu segera buang tisu bekas ke tempat sampah tertutup.",
    "Jika tidak ada tisu, gunakan lengan baju bagian dalam sebagai penghalang percikan batuk/bersin.",
    "Segera cuci tangan dengan sabun dan air mengalir setelah batuk atau bersin."
  ],
  ventilasiRumah: [
    "Buka jendela kamar tidur pasien dan ruang tamu lebar-lebar setiap pagi hari.",
    "Biarkan tirai dibuka agar sinar matahari pagi dapat menerangi lantai dan seisi ruangan secara penuh.",
    "Hindari kondisi rumah yang pengap, lembab, dan gelap karena merupakan lingkungan ideal bagi kuman TB bertahan hidup berhari-hari."
  ],
  dukunganPsikologis: [
    "Berikan kata-kata penyemangat secara rutin; katakan bahwa penyakit ini pasti sembuh asal patuh minum obat.",
    "Dengarkan keluhan pasien dengan empati, jangan menjauhi mereka secara sosial karena hal itu dapat memicu depresi berat.",
    "Ingatkan bahwa pengobatan 6 bulan terasa singkat jika dilewati bersama-sama demi kesehatan masa depan keluarga."
  ]
};
