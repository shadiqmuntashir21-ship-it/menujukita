export type DemoTask={id:number;title:string;phase:string;category:string;due:string;status:"todo"|"in_progress"|"done";priority:"critical"|"high"|"medium"|"low";assignee:string};
export type DemoBudgetItem={id:number;name:string;category:string;planned:number;actual:number;paid:number;notes:string};
export type DemoPayment={id:number;title:string;vendor:string;amount:number;due:string;status:"Paid"|"Upcoming"|"Overdue";method:string};
export type DemoVendor={id:number;name:string;category:string;status:"Searching"|"Shortlisted"|"Negotiating"|"Booked"|"Completed";quoted:number;agreed:number;contact:string;pic:string;notes:string};
export type DemoGuest={id:number;name:string;group:string;side:"Alya"|"Raka"|"Bersama";phone:string;pax:number;rsvp:"Attending"|"Waiting"|"Declined"|"Maybe";vip:boolean;dietary:string;tableId:number|null};
export type DemoRundown={id:number;time:string;activity:string;location:string;status:"done"|"next"|"upcoming";pic:string;vendor:string;notes:string};
export type DemoSeat={id:number;name:string;capacity:number;guestIds:number[];zone:string};
export type DemoDocument={id:number;name:string;category:string;size:string;notes:string};
export type DemoMember={id:number;name:string;role:string;access:string;phone:string};
export type DemoDetails={venue:string;ceremony:string;reception:string;theme:string;dressCode:string;hashtag:string;planner:string;emergencyContact:string};

export type DemoCashEntry={id:number;kind:"deposit"|"withdrawal"|"refund";contributor:string;amount:number;date:string;note:string};
export type DemoState={
 couple:string;date:string;city:string;days:number;budget:number;reserve:number;targetGuests:number;
 tasks:DemoTask[];budgetItems:DemoBudgetItem[];vendors:DemoVendor[];payments:DemoPayment[];guests:DemoGuest[];cashEntries:DemoCashEntry[];
 rundown:DemoRundown[];seating:DemoSeat[];documents:DemoDocument[];members:DemoMember[];details:DemoDetails;
};

