"use strict";

const $ = id => document.getElementById(id);
const clamp = (n, a = 0, b = 100) => Math.max(a, Math.min(b, n));
const rupiah = n => "Rp " + Math.round(n).toLocaleString("id-ID");
const cap = s => s[0].toUpperCase() + s.slice(1);

function flash(emoji, text){
  $("log").innerHTML = '<span class="spark">' + emoji + '</span><span id="logText">' + text + '</span>';
}

function render(){
  $("hName").textContent = S.nama;
  $("hDay").textContent = "Hari " + S.hari;
  $("hMood").textContent = moodText();
  $("vUang").textContent = rupiah(S.uang);
  setStat("energi", S.energi); setStat("kenyang", S.kenyang); setStat("senang", S.senang);

  let dots = "";
  for(let i = 0; i < S.slotMax; i++){
    const cls = i < S.slot ? "done" : (i === S.slot ? "now" : "");
    dots += '<div class="tdot ' + cls + '"><div class="bar"></div>' + SLOTS[i] + '</div>';
  }
  $("timeDots").innerHTML = dots;

  const p = PLACES[S.place];
  $("scene").style.background = SKY[S.slot] || SKY[3];
  $("sceneLabel").textContent = p.nama;
  $("placeEmoji").textContent = p.emoji;
  $("heroEmoji").textContent = S.avatar;
  $("ground").className = "ground" + (p.indoor ? " indoor" : "");
  $("stars").className = "stars" + (S.slot === 3 ? " show" : "");

  let prog, label;
  if(!S.punyaRumah){ label = "Beli rumah sendiri (" + rupiah(S.goalTarget) + ")"; prog = clamp(S.uang / S.goalTarget * 100); }
  else { label = "Jadian 💗"; prog = clamp(S.cinta); }
  $("goalLabel").textContent = label;
  $("goalBar").style.width = prog + "%";
  $("goalProgress").textContent = Math.floor(prog) + "%";

  renderActions();
  renderTravel();
}

function setStat(k, v){
  $("v" + cap(k)).textContent = Math.round(v);
  $("b" + cap(k)).style.width = clamp(v) + "%";
}

function moodText(){
  if(S.energi < 20) return "Capek banget, butuh tidur 😴";
  if(S.kenyang < 25) return "Perutnya keroncongan 😵";
  if(S.senang < 25) return "Lagi bete nih 😔";
  if(S.jadian) return "Pacaran 💞";
  if(S.punyaRumah) return "Punya rumah sendiri 🏠";
  return "Lagi semangat cari rezeki ✨";
}

const noTime = () => S.slot >= S.slotMax;

function renderActions(){
  const A = $("actions"); A.innerHTML = "";
  const lowEnergy = S.energi < 15;

  const add = (o) => {
    const b = document.createElement("button");
    b.className = "btn " + (o.cls || "");
    b.innerHTML = '<span class="ic">' + o.ic + '</span>' + o.t + '<span class="cost">' + o.cost + '</span>';
    b.disabled = !!o.dis;
    b.onclick = o.fn;
    if(o.span) b.style.gridColumn = "span 2";
    A.appendChild(b);
  };

  if(S.place === "rumah"){
    $("actTitle").textContent = "Di rumah";
    add({ ic:"😴", t:"Tidur", cost:"pulih energi · ganti hari", cls:"primary", fn:tidur });
    add({ ic:"🚿", t:"Mandi & rapikan", cost:"−1 waktu · +Senang", dis:noTime(), fn:() => doAct("mandi") });
    if(!S.punyaRumah && S.uang >= S.goalTarget){
      add({ ic:"🏠", t:"Beli rumah impian!", cost:"−" + rupiah(S.goalTarget), cls:"primary", span:true, fn:tryBuyHouse });
    }
  }
  else if(S.place === "sawah"){
    $("actTitle").textContent = "Kerja di sawah · lv" + S.jobLevel.tani;
    add({ ic:"🌾", t:"Bertani", cost:"−1 waktu · −energi · +" + rupiah(pay("tani")), cls:"primary", dis:noTime() || lowEnergy, fn:() => kerja("tani") });
    add({ ic:"🎣", t:"Mancing", cost:"−1 waktu · rezeki tak terduga", dis:noTime() || lowEnergy, fn:mancing });
  }
  else if(S.place === "warung"){
    $("actTitle").textContent = "Warung Bu Inah";
    add({ ic:"🍛", t:"Makan nasi padang", cost:"−" + rupiah(15000) + " · +Kenyang", dis:S.uang < 15000, fn:() => makan(15000, 45, 5) });
    add({ ic:"🍜", t:"Mie ayam", cost:"−" + rupiah(10000) + " · +Kenyang", dis:S.uang < 10000, fn:() => makan(10000, 30, 4) });
    add({ ic:"☕", t:"Ngopi santai", cost:"−" + rupiah(5000) + " · +Senang", dis:S.uang < 5000, fn:() => makan(5000, 8, 12) });
    add({ ic:"🧑‍🍳", t:"Jadi pelayan", cost:"−1 waktu · +" + rupiah(pay("warung")), cls:"primary", dis:noTime() || lowEnergy, fn:() => kerja("warung") });
  }
  else if(S.place === "proyek"){
    $("actTitle").textContent = "Proyek bangunan · lv" + S.jobLevel.bangun;
    add({ ic:"🧱", t:"Kerja kuli", cost:"−1 waktu · −energi · +" + rupiah(pay("bangun")), cls:"primary", dis:noTime() || lowEnergy, fn:() => kerja("bangun") });
    add({ ic:"🛒", t:"Beli motor (1jt)", cost:"jalan lebih cepat", dis:S.punyaMotor || S.uang < 1000000, fn:beliMotor });
  }
  else if(S.place === "taman"){
    $("actTitle").textContent = "Taman desa";
    add({ ic:"🎶", t:"Main gitar", cost:"−1 waktu · +Senang banyak", cls:"primary", dis:noTime(), fn:() => doAct("gitar") });
    add({ ic:"⚽", t:"Main bola", cost:"−1 waktu · +Senang · −energi", dis:noTime() || lowEnergy, fn:() => doAct("bola") });
    add({ ic:"🛏️", t:"Tidur siang di rumput", cost:"−1 waktu · +energi sedikit", dis:noTime(), fn:() => doAct("tidursiang") });
  }
  else if(S.place === "rumahDia"){
    $("actTitle").textContent = (S.jadian ? "Pacarmu, Sari 💞" : "Sari, gadis desa 💗");
    add({ ic:"💬", t:"Ngobrol", cost:"−1 waktu · +Cinta", cls:"love", dis:noTime(), fn:() => nembak("ngobrol") });
    add({ ic:"🎁", t:"Kasih hadiah", cost:"−" + rupiah(50000) + " · +Cinta besar", cls:"love", dis:S.uang < 50000, fn:() => nembak("hadiah") });
    if(!S.jadian) add({ ic:"💍", t:"Nembak", cost:"butuh Cinta 100% & punya rumah", cls:"love", dis:!(S.cinta >= 100 && S.punyaRumah), fn:tembak });
    else add({ ic:"🌅", t:"Jalan berdua", cost:"−1 waktu · +Senang penuh", cls:"love", dis:noTime(), fn:() => doAct("kencan") });
  }
}

