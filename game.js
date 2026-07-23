"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const KM_TOTAL = 3200;
const MONTHS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const ENDING_RANKS = [
  "Disparu sans laisser de trace",
  "Nourriture pour coyotes",
  "Victime de la dysenterie",
  "Conducteur de chariot égaré",
  "Pionnier mal préparé",
  "Chercheur d’or bredouille",
  "Voyageur du dimanche",
  "Convoyeur de bétail",
  "Éclaireur hésitant",
  "Pionnier ordinaire",
  "Chef de famille prudent",
  "Guide de convoi",
  "Vétéran de la piste",
  "Bâtisseur de ferme",
  "Fondateur de comptoir",
  "Capitaine de la Frontière",
  "Maître de la piste de l’Oregon",
  "Conquérant de l’Ouest",
  "Légende de la Frontière",
  "Père ou Mère de l’Oregon"
];

const SHOP = {
  boeufs: { label:"Bœufs", desc:"Une paire coûte 40 $. Il en faut au moins quatre.", unit:"bête", plural:"bêtes", step:2, price:40, max:12, start:6 },
  vivres: { label:"Vivres", desc:"Farine, lard, café et haricots. Prix pour 10 kg.", unit:"kg", plural:"kg", step:10, price:4, max:800, start:300 },
  munitions: { label:"Munitions", desc:"Boîtes de 20 balles pour la chasse.", unit:"balle", plural:"balles", step:20, price:3, max:600, start:100 },
  vetements: { label:"Couvertures", desc:"Gardent les voyageurs au chaud et au sec.", unit:"pièce", plural:"pièces", step:1, price:10, max:15, start:5 },
  pieces: { label:"Pièces de rechange", desc:"Roues, essieux et timons pour les avaries.", unit:"pièce", plural:"pièces", step:1, price:18, max:12, start:3 },
  medicaments: { label:"Remèdes", desc:"Bandages et fortifiants pour soigner le groupe.", unit:"dose", plural:"doses", step:1, price:12, max:15, start:4 }
};

const LANDMARKS = [
  {km:165,name:"Rivière Kansas",kind:"river",depth:0.8,visual:"kansas"},
  {km:490,name:"Fort Kearny",kind:"fort",visual:"fort-kearny"},
  {km:980,name:"Chimney Rock",kind:"landmark",visual:"chimney-rock"},
  {km:1240,name:"Fort Laramie",kind:"fort",visual:"fort-laramie"},
  {km:1510,name:"Independence Rock",kind:"landmark",visual:"independence-rock"},
  {km:1810,name:"South Pass",kind:"landmark",visual:"south-pass"},
  {km:2320,name:"Rivière Snake",kind:"river",depth:1.6,visual:"snake"},
  {km:2580,name:"Fort Boise",kind:"fort",visual:"fort-boise"},
  {km:2920,name:"The Dalles",kind:"river",depth:2.1,visual:"dalles"}
];
const FINAL_STAGE = {km:KM_TOTAL,name:"Vallée de Willamette",visual:"willamette"};

const WEATHER = [
  {name:"Doux",temp:18,cls:""},{name:"Chaud",temp:31,cls:""},{name:"Pluvieux",temp:13,cls:"rain"},
  {name:"Froid",temp:4,cls:""},{name:"Neige",temp:-4,cls:"snow"}
];
const PACES = {
  prudent:{km:65,health:1,food:.9,incident:.32,strain:-1,hint:"Ménage le groupe et l’attelage · incidents moins fréquents"},
  soutenu:{km:90,health:-1,food:1,incident:.52,strain:1,hint:"Bon progrès, avec une fatigue et des risques réguliers"},
  epuisant:{km:115,health:-7,food:1.2,incident:.88,strain:3,hint:"Forte fatigue · davantage de pannes, blessures et bœufs épuisés"}
};

let game = null;
let cart = Object.fromEntries(Object.entries(SHOP).map(([k,v]) => [k,v.start]));
let hunt = null;
let attack = null;
let attackOutcome = null;
let helpReturnScreen = "ecran-accueil";

function baseGame(names, profession, month) {
  const money = {fermier:800,charpentier:1000,banquier:1600}[profession];
  return {
    version:1, profession, money, initialMoney:money, cart:{...cart},
    party:names.map(name => ({name,health:100,state:"En forme",alive:true,sickDays:0})),
    day:1, month:Number(month), year:1848, km:0, days:0, pace:"soutenu", rations:"normales",
    weather:WEATHER[0], landmarkIndex:0, oxStrain:0, journal:[], finished:false, score:0
  };
}

function showScreen(id) {
  $$(".screen").forEach(el => { el.classList.toggle("active",el.id===id); });
  window.scrollTo(0,0);
  const active = $("#"+id); if (active){active.tabIndex=-1;active.focus({preventScroll:true});}
}

function returnToTrailTop() {
  if(!$("#ecran-voyage").classList.contains("active"))return;
  requestAnimationFrame(()=>{
    const root=document.documentElement,previous=root.style.scrollBehavior;
    root.style.scrollBehavior="auto";
    window.scrollTo(0,0);root.scrollTop=0;document.body.scrollTop=0;
    requestAnimationFrame(()=>{window.scrollTo(0,0);root.style.scrollBehavior=previous;});
  });
}

function openGuide(returnScreen) {
  helpReturnScreen=returnScreen;
  showScreen("ecran-aide");
}

function formatDate() { return `${game.day} ${MONTHS[game.month]} ${game.year}`; }
function alive() { return game.party.filter(p => p.alive); }
function rand(min,max) { return Math.floor(Math.random()*(max-min+1))+min; }
function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function clamp(v,min,max) { return Math.max(min,Math.min(max,v)); }
function money(n) { return `${Math.max(0,Math.round(n))} $`; }
// Dans l'interface du jeu, zéro conserve le singulier : « 0 pièce ».
function unitLabel(item,quantity) { return quantity<=1?item.unit:item.plural; }
function itemQuantity(key,quantity) { return `${quantity} ${unitLabel(SHOP[key],quantity)}`; }
function endingRank(score) { return ENDING_RANKS[Math.min(ENDING_RANKS.length-1,Math.floor(Math.max(0,score)/250))]; }
function dailyFoodPerPerson() { return {copieuses:3,normales:2,maigres:1}[game.rations]; }
function consumeFood(days,perPerson=dailyFoodPerPerson()) {
  const needed=perPerson*alive().length*days,consumed=Math.min(game.cart.vivres,needed);
  game.cart.vivres-=consumed;return {needed,consumed};
}
function travelWeatherFactor(weather) { return {Doux:1,Chaud:.85,Pluvieux:.8,Froid:.9,Neige:.65}[weather.name]??1; }

function checkJourneyFailure() {
  if(game.finished)return true;
  if(game.cart.boeufs<=0){
    finish(false,"Le dernier bœuf ne peut plus tirer. Sans attelage, le chariot reste abandonné sur la piste.");
    return true;
  }
  return false;
}

function toast(text) {
  const el=$("#toast"); el.textContent=text; el.classList.add("show");
  clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove("show"),2600);
}

function addJournal(text) {
  game.journal.unshift({date:formatDate(),text});
  game.journal=game.journal.slice(0,40);
}

function advanceDate(days) {
  for(let i=0;i<days;i++){
    game.day++; game.days++;
    const lengths=[31,(game.year%4===0?29:28),31,30,31,30,31,31,30,31,30,31];
    if(game.day>lengths[game.month]){game.day=1;game.month++;if(game.month>11){game.month=0;game.year++;}}
  }
}

function healthLabel(value) {
  if(value>74)return ["Bonne santé","good"];
  if(value>44)return ["Fatigué","warn"];
  if(value>0)return ["Très faible","bad"];
  return ["Décédé","dead"];
}

function injuryCondition(value) {
  if(value>64)return "Blessure légère";
  if(value>34)return "Sérieusement affaibli";
  return "État critique";
}

function weatherVisual() {
  if(game.weather.name==="Pluvieux")return {key:"rain",label:"temps pluvieux"};
  if(game.weather.temp<=5)return {key:"cold",label:"temps froid et enneigé"};
  if(game.weather.temp>=27)return {key:"hot",label:"temps chaud et aride"};
  return {key:"mild",label:"temps modéré"};
}