const phases:{phase:string;category:string;items:string[]}[]=[
 {phase:"12+ Bulan",category:"Foundation",items:["Tentukan visi & prioritas wedding","Tentukan kisaran budget awal","Susun estimasi jumlah tamu","Pilih rentang tanggal wedding","Riset venue utama","Buat moodboard wedding","Diskusikan konsep adat/ceremony","Tentukan pembagian kontribusi keluarga","Buat akun email wedding khusus","Susun daftar vendor prioritas","Tentukan apakah memakai wedding planner","Buat folder dokumen wedding"]},
 {phase:"9–12 Bulan",category:"Vendor",items:["Booking venue","Booking wedding planner / WO","Booking catering","Booking fotografer","Booking videografer","Booking MUA","Mulai pencarian busana pengantin","Booking dekorasi","Booking entertainment / band","Booking MC","Booking officiant / penghulu / pemuka agama","Blok kamar hotel keluarga inti","Riset transportasi wedding","Susun draft Save the Date"]},
 {phase:"6–9 Bulan",category:"Design",items:["Finalisasi konsep dekorasi","Finalisasi palette warna","Pilih desain undangan","Jadwalkan foto prewedding","Finalisasi vendor busana","Pilih cincin wedding","Susun wedding website / RSVP","Mulai guest list master","Pilih bridesmaid & groomsmen","Riset souvenir","Menu tasting pertama","Review kontrak seluruh vendor","Riset honeymoon","Cek dokumen legal/pernikahan"]},
 {phase:"3–6 Bulan",category:"Planning",items:["Fitting busana pertama","Finalisasi desain bunga","Finalisasi wedding cake","Pilih lagu ceremony","Pilih lagu entrance","Pilih lagu first dance","Susun ceremony flow","Susun draft rundown resepsi","Booking transport keluarga","Finalisasi souvenir","Pilih signage & stationery","Buat draft seating plan","Susun daftar VIP","Siapkan registrasi tamu","Mulai koordinasi foto keluarga","Tentukan vendor meal & crew meal"]},
 {phase:"1–3 Bulan",category:"Guests",items:["Kirim undangan utama","Mulai tracking RSVP","Follow-up tamu VIP","Finalisasi menu catering","Finalisasi jumlah meja","Finalisasi layout venue","Fitting busana final","Finalisasi hair & makeup look","Susun shot list foto","Susun shot list video","Susun daftar lagu final","Susun daftar speech / toast","Konfirmasi transport vendor","Susun vendor arrival schedule","Jadwalkan rehearsal","Review payment schedule seluruh vendor"]},
 {phase:"Final Weeks",category:"Final",items:["Kunci jumlah tamu ke catering","Kunci seating plan","Cetak place card / table number","Konfirmasi seluruh vendor","Bayar termin vendor yang jatuh tempo","Bagikan rundown final ke tim","Briefing keluarga inti","Briefing wedding party","Siapkan emergency kit","Siapkan dokumen legal","Siapkan amplop pembayaran vendor","Cek cuaca & contingency plan","Packing busana & aksesori","Final venue walkthrough","Konfirmasi vendor meal","Konfirmasi parkir & transport","Kirim reminder RSVP terakhir","Cek seluruh file di Wedding Vault"]},
 {phase:"Day-H",category:"Day-H",items:["Pastikan emergency kit dibawa","Cek bridal room","Cek vendor arrival","Konfirmasi makeup mulai tepat waktu","Konfirmasi dekor selesai","Cek sound system","Cek seating & signage","Briefing MC","Briefing keluarga","Konfirmasi ring & dokumen","Aktifkan Day-H Mode","Pantau rundown utama","Konfirmasi pembayaran terakhir","Pastikan barang pribadi terkumpul"]},
 {phase:"After Wedding",category:"Post Wedding",items:["Konfirmasi seluruh pembayaran selesai","Kembalikan barang rental","Backup foto & video awal","Kirim ucapan terima kasih","Review vendor","Rekap sisa budget","Arsipkan dokumen wedding","Update status workspace selesai"]}
];

const taskTitles=phases.flatMap(p=>p.items.map(title=>({phase:p.phase,category:p.category,title})));
const tasks:DemoTask[]=taskTitles.map((t,i)=>({
 id:i+1,title:t.title,phase:t.phase,category:t.category,
 due:t.phase==="12+ Bulan"?"Selesai":t.phase==="9–12 Bulan"?"Selesai":t.phase==="6–9 Bulan"?(i%4===0?"Selesai":"2–4 bulan lalu"):t.phase==="3–6 Bulan"?(i%3===0?"Selesai":"Bulan ini"):t.phase==="1–3 Bulan"?(i%4===0?"Selesai":`${3+(i%18)} hari lagi`):t.phase==="Final Weeks"?`${1+(i%18)} hari lagi`:t.phase==="Day-H"?"Hari-H":"Setelah wedding",
 status:(t.phase==="12+ Bulan"||t.phase==="9–12 Bulan"||(t.phase==="6–9 Bulan"&&i%4===0)||(t.phase==="3–6 Bulan"&&i%3===0)||(t.phase==="1–3 Bulan"&&i%4===0))?"done":i%7===0?"in_progress":"todo",
 priority:i%11===0?"critical":i%4===0?"high":i%3===0?"low":"medium",
 assignee:i%5===0?"Raka":i%4===0?"Nadia (WO)":"Alya"
}));

