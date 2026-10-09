/** MenujuKita: editorial guidance and reusable starter tasks. No account data in this module. */
export type WeddingPhase = "Mulai"|"Konsep"|"Keuangan"|"Persiapan"|"Detail"|"Finalisasi"|"Hari-H";
export const WEDDING_PHASES: WeddingPhase[] = ["Mulai","Konsep","Keuangan","Persiapan","Detail","Finalisasi","Hari-H"];
export type WeddingGuide = {
 id:string;phase:WeddingPhase;title:string;why:string;when:string;steps:string[];questions:string[];next:string;
 view:"settings"|"guests"|"money"|"vendors"|"plan"|"vault";keywords:string[];
};
export const WEDDING_GUIDES: WeddingGuide[] = [
  {
    "id": "mulai",
    "phase": "Mulai",
    "title": "Menentukan fondasi rencana pernikahan",
    "why": "Tanggal, perkiraan tamu dan bentuk acara menjadi dasar hampir semua keputusan berikutnya.",
    "when": "Saat awal persiapan; perkiraan pun boleh berubah.",
    "steps": [
      "Diskusikan acara apa saja yang ingin diselenggarakan.",
      "Tentukan tanggal sementara atau tandai jika belum ada.",
      "Tuliskan kisaran jumlah tamu, kota, dan hal yang paling penting bagi kalian.",
      "Tinjau kembali rencana setiap kali ada keputusan besar."
    ],
    "questions": [
      "Apakah acaranya satu hari atau beberapa hari?",
      "Siapa saja pihak keluarga yang perlu diajak bicara?"
    ],
    "next": "Lanjutkan membuat anggaran dan daftar tamu awal.",
    "view": "settings",
    "keywords": [
      "fondasi",
      "rencana",
      "keluarga"
    ]
  },
  {
    "id": "tamu",
    "phase": "Persiapan",
    "title": "Menyusun daftar tamu dan jumlah undangan",
    "why": "Jumlah undangan tidak selalu sama dengan jumlah orang; perkiraan hadir memengaruhi kapasitas dan biaya.",
    "when": "Mulai sejak awal, perbarui sampai konfirmasi akhir.",
    "steps": [
      "Mulai dari keluarga inti dan tamu prioritas.",
      "Pisahkan tamu menurut pihak pasangan dan kelompok.",
      "Catat perkiraan jumlah orang per undangan.",
      "Tinjau total dengan kapasitas lokasi dan anggaran."
    ],
    "questions": [
      "Apakah satu undangan mencakup pasangan/keluarga?",
      "Siapa yang perlu mendapat prioritas saat kapasitas terbatas?"
    ],
    "next": "Masukkan daftar awal pada modul Tamu.",
    "view": "guests",
    "keywords": [
      "undangan",
      "guest",
      "rsvp"
    ]
  },
  {
    "id": "anggaran",
    "phase": "Keuangan",
    "title": "Menetapkan anggaran tanpa kebingungan",
    "why": "Anggaran adalah rencana pengeluaran, bukan jumlah uang tunai yang sudah tersedia.",
    "when": "Sebelum mengambil komitmen biaya besar.",
    "steps": [
      "Tentukan batas nyaman dan sumber dananya.",
      "Bagi perkiraan biaya ke kategori seperti lokasi, konsumsi, dekorasi dan dokumentasi.",
      "Sisihkan cadangan untuk perubahan biaya.",
      "Bandingkan total rencana dengan dana tersedia dan kewajiban."
    ],
    "questions": [
      "Berapa batas nyaman tanpa mengandalkan utang tak terencana?",
      "Biaya mana yang wajib dan mana yang bisa dikurangi?"
    ],
    "next": "Mulai menyusun anggaran kategori dan menyiapkan dana.",
    "view": "money",
    "keywords": [
      "budget",
      "biaya",
      "alokasi"
    ]
  },
  {
    "id": "tabungan",
    "phase": "Keuangan",
    "title": "Merencanakan tabungan bersama",
    "why": "Setoran yang pernah masuk, saldo yang ada, dan target biaya adalah tiga angka berbeda.",
    "when": "Saat menyusun target dan selama masa persiapan.",
    "steps": [
      "Tetapkan target dana dan tenggat realistis.",
      "Catat dana awal yang benar-benar tersedia.",
      "Diskusikan kontribusi rutin atau sekali waktu; tidak harus sama besar.",
      "Catat setoran dan pengeluaran agar saldo tidak menipu."
    ],
    "questions": [
      "Berapa dana yang sudah benar-benar disimpan?",
      "Apakah setoran sudah termasuk uang yang sebelumnya dipakai?"
    ],
    "next": "Periksa ringkasan keuangan dan riwayat transaksi.",
    "view": "money",
    "keywords": [
      "menabung",
      "setor",
      "saldo",
      "tabungan"
    ]
  },
  {
    "id": "venue",
    "phase": "Persiapan",
    "title": "Memilih lokasi acara dengan tenang",
    "why": "Kapasitas, fasilitas, jam penggunaan, dan biaya tambahan sama pentingnya dengan harga paket.",
    "when": "Sesegera mungkin setelah tanggal dan jumlah tamu mulai jelas.",
    "steps": [
      "Cari beberapa lokasi yang sesuai jumlah tamu.",
      "Periksa ketersediaan tanggal, akses parkir dan fasilitas.",
      "Bandingkan rincian harga beserta biaya tambahan.",
      "Simpan syarat pembayaran dan pembatalan sebelum memberi DP."
    ],
    "questions": [
      "Apakah katering/vendor luar diizinkan?",
      "Apa ketentuan jika tanggal berubah?",
      "Biaya tambahan apa yang sering muncul?"
    ],
    "next": "Simpan kandidat dan bandingkan penawarannya pada Vendor.",
    "view": "vendors",
    "keywords": [
      "gedung",
      "lokasi",
      "venue"
    ]
  },
  {
    "id": "katering",
    "phase": "Persiapan",
    "title": "Membandingkan katering dan jumlah porsi",
    "why": "Harga per porsi hanya satu bagian; pelayanan, jumlah cadangan dan aturan tambahan juga penting.",
    "when": "Setelah perkiraan tamu mulai terbentuk.",
    "steps": [
      "Tentukan jenis layanan dan kebutuhan menu.",
      "Minta rincian beberapa penawaran dengan jumlah porsi yang sama.",
      "Periksa test food, kru, perlengkapan dan biaya transport.",
      "Diskusikan pilihan; kemudian simpan jadwal DP dan pelunasan."
    ],
    "questions": [
      "Apakah ada biaya untuk porsi tambahan?",
      "Bagaimana aturan pembatalan dan perubahan jumlah tamu?"
    ],
    "next": "Catat kandidat katering dan jadwal pembayaran.",
    "view": "vendors",
    "keywords": [
      "konsumsi",
      "catering",
      "menu"
    ]
  },
  {
    "id": "foto",
    "phase": "Persiapan",
    "title": "Memilih dokumentasi foto dan video",
    "why": "Jangan hanya menilai portofolio. Perjelas cakupan pekerjaan dan hasil akhirnya.",
    "when": "Setelah tanggal acara disepakati.",
    "steps": [
      "Tentukan acara yang ingin didokumentasikan.",
      "Bandingkan portofolio, jumlah kru dan jam kerja.",
      "Pastikan hasil yang didapat, tenggat penyerahan, dan revisi.",
      "Simpan rincian paket, kontak serta kontrak."
    ],
    "questions": [
      "Apakah file mentah tersedia?",
      "Apakah ada biaya tambahan lembur atau perjalanan?"
    ],
    "next": "Masukkan penawaran fotografer ke Vendor.",
    "view": "vendors",
    "keywords": [
      "fotografer",
      "videografer",
      "dokumentasi"
    ]
  },
  {
    "id": "konsep",
    "phase": "Konsep",
    "title": "Menyepakati konsep dan prioritas bersama",
    "why": "Konsep membantu semua pilihan terasa selaras, tetapi tidak perlu mengikuti tren atau membuat pengeluaran berlebihan.",
    "when": "Di awal hingga sebelum vendor dekorasi ditetapkan.",
    "steps": [
      "Masing-masing pasangan memilih beberapa inspirasi.",
      "Diskusikan suasana, warna, kenyamanan dan kebutuhan keluarga.",
      "Bandingkan pilihan dengan kapasitas tempat dan anggaran.",
      "Catat pilihan final serta bagian yang fleksibel."
    ],
    "questions": [
      "Apa tiga hal yang paling penting bagi masing-masing?",
      "Mana yang wajib dan mana sekadar keinginan?"
    ],
    "next": "Gunakan catatan dan pilih referensi yang disepakati.",
    "view": "plan",
    "keywords": [
      "dekorasi",
      "warna",
      "mood",
      "tema"
    ]
  },
  {
    "id": "busana",
    "phase": "Detail",
    "title": "Menyiapkan busana dan fitting",
    "why": "Jadwal fitting perlu ruang untuk perubahan ukuran, aksesori dan kenyamanan.",
    "when": "Sebelum acara dengan waktu cadangan untuk penyesuaian.",
    "steps": [
      "Tentukan kebutuhan busana setiap acara.",
      "Bandingkan sewa, jahit, atau beli.",
      "Catat jadwal ukur, fitting, serah terima dan pengembalian.",
      "Periksa aksesori dan kontak penanggung jawab."
    ],
    "questions": [
      "Apa yang termasuk biaya penyewaan?",
      "Ada denda keterlambatan pengembalian?"
    ],
    "next": "Masukkan fitting ke agenda dan checklist.",
    "view": "plan",
    "keywords": [
      "baju",
      "rias",
      "makeup",
      "attire",
      "fitting"
    ]
  },
  {
    "id": "dokumen",
    "phase": "Detail",
    "title": "Memeriksa dokumen persiapan pernikahan",
    "why": "Persyaratan administrasi berbeda menurut kondisi pasangan, lembaga dan wilayah.",
    "when": "Periksa sejak awal; konfirmasi persyaratan resmi setempat.",
    "steps": [
      "Tanyakan persyaratan pada lembaga resmi yang berwenang.",
      "Buat daftar dokumen yang memang diperlukan.",
      "Catat penanggung jawab dan batas waktu tiap dokumen.",
      "Simpan salinan yang aman dan periksa kembali sebelum hari acara."
    ],
    "questions": [
      "Dokumen mana yang memiliki masa berlaku?",
      "Apakah diperlukan janji temu atau verifikasi langsung?"
    ],
    "next": "Simpan dokumen penting pada Wedding Vault.",
    "view": "vault",
    "keywords": [
      "berkas",
      "administrasi",
      "surat",
      "akad"
    ]
  },
  {
    "id": "undangan",
    "phase": "Detail",
    "title": "Mempersiapkan undangan dan RSVP",
    "why": "Informasi yang jelas dan daftar tamu yang rapi mengurangi salah informasi.",
    "when": "Setelah jadwal dan lokasi utama cukup pasti.",
    "steps": [
      "Pastikan nama, tanggal, jam dan lokasi benar.",
      "Cocokkan nama penerima dengan daftar tamu.",
      "Kirim undangan pada waktu yang sesuai dengan keadaan tamu.",
      "Tindak lanjuti RSVP secara sopan, lalu perbarui jumlah hadir."
    ],
    "questions": [
      "Apakah akses lokasi sudah jelas?",
      "Apakah penerima dapat menyampaikan jumlah yang hadir?"
    ],
    "next": "Perbarui daftar Tamu dan respons RSVP.",
    "view": "guests",
    "keywords": [
      "rsvp",
      "sebar",
      "desain"
    ]
  },
  {
    "id": "seserahan",
    "phase": "Detail",
    "title": "Mengatur kebutuhan seserahan",
    "why": "Daftar yang disepakati menghindari pembelian ganda dan menjaga pengeluaran tetap terukur.",
    "when": "Sesuaikan dengan kesepakatan keluarga dan tradisi masing-masing.",
    "steps": [
      "Diskusikan kebutuhan yang relevan, tanpa menganggap semua pasangan sama.",
      "Catat jumlah, perkiraan harga dan toko.",
      "Tentukan PIC pembelian dan tenggat.",
      "Simpan nota serta tandai barang yang sudah siap."
    ],
    "questions": [
      "Apakah barangnya benar-benar diperlukan?",
      "Siapa yang bertanggung jawab menyiapkan kemasan?"
    ],
    "next": "Hubungkan pengeluaran seserahan ke anggaran.",
    "view": "money",
    "keywords": [
      "hantaran",
      "hadiah"
    ]
  },
  {
    "id": "pelunasan",
    "phase": "Finalisasi",
    "title": "Memastikan pembayaran vendor tidak terlewat",
    "why": "Pembayaran harus didasarkan pada kewajiban dan tanggal yang sudah disepakati.",
    "when": "Pantau sepanjang perencanaan, utamanya menjelang acara.",
    "steps": [
      "Periksa tagihan dan nominal berdasarkan kontrak.",
      "Pastikan saldo dana tersedia sebelum membayar.",
      "Catat transaksi setelah uang benar-benar keluar.",
      "Simpan bukti dan tandai sisa kewajiban dengan benar."
    ],
    "questions": [
      "Apakah pembayaran ini DP, cicilan, atau pelunasan?",
      "Siapa yang menerima dan memverifikasi dana?"
    ],
    "next": "Periksa transaksi dan jadwal pembayaran di Keuangan.",
    "view": "money",
    "keywords": [
      "dp",
      "bayar",
      "cicilan",
      "invoice"
    ]
  },
  {
    "id": "finalisasi",
    "phase": "Finalisasi",
    "title": "Melakukan konfirmasi akhir sebelum acara",
    "why": "Konfirmasi beberapa hari sebelumnya dapat mengurangi kejutan pelaksanaan.",
    "when": "Pada tahap finalisasi mendekati Hari-H.",
    "steps": [
      "Hubungi kembali seluruh vendor terpilih.",
      "Konfirmasi lokasi, jam kedatangan, PIC dan kebutuhan peralatan.",
      "Periksa tamu yang sudah RSVP dan jumlah porsi.",
      "Bagikan rundown versi final kepada pihak terkait."
    ],
    "questions": [
      "Siapa kontak cadangan bila PIC utama sulit dihubungi?",
      "Apa rencana bila jadwal bergeser?"
    ],
    "next": "Periksa Rundown dan siapkan Mode Hari-H.",
    "view": "plan",
    "keywords": [
      "konfirmasi",
      "briefing",
      "final",
      "emergency"
    ]
  },
  {
    "id": "harih",
    "phase": "Hari-H",
    "title": "Menjalankan rundown Hari-H",
    "why": "Rundown membantu semua pihak memahami urutan acara, tetapi tetap perlu fleksibel saat kondisi berubah.",
    "when": "Menjelang dan saat acara.",
    "steps": [
      "Susun urutan acara berdasarkan waktu dan lokasi.",
      "Tentukan PIC dan kontak vendor untuk tiap agenda.",
      "Siapkan salinan offline/cetak versi yang disepakati.",
      "Perbarui status kegiatan sesuai pelaksanaan dan catat perubahan penting."
    ],
    "questions": [
      "Siapa yang berwenang mengubah jadwal?",
      "Apa langkah jika salah satu vendor terlambat?"
    ],
    "next": "Buka Mode Hari-H untuk memantau agenda.",
    "view": "plan",
    "keywords": [
      "rundown",
      "hari-h",
      "koordinasi"
    ]
  },
  {
    "id": "checklist",
    "phase": "Mulai",
    "title": "Mengelola checklist bersama pasangan",
    "why": "Checklist menjadi ringan jika masing-masing tahu tugas, alasan dan waktu pengerjaan.",
    "when": "Sepanjang persiapan.",
    "steps": [
      "Buka tiga prioritas yang disarankan.",
      "Bagi tugas yang memang bisa dikerjakan secara terpisah.",
      "Tambahkan detail, tenggat dan catatan agar jelas.",
      "Perbarui status setelah benar-benar ada perkembangan."
    ],
    "questions": [
      "Apakah pekerjaan ini memang diperlukan untuk acara kalian?",
      "Siapa yang paling tepat menjadi PIC?"
    ],
    "next": "Buka Rencana untuk memulai tugas berikutnya.",
    "view": "plan",
    "keywords": [
      "tugas",
      "persiapan",
      "task"
    ]
  }
];
export type WeddingTaskTemplate = {title:string;guideId:string;phase:WeddingPhase;days:number;priority:"low"|"medium"|"high"|"critical";category:string;styles:string[]|null};
export const WEDDING_TASK_TEMPLATES: WeddingTaskTemplate[] = [
  {
    "title": "Diskusikan bentuk acara bersama pasangan",
    "guideId": "mulai",
    "phase": "Mulai",
    "days": 300,
    "priority": "high",
    "category": "general",
    "styles": null
  },
  {
    "title": "Diskusikan kebutuhan keluarga dan prioritas",
    "guideId": "mulai",
    "phase": "Mulai",
    "days": 285,
    "priority": "medium",
    "category": "general",
    "styles": null
  },
  {
    "title": "Buat perkiraan daftar tamu awal",
    "guideId": "tamu",
    "phase": "Mulai",
    "days": 270,
    "priority": "high",
    "category": "guest",
    "styles": null
  },
  {
    "title": "Tetapkan tanggal atau rentang waktu acara",
    "guideId": "mulai",
    "phase": "Mulai",
    "days": 260,
    "priority": "high",
    "category": "general",
    "styles": null
  },
  {
    "title": "Tentukan kota dan perkiraan lokasi acara",
    "guideId": "mulai",
    "phase": "Mulai",
    "days": 245,
    "priority": "medium",
    "category": "general",
    "styles": null
  },
  {
    "title": "Susun daftar kebutuhan utama acara",
    "guideId": "mulai",
    "phase": "Mulai",
    "days": 235,
    "priority": "medium",
    "category": "general",
    "styles": null
  },
  {
    "title": "Tentukan anggaran awal yang nyaman",
    "guideId": "anggaran",
    "phase": "Keuangan",
    "days": 230,
    "priority": "high",
    "category": "money",
    "styles": null
  },
  {
    "title": "Tinjau dana awal dan rencana tabungan",
    "guideId": "tabungan",
    "phase": "Keuangan",
    "days": 225,
    "priority": "high",
    "category": "money",
    "styles": null
  },
  {
    "title": "Siapkan alokasi biaya per kategori",
    "guideId": "anggaran",
    "phase": "Keuangan",
    "days": 210,
    "priority": "high",
    "category": "money",
    "styles": null
  },
  {
    "title": "Cari referensi gaya dan suasana acara",
    "guideId": "konsep",
    "phase": "Konsep",
    "days": 210,
    "priority": "medium",
    "category": "general",
    "styles": null
  },
  {
    "title": "Diskusikan warna dan nuansa pernikahan",
    "guideId": "konsep",
    "phase": "Konsep",
    "days": 200,
    "priority": "medium",
    "category": "general",
    "styles": null
  },
  {
    "title": "Putuskan konsep bersama pasangan",
    "guideId": "konsep",
    "phase": "Konsep",
    "days": 175,
    "priority": "high",
    "category": "general",
    "styles": null
  },
  {
    "title": "Diskusikan kebutuhan adat atau keluarga",
    "guideId": "konsep",
    "phase": "Konsep",
    "days": 180,
    "priority": "medium",
    "category": "general",
    "styles": null
  },
  {
    "title": "Tentukan konsep dekorasi sementara",
    "guideId": "konsep",
    "phase": "Konsep",
    "days": 170,
    "priority": "medium",
    "category": "general",
    "styles": null
  },
  {
    "title": "Cari beberapa kandidat venue",
    "guideId": "venue",
    "phase": "Persiapan",
    "days": 220,
    "priority": "critical",
    "category": "vendor",
    "styles": null
  },
  {
    "title": "Survei dan bandingkan venue",
    "guideId": "venue",
    "phase": "Persiapan",
    "days": 200,
    "priority": "high",
    "category": "vendor",
    "styles": null
  },
  {
    "title": "Konfirmasi venue dan baca kontrak",
    "guideId": "venue",
    "phase": "Persiapan",
    "days": 180,
    "priority": "critical",
    "category": "vendor",
    "styles": null
  },
  {
    "title": "Cari dan bandingkan katering",
    "guideId": "katering",
    "phase": "Persiapan",
    "days": 175,
    "priority": "high",
    "category": "vendor",
    "styles": null
  },
  {
    "title": "Diskusikan menu serta jumlah porsi",
    "guideId": "katering",
    "phase": "Persiapan",
    "days": 145,
    "priority": "high",
    "category": "vendor",
    "styles": null
  },
  {
    "title": "Cari fotografer dan videografer",
    "guideId": "foto",
    "phase": "Persiapan",
    "days": 160,
    "priority": "high",
    "category": "vendor",
    "styles": null
  },
  {
    "title": "Bandingkan penawaran dokumentasi",
    "guideId": "foto",
    "phase": "Persiapan",
    "days": 145,
    "priority": "high",
    "category": "vendor",
    "styles": null
  },
  {
    "title": "Cari kandidat dekorasi dan MUA",
    "guideId": "konsep",
    "phase": "Persiapan",
    "days": 135,
    "priority": "medium",
    "category": "vendor",
    "styles": null
  },
  {
    "title": "Tinjau paket dan jadwal Wedding Organizer",
    "guideId": "venue",
    "phase": "Persiapan",
    "days": 130,
    "priority": "low",
    "category": "vendor",
    "styles": [
      "couple_wo",
      "wo"
    ]
  },
  {
    "title": "Catat seluruh jadwal DP vendor",
    "guideId": "pelunasan",
    "phase": "Persiapan",
    "days": 125,
    "priority": "high",
    "category": "money",
    "styles": null
  },
  {
    "title": "Lengkapi daftar tamu keluarga dan teman",
    "guideId": "tamu",
    "phase": "Detail",
    "days": 120,
    "priority": "high",
    "category": "guest",
    "styles": null
  },
  {
    "title": "Periksa persyaratan dokumen pernikahan",
    "guideId": "dokumen",
    "phase": "Detail",
    "days": 120,
    "priority": "high",
    "category": "document",
    "styles": null
  },
  {
    "title": "Jadwalkan fitting busana",
    "guideId": "busana",
    "phase": "Detail",
    "days": 100,
    "priority": "medium",
    "category": "attire",
    "styles": null
  },
  {
    "title": "Susun daftar kebutuhan seserahan",
    "guideId": "seserahan",
    "phase": "Detail",
    "days": 100,
    "priority": "medium",
    "category": "money",
    "styles": null
  },
  {
    "title": "Finalisasi isi dan informasi undangan",
    "guideId": "undangan",
    "phase": "Detail",
    "days": 90,
    "priority": "high",
    "category": "guest",
    "styles": null
  },
  {
    "title": "Periksa titik lokasi dan petunjuk perjalanan",
    "guideId": "undangan",
    "phase": "Detail",
    "days": 80,
    "priority": "medium",
    "category": "guest",
    "styles": null
  },
  {
    "title": "Sebarkan undangan sesuai rencana",
    "guideId": "undangan",
    "phase": "Detail",
    "days": 60,
    "priority": "medium",
    "category": "guest",
    "styles": null
  },
  {
    "title": "Catat dan tindak lanjuti RSVP",
    "guideId": "tamu",
    "phase": "Detail",
    "days": 45,
    "priority": "high",
    "category": "guest",
    "styles": null
  },
  {
    "title": "Mulai menyusun posisi meja dan kelompok tamu",
    "guideId": "tamu",
    "phase": "Detail",
    "days": 35,
    "priority": "medium",
    "category": "guest",
    "styles": null
  },
  {
    "title": "Lengkapi daftar seserahan dan kemasan",
    "guideId": "seserahan",
    "phase": "Detail",
    "days": 30,
    "priority": "medium",
    "category": "money",
    "styles": null
  },
  {
    "title": "Tinjau pembayaran dan pelunasan vendor",
    "guideId": "pelunasan",
    "phase": "Finalisasi",
    "days": 25,
    "priority": "critical",
    "category": "money",
    "styles": null
  },
  {
    "title": "Konfirmasi jumlah porsi akhir katering",
    "guideId": "katering",
    "phase": "Finalisasi",
    "days": 21,
    "priority": "critical",
    "category": "vendor",
    "styles": null
  },
  {
    "title": "Konfirmasi seluruh vendor dan PIC",
    "guideId": "finalisasi",
    "phase": "Finalisasi",
    "days": 14,
    "priority": "critical",
    "category": "vendor",
    "styles": null
  },
  {
    "title": "Finalisasi jumlah tamu dan seating",
    "guideId": "tamu",
    "phase": "Finalisasi",
    "days": 10,
    "priority": "high",
    "category": "guest",
    "styles": null
  },
  {
    "title": "Periksa semua dokumen serta barang penting",
    "guideId": "dokumen",
    "phase": "Finalisasi",
    "days": 7,
    "priority": "high",
    "category": "document",
    "styles": null
  },
  {
    "title": "Buat dan periksa rundown final",
    "guideId": "harih",
    "phase": "Finalisasi",
    "days": 7,
    "priority": "critical",
    "category": "Day-H",
    "styles": null
  },
  {
    "title": "Briefing final dengan keluarga dan vendor",
    "guideId": "finalisasi",
    "phase": "Finalisasi",
    "days": 3,
    "priority": "critical",
    "category": "Day-H",
    "styles": null
  },
  {
    "title": "Siapkan kontak darurat dan kebutuhan cadangan",
    "guideId": "finalisasi",
    "phase": "Finalisasi",
    "days": 2,
    "priority": "high",
    "category": "Day-H",
    "styles": null
  },
  {
    "title": "Periksa kesiapan PIC dan vendor Hari-H",
    "guideId": "harih",
    "phase": "Hari-H",
    "days": 1,
    "priority": "critical",
    "category": "Day-H",
    "styles": null
  },
  {
    "title": "Pantau rundown dan perubahan agenda",
    "guideId": "harih",
    "phase": "Hari-H",
    "days": 0,
    "priority": "critical",
    "category": "Day-H",
    "styles": null
  },
  {
    "title": "Catat penyelesaian dan evaluasi setelah acara",
    "guideId": "harih",
    "phase": "Hari-H",
    "days": -1,
    "priority": "low",
    "category": "Day-H",
    "styles": null
  }
];
export function guideById(id:string){return WEDDING_GUIDES.find(g=>g.id===id)||WEDDING_GUIDES[WEDDING_GUIDES.length-1]}
export function guideForTask(title:string,category=""){
 const titleLower=title.toLowerCase();
 const template=WEDDING_TASK_TEMPLATES.find(t=>t.title.toLowerCase()===titleLower);
 if(template)return guideById(template.guideId);
 const words=titleLower+" "+category.toLowerCase();
 let best:WeddingGuide|undefined;let score=0;
 for(const g of WEDDING_GUIDES){
  const matches=g.keywords.filter(k=>words.includes(k)).length;
  if(matches>score){score=matches;best=g}
 }
 return best||guideById("checklist");
}
export function phaseForTask(task:{title?:string;category?:string;due_date?:unknown}, weddingDate?:unknown):WeddingPhase {
 const template=WEDDING_TASK_TEMPLATES.find(t=>t.title===task.title);
 if(template)return template.phase;
 const cat=String(task.category||"").toLowerCase();
 if(cat==="day-h")return "Hari-H";
 if(cat==="money")return "Keuangan";
 if(cat==="guest")return "Persiapan";
 if(!task.due_date||!weddingDate)return "Persiapan";
 const days=Math.ceil((new Date(String(weddingDate)).getTime()-new Date(String(task.due_date)).getTime())/86400000);
 if(days>180)return "Mulai";if(days>120)return "Konsep";if(days>70)return "Persiapan";if(days>30)return "Detail";if(days>1)return "Finalisasi";return "Hari-H";
}
export function templateTasks(planningStyle:string, weddingDate:string|null){
 const today=new Date().toISOString().slice(0,10);
 return WEDDING_TASK_TEMPLATES.filter(t=>!t.styles||t.styles.includes(planningStyle)).map((t,i)=>{
  let dueDate:string|null=null;
  if(weddingDate){
   const date=new Date(weddingDate+"T12:00:00Z");
   date.setUTCDate(date.getUTCDate()-t.days);
   const recommended=date.toISOString().slice(0,10);
   // Do not flood couples with already-overdue starter tasks.
   dueDate=recommended<today?today:recommended;
  }
  return {...t,sortOrder:i,dueDate};
 });
}
