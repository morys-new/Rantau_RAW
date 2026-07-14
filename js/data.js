const S = {
  nama:"Budi", avatar:"🧑",
  hari:1, slot:0, slotMax:4,
  uang:75000, energi:100, kenyang:100, senang:100,
  place:"rumah",
  jobLevel:{ NangkepKuyang:1, warung:1, bangun:1 },
  cinta:0, jadian:false,
  punyaRumah:false, punyaMobil:false,
  goalTarget:1500000,
};

const SLOTS = ["Pagi","Siang","Sore","Malam"];

const PLACES = {
  rumah:    { nama:"Home",                  emoji:"🛏️", indoor:true  },
  sawah:    { nama:"Sawah Terlarang",       emoji:"🌾", indoor:false },
  warung:   { nama:"Warung Haka Bojess",    emoji:"🍜", indoor:true  },
  proyek:   { nama:"Proyek Bangunan",       emoji:"🏗️", indoor:false },
  taman:    { nama:"Taman Cinta",           emoji:"🌳", indoor:false },
  rumahDia: { nama:"Rumah Mommy Ibeng",     emoji:"💗", indoor:true  },
};

const SKY = [
  "linear-gradient(180deg,#ffd9a0,#ffb88c 55%,#ffd9a0)",
  "linear-gradient(180deg,#8fd3f4,#cdeafe 60%,#eaf6ff)",
  "linear-gradient(180deg,#ff9e6d,#ffd29b 60%,#ffe9c2)",
  "linear-gradient(180deg,#1e2f4d,#3a4f73 60%,#5a6f94)",
];

const GAJI_DASAR = { tani:40000, warung:55000, bangun:80000 };