const vendorSeed=[
 ["The Garden Hall","Venue","Booked",28500000,"Pak Reza","081288991200"],["Rasa Kita Catering","Catering","Booked",32000000,"Mbak Intan","081322004211"],["Lens Story","Photography","Booked",9500000,"Dito","081277112001"],["Motion House","Videography","Booked",8500000,"Reno","081355770022"],["Bloom Decor","Decoration","Booked",15000000,"Caca","081141129880"],["Laras Beauty","Makeup","Booked",7500000,"Laras","081290904141"],["Atelier Senja","Bridal Attire","Booked",12000000,"Maya","081355181202"],["Nada Wedding MC","MC","Booked",3500000,"Rafi","081370001881"],["Soul Notes","Entertainment","Booked",6500000,"Ari","081223334499"],["Paperie Studio","Invitation","Booked",3200000,"Nia","081288107610"],["Kita Souvenir","Souvenir","Booked",5200000,"Dewi","081277409944"],["Sugar Bloom","Wedding Cake","Booked",2800000,"Salsa","081399227711"],["Petal & Stem","Florist","Booked",4200000,"Gina","081231909919"],["Move With Us","Transport","Negotiating",4500000,"Faris","081277660099"],["Grand Vista Hotel","Accommodation","Booked",9800000,"Nana","081241720922"],["Cerita Cahaya","Lighting","Booked",5000000,"Rio","081211457777"],["Perfect Sound","Sound System","Booked",4200000,"Evan","081233665500"],["Sweet Corner","Dessert","Shortlisted",3000000,"Tasya","081288909013"],["Print & Place","Stationery","Booked",2400000,"Yuni","081299334455"],["Bunga Pagi","Family Corsage","Searching",1800000,"-","-"],["Memory Booth","Photo Booth","Negotiating",3800000,"Icha","081290081111"],["SafeHands Crew","Security","Booked",2500000,"Agus","081377118822"],["Ceremony Kit","Rental","Shortlisted",2500000,"Niko","081322771100"],["Travelmate","Honeymoon","Searching",18000000,"Sinta","081244889900"]
] as const;
const vendors:DemoVendor[]=vendorSeed.map((v,i)=>({id:i+1,name:v[0],category:v[1],status:v[2] as DemoVendor["status"],quoted:Number(v[3])*1.08,agreed:Number(v[3]),pic:v[4],contact:v[5],notes:i%3===0?"Kontrak sudah disimpan di Vault.":"Follow-up sesuai timeline."}));

const budgetSeed=[
 ["Venue","Venue",30000000,28500000],["Catering","Food",35000000,32000000],["Decoration","Decoration",17000000,15000000],["Photography","Documentation",10000000,9500000],["Videography","Documentation",9000000,8500000],["MUA","Beauty",8000000,7500000],["Bridal attire","Attire",13000000,12000000],["Groom attire","Attire",5500000,5000000],["MC","Entertainment",4000000,3500000],["Band","Entertainment",7000000,6500000],["Invitation","Stationery",3500000,3200000],["Souvenir","Guest",6000000,5200000],["Wedding cake","Food",3000000,2800000],["Florist","Decoration",4500000,4200000],["Transport","Logistics",5000000,4500000],["Hotel keluarga","Accommodation",10000000,9800000],["Lighting","Production",5500000,5000000],["Sound","Production",4500000,4200000],["Photo booth","Entertainment",4000000,3800000],["Dessert","Food",3500000,3000000],["Stationery","Stationery",2800000,2400000],["Security","Operations",3000000,2500000],["Rental ceremony","Ceremony",3000000,2500000],["Legal/admin","Ceremony",1500000,1200000],["Family attire","Attire",7500000,6800000],["Bridesmaid/groomsmen","Attire",5000000,4500000],["Vendor meals","Food",3500000,3200000],["Tips & envelopes","Operations",3000000,2500000],["Emergency fund","Buffer",8000000,0],["Honeymoon","Honeymoon",20000000,18000000],["Prewedding","Documentation",5000000,4800000],["Wedding rings","Jewelry",12000000,11500000],["Miscellaneous","Other",6000000,2500000],["Post wedding","Post Wedding",3000000,1200000]
] as const;
const budgetItems:DemoBudgetItem[]=budgetSeed.map((x,i)=>({id:i+1,name:x[0],category:x[1],planned:Number(x[2]),actual:Number(x[3]),paid:i<12?Math.round(Number(x[3])*.7):i<22?Math.round(Number(x[3])*.35):0,notes:i%5===0?"Sudah termasuk pajak/transport.":""}));