function regionVisual() {
  if(game.km<500)return {key:"plains",title:"Les Grandes Plaines",label:"les Grandes Plaines"};
  if(game.km<1400)return {key:"platte",title:"Le pays de la Platte",label:"la vallée de la Platte"};
  if(game.km<2200)return {key:"rockies",title:"Les Rocheuses",label:"les Rocheuses"};
  return {key:"oregon",title:"Le pays de l’Oregon",label:"le pays de l’Oregon"};
}

function currentStage() {
  return LANDMARKS[game.landmarkIndex]||FINAL_STAGE;
}

function stageAsset(stage=currentStage(),weather=weatherVisual()) {
  return `stage-${stage.visual}-${weather.key}.webp`;
}

function setTrailScene() {
  const weather=weatherVisual(),stage=currentStage(),scene=$("#scene");
  scene.className=`scene trail-scene stage-scene weather-${weather.key}`;
  scene.style.backgroundImage=`url('assets/${stageAsset(stage,weather)}')`;
  scene.setAttribute("aria-label",`Le chariot avance vers ${stage.name}, par ${weather.label}`);
}

function updateUI() {
  if(!game)return;
  $("#date").textContent=formatDate();
  $("#distance-label").textContent=`${Math.round(game.km).toLocaleString("fr-FR")} / ${KM_TOTAL.toLocaleString("fr-FR")} km`;
  $("#barre-progression").style.width=`${clamp(game.km/KM_TOTAL*100,0,100)}%`;
  $("#stat-vivres").textContent=`${Math.round(game.cart.vivres)} kg`;
  $("#stat-argent").textContent=money(game.money);
  $("#stat-munitions").textContent=game.cart.munitions;
  $("#stat-pieces").textContent=game.cart.pieces;
  $("#stat-boeufs").textContent=game.cart.boeufs;
  $("#stat-vetements").textContent=game.cart.vetements;
  $("#rythme").value=game.pace; $("#rations").value=game.rations;
  $("#rythme-effet").textContent=PACES[game.pace].hint;
  const avg=alive().length ? alive().reduce((n,p)=>n+p.health,0)/alive().length : 0;
  const [global,cls]=healthLabel(avg); $("#sante-globale").textContent=global; $("#sante-globale").className=`status ${cls}`;
  $("#liste-groupe").innerHTML=game.party.map(p=>{const [label,c]=healthLabel(p.health),state=p.state!=="En forme"?p.state:label;return `<li><span class="health-dot ${c}" aria-hidden="true"></span><b>${escapeHtml(p.name)}</b><span class="party-state">${p.alive?escapeHtml(state):label}</span></li>`}).join("");
  $("#journal").innerHTML=game.journal.slice(0,4).map(j=>`<li><time>${escapeHtml(j.date)}</time>${escapeHtml(j.text)}</li>`).join("");
  const next=LANDMARKS.find(l=>l.km>game.km);
  $("#lieu").textContent=next?`${next.name} · ${Math.max(0,Math.round(next.km-game.km))} km`:"Vallée de Willamette";
  $("#meteo").textContent=`${game.weather.name} · ${game.weather.temp} °C`;
  $("#meteo-scene").className=`weather ${game.weather.cls}`;
  if(!$("#scene").matches(".landmark-scene"))setTrailScene();
  $("#titre-etape").textContent=`En route vers ${currentStage().name}`;
}

function escapeHtml(str){const d=document.createElement("div");d.textContent=String(str);return d.innerHTML;}

function renderShop() {
  const spent=Object.entries(cart).reduce((sum,[k,q])=>sum+q/SHOP[k].step*SHOP[k].price,0);
  $("#argent-boutique").textContent=money(game.initialMoney-spent);
  $("#liste-boutique").innerHTML=Object.entries(SHOP).map(([key,item])=>`
    <article class="shop-item panel"><h3>${item.label}</h3><b>${item.price} $ / ${item.step} ${unitLabel(item,item.step)}</b><p>${item.desc}</p>
    <div class="stepper"><button type="button" data-shop="${key}" data-dir="-1" aria-label="Retirer ${item.label}">−</button><output>${cart[key]} ${unitLabel(item,cart[key])}</output><button type="button" data-shop="${key}" data-dir="1" aria-label="Ajouter ${item.label}">+</button></div></article>`).join("");
  const notes=[];if(cart.boeufs<4)notes.push("Il faut au moins 4 bœufs.");if(cart.vivres<200)notes.push("Prévoyez environ 200 kg de vivres.");if(cart.munitions<40)notes.push("La chasse exigera des munitions.");
  $("#conseils-boutique").innerHTML=notes.length?notes.map(n=>`<div>⚠ ${n}</div>`).join(""):"Votre chargement semble prêt pour la piste.";
}

function changeCart(key,dir){
  const item=SHOP[key], next=clamp(cart[key]+dir*item.step,0,item.max);
  const trial={...cart,[key]:next};
  const spent=Object.entries(trial).reduce((sum,[k,q])=>sum+q/SHOP[k].step*SHOP[k].price,0);
  if(spent>game.initialMoney){toast("Vous n’avez pas assez d’argent.");return;}
  cart=trial;renderShop();
}

function leaveTown(){
  if(cart.boeufs<4){toast("Il vous faut au moins quatre bœufs.");return;}
  if(cart.vivres<100){toast("Emportez au moins 100 kg de vivres.");return;}
  const spent=Object.entries(cart).reduce((sum,[k,q])=>sum+q/SHOP[k].step*SHOP[k].price,0);
  game.cart={...cart};game.money=game.initialMoney-spent;
  addJournal("Nous avons quitté Independence. La piste s’ouvre devant nous.");
  showScreen("ecran-voyage");updateUI();
}

function travel(){
  if(game.finished)return;
  if(checkJourneyFailure())return;
  if(game.cart.vivres<=0){ resolveStarvation(); return; }
  const from=game.km;
  const pace=PACES[game.pace];
  const oxFactor=clamp(game.cart.boeufs/6,.25,1.15);
  const travelWeather=game.weather;
  const plannedDistance=Math.max(1,Math.round(pace.km*oxFactor*travelWeatherFactor(travelWeather)));
  let distance=plannedDistance;
  const next=LANDMARKS[game.landmarkIndex];if(next&&from<next.km&&from+distance>=next.km)distance=next.km-from;
  const travelDays=distance<plannedDistance?Math.max(1,Math.ceil(5*distance/plannedDistance)):5,timeRatio=travelDays/5;
  game.km+=distance;advanceDate(travelDays);
  const food=consumeFood(travelDays,dailyFoodPerPerson()*pace.food),foodConsumed=Math.round(food.consumed),foodShortage=food.consumed<food.needed;
  game.oxStrain=clamp((game.oxStrain||0)+pace.strain*timeRatio,0,10);
  for(const p of alive()){
    const rationHealth={copieuses:2,normales:0,maigres:-4}[game.rations];
    const coldPenalty=travelWeather.temp<=5&&game.cart.vetements<alive().length?(travelWeather.temp<0?-6:-3):0;
    const heatPenalty=travelWeather.temp>=27?-2:0;
    p.health=clamp(p.health+Math.round((pace.health+rationHealth+coldPenalty+heatPenalty)*timeRatio)+(foodShortage?-8:0),0,100);
    if(p.sickDays>0){p.sickDays-=travelDays;p.health=clamp(p.health-travelDays,0,100);if(p.sickDays<=0)p.state="En forme";}
  }
  game.weather=weatherForSeason();
  const paceJournal=game.pace==="epuisant"?" Le rythme épuisant a durement éprouvé le convoi.":"";
  addJournal(`${distance} km parcourus en ${travelDays} jour${travelDays>1?"s":""}.${paceJournal} ${game.weather.name.toLowerCase()} à l’horizon.`);
  updateDeaths();
  if(game.finished)return;
  if(game.km>=KM_TOTAL){finish(true);return;}
  if(next && game.km>=next.km){game.landmarkIndex++;landmark(next);}
  else {
    const weatherRisk={Doux:0,Chaud:.04,Pluvieux:.08,Froid:.04,Neige:.1}[travelWeather.name]||0;
    const incidentChance=clamp(pace.incident+weatherRisk+game.oxStrain*.01,.2,.96);
    if(Math.random()<incidentChance)randomEvent();else quietTravelEvent(distance,foodConsumed,travelDays);
  }
  updateUI();
}