function renderTravel(){
  const T = $("travel"); T.innerHTML = "";
  Object.keys(PLACES).forEach(key => {
    const p = PLACES[key];
    const b = document.createElement("button");
    b.className = "btn travel" + (S.place === key ? " active" : "");
    b.innerHTML = '<span class="ic">' + p.emoji + '</span>' + p.nama;
    b.onclick = () => {
      if(S.place !== key){ S.place = key; flash(p.emoji, "Kamu pergi ke " + p.nama + "."); render(); }
    };
    T.appendChild(b);
  });
}

function pay(job){
  return Math.round(GAJI_DASAR[job] * (1 + (S.jobLevel[job] - 1) * 0.25));
}

function kerja(job){
  const earned = pay(job);
  const cost = { tani:18, warung:14, bangun:24 }[job];
  S.uang += earned; S.energi = clamp(S.energi - cost); S.kenyang = clamp(S.kenyang - 12);
  S.jobLevel[job]++;
  const ic = { tani:"🌾", warung:"🧑‍🍳", bangun:"🧱" }[job];
  flash(ic, "Kerja keras! Dapat " + rupiah(earned) + ". Skill naik jadi lv" + S.jobLevel[job] + ".");
  passTime();
}

function mancing(){
  S.energi = clamp(S.energi - 12);
  const r = Math.random();
  let got;
  if(r < 0.15){ got = 0; flash("🎣", "Yah, nggak dapat apa-apa. Sabar ya."); }
  else if(r < 0.85){ got = Math.round(20000 + Math.random() * 40000); flash("🐟", "Dapat ikan! Dijual " + rupiah(got) + "."); }
  else { got = 120000; flash("🐠", "WOW ikan langka! Laku " + rupiah(got) + "!"); }
  S.uang += got;
  passTime();
}

function makan(harga, k, s){
  S.uang -= harga; S.kenyang = clamp(S.kenyang + k); S.senang = clamp(S.senang + s);
  flash("😋", "Mantap, kenyang! Bayar " + rupiah(harga) + ".");
  render();
}

function doAct(type){
  const map = {
    mandi:      { e:0,   k:0,   s:10, t:"🚿", msg:"Segar! Badan wangi, hati senang." },
    gitar:      { e:-3,  k:-5,  s:22, t:"🎶", msg:"Petik gitar, hati jadi tenang." },
    bola:       { e:-16, k:-10, s:26, t:"⚽", msg:"Main bola sama anak kampung, seru!" },
    tidursiang: { e:18,  k:-5,  s:5,  t:"😌", msg:"Tidur siang sebentar, lumayan segar." },
    kencan:     { e:-4,  k:-5,  s:40, t:"💞", msg:"Jalan berdua sama Sari. Bahagia banget." },
  };
  const a = map[type];
  S.energi = clamp(S.energi + a.e); S.kenyang = clamp(S.kenyang + a.k); S.senang = clamp(S.senang + a.s);
  flash(a.t, a.msg);
  passTime();
}