const paymentSeed=[
 ["Venue DP","The Garden Hall",10000000,"Paid"],["Venue Termin II","The Garden Hall",10000000,"Paid"],["Venue Pelunasan","The Garden Hall",8500000,"Upcoming"],["Catering Booking","Rasa Kita Catering",8000000,"Paid"],["Catering DP II","Rasa Kita Catering",12000000,"Paid"],["Catering Pelunasan","Rasa Kita Catering",12000000,"Upcoming"],["Photography DP","Lens Story",3500000,"Paid"],["Photography Payment II","Lens Story",3000000,"Upcoming"],["Photography Pelunasan","Lens Story",3000000,"Upcoming"],["Videography DP","Motion House",3500000,"Paid"],["Videography Pelunasan","Motion House",5000000,"Upcoming"],["Decoration DP","Bloom Decor",6000000,"Paid"],["Decoration Termin II","Bloom Decor",5000000,"Overdue"],["Decoration Pelunasan","Bloom Decor",4000000,"Upcoming"],["MUA DP","Laras Beauty",3000000,"Paid"],["MUA Pelunasan","Laras Beauty",4500000,"Upcoming"],["Attire DP","Atelier Senja",5000000,"Paid"],["Attire Pelunasan","Atelier Senja",7000000,"Upcoming"],["MC","Nada Wedding MC",3500000,"Upcoming"],["Entertainment DP","Soul Notes",2500000,"Paid"],["Entertainment Pelunasan","Soul Notes",4000000,"Upcoming"],["Souvenir DP","Kita Souvenir",2500000,"Paid"],["Souvenir Pelunasan","Kita Souvenir",2700000,"Upcoming"],["Hotel Family Block","Grand Vista Hotel",4900000,"Paid"],["Hotel Pelunasan","Grand Vista Hotel",4900000,"Upcoming"],["Sound & Lighting Final","Perfect Sound",4200000,"Upcoming"],["Wedding Cake Final","Sugar Bloom",2800000,"Upcoming"],["Transport DP","Move With Us",1500000,"Upcoming"]
] as const;
const payments:DemoPayment[]=paymentSeed.map((p,i)=>({id:i+1,title:p[0],vendor:p[1],amount:Number(p[2]),status:p[3] as DemoPayment["status"],due:p[3]==="Paid"?"Sudah dibayar":p[3]==="Overdue"?"Terlambat 2 hari":`${2+(i%25)} hari lagi`,method:i%3===0?"Transfer BRI":"QRIS"}));

const firstNames=["Aditya","Aisyah","Aldo","Alia","Andi","Anisa","Arga","Aulia","Bagas","Bella","Bima","Citra","Daffa","Dewi","Dimas","Dinda","Fahri","Farah","Fikri","Gina","Hana","Indra","Intan","Iqbal","Karin","Laila","Lina","Maya","Nabila","Nadia","Nanda","Naufal","Putri","Rafi","Raka","Rani","Rara","Reza","Rizky","Salsa","Sari","Tasya","Tio","Vina","Yuni","Zahra"];
const lastNames=["Pratama","Saputra","Putri","Ramadhan","Mahendra","Nugraha","Wijaya","Lestari","Hidayat","Permata","Kusuma","Ananda","Santoso","Maulana","Fauzi","Rahma","Syahputra","Amalia"];
const groups=["Keluarga Alya","Keluarga Raka","Teman Kampus","Teman Kantor","Tetangga","Komunitas","Keluarga Besar","VIP"];
const guests:DemoGuest[]=Array.from({length:128},(_,i)=>{
 const name=`${firstNames[i%firstNames.length]} ${lastNames[(i*7)%lastNames.length]}`;
 const r=i%10<6?"Attending":i%10<8?"Waiting":i%10===8?"Maybe":"Declined";
 return{id:i+1,name,group:groups[i%groups.length],side:i%3===0?"Alya":i%3===1?"Raka":"Bersama",phone:`08${String(1200000000+i*731).slice(0,10)}`,pax:i%7===0?3:i%3===0?2:1,rsvp:r as DemoGuest["rsvp"],vip:i%17===0,dietary:i%19===0?"No seafood":i%23===0?"Vegetarian":"",tableId:r==="Attending"?1+(i%18):null}
});