function quietTravelEvent(distance,foodConsumed,travelDays=5){
  const paceText={prudent:"L’allure prudente a ménagé le groupe et l’attelage.",soutenu:"L’allure soutenue a laissé une fatigue ordinaire.",epuisant:"Même sans accident, l’allure épuisante a durement éprouvé le groupe et les bœufs."}[game.pace];
  eventModal("Une étape sans incident",`Le convoi a avancé de ${distance} km en ${travelDays} jour${travelDays>1?"s":""}.`,`${foodConsumed} kg de vivres ${foodConsumed<=1?"a été consommé":"ont été consommés"}. ${paceText}`,[
    {label:"Poursuivre la route",action:()=>addJournal("Une étape calme et sans incident.")}
  ],stageAsset());
}

function weatherForSeason(){
  const m=game.month;
  if(m>=10||m<=1)return pick([WEATHER[3],WEATHER[4],WEATHER[4]]);
  if(m>=7)return pick([WEATHER[0],WEATHER[2],WEATHER[3]]);
  if(m>=5)return pick([WEATHER[0],WEATHER[1],WEATHER[2]]);
  return pick([WEATHER[0],WEATHER[0],WEATHER[2],WEATHER[3]]);
}

function resolveStarvation(){
  for(const p of alive())p.health=clamp(p.health-18,0,100);
  advanceDate(3);addJournal("Les vivres sont épuisés. La faim affaiblit tout le monde.");updateDeaths();
  if(game.finished)return;
  updateUI();randomEvent();
}

function updateDeaths(){
  const dying=alive().filter(p=>p.health<=0).sort(()=>Math.random()-.5);
  const deaths=dying.slice(0,1);
  for(const p of deaths){
    p.alive=false;p.state="Décédé";addJournal(`${p.name} est mort sur la piste.`);
  }
  // Une même étape peut affaiblir tout le groupe, mais ne doit pas tuer
  // plusieurs voyageurs simultanément. Les autres restent en état critique.
  for(const p of dying.slice(1)){
    p.health=1;p.state="Très faible";
  }
  if(alive().length===0)finish(false,"La piste a eu raison de tout le convoi.");
}

function randomEvent(){
  const events=[
    ()=>{
      const loss=Math.min(game.cart.vivres,rand(12,35));game.cart.vivres-=loss;
      const lossText=loss>0?`${loss} kg de vivres ${loss===1?"est perdu":"sont perdus"}.`:"Les réserves de vivres étaient déjà vides : rien n’a pu être perdu.";
      eventModal("Mauvaise piste",`Le chariot s’est renversé dans une ornière. ${lossText}`,"Une journée sera nécessaire pour tout remettre en ordre.",[
        {label:"Réparer et repartir",action:()=>{advanceDate(1);consumeFood(1);addJournal(loss>0?`Une chute de chariot nous a coûté ${loss} kg de vivres.`:"Le chariot s’est renversé, sans perte de vivres.")}}
      ],"incident-wagon.png");
    },
    ()=>{
      const p=pick(alive());p.health=clamp(p.health-rand(12,22),1,100);p.state="Fièvre";p.sickDays=10;
      eventModal("La fièvre",`${p.name} souffre d’une forte fièvre.`,"Un remède améliore nettement ses chances.",[
        {label:"Utiliser un remède",disabled:game.cart.medicaments<1,action:()=>{game.cart.medicaments--;p.health=clamp(p.health+18,1,100);p.sickDays=4;addJournal(`${p.name} a reçu un remède.`)}},
        {label:"Continuer prudemment",action:()=>{p.health=clamp(p.health-5,0,100);addJournal(`${p.name} reste fiévreux.`)}}
      ],"incident-fever.png");
    },
    ()=>{
      if(game.cart.pieces>0){
        const days=game.profession==="charpentier"?1:2;game.cart.pieces--;
        eventModal("Essieu brisé","Un choc sec — l’essieu du chariot vient de céder.",`Vous utilisez une pièce de rechange et perdez ${days===1?"une journée":"deux jours"}.`,[
          {label:"Effectuer la réparation",action:()=>{advanceDate(days);consumeFood(days)}}
        ],"incident-axle.png");
      }else{
        const discardedFood=Math.min(game.cart.vivres,rand(20,45));
        const discardedBlankets=Math.min(game.cart.vetements,1);
        eventModal("Essieu brisé","Votre essieu est rompu et vous n’avez aucune pièce.","Une famille de passage propose une pièce pour 45 $.",[
          {label:"Acheter la pièce (45 $)",disabled:game.money<45,action:()=>{game.money-=45;advanceDate(2);consumeFood(2)}},
          {label:"Alléger et improviser",action:()=>{
            advanceDate(4);consumeFood(4);const actualFood=Math.min(game.cart.vivres,discardedFood);game.cart.vivres-=actualFood;game.cart.vetements-=discardedBlankets;
            alive().forEach(p=>p.health=clamp(p.health-7,0,100));
            const losses=[];if(actualFood)losses.push(`${actualFood} kg de vivres`);if(discardedBlankets)losses.push("une couverture");
            addJournal(`Faute de pièce, le chariot a été allégé${losses.length?` de ${losses.join(" et ")}`:""} pour reprendre la piste.`);
          }}
        ],"incident-axle.png");
      }
    },
    ()=>{
      const found=rand(10,25);game.cart.vivres+=found;
      eventModal("Une bonne rencontre","Des voyageurs revenant de l’Oregon partagent leurs provisions.",`Vous recevez ${found} kg de vivres et quelques conseils.`,[
        {label:"Les remercier",action:()=>addJournal("Une famille généreuse nous a ravitaillés.")}
      ],"incident-encounter.png");
    },
    ()=>theftEvent(),
    ()=>tradeEvent(),
    ()=>attackEvent(),
    ()=>injuryEvent(),
    ()=>contagiousDiseaseEvent(),
    ()=>dysenteryEvent()
  ];
  if(game.weather.name==="Pluvieux")events.push(()=>{
    const days=rand(2,4);
    eventModal("Pluies diluviennes","La boue avale les roues. Impossible d’avancer.",`${days} jours de retard, mais le convoi reste à l’abri.`,[
      {label:"Attendre l’éclaircie",action:()=>{advanceDate(days);consumeFood(days);addJournal(`${days} jours perdus dans les pluies diluviennes.`)}}
    ],"incident-rain.png");
  });
  if(game.cart.vetements>0&&game.weather.temp<=5)events.push(()=>blanketLossEvent());
  if(game.weather.temp<=5||game.weather.temp>=27)events.push(()=>climateInjuryEvent());
  if(game.cart.boeufs>0)events.push(()=>oxInjuryEvent());
  if(game.pace==="soutenu")events.push(events[0],()=>injuryEvent());
  if(game.pace==="epuisant"){
    events.push(events[0],events[0],events[2],events[2],()=>injuryEvent(),()=>injuryEvent());
    if(game.cart.boeufs>0)events.push(()=>oxInjuryEvent(),()=>oxInjuryEvent(),()=>oxInjuryEvent());
  }
  if(game.cart.boeufs>0&&game.oxStrain>=6)events.push(()=>oxInjuryEvent(),()=>oxInjuryEvent(),()=>oxInjuryEvent());
  pick(events)();
}

