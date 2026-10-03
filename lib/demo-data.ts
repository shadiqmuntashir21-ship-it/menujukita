export type DemoTask={id:number;title:string;due:string;status:"todo"|"done";priority:"critical"|"high"|"medium";category:string};
export type DemoVendor={name:string;category:string;status:string;price:number;contact:string};
export type DemoPayment={title:string;amount:number;due:string;status:string};
export type DemoRundown={time:string;activity:string;location:string;status:"done"|"next"|"upcoming"};
export type DemoSeat={name:string;capacity:number;guests:string[]};
export type DemoMember={name:string;role:string;access:string};

export type DemoState={
  couple:string;date:string;city:string;days:number;health:number;budget:number;paid:number;targetGuests:number;
  tasks:DemoTask[];vendors:DemoVendor[];payments:DemoPayment[];
  rsvp:{attending:number;declined:number;waiting:number};
  rundown:DemoRundown[];seating:DemoSeat[];members:DemoMember[];
};

export const demoSeed:DemoState={
  couple:"Alya & Raka",date:"14 Februari 2027",city:"Jakarta",days:134,health:82,budget:120000000,paid:58250000,targetGuests:350,
  tasks:[
    {id:1,title:"Finalisasi menu catering",due:"3 hari lagi",status:"todo",priority:"critical",category:"Catering"},
    {id:2,title:"Bayar Photography Payment II",due:"5 hari lagi",status:"todo",priority:"high",category:"Payment"},
    {id:3,title:"Konfirmasi fitting busana",due:"8 hari lagi",status:"todo",priority:"medium",category:"Attire"},
    {id:4,title:"Finalisasi layout meja keluarga",due:"12 hari lagi",status:"todo",priority:"medium",category:"Guest"},
    {id:5,title:"Kirim reminder RSVP tahap 1",due:"18 hari lagi",status:"todo",priority:"high",category:"Guest"},
    {id:6,title:"Review kontrak dekorasi",due:"21 hari lagi",status:"todo",priority:"medium",category:"Vendor"},
    {id:7,title:"Booking venue",due:"Selesai",status:"done",priority:"critical",category:"Venue"},
    {id:8,title:"Booking fotografer",due:"Selesai",status:"done",priority:"high",category:"Documentation"},
    {id:9,title:"Pilih tema dekorasi",due:"Selesai",status:"done",priority:"high",category:"Decoration"},
    {id:10,title:"Tentukan konsep undangan",due:"Selesai",status:"done",priority:"medium",category:"Invitation"},
    {id:11,title:"Susun guest list awal",due:"Selesai",status:"done",priority:"high",category:"Guest"},
    {id:12,title:"Pilih MUA",due:"Selesai",status:"done",priority:"high",category:"Makeup"},
    {id:13,title:"Pilih MC",due:"Selesai",status:"done",priority:"medium",category:"Entertainment"},
    {id:14,title:"Tentukan buffer budget",due:"Selesai",status:"done",priority:"medium",category:"Money"}
  ],
  vendors:[
    {name:"The Garden Hall",category:"Venue",status:"Booked",price:25000000,contact:"0812 8899 1200"},
    {name:"Rasa Kita Catering",category:"Catering",status:"Booked",price:32000000,contact:"0813 2200 4211"},
    {name:"Lens Story",category:"Photography",status:"Booked",price:8500000,contact:"0812 7711 2001"},
    {name:"Bloom Decor",category:"Decoration",status:"Negotiating",price:13500000,contact:"0811 4112 988"},
    {name:"Laras MUA",category:"Makeup",status:"Booked",price:7000000,contact:"0812 9090 4141"},
    {name:"Nada Wedding MC",category:"MC",status:"Booked",price:3000000,contact:"0813 7000 188"},
    {name:"Paperie Studio",category:"Invitation",status:"Shortlisted",price:2500000,contact:"0812 8810 761"},
    {name:"Kita Souvenir",category:"Souvenir",status:"Searching",price:4500000,contact:"-"}
  ],
  payments:[
    {title:"Photography Payment II",amount:2500000,due:"5 hari lagi",status:"Upcoming"},
    {title:"Decoration DP",amount:4000000,due:"9 hari lagi",status:"Upcoming"},
    {title:"Venue pelunasan",amount:7500000,due:"28 hari lagi",status:"Upcoming"},
    {title:"MUA DP",amount:2500000,due:"Paid",status:"Paid"}
  ],
  rsvp:{attending:231,declined:27,waiting:92},
  rundown:[
    {time:"06:00",activity:"Persiapan keluarga & makeup",location:"Bridal Room",status:"done"},
    {time:"08:30",activity:"Final briefing vendor",location:"Main Hall",status:"done"},
    {time:"09:00",activity:"Akad / Pemberkatan",location:"Ceremony Area",status:"next"},
    {time:"10:30",activity:"Family Photography",location:"Photo Area",status:"upcoming"},
    {time:"12:00",activity:"Resepsi dibuka",location:"Main Hall",status:"upcoming"},
    {time:"13:30",activity:"Couple entrance & toast",location:"Main Stage",status:"upcoming"},
    {time:"15:00",activity:"Closing",location:"Main Hall",status:"upcoming"}
  ],
  seating:[
    {name:"Meja Keluarga A",capacity:10,guests:["Bpk. Ahmad & Keluarga","Ibu Sari","Kak Dinda & Partner"]},
    {name:"Meja Keluarga B",capacity:10,guests:["Keluarga Pak Rudi","Ibu Maya & Keluarga"]},
    {name:"Teman Kampus",capacity:8,guests:["Fahri","Nabila","Rizky","Aulia","Dimas","Rara"]},
    {name:"Teman Kantor",capacity:8,guests:["Mira","Ardi","Lina","Bimo"]}
  ],
  members:[
    {name:"Alya",role:"Owner",access:"Full access"},
    {name:"Raka",role:"Partner",access:"Full planning + budget"},
    {name:"Nadia",role:"Collaborator / WO",access:"Planning, vendor, guest, rundown"},
    {name:"Ibu Maya",role:"Viewer",access:"Read only"}
  ]
};