function beliMotor(){
  S.uang -= 1000000; S.punyaMotor = true;
  flash("🛵", "Punya motor sekarang! Hidup lebih gampang.");
  render();
}

function nembak(type){
  if(type === "ngobrol"){
    S.cinta = clamp(S.cinta + 12); S.senang = clamp(S.senang + 8);
    flash("💬", "Ngobrol asik sama Sari. Makin dekat.");
    passTime();
  } else {
    S.uang -= 50000; S.cinta = clamp(S.cinta + 25); S.senang = clamp(S.senang + 10);
    flash("🎁", "Sari senang dapat hadiah! Cinta " + Math.round(S.cinta) + "%.");
    render();
  }
}

function tembak(){
  S.jadian = true; S.senang = 100;
  showModal("💍", "Dia bilang IYA!", "Sari menerima cintamu. Kalian resmi pacaran. Hidup di kampung terasa lengkap. 💞 (Tapi cerita belum berhenti, lanjut hidupmu!)");
  render();
}

function passTime(){
  S.slot++;
  S.kenyang = clamp(S.kenyang - 6);
  S.energi = clamp(S.energi - 2);
  if(S.kenyang <= 0){ S.energi = clamp(S.energi - 10); S.senang = clamp(S.senang - 8); }
  if(S.slot >= S.slotMax){ setTimeout(autoSleepPrompt, 350); }
  render();
}

function autoSleepPrompt(){
  showModal("🌙", "Hari sudah malam",
    "Waktumu habis untuk hari ini. Saatnya pulang dan tidur untuk memulai hari baru.",
    () => { S.place = "rumah"; render(); tidur(true); });
}

function tidur(forced){
  if(!forced && S.place !== "rumah"){ S.place = "rumah"; }
  const kualitas = S.kenyang > 30 ? 100 : 55;
  S.energi = kualitas;
  S.hari++; S.slot = 0;
  if(S.kenyang < 20) S.senang = clamp(S.senang - 15);
  S.kenyang = clamp(S.kenyang - 10);
  S.senang = clamp(S.senang - 3);

  const ev = morningEvent();
  if(ev) showModal(ev.ic, ev.title, ev.text);
  else flash("🌅", "Hari " + S.hari + " dimulai. Semangat!");
  render();
}

function morningEvent(){
  if(Math.random() > 0.45) return null;
  const evs = [
    { ic:"💵", title:"Rezeki nomplok", text:"Kamu nemu dompet berisi uang di jalan, dan pemiliknya kasih imbalan Rp 50.000!", apply:() => S.uang += 50000 },
    { ic:"🤧", title:"Masuk angin",    text:"Semalam kehujanan, badanmu kurang fit. Energi berkurang.", apply:() => S.energi = clamp(S.energi - 20) },
    { ic:"🎉", title:"Hajatan tetangga", text:"Ada syukuran di kampung, kamu ikut makan-makan gratis. Kenyang & senang!", apply:() => { S.kenyang = clamp(S.kenyang + 30); S.senang = clamp(S.senang + 15); } },
    { ic:"📈", title:"Harga panen naik", text:"Hasil sawah lagi mahal. Kerja tani hari ini berasa lebih cuan!", apply:() => S.jobLevel.tani++ },
  ];
  const e = evs[Math.floor(Math.random() * evs.length)];
  e.apply();
  return e;
}

function tryBuyHouse(){
  S.uang -= S.goalTarget; S.punyaRumah = true;
  showModal("🏠", "Rumah Impian!", "Selamat! Kamu berhasil beli rumah sendiri di kampung. Sekarang kamu bisa fokus mengejar cinta Sari. 💗");
  render();
}

let modalCb = null;
function showModal(emoji, title, text, cb){
  $("modalEmoji").textContent = emoji;
  $("modalTitle").textContent = title;
  $("modalText").textContent = text;
  modalCb = cb || null;
  $("modal").classList.remove("hidden");
}
$("modalOk").onclick = () => {
  $("modal").classList.add("hidden");
  const cb = modalCb; modalCb = null;
  if(cb) cb();
};

let chosenAv = "🧑";
$("avatars").addEventListener("click", e => {
  if(!e.target.classList.contains("av")) return;
  document.querySelectorAll(".av").forEach(a => a.classList.remove("sel"));
  e.target.classList.add("sel");
  chosenAv = e.target.textContent;
});

$("startBtn").onclick = () => {
  const nm = $("nameInput").value.trim();
  S.nama = nm || "Budi";
  S.avatar = chosenAv;
  $("startScreen").classList.add("hidden");
  flash("🌅", "Selamat datang di kampung, " + S.nama + "! Mulai dengan cari kerja.");
  render();
};

$("resetLink").onclick = () => location.reload();

render();