function oxInjuryEvent(){
  const meat=rand(35,55),lastOx=game.cart.boeufs===1;
  eventModal("Un bœuf blessé","Une pierre a fait chuter l’un des bœufs. Sa patte enflée ne supporte plus le joug.",lastOx?"C’est votre dernier bœuf. L’abattre laisserait le chariot sans attelage.":"Vous pouvez tenter de le soigner ou transformer l’animal en provisions.",[
    {label:"Le soigner et attendre 2 jours",disabled:game.cart.medicaments<1,action:()=>{
      game.cart.medicaments--;advanceDate(2);consumeFood(2);game.oxStrain=clamp(game.oxStrain-4,0,10);addJournal("Un remède et deux jours de repos ont remis un bœuf sur pied.");
    }},
    {label:`L’abattre et charger ${meat} kg`,action:()=>{
      game.cart.boeufs--;game.cart.vivres+=meat;game.oxStrain=clamp(game.oxStrain-2,0,10);addJournal(`Un bœuf blessé a été abattu. Sa viande ajoute ${meat} kg aux réserves.`);
    }}
  ],"incident-ox-injury.png");
}

function injuryEvent(){
  const p=pick(alive()),damage=rand(14,24);p.health=clamp(p.health-damage,1,100);p.state="Blessé";p.sickDays=8;
  eventModal("Blessure sur la piste",`${p.name} a fait une mauvaise chute près du chariot.`,`Sa blessure l’a fortement affaibli. Un remède et des bandages accéléreraient sa guérison.`,[
    {label:"Utiliser un remède",disabled:game.cart.medicaments<1,action:()=>{game.cart.medicaments--;p.health=clamp(p.health+16,1,100);p.sickDays=3;p.state="Convalescent";addJournal(`${p.name} a été soigné après sa chute.`)}},
    {label:"Poser une attelle",action:()=>{advanceDate(1);consumeFood(1);p.sickDays=6;addJournal(`${p.name} voyage avec une attelle improvisée.`)}}
  ],"incident-injury.png");
}

function dysenteryEvent(){
  const p=pick(alive()),damage=rand(18,28);p.health=clamp(p.health-damage,1,100);p.state="Dysenterie";p.sickDays=12;
  eventModal("Dysenterie",`${p.name} est pris de violentes douleurs et se déshydrate rapidement.`,`Son état s’est sérieusement dégradé. Du repos, de l’eau bouillie et un remède peuvent éviter le pire.`,[
    {label:"Donner un remède",disabled:game.cart.medicaments<1,action:()=>{game.cart.medicaments--;p.health=clamp(p.health+18,1,100);p.sickDays=5;p.state="Convalescent";addJournal(`${p.name} a reçu un remède contre la dysenterie.`)}},
    {label:"Faire halte 2 jours",action:()=>{advanceDate(2);consumeFood(2);p.health=clamp(p.health+6,1,100);p.sickDays=8;addJournal(`Le convoi s’est arrêté pour soigner la dysenterie de ${p.name}.`)}},
    {label:"Continuer",action:()=>{p.health=clamp(p.health-8,1,100);addJournal(`${p.name} reste gravement atteint de dysenterie.`)}}
  ],"incident-dysentery.png");
}

function climateInjuryEvent(){
  const p=pick(alive()),cold=game.weather.temp<=5,damage=cold?rand(14,23):rand(8,16);
  p.health=clamp(p.health-damage,1,100);p.state=cold?"Engelures":"Piqûres";p.sickDays=cold?9:6;
  const title=cold?"Engelures":"Piqûres d’insectes";
  const text=cold?`${p.name} souffre d’engelures après une longue exposition au froid.`:`${p.name} est couvert de piqûres douloureuses après une halte sous une chaleur étouffante.`;
  const details=cold?"Il faut réchauffer progressivement les zones atteintes.":"Les piqûres se sont infectées et doivent être nettoyées.";
  eventModal(title,text,`${details} ${p.name} en ressort affaibli.`,[
    {label:"Utiliser un remède",disabled:game.cart.medicaments<1,action:()=>{game.cart.medicaments--;p.health=clamp(p.health+(cold?17:12),1,100);p.sickDays=3;p.state="Convalescent";addJournal(`${p.name} a été soigné pour ${cold?"des engelures":"des piqûres d’insectes"}.`)}},
    {label:cold?"Réchauffer et attendre":"Nettoyer et repartir",action:()=>{if(cold){advanceDate(1);consumeFood(1)}p.sickDays=cold?6:4;addJournal(`${p.name} récupère lentement après ${cold?"ses engelures":"ses piqûres"}.`)}}
  ],cold?"incident-frostbite.png":"incident-bites.png");
}

function contagiousDiseaseEvent(){
  const patients=[...alive()].sort(()=>Math.random()-.5).slice(0,Math.min(alive().length,rand(2,3)));
  patients.forEach(p=>{p.health=clamp(p.health-rand(9,16),1,100);p.state="Malade";p.sickDays=Math.max(p.sickDays,10)});
  const count=patients.length;
  eventModal("Maladie contagieuse",`${count} voyageur${count>1?"s":""} présente${count>1?"nt":""} les mêmes symptômes.`,`La maladie risque d’épuiser rapidement le groupe. Vous avez ${itemQuantity("medicaments",game.cart.medicaments)}.`,[
    {label:`Distribuer ${count} remède${count>1?"s":""}`,disabled:game.cart.medicaments<count,action:()=>{game.cart.medicaments-=count;patients.forEach(p=>{p.health=clamp(p.health+14,1,100);p.sickDays=4;p.state="Convalescent"});addJournal(`${count} malade${count>1?"s ont":" a"} reçu un remède.`)}},
    {label:"Isoler les malades 2 jours",action:()=>{advanceDate(2);consumeFood(2);patients.forEach(p=>p.sickDays=7);addJournal("Le convoi s’est arrêté pour isoler les malades.")}},
    {label:"Continuer la route",action:()=>{patients.forEach(p=>p.health=clamp(p.health-5,1,100));addJournal("La maladie contagieuse affaiblit le groupe.")}}
  ],"incident-contagious.png");
}

function blanketLossEvent(){
  const loss=Math.min(game.cart.vetements,rand(1,2));game.cart.vetements-=loss;
  const blankets=`${loss} couverture${loss>1?"s":""}`;
  eventModal("Couvertures hors d’usage","Une nuit glaciale et humide détrempe les couvertures les plus exposées.",`${blankets} ${loss===1?"est devenue":"sont devenues"} inutilisable${loss>1?"s":""}.`,[
    {label:"Réorganiser le chargement",action:()=>addJournal(`${blankets} perdue${loss>1?"s":""} pendant une nuit de grand froid.`)}
  ],"incident-blankets.png");
}

function theftEvent(){
  const possible=[
    {key:"money",label:"$",amount:Math.min(game.money,rand(25,70))},
    {key:"vivres",amount:Math.min(game.cart.vivres,rand(25,60))},
    {key:"munitions",amount:Math.min(game.cart.munitions,rand(15,40))},
    {key:"vetements",amount:Math.min(game.cart.vetements,rand(1,2))},
    {key:"pieces",amount:Math.min(game.cart.pieces,1)},
    {key:"medicaments",amount:Math.min(game.cart.medicaments,rand(1,2))},
    {key:"boeufs",amount:Math.min(game.cart.boeufs,1)}
  ].filter(item=>item.amount>0);
  const stolen=pick(possible);
  if(!stolen){eventModal("Tentative de vol","Des traces entourent le camp, mais le chargement est intact.","Les coffres étaient heureusement vides ou bien verrouillés.",[{label:"Redoubler de vigilance",action:()=>addJournal("Une tentative de vol a échoué.")}],"incident-theft.png");return;}
  if(stolen.key==="money")game.money-=stolen.amount;else game.cart[stolen.key]-=stolen.amount;
  const stolenLabel=stolen.key==="money"?`${stolen.amount} $`:itemQuantity(stolen.key,stolen.amount);
  const description=`${stolenLabel} ${stolen.amount===1?"a":"ont"} disparu.`;
  eventModal("Vol au camp","Au lever du jour, un coffre est ouvert et des traces s’éloignent du camp.",description,[
    {label:"Sécuriser le chargement",action:()=>addJournal(`Un vol nous a coûté ${stolenLabel}.`)}
  ],"incident-theft.png");
}

