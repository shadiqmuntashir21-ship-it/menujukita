export const money=(n:any)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n||0));
export const dateLabel=(v:any)=>v?new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(v)):"Belum dijadwalkan";
export const timeLabel=(v:any)=>v?new Intl.DateTimeFormat("id-ID",{hour:"2-digit",minute:"2-digit"}).format(new Date(v)):"--:--";
export const labels:Record<string,string>={
  todo:"Belum mulai",in_progress:"Berjalan",done:"Selesai",skipped:"Dilewati",
  searching:"Mencari",shortlisted:"Shortlist",contacted:"Dihubungi",negotiating:"Negosiasi",
  booked:"Terkunci",completed:"Selesai",cancelled:"Batal",
  upcoming:"Akan datang",paid:"Lunas",overdue:"Terlambat",
  waiting:"Menunggu",attending:"Hadir",not_attending:"Tidak hadir",maybe:"Mungkin",
  ready:"Siap",delayed:"Terlambat"
};
export const priorityLabels:Record<string,string>={low:"Rendah",medium:"Sedang",high:"Tinggi",critical:"Kritis"};