const seating:DemoSeat[]=Array.from({length:18},(_,i)=>({id:i+1,name:i<4?`Keluarga ${String.fromCharCode(65+i)}`:i<7?`VIP ${i-3}`:`Meja ${String(i+1).padStart(2,"0")}`,capacity:i<7?10:8,zone:i<4?"Family":i<7?"VIP":i<12?"Friends":"General",guestIds:guests.filter(g=>g.tableId===i+1).map(g=>g.id)}));

const rundownSeed=[
 ["04:30","Wake-up call wedding team","Hotel","Alya","Nadia (WO)"],["05:00","Makeup pengantin mulai","Bridal Room","Alya","Laras Beauty"],["05:15","Hair styling & hijab prep","Bridal Room","Alya","Laras Beauty"],["05:30","Decor vendor final setup","Main Hall","Nadia (WO)","Bloom Decor"],["06:00","Family makeup call time","Family Room","Ibu Maya","Laras Beauty"],["06:30","Photo detail items","Bridal Room","Raka","Lens Story"],["07:00","Breakfast pengantin","Bridal Room","Alya","Hotel"],["07:15","Groom preparation photo","Groom Room","Raka","Lens Story"],["07:45","Final dress / attire","Bridal Room","Alya","Atelier Senja"],["08:00","Vendor briefing","FOH","Nadia (WO)","All Vendors"],["08:15","Family arrival check","Lobby","Ibu Maya","WO Team"],["08:30","Ceremony sound check","Ceremony Area","Nadia (WO)","Perfect Sound"],["08:45","Pengantin menuju holding area","Holding Room","Alya","WO Team"],["09:00","Akad / pemberkatan","Ceremony Area","Raka","MC & Officiant"],["09:45","Signing & family prayer","Ceremony Area","Alya","WO Team"],["10:00","Couple portrait","Garden","Alya","Lens Story"],["10:30","Family photography","Photo Area","Ibu Maya","Lens Story"],["11:00","Room turnover reception","Main Hall","Nadia (WO)","Bloom Decor"],["11:20","Lunch wedding team","Crew Area","Nadia (WO)","Rasa Kita Catering"],["11:40","Guest reception desk opens","Lobby","Guest Team","WO Team"],["12:00","Reception doors open","Main Hall","Nadia (WO)","MC"],["12:20","Couple entrance","Main Hall","Alya","Nada Wedding MC"],["12:30","Welcome speech","Main Stage","Ayah Alya","MC"],["12:45","Lunch service","Main Hall","Nadia (WO)","Rasa Kita Catering"],["13:10","Live music set I","Main Stage","Raka","Soul Notes"],["13:30","Toast & speeches","Main Stage","Nadia (WO)","MC"],["14:00","Cake cutting","Main Stage","Alya","Sugar Bloom"],["14:20","Photo booth / mingle","Main Hall","Guest Team","Memory Booth"],["15:00","Live music set II","Main Stage","Raka","Soul Notes"],["16:00","VIP farewell","Lobby","Family","WO Team"],["17:00","Reception close","Main Hall","Nadia (WO)","All Vendors"],["17:15","Vendor settlement check","Back Office","Raka","Nadia (WO)"],["18:00","Personal items inventory","Bridal Room","Alya","WO Team"],["19:00","Family dinner","Hotel Restaurant","Family","Hotel"],["20:30","Return to room / wrap","Hotel","Alya","-"]
] as const;
const rundown:DemoRundown[]=rundownSeed.map((r,i)=>({id:i+1,time:r[0],activity:r[1],location:r[2],pic:r[3],vendor:r[4],status:i<12?"done":i===12?"next":"upcoming",notes:i%6===0?"Pastikan komunikasi via group vendor.":""}));