function tradeEvent(){
  const offers=[
    {mode:"buy",key:"vivres",qty:50,price:34,label:"50 kg de vivres"},
    {mode:"buy",key:"munitions",qty:40,price:18,label:"40 balles"},
    {mode:"buy",key:"pieces",qty:1,price:28,label:"1 pièce de rechange"},
    {mode:"buy",key:"medicaments",qty:2,price:30,label:"2 remèdes"},
    {mode:"buy",key:"boeufs",qty:2,price:85,label:"2 bœufs"},
    {mode:"buy",key:"vetements",qty:2,price:24,label:"2 couvertures"},
    {mode:"sell",key:"vivres",qty:40,price:22,label:"40 kg de vivres"},
    {mode:"sell",key:"munitions",qty:30,price:14,label:"30 balles"},
    {mode:"sell",key:"vetements",qty:1,price:14,label:"1 couverture"},
    {mode:"sell",key:"pieces",qty:1,price:20,label:"1 pièce de rechange"},
    {mode:"sell",key:"medicaments",qty:1,price:18,label:"1 remède"}
  ];
  const offer=pick(offers),buying=offer.mode==="buy";
  const canAccept=buying?game.money>=offer.price&&game.cart[offer.key]+offer.qty<=SHOP[offer.key].max:game.cart[offer.key]>=offer.qty;
  const text=buying?`Un marchand vous propose ${offer.label} pour ${offer.price} $.`:`Un voyageur vous offre ${offer.price} $ pour ${offer.label}.`;
  eventModal("Une proposition sur la piste",text,"La quantité et le prix sont fixes. Acceptez-vous l’offre ?",[
    {label:"Accepter",disabled:!canAccept,action:()=>{if(buying){game.money-=offer.price;game.cart[offer.key]+=offer.qty;}else{game.money+=offer.price;game.cart[offer.key]-=offer.qty;}addJournal(`Marché conclu : ${offer.label} pour ${offer.price} $.`)}},
    {label:"Refuser",action:()=>addJournal("Nous avons refusé une proposition commerciale.")}
  ],"incident-trade.png");
}

function attackEvent(){
  eventModal("Attaque du convoi","Les indiens approchent rapidement à cheval et des projectiles frappent autour des chariots.","Mettez le groupe à couvert et tenez jusqu’à leur retrait.",[
    {label:"Protéger le convoi",action:()=>setTimeout(startAttack,0)}
  ],"incident-attack.png");
}

function landmark(mark){
  const art=stageAsset(mark),scene=$("#scene");
  scene.className="scene landmark-scene";scene.style.backgroundImage=`url('assets/${art}')`;
  scene.setAttribute("aria-label",`${mark.name}, par ${weatherVisual().label}`);
  if(mark.kind==="river") riverEvent(mark,art);
  else if(mark.kind==="fort") fortEvent(mark,art);
  else eventModal(mark.name,`Le convoi atteint ${mark.name}.`,"Un repère bienvenu sur l’immensité de la piste.",[{label:"Graver nos noms et repartir",action:()=>{addJournal(`Nous avons atteint ${mark.name}.`);setTrailScene();}}],art);
}

function riverEvent(mark,art=stageAsset(mark)){
  const cost=35+Math.round(mark.depth*15);
  eventModal(mark.name,`Le courant est rapide et l’eau atteint environ ${mark.depth.toFixed(1).replace(".",",")} mètre${mark.depth>=2?"s":""}.`,"Comment ferez-vous traverser le chariot ?",[
    {label:`Prendre le bac (${cost} $)`,disabled:game.money<cost,action:()=>{game.money-=cost;advanceDate(1);const food=consumeFood(1);addJournal(`Traversée de ${mark.name} en bac, sans incident.`);queueRiverOutcome(mark,"ferry",{method:"Bac",days:1,food:food.consumed,text:"Le bac a transporté le chariot et tout le groupe jusqu’à l’autre rive.",result:`Traversée sans perte · Coût : ${cost} $`})}},
    {label:"Calfater et flotter",action:()=>riverRisk(mark)},
    {label:"Attendre que l’eau baisse",action:()=>{advanceDate(3);const food=consumeFood(3);game.oxStrain=clamp(game.oxStrain-2,0,10);addJournal(`Après trois jours d’attente, nous avons traversé ${mark.name} dans une eau plus basse.`);queueRiverOutcome(mark,"wait",{method:"Attente et passage à gué",days:3,food:food.consumed,text:"Le niveau a suffisamment baissé pour permettre un passage prudent.",result:"Traversée réussie sans perte de chargement"})}}
  ],art);
}

function queueRiverOutcome(mark,outcome,data){setTimeout(()=>{if(!game.finished)showRiverOutcome(mark,outcome,data)},0)}

function showRiverOutcome(mark,outcome,{method,days,food,text,result}){
  const art=$("#bilan-riviere-art");art.style.backgroundImage=`url('assets/river-${mark.visual}-${outcome}.png')`;art.setAttribute("aria-label",`${method} à ${mark.name}`);
  $("#titre-bilan-riviere").textContent=`Bilan — ${mark.name}`;$("#bilan-riviere-texte").textContent=text;$("#bilan-riviere-methode").textContent=method;
  $("#bilan-riviere-duree").textContent=`${days} jour${days>1?"s":""}`;$("#bilan-riviere-vivres").textContent=`${Math.round(food)} kg`;$("#bilan-riviere-resultat").textContent=result;
  $("#dialogue-bilan-riviere").showModal();
}

function riverRisk(mark){
  advanceDate(1);const travelFood=consumeFood(1);
  game.oxStrain=clamp(game.oxStrain+1,0,10);
  const risk=clamp(mark.depth*.14+(game.cart.boeufs<4?.1:0)+(game.cart.pieces===0?.05:0),.05,.5);
  if(Math.random()<risk){
    const cargoLosses=[
      {key:"vivres",amount:Math.min(game.cart.vivres,rand(25,70))},
      {key:"munitions",amount:Math.min(game.cart.munitions,rand(5,20))},
      {key:"vetements",amount:Math.random()<.45?Math.min(game.cart.vetements,rand(1,2)):0},
      {key:"pieces",amount:Math.random()<.35?Math.min(game.cart.pieces,1):0},
      {key:"medicaments",amount:Math.random()<.3?Math.min(game.cart.medicaments,rand(1,2)):0}
    ];
    const losses=[];
    for(const loss of cargoLosses){
      if(!loss.amount)continue;
      game.cart[loss.key]-=loss.amount;losses.push(itemQuantity(loss.key,loss.amount));
    }
    const maxOxLoss=Math.max(0,game.cart.boeufs-1);
    const oxLoss=maxOxLoss&&Math.random()<clamp(.18+mark.depth*.12,.2,.45)?Math.min(maxOxLoss,mark.depth>=1.5?rand(1,2):1):0;
    if(oxLoss){game.cart.boeufs-=oxLoss;losses.push(`${oxLoss} bœuf${oxLoss>1?"s":""}`);}
    alive().forEach(p=>p.health=clamp(p.health-rand(2,9),0,100));
    addJournal(losses.length?`Le chariot a pris l’eau à ${mark.name}. Le courant emporte ${losses.join(" et ")}.`:`Le chariot a pris l’eau à ${mark.name}, sans perte de chargement.`);toast("Le courant a secoué le convoi.");
    queueRiverOutcome(mark,"float-accident",{method:"Chariot calfaté",days:1,food:travelFood.consumed,text:"Le chariot a pris l’eau dans le courant avant d’atteindre difficilement l’autre rive.",result:losses.length?`Pertes : ${losses.join(" et ")}`:"Aucune provision perdue, mais le groupe a été éprouvé"});
  } else {addJournal(`Le chariot a traversé ${mark.name} à flot sans incident.`);queueRiverOutcome(mark,"float-success",{method:"Chariot calfaté",days:1,food:travelFood.consumed,text:"Le chariot a flotté jusqu’à l’autre rive sous le contrôle des cordes et des bœufs.",result:"Traversée réussie sans perte de chargement"})}
  setTrailScene();updateDeaths();
}

function fortEvent(mark,art=stageAsset(mark)){
  const price=Math.round(1.3+game.km/KM_TOTAL*.7);
  const foodCost=20*price, ammoCost=6*price, restFood=alive().length*4;
  const equipment=[
    {key:"boeufs",qty:2,cost:60*price,label:"2 bœufs"},
    {key:"vetements",qty:2,cost:22*price,label:"2 couvertures"},
    {key:"pieces",qty:1,cost:28*price,label:"1 pièce de rechange"},
    {key:"medicaments",qty:2,cost:28*price,label:"2 remèdes"}
  ].sort(()=>Math.random()-.5).slice(0,2);
  const actions=[
    {label:`Acheter 50 kg de vivres (${foodCost} $)`,keepOpen:true,disabled:()=>game.money<foodCost,action:()=>{game.money-=foodCost;game.cart.vivres+=50;addJournal(`Ravitaillement à ${mark.name}.`)}},
    {label:`Acheter 40 balles (${ammoCost} $)`,keepOpen:true,disabled:()=>game.money<ammoCost,action:()=>{game.money-=ammoCost;game.cart.munitions+=40;addJournal(`Achat de munitions à ${mark.name}.`)}},
    ...equipment.map(item=>({label:`Acheter ${item.label} (${item.cost} $)`,keepOpen:true,disabled:()=>game.money<item.cost||game.cart[item.key]+item.qty>SHOP[item.key].max,action:()=>{game.money-=item.cost;game.cart[item.key]+=item.qty;addJournal(`Achat de ${item.label} à ${mark.name}.`)}})),
    {label:"Se reposer 2 jours",keepOpen:true,disabled:()=>game.cart.vivres<restFood,action:()=>{advanceDate(2);consumeFood(2,2);game.oxStrain=clamp(game.oxStrain-3,0,10);alive().forEach(p=>p.health=clamp(p.health+8,0,100));addJournal(`Halte réparatrice à ${mark.name}.`)}},
    {label:"Repartir",primary:true,action:()=>addJournal(`Passage à ${mark.name}.`)}
  ];
  eventModal(mark.name,"Palissades, forge et odeur de pain frais : une halte bienvenue.","Le stock d’équipement varie à chaque fort. Vous pouvez effectuer plusieurs achats avant de repartir.",actions,art);
}

function eventModal(title,text,details,actions,art="trail"){
  const d=$("#dialogue-evenement");$("#event-title").textContent=title;$("#event-text").textContent=text;$("#event-details").textContent=details;
  const artFile=art.includes(".")?art:`${art}.webp`;
  $("#event-art").style.backgroundImage=`url('assets/${artFile}')`;
  const box=$("#event-actions");box.innerHTML="";
  const isDisabled=a=>typeof a.disabled==="function"?a.disabled():!!a.disabled;
  const buttons=[];
  actions.forEach((a,i)=>{
    const b=document.createElement("button");b.type="button";b.className=`btn ${a.primary||(!actions.some(item=>item.primary)&&i===0)?"primary":"secondary"}`;b.textContent=a.label;b.disabled=isDisabled(a);
    b.addEventListener("click",()=>{
      if(isDisabled(a))return;
      a.action();updateDeaths();
      if(game.finished||checkJourneyFailure()){d.close();return;}
      updateUI();
      if(a.keepOpen){
        $("#event-details").textContent=`${details} Il vous reste ${money(game.money)}, ${itemQuantity("vivres",Math.round(game.cart.vivres))} et ${itemQuantity("munitions",game.cart.munitions)}.`;
        buttons.forEach(({action,button})=>button.disabled=isDisabled(action));
        return;
      }
      d.close();setTrailScene();returnToTrailTop();
    });
    buttons.push({action:a,button:b});box.appendChild(b);
  });
  if(!d.open)d.showModal();
}

function rest(){
  if(checkJourneyFailure())return;
  if(game.cart.vivres<alive().length*4){toast("Pas assez de vivres pour camper deux jours.");return;}
  advanceDate(2);consumeFood(2,2);game.oxStrain=clamp(game.oxStrain-3,0,10);alive().forEach(p=>{p.health=clamp(p.health+9,0,100);if(p.health>60)p.state="En forme"});addJournal("Deux jours de repos ont remonté le moral du groupe et soulagé l’attelage.");updateUI();returnToTrailTop();
}

function renderTrailMap(){
  const stops=[{km:0,name:"Independence"},...LANDMARKS,{km:KM_TOTAL,name:"Oregon"}],left=45,width=830;
  const x=km=>left+km/KM_TOTAL*width,current=x(game.km);
  return `<section class="map-card" aria-labelledby="titre-carte"><h3 id="titre-carte">Carte de la piste</h3><div class="trail-map-scroll"><svg class="trail-map" viewBox="0 0 920 210" role="img" aria-label="Progression de Independence jusqu’à la vallée de Willamette"><path class="map-route" d="M ${left} 105 H ${left+width}"/><path class="map-progress" d="M ${left} 105 H ${current}"/>${stops.map((stop,i)=>{const px=x(stop.km),top=i%2===0;return `<g><circle class="map-stop" cx="${px}" cy="105" r="5"/><path class="map-tick" d="M ${px} 96 V ${top?70:140}"/><text x="${px}" y="${top?61:157}" text-anchor="middle">${escapeHtml(stop.name)}</text></g>`}).join("")}<g class="map-current"><path d="M ${current} 78 l 10 18 h -20 z"/><text x="${current}" y="72" text-anchor="middle">Vous êtes ici</text></g></svg></div><p>${Math.round(game.km).toLocaleString("fr-FR")} km parcourus · ${Math.max(0,KM_TOTAL-Math.round(game.km)).toLocaleString("fr-FR")} km restants</p></section>`;
}

function showInventory(){
  $("#info-title").textContent="Inventaire du chariot";
  $("#info-content").innerHTML=`<table class="inventory-table"><tbody>${Object.entries(SHOP).map(([k,v])=>`<tr><td>${v.label}</td><td>${game.cart[k]} ${unitLabel(v,game.cart[k])}</td></tr>`).join("")}<tr><td>Argent restant</td><td>${money(game.money)}</td></tr></tbody></table><p>Le chariot transporte aussi vos outils, de la vaisselle et les souvenirs du voyage.</p>`;
  $("#dialogue-info").showModal();
}

function showMap(){
  $("#info-title").textContent="Carte de la piste";
  $("#info-content").innerHTML=renderTrailMap();
  $("#dialogue-info").showModal();
}

function showJournal(){
  $("#info-title").textContent="Journal de bord";
  $("#info-content").innerHTML=`<ol class="journal-list">${game.journal.map(j=>`<li><time>${escapeHtml(j.date)}</time>${escapeHtml(j.text)}</li>`).join("")}</ol>`;$("#dialogue-info").showModal();
}

function showHelp(){
  openGuide("ecran-voyage");
}

function finish(win,message=""){
  game.finished=true;const avg=alive().length?alive().reduce((n,p)=>n+p.health,0)/alive().length:0;
  const score=Math.max(0,Math.round(game.money+game.cart.vivres*2+alive().length*250+avg*10+(game.profession==="fermier"?1200:game.profession==="charpentier"?600:0)));
  game.score=score;
  $("#ecran-fin").classList.toggle("defeat",!win);$("#fin-kicker").textContent=win?"Vallée de Willamette · Oregon":"La piste s’arrête ici";
  $("#titre-fin").textContent=win?"Vous avez atteint l’Oregon":"Le convoi n’ira pas plus loin";
  $("#texte-fin").textContent=message||(win?`${alive().length} voyageur${alive().length>1?"s":""} contemple${alive().length>1?"nt":""} enfin la vallée. Après ${game.days} jours sur la piste, une nouvelle vie commence.`:"La faim, la maladie et la route ont eu raison de votre expédition.");
  $("#rang-fin").textContent=endingRank(score);
  $("#score-fin").textContent=`Score · ${score.toLocaleString("fr-FR")}${win?"":` · Distance · ${Math.round(game.km).toLocaleString("fr-FR")} km`}`;
  $("#journal-fin").innerHTML=game.journal.map(j=>`<li><time>${escapeHtml(j.date)}</time>${escapeHtml(j.text)}</li>`).join("")||"<li>Aucune entrée dans le journal.</li>";
  showScreen("ecran-fin");
}