const documents:DemoDocument[]=[
 {id:1,name:"Kontrak Venue - The Garden Hall.pdf",category:"Contract",size:"1.1 MB",notes:"Signed 2 pihak"},
 {id:2,name:"Kontrak Catering.pdf",category:"Contract",size:"920 KB",notes:"Final pax menyusul"},
 {id:3,name:"Invoice Photography.pdf",category:"Invoice",size:"420 KB",notes:"Payment II upcoming"},
 {id:4,name:"Invoice Decoration.pdf",category:"Invoice",size:"510 KB",notes:"Termin II overdue"},
 {id:5,name:"Floorplan Reception.png",category:"Floorplan",size:"1.2 MB",notes:"Version 4"},
 {id:6,name:"Seating Plan Final.xlsx",category:"Guest",size:"330 KB",notes:"Draft final"},
 {id:7,name:"Rundown Master.pdf",category:"Rundown",size:"680 KB",notes:"WO version"},
 {id:8,name:"Shot List Photography.pdf",category:"Photo",size:"280 KB",notes:"Family + couple"},
 {id:9,name:"Shot List Video.pdf",category:"Video",size:"260 KB",notes:"Highlight"},
 {id:10,name:"Wedding Playlist.pdf",category:"Music",size:"190 KB",notes:"MC approved"},
 {id:11,name:"Vendor Contact Sheet.pdf",category:"Operations",size:"220 KB",notes:"Day-H contacts"},
 {id:12,name:"Dokumen Pernikahan.pdf",category:"Legal",size:"1.4 MB",notes:"Private"},
 {id:13,name:"Menu Catering Final.pdf",category:"Food",size:"480 KB",notes:"350 pax"},
 {id:14,name:"Decoration Moodboard.pdf",category:"Design",size:"2.1 MB",notes:"Final palette"},
 {id:15,name:"Payment Tracker.pdf",category:"Finance",size:"210 KB",notes:"Updated weekly"},
 {id:16,name:"Emergency Contacts.pdf",category:"Operations",size:"160 KB",notes:"Print 3 copies"}
];

const members:DemoMember[]=[
 {id:1,name:"Alya",role:"Owner / Bride",access:"Full access",phone:"081211110001"},
 {id:2,name:"Raka",role:"Partner / Groom",access:"Full planning + budget",phone:"081211110002"},
 {id:3,name:"Nadia",role:"Wedding Organizer",access:"Planning, vendor, guest, rundown",phone:"081211110003"},
 {id:4,name:"Ibu Maya",role:"Family PIC Alya",access:"Guest + view",phone:"081211110004"},
 {id:5,name:"Pak Rudi",role:"Family PIC Raka",access:"Guest + view",phone:"081211110005"},
 {id:6,name:"Dinda",role:"Bridesmaid Lead",access:"Rundown + tasks",phone:"081211110006"},
 {id:7,name:"Fahri",role:"Groomsman Lead",access:"Rundown + tasks",phone:"081211110007"},
 {id:8,name:"Tio",role:"Transport PIC",access:"Rundown only",phone:"081211110008"}
];

export const demoSeed:DemoState={
 couple:"Alya & Raka",date:"14 Februari 2027",city:"Jakarta",days:134,budget:220000000,reserve:8000000,targetGuests:350,
 tasks,budgetItems,vendors,payments,guests,rundown,seating,documents,members,
 cashEntries:[{id:1,kind:"deposit",contributor:"Alya",amount:90000000,date:"2026-10-01",note:"Tabungan awal"},{id:2,kind:"deposit",contributor:"Raka",amount:65000000,date:"2026-10-06",note:"Kontribusi pasangan"},{id:3,kind:"deposit",contributor:"Keluarga",amount:25000000,date:"2026-10-08",note:"Bantuan keluarga"}],
 details:{venue:"The Garden Hall",ceremony:"Akad",reception:"Garden Reception",theme:"Modern Garden · Ivory & Sage",dressCode:"Formal · Earth Tone",hashtag:"#MenujuAlyaRaka",planner:"Nadia / Teman Wedding Organizer",emergencyContact:"Nadia · 0812 1111 0003"}
};