// Mini-jeu de chasse
const HUNT_SPECIES={
  bison:{size:25,speed:[75,105],loot:[20,28],y:[205,330],hit:.92},
  deer:{size:18,speed:[105,145],loot:[11,17],y:[180,320],hit:.82},
  rabbit:{size:10,speed:[145,205],loot:[3,6],y:[315,370],hit:.72},
  bird:{size:9,speed:[165,230],loot:[2,4],y:[65,175],hit:.7}
};

function huntBackground(){
  const key=weatherVisual().key;
  return {cold:"hunt-cold.png",hot:"hunt-hot.png",rain:"hunt-rain.png",mild:"hunt.webp"}[key];
}

function startHunt(){
  if(game.cart.munitions<=0){toast("Vous n’avez plus de munitions.");return;}
  advanceDate(1);consumeFood(1,2);
  hunt={time:16,loot:0,shots:0,background:huntBackground(),cross:{x:380,y:210},animals:[],last:performance.now(),running:true};
  for(let i=0;i<6;i++)spawnAnimal(i*115);
  const canvas=$("#canvas-chasse");canvas.style.backgroundImage=`url('assets/${hunt.background}')`;
  $("#dialogue-chasse .eyebrow").textContent=regionVisual().title;
  $("#chasse-balles").textContent=game.cart.munitions;$("#chasse-butin").textContent=0;$("#chasse-temps").textContent=16;
  $("#dialogue-chasse").showModal();canvas.focus();requestAnimationFrame(huntLoop);
}

function spawnAnimal(offset=0){
  const species=pick(["bison","deer","rabbit","rabbit","bird","bird"]),cfg=HUNT_SPECIES[species],direction=Math.random()<.25?-1:1;
  hunt.animals.push({species,size:cfg.size,vx:rand(...cfg.speed)*direction,y:rand(...cfg.y),x:direction>0?-60-offset:820+offset,phase:Math.random()*6});
}

function resetAnimal(a){
  const replacement=[];spawnAnimal(rand(40,180));replacement.push(hunt.animals.pop());Object.assign(a,replacement[0]);
}

function huntLoop(now){
  if(!hunt?.running)return;const dt=Math.min(.04,(now-hunt.last)/1000);hunt.last=now;hunt.time-=dt;
  const c=$("#canvas-chasse"),ctx=c.getContext("2d");ctx.clearRect(0,0,c.width,c.height);
  hunt.animals.forEach(a=>{a.x+=a.vx*dt;a.phase+=dt*5;if(a.species==="bird")a.y+=Math.sin(a.phase)*.7;if((a.vx>0&&a.x>c.width+60)||(a.vx<0&&a.x<-60))resetAnimal(a);drawAnimal(ctx,a)});
  ctx.strokeStyle="#f7e4b2";ctx.lineWidth=2;ctx.beginPath();ctx.arc(hunt.cross.x,hunt.cross.y,11,0,Math.PI*2);ctx.moveTo(hunt.cross.x-17,hunt.cross.y);ctx.lineTo(hunt.cross.x+17,hunt.cross.y);ctx.moveTo(hunt.cross.x,hunt.cross.y-17);ctx.lineTo(hunt.cross.x,hunt.cross.y+17);ctx.stroke();
  $("#chasse-temps").textContent=Math.max(0,Math.ceil(hunt.time));
  if(hunt.time<=0||game.cart.munitions<=0||hunt.loot>=90){endHunt();return;}requestAnimationFrame(huntLoop);
}

function drawAnimal(ctx,a){
  const facing=a.vx>=0?1:-1;ctx.save();ctx.translate(a.x,a.y);ctx.scale(facing,1);ctx.fillStyle="#33291d";ctx.strokeStyle="#33291d";ctx.lineWidth=3;
  if(a.species==="bird"){
    ctx.beginPath();ctx.moveTo(-a.size*1.5,0);ctx.quadraticCurveTo(-a.size*.4,-a.size,a.size*.15,0);ctx.quadraticCurveTo(a.size*.8,-a.size,a.size*1.5,0);ctx.quadraticCurveTo(a.size*.5,-a.size*.25,0,a.size*.3);ctx.closePath();ctx.fill();
  }else if(a.species==="rabbit"){
    ctx.beginPath();ctx.ellipse(0,0,a.size*1.15,a.size*.65,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(a.size*.9,-a.size*.45,a.size*.42,0,Math.PI*2);ctx.fill();ctx.fillRect(a.size*.75,-a.size*1.5,3,a.size);ctx.fillRect(a.size*1.05,-a.size*1.55,3,a.size);
  }else{
    ctx.beginPath();ctx.ellipse(0,0,a.size*1.2,a.size*.65,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(a.size,-a.size*.25,a.size*.38,0,Math.PI*2);ctx.fill();ctx.fillRect(-a.size*.7,a.size*.25,4,a.size*.9);ctx.fillRect(a.size*.55,a.size*.25,4,a.size*.9);
    if(a.species==="deer"){ctx.beginPath();ctx.moveTo(a.size*1.05,-a.size*.55);ctx.lineTo(a.size*1.25,-a.size*1.1);ctx.moveTo(a.size*.9,-a.size*.55);ctx.lineTo(a.size*.8,-a.size*1.05);ctx.stroke();}
  }
  ctx.restore();
}

function aimHuntAt(event){
  if(!hunt)return;const canvas=$("#canvas-chasse"),rect=canvas.getBoundingClientRect();
  hunt.cross={x:(event.clientX-rect.left)*canvas.width/rect.width,y:(event.clientY-rect.top)*canvas.height/rect.height};
}

function shoot(touchAssist=false){
  if(!hunt?.running||game.cart.munitions<=0)return;hunt.shots++;game.cart.munitions--;
  const hit=hunt.animals.find(a=>Math.hypot(a.x-hunt.cross.x,a.y-hunt.cross.y)<a.size*HUNT_SPECIES[a.species].hit+(touchAssist?14:0));
  if(hit){const range=HUNT_SPECIES[hit.species].loot,gain=Math.min(90-hunt.loot,rand(...range));hunt.loot+=gain;resetAnimal(hit);toast(`Touché : +${gain} kg`)}
  $("#chasse-balles").textContent=game.cart.munitions;$("#chasse-butin").textContent=hunt.loot;
  if(hunt.loot>=90)endHunt();
}

function endHunt(){
  if(!hunt?.running)return;
  const result={shots:hunt.shots,remaining:game.cart.munitions,loot:hunt.loot,background:hunt.background};hunt.running=false;game.cart.vivres+=result.loot;
  addJournal(result.loot?`La chasse rapporte ${result.loot} kg de viande pour ${result.shots} balle${result.shots>1?"s":""} tirée${result.shots>1?"s":""}.`:"La chasse ne rapporte rien cette fois.");
  $("#dialogue-chasse").close();updateUI();hunt=null;
  $("#dialogue-bilan-chasse .hunt-result-art").style.backgroundImage=`url('assets/${result.background}')`;
  $("#bilan-balles-tirees").textContent=result.shots;$("#bilan-balles-restantes").textContent=result.remaining;$("#bilan-viande").textContent=result.loot;
  $("#dialogue-bilan-chasse").showModal();
}

// Mini-jeu d'attaque : esquive et mise à couvert, sans tir.
function startAttack(){
  if(game.finished||!alive().length)return;
  attack={time:15,hits:0,x:330,projectiles:[],spawnIn:.3,last:performance.now(),running:true};
  $("#attaque-temps").textContent=15;$("#attaque-impacts").textContent=0;
  $("#dialogue-attaque").showModal();$("#canvas-attaque").focus();requestAnimationFrame(attackLoop);
}

function moveAttack(direction){if(attack?.running)attack.x=clamp(attack.x+direction*42,20,640);}

function attackLoop(now){
  if(!attack?.running)return;const dt=Math.min(.04,(now-attack.last)/1000);attack.last=now;attack.time-=dt;attack.spawnIn-=dt;
  const c=$("#canvas-attaque"),ctx=c.getContext("2d");ctx.clearRect(0,0,c.width,c.height);
  if(attack.spawnIn<=0){attack.projectiles.push({x:rand(20,740),y:-20,vx:rand(-35,35),vy:rand(180,260)});attack.spawnIn=Math.max(.16,.52-(15-attack.time)*.018);}
  ctx.strokeStyle="#ead8ad";ctx.lineWidth=3;
  attack.projectiles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*.06,p.y-18);ctx.stroke();if(!p.hit&&p.y>345&&p.y<410&&p.x>attack.x&&p.x<attack.x+100){p.hit=true;attack.hits++;$("#attaque-impacts").textContent=attack.hits;}});
  attack.projectiles=attack.projectiles.filter(p=>p.y<440&&!p.hit);
  ctx.fillStyle="#3b2a1d";ctx.fillRect(attack.x,360,100,35);ctx.fillStyle="#e6d7b3";ctx.beginPath();ctx.arc(attack.x+50,360,42,Math.PI,0);ctx.fill();ctx.strokeStyle="#3b2a1d";ctx.beginPath();ctx.arc(attack.x+20,398,15,0,Math.PI*2);ctx.arc(attack.x+80,398,15,0,Math.PI*2);ctx.stroke();
  $("#attaque-temps").textContent=Math.max(0,Math.ceil(attack.time));
  if(attack.time<=0){endAttack();return;}requestAnimationFrame(attackLoop);
}

function endAttack(){
  if(!attack?.running)return;const hits=attack.hits;attack.running=false;$("#dialogue-attaque").close();attack=null;
  const candidates=[...alive()].sort(()=>Math.random()-.5),affected=Math.min(candidates.length,Math.ceil(hits/2)),wounded=[],dead=[];
  for(const p of candidates.slice(0,affected)){
    const lethalChance=Math.max(0,(hits-4)*.07);
    if(dead.length===0&&Math.random()<lethalChance){p.health=0;p.alive=false;p.state="Décédé";dead.push(p);}
    else{p.health=clamp(p.health-rand(18,32)-Math.floor(hits/3),1,100);p.state="Blessé";p.needsRemedy=true;wounded.push(p);}
  }
  attackOutcome={hits,wounded,dead};showAttackOutcome();
}

function showAttackOutcome(){
  const {hits,wounded,dead}=attackOutcome;$("#bilan-attaque-impacts").textContent=hits;$("#bilan-attaque-blesses").textContent=wounded.length;$("#bilan-attaque-deces").textContent=dead.length;
  const entries=[...wounded.map(p=>`<li><b>${escapeHtml(p.name)}</b><span>${injuryCondition(p.health)}</span></li>`),...dead.map(p=>`<li><b>${escapeHtml(p.name)}</b><span>Décédé</span></li>`)];
  $("#bilan-attaque-liste").innerHTML=entries.length?entries.join(""):"<li><b>Aucune victime</b><span>Le convoi a tenu bon.</span></li>";
  const untreated=wounded.filter(p=>p.needsRemedy).length,usable=Math.min(untreated,game.cart.medicaments);
  $("#soigner-attaque").disabled=usable===0;
  $("#soigner-attaque").textContent=untreated===0?"Aucun remède nécessaire":usable?`Utiliser ${usable} remède${usable>1?"s":""}`:"Aucun remède disponible";
  if(!$("#dialogue-bilan-attaque").open)$("#dialogue-bilan-attaque").showModal();
}

function treatAttackWounds(){
  if(!attackOutcome)return;const patients=attackOutcome.wounded.filter(p=>p.needsRemedy).slice(0,game.cart.medicaments);
  for(const p of patients){game.cart.medicaments--;p.health=clamp(p.health+24,1,100);p.needsRemedy=false;p.state="Convalescent";}
  showAttackOutcome();
}

function continueAfterAttack(){
  if(!attackOutcome)return;const {hits,wounded,dead}=attackOutcome;$("#dialogue-bilan-attaque").close();
  addJournal(`L’attaque se termine après ${hits} impact${hits>1?"s":""} : ${wounded.length} blessé${wounded.length>1?"s":""}, ${dead.length} mort${dead.length>1?"s":""}.`);attackOutcome=null;
  if(!alive().length){finish(false,"Aucun membre du convoi n’a survécu à l’attaque.");return;}updateUI();returnToTrailTop();
}

function bindEvents(){
  $("#nouvelle-partie").addEventListener("click",()=>showScreen("ecran-groupe"));
  $("#guide-accueil").addEventListener("click",()=>openGuide("ecran-accueil"));
  $("#guide-boutique").addEventListener("click",()=>openGuide("ecran-boutique"));
  $("#retour-aide").addEventListener("click",()=>showScreen(helpReturnScreen));
  $("#form-groupe").addEventListener("submit",e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const names=[0,1,2,3,4].map(i=>String(fd.get(`nom${i}`)).trim());if(names.some(name=>!name)){toast("Donnez un nom à chaque voyageur.");return;}game=baseGame(names,fd.get("profession"),fd.get("mois"));cart=Object.fromEntries(Object.entries(SHOP).map(([k,v])=>[k,v.start]));renderShop();showScreen("ecran-boutique")});
  $("#liste-boutique").addEventListener("click",e=>{const b=e.target.closest("[data-shop]");if(b)changeCart(b.dataset.shop,Number(b.dataset.dir))});
  $("#retour-groupe").addEventListener("click",()=>showScreen("ecran-groupe"));$("#partir").addEventListener("click",leaveTown);
  $("#rythme").addEventListener("change",e=>{game.pace=e.target.value;$("#rythme-effet").textContent=PACES[game.pace].hint});$("#rations").addEventListener("change",e=>game.rations=e.target.value);
  $("#avancer").addEventListener("click",travel);$("#repos").addEventListener("click",rest);$("#chasser").addEventListener("click",startHunt);$("#carte-btn").addEventListener("click",showMap);$("#inventaire-btn").addEventListener("click",showInventory);$("#journal-plus").addEventListener("click",showJournal);$("#aide").addEventListener("click",showHelp);
  $("#rejouer").addEventListener("click",()=>{game=null;showScreen("ecran-groupe")});$("#fermer-chasse").addEventListener("click",endHunt);
  $("#dialogue-evenement").addEventListener("cancel",e=>e.preventDefault());
  $("#dialogue-chasse").addEventListener("cancel",e=>{e.preventDefault();endHunt()});
  $("#dialogue-attaque").addEventListener("cancel",e=>e.preventDefault());$("#dialogue-bilan-attaque").addEventListener("cancel",e=>e.preventDefault());
  ["#dialogue-evenement","#dialogue-bilan-chasse","#dialogue-bilan-riviere"].forEach(selector=>$(selector).addEventListener("close",returnToTrailTop));
  $("#attaque-gauche").addEventListener("click",()=>moveAttack(-1));$("#attaque-droite").addEventListener("click",()=>moveAttack(1));$("#soigner-attaque").addEventListener("click",treatAttackWounds);$("#continuer-attaque").addEventListener("click",continueAfterAttack);
  const canvas=$("#canvas-chasse");canvas.addEventListener("pointermove",e=>{if(e.pointerType==="mouse")aimHuntAt(e)});canvas.addEventListener("pointerdown",e=>{if(!e.isPrimary||!hunt)return;e.preventDefault();aimHuntAt(e);shoot(e.pointerType!=="mouse")});canvas.addEventListener("keydown",e=>{if(!hunt)return;const step=18;if(e.key==="ArrowLeft")hunt.cross.x-=step;if(e.key==="ArrowRight")hunt.cross.x+=step;if(e.key==="ArrowUp")hunt.cross.y-=step;if(e.key==="ArrowDown")hunt.cross.y+=step;if(e.code==="Space"){e.preventDefault();shoot()}hunt.cross.x=clamp(hunt.cross.x,0,canvas.width);hunt.cross.y=clamp(hunt.cross.y,0,canvas.height)});
  $("#canvas-attaque").addEventListener("keydown",e=>{if(e.key==="ArrowLeft"){e.preventDefault();moveAttack(-1)}if(e.key==="ArrowRight"){e.preventDefault();moveAttack(1)}});
  document.addEventListener("keydown",e=>{
    const typing=e.target.matches?.("input, textarea, select, [contenteditable='true']");
    if(e.key!=="&"||typing||!game||game.finished||!$("#ecran-voyage").classList.contains("active")||$("dialog[open]")||hunt||attack)return;
    e.preventDefault();attackEvent();
  });
}

bindEvents();
