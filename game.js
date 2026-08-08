"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const KM_TOTAL = 3200;
const MONTHS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
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
  boeufs: { label:"Bœufs", desc:"Une paire coûte 40 $. Il en faut au moins quatre.", unit:"bête", plural:"bêtes", unitEn:"ox", pluralEn:"oxen", step:2, price:40, max:12, start:6 },
  vivres: { label:"Vivres", desc:"Farine, lard, café et haricots. Prix pour 10 kg.", unit:"kg", plural:"kg", unitEn:"kg", pluralEn:"kg", step:10, price:4, max:800, start:500 },
  munitions: { label:"Munitions", desc:"Boîtes de 20 balles pour la chasse.", unit:"balle", plural:"balles", unitEn:"bullet", pluralEn:"bullets", step:20, price:3, max:600, start:160 },
  vetements: { label:"Couvertures", desc:"Gardent les voyageurs au chaud et au sec.", unit:"couverture", plural:"couvertures", unitEn:"blanket", pluralEn:"blankets", step:1, price:10, max:15, start:5 },
  pieces: { label:"Pièces de rechange", desc:"Roues, essieux et timons pour les avaries.", unit:"pièce", plural:"pièces", unitEn:"spare part", pluralEn:"spare parts", step:1, price:18, max:12, start:3 },
  medicaments: { label:"Remèdes", desc:"Bandages et fortifiants pour soigner le groupe.", unit:"dose", plural:"doses", unitEn:"dose", pluralEn:"doses", step:1, price:12, max:15, start:4 }
};

const LANDMARKS = [
  {km:165,name:"Rivière Kansas",kind:"river",baseDepth:0.8,seasonalFlow:.75,weatherResponse:1.15,visual:"kansas"},
  {km:490,name:"Fort Kearny",kind:"fort",visual:"fort-kearny"},
  {km:980,name:"Chimney Rock",kind:"landmark",visual:"chimney-rock"},
  {km:1240,name:"Fort Laramie",kind:"fort",visual:"fort-laramie"},
  {km:1510,name:"Independence Rock",kind:"landmark",visual:"independence-rock"},
  {km:1810,name:"South Pass",kind:"landmark",visual:"south-pass"},
  {km:2320,name:"Rivière Snake",kind:"river",baseDepth:1.6,seasonalFlow:1.1,weatherResponse:.9,visual:"snake"},
  {km:2580,name:"Fort Boise",kind:"fort",visual:"fort-boise"},
  {km:2920,name:"The Dalles",kind:"river",baseDepth:2.1,seasonalFlow:1.25,weatherResponse:1,visual:"dalles"}
];
const FINAL_STAGE = {km:KM_TOTAL,name:"Vallée de Willamette",visual:"willamette"};

const WEATHER = [
  {name:"Doux",temp:18,cls:""},{name:"Chaud",temp:31,cls:""},{name:"Pluvieux",temp:13,cls:"rain"},
  {name:"Froid",temp:4,cls:""},{name:"Neige",temp:-4,cls:"snow"}
];
const PACES = {
  prudent:{km:65,health:1,food:.8,incident:.38,strain:-1},
  soutenu:{km:90,health:-1,food:1,incident:.62,strain:1},
  epuisant:{km:115,health:-7,food:1.45,incident:.92,strain:3}
};
const MONTHLY_WEATHER = [
  [3,4,4],       // janvier
  [3,3,4,2],     // février
  [3,3,4,2,0],   // mars
  [0,0,2,3],     // avril
  [0,0,0,2,1],   // mai
  [0,0,1,1,2],   // juin
  [1,1,1,0,2],   // juillet
  [1,1,0,0,2],   // août
  [0,0,1,2,3],   // septembre
  [0,0,2,3,3],   // octobre
  [3,3,4,2],     // novembre
  [3,4,4,2]      // décembre
];
// Fonte printanière, étiage estival et réaction aux conditions des derniers jours.
const RIVER_SEASON_LEVEL = [-.15,-.1,.05,.25,.4,.3,.05,-.2,-.25,-.1,-.05,-.1];
const RIVER_WEATHER_LEVEL = {Doux:0,Chaud:-.18,Pluvieux:.35,Froid:-.1,Neige:-.15};

let game = null;
let cart = Object.fromEntries(Object.entries(SHOP).map(([k,v]) => [k,v.start]));
let hunt = null;
let attack = null;
let attackOutcome = null;
let activeEventModal = null;
let activeRiverOutcome = null;
let activeInfoView = null;
let helpReturnScreen = "ecran-accueil";

function baseGame(names, profession, month) {
  const money = {fermier:800,charpentier:1000,banquier:1600}[profession];
  return {
    version:1, profession, money, initialMoney:money, cart:{...cart},
    party:names.map(name => ({name,health:100,state:"En forme",alive:true,sickDays:0})),
    day:1, month:Number(month), year:1848, km:0, days:0, pace:"soutenu", rations:"normales",
    weather:WEATHER[0], landmarkIndex:0, oxStrain:0, lastEvent:null, journal:[], finished:false, score:0
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

function formatDate(day=game.day,month=game.month,year=game.year) { return currentLanguage==="en"?`${MONTHS_EN[month]} ${day}, ${year}`:`${day} ${MONTHS[month]} ${year}`; }
function landmarkName(mark){return languageText(mark.name)}
function alive() { return game.party.filter(p => p.alive); }
function rand(min,max) { return Math.floor(Math.random()*(max-min+1))+min; }
function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function joinList(items,language=currentLanguage) {
  if(items.length<2)return items[0]??"";
  return `${items.slice(0,-1).join(", ")} ${language==="en"?"and":"et"} ${items.at(-1)}`;
}
function shuffled(arr) {
  const result=[...arr];
  for(let i=result.length-1;i>0;i--){const j=rand(0,i);[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
function clamp(v,min,max) { return Math.max(min,Math.min(max,v)); }
function money(n) { const amount=Math.max(0,Math.round(n)).toLocaleString(currentLocale());return currentLanguage==="en"?`$${amount}`:`${amount} $`; }
// Dans l'interface du jeu, zéro conserve le singulier : « 0 pièce ».
function unitLabelFor(item,quantity,language=currentLanguage) { return language==="en"?(quantity<=1?item.unitEn:item.pluralEn):quantity<=1?item.unit:item.plural; }
function unitLabel(item,quantity) { return unitLabelFor(item,quantity); }
function itemQuantityFor(key,quantity,language=currentLanguage) {
  const quantityText=`${quantity} ${unitLabelFor(SHOP[key],quantity,language)}`;
  if(key==="vivres")return language==="en"?`${quantityText} of food`:`${quantityText} de vivres`;
  return language==="en"&&key==="medicaments"?`${quantityText} of medicine`:quantityText;
}
function itemQuantity(key,quantity) { return itemQuantityFor(key,quantity); }
function endingRank(score) { return languageText(ENDING_RANKS[Math.min(ENDING_RANKS.length-1,Math.floor(Math.max(0,score)/250))]); }
function remedyLabel(availableLabel,required=1) {
  if(game.cart.medicaments>=required)return availableLabel;
  if(game.cart.medicaments===0)return "Aucun remède disponible";
  return bilingual(`${required} remèdes nécessaires · ${game.cart.medicaments} disponible`,`${required} doses needed · ${game.cart.medicaments} available`);
}
function dailyFoodPerPerson() { return {copieuses:2,normales:1.5,maigres:1}[game.rations]; }
function consumeFood(days,perPerson=dailyFoodPerPerson()) {
  const needed=perPerson*alive().length*days,consumed=Math.min(game.cart.vivres,needed);
  game.cart.vivres-=consumed;return {needed,consumed,missing:needed-consumed};
}
function applyFoodShortage(food,days) {
  if(food.missing<=0||food.needed<=0)return 0;
  const penalty=Math.max(1,Math.ceil(8*days*food.missing/food.needed));
  alive().forEach(p=>p.health=clamp(p.health-penalty,0,100));
  addJournal(bilingual(`Les vivres n’ont pas suffi pendant ${days} jour${days>1?"s":""}. La faim a affaibli le groupe.`,`Food ran short for ${days} day${days===1?"":"s"}. Hunger weakened the party.`));
  return penalty;
}
function consumeDelay(days,perPerson=dailyFoodPerPerson(),refreshWeather=true) {
  advanceDate(days);const food=consumeFood(days,perPerson);applyFoodShortage(food,days);
  if(refreshWeather)game.weather=weatherForSeason();
  return food;
}
function loadFood(amount){
  const loaded=Math.max(0,Math.min(amount,SHOP.vivres.max-game.cart.vivres));
  game.cart.vivres+=loaded;return loaded;
}
function travelWeatherFactor(weather) { return {Doux:1,Chaud:.85,Pluvieux:.8,Froid:.9,Neige:.65}[weather.name]??1; }
function formatDepth(depth) { return depth.toFixed(1).replace(".",currentLanguage==="en"?".":","); }
function riverDepth(mark,previous=null) {
  const seasonal=RIVER_SEASON_LEVEL[game.month]*(mark.seasonalFlow??1);
  const weather=(RIVER_WEATHER_LEVEL[game.weather.name]??0)*(mark.weatherResponse??1);
  const localVariation=rand(-22,22)/100;
  const expected=mark.baseDepth+seasonal+weather+localVariation;
  // Après une attente, le niveau conserve une part d'inertie tout en restant imprévisible.
  const measured=previous===null?expected:previous*.55+expected*.45+rand(-16,16)/100;
  return clamp(measured,.3,3.4);
}

function checkJourneyFailure() {
  if(game.finished)return true;
  if(game.cart.boeufs<=0){
    finish(false,"Le dernier bœuf ne peut plus tirer. Sans attelage, le chariot reste abandonné sur la piste.");
    return true;
  }
  return false;
}

function toast(text) {
  const el=$("#toast"); el.textContent=languageText(text); el.classList.add("show");
  clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove("show"),2600);
}

function addJournal(text) {
  game.journal.unshift({day:game.day,month:game.month,year:game.year,text});
}

function journalDate(entry){return formatDate(entry.day,entry.month,entry.year)}
function journalItems(entries){return entries.map(j=>`<li><time>${escapeHtml(journalDate(j))}</time>${escapeHtml(languageText(j.text))}</li>`).join("")}

function advanceDate(days) {
  for(let i=0;i<days;i++){
    game.day++; game.days++;
    const lengths=[31,(game.year%4===0?29:28),31,30,31,30,31,31,30,31,30,31];
    if(game.day>lengths[game.month]){game.day=1;game.month++;if(game.month>11){game.month=0;game.year++;}}
    for(const p of alive()){
      if(p.sickDays<=0)continue;
      p.sickDays--;p.health=clamp(p.health-1,0,100);
      if(p.sickDays<=0)p.state="En forme";
    }
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

function fortArrivalAsset(fort,weather=weatherVisual()) {
  return `arrival-${fort.visual}-${weather.key}.webp`;
}

function showLandmarkArt(mark,art,weather=weatherVisual()) {
  const scene=$("#scene");scene.className="scene landmark-scene";scene.style.backgroundImage=`url('assets/${art}')`;
  scene.setAttribute("aria-label",mark.kind==="fort"?(currentLanguage==="en"?`Arriving at the gate of ${landmarkName(mark)}, in ${languageText(weather.label)}`:`Arrivée à la porte de ${mark.name}, par ${weather.label}`):(currentLanguage==="en"?`${landmarkName(mark)}, in ${languageText(weather.label)}`:`${mark.name}, par ${weather.label}`));
}

function refreshFortArrivalArt(mark) {
  const weather=weatherVisual(),art=fortArrivalAsset(mark,weather);showLandmarkArt(mark,art,weather);
  $("#event-art").style.backgroundImage=`url('assets/${art}')`;
}

function setTrailScene() {
  const weather=weatherVisual(),stage=currentStage(),scene=$("#scene");
  scene.className=`scene trail-scene stage-scene weather-${weather.key}`;
  scene.style.backgroundImage=`url('assets/${stageAsset(stage,weather)}')`;
  scene.setAttribute("aria-label",currentLanguage==="en"?`The wagon travels toward ${landmarkName(stage)} in ${languageText(weather.label)}`:`Le chariot avance vers ${stage.name}, par ${weather.label}`);
}

function updateUI() {
  if(!game)return;
  $("#date").textContent=formatDate();
  $("#distance-label").textContent=`${Math.round(game.km).toLocaleString(currentLocale())} / ${KM_TOTAL.toLocaleString(currentLocale())} km`;
  $("#barre-progression").style.width=`${clamp(game.km/KM_TOTAL*100,0,100)}%`;
  $("#stat-vivres").textContent=`${Math.round(game.cart.vivres)} kg`;
  $("#stat-argent").textContent=money(game.money);
  $("#stat-munitions").textContent=game.cart.munitions;
  $("#stat-pieces").textContent=game.cart.pieces;
  $("#stat-boeufs").textContent=game.cart.boeufs;
  $("#stat-vetements").textContent=game.cart.vetements;
  $("#rythme").value=game.pace; $("#rations").value=game.rations;
  const avg=alive().length ? alive().reduce((n,p)=>n+p.health,0)/alive().length : 0;
  const [global,cls]=healthLabel(avg); $("#sante-globale").textContent=languageText(global); $("#sante-globale").className=`status ${cls}`;
  $("#liste-groupe").innerHTML=game.party.map(p=>{const [label,c]=healthLabel(p.health),state=p.state!=="En forme"?p.state:label;return `<li><span class="health-dot ${c}" aria-hidden="true"></span><b>${escapeHtml(p.name)}</b><span class="party-state">${escapeHtml(languageText(p.alive?state:label))}</span></li>`}).join("");
  $("#journal").innerHTML=journalItems(game.journal.slice(0,4));
  const next=LANDMARKS.find(l=>l.km>game.km);
  $("#lieu").textContent=next?`${landmarkName(next)} · ${Math.max(0,Math.round(next.km-game.km))} km`:languageText("Vallée de Willamette");
  $("#meteo").textContent=`${languageText(game.weather.name)} · ${game.weather.temp} °C`;
  $("#meteo-scene").className=`weather ${game.weather.cls}`;
  if(!$("#scene").matches(".landmark-scene"))setTrailScene();
  $("#titre-etape").textContent=currentLanguage==="en"?`Heading toward ${landmarkName(currentStage())}`:`En route vers ${currentStage().name}`;
}

function escapeHtml(str){const d=document.createElement("div");d.textContent=String(str);return d.innerHTML;}

function renderShop() {
  const spent=Object.entries(cart).reduce((sum,[k,q])=>sum+q/SHOP[k].step*SHOP[k].price,0);
  $("#argent-boutique").textContent=money(game.initialMoney-spent);
  $("#liste-boutique").innerHTML=Object.entries(SHOP).map(([key,item])=>{const canRemove=cart[key]>=item.step,canAdd=cart[key]+item.step<=item.max&&spent+item.price<=game.initialMoney;return `
    <article class="shop-item panel"><h3>${languageText(item.label)}</h3><b>${money(item.price)} / ${item.step} ${unitLabel(item,item.step)}</b><p>${languageText(item.desc)}</p>
    <div class="stepper"><button type="button" data-shop="${key}" data-dir="-1" aria-label="${currentLanguage==="en"?"Remove":"Retirer"} ${languageText(item.label)}" ${canRemove?"":"disabled"}>−</button><output>${cart[key]} ${unitLabel(item,cart[key])}</output><button type="button" data-shop="${key}" data-dir="1" aria-label="${currentLanguage==="en"?"Add":"Ajouter"} ${languageText(item.label)}" ${canAdd?"":"disabled"}>+</button></div></article>`}).join("");
  const notes=[];if(cart.boeufs<4)notes.push("Il faut au moins 4 bœufs.");if(cart.vivres<400)notes.push("Prévoyez environ 400 kg de vivres.");if(cart.munitions<100)notes.push("Prévoyez au moins 100 balles pour la chasse.");
  $("#conseils-boutique").innerHTML=notes.length?notes.map(n=>`<div>⚠ ${languageText(n)}</div>`).join(""):languageText("Votre chargement semble prêt pour la piste.");
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

function dailyIncidentChance(pace,weather){
  const weatherRisk={Doux:0,Chaud:.04,Pluvieux:.08,Froid:.04,Neige:.1}[weather.name]||0;
  const equipmentRisk=(game.cart.pieces===0?.07:0)+(game.cart.boeufs<4?.06:0)+((weather.temp<=5||weather.name==="Pluvieux")&&game.cart.vetements<alive().length?.05:0);
  const journeyChance=clamp(pace.incident+weatherRisk+equipmentRisk+game.oxStrain*.012,.24,.97);
  return 1-Math.pow(1-journeyChance,1/5);
}

function dailyIncidentOccurs(pace,weather){return Math.random()<dailyIncidentChance(pace,weather)}

function addTravelJournal(distance,days,weather=game.weather){
  const paceJournal=game.pace==="epuisant"?" Le rythme épuisant a durement éprouvé le convoi.":"";
  const paceJournalEn=game.pace==="epuisant"?" The grueling pace severely tested the wagon party.":"";
  addJournal(bilingual(`${distance} km parcourus en ${days} jour${days>1?"s":""}.${paceJournal} Temps ${weather.name.toLowerCase()} en fin d’étape.`,`${distance} km traveled in ${days} day${days===1?"":"s"}.${paceJournalEn} ${languageText(weather.name,"en")} weather at the end of the leg.`));
}

function travel(){
  if(game.finished)return;
  if(checkJourneyFailure())return;
  if(game.cart.vivres<=0){ resolveStarvation(); return; }
  const pace=PACES[game.pace];
  let distance=0,foodConsumed=0,travelDays=0,lastTravelWeather=game.weather;
  for(let day=0;day<5;day++){
    if(game.cart.vivres<=0){
      if(travelDays)addTravelJournal(distance,travelDays,lastTravelWeather);
      resolveStarvation();updateUI();return;
    }
    const travelWeather=game.weather,oxFactor=clamp(.45+game.cart.boeufs*.075,.5,1.35);lastTravelWeather=travelWeather;
    const plannedDistance=Math.max(1,Math.round(pace.km/5*oxFactor*travelWeatherFactor(travelWeather)));
    const next=LANDMARKS[game.landmarkIndex];
    const remainingToStop=Math.min(next?next.km-game.km:Infinity,KM_TOTAL-game.km);
    const dayDistance=Math.max(0,Math.min(plannedDistance,remainingToStop));
    game.km+=dayDistance;distance+=dayDistance;advanceDate(1);travelDays++;
    const food=consumeFood(1,dailyFoodPerPerson()*pace.food),foodShortage=food.missing>0;
    foodConsumed+=food.consumed;game.oxStrain=clamp((game.oxStrain||0)+pace.strain/5+Math.max(0,6-game.cart.boeufs)*.04,0,10);
    for(const p of alive()){
      const rationHealth={copieuses:1,normales:-1,maigres:-5}[game.rations];
      const coldPenalty=travelWeather.temp<=5&&game.cart.vetements<alive().length?(travelWeather.temp<0?-6:-3):0;
      const rainPenalty=travelWeather.name==="Pluvieux"&&game.cart.vetements<alive().length?-2:0;
      const heatPenalty=travelWeather.temp>=27?-2:0;
      const strainPenalty=game.oxStrain>=7?-2:game.oxStrain>=4?-1:0;
      const starvationPenalty=foodShortage?Math.max(1,Math.ceil(8*food.missing/food.needed)):0;
      p.health=clamp(p.health+(pace.health+rationHealth+coldPenalty+rainPenalty+heatPenalty+strainPenalty)/5-starvationPenalty,0,100);
    }
    updateDeaths();
    if(game.finished)return;
    if(game.km>=KM_TOTAL){addTravelJournal(distance,travelDays,lastTravelWeather);finish(true);return;}
    if(next&&game.km>=next.km){addTravelJournal(distance,travelDays,lastTravelWeather);game.landmarkIndex++;landmark(next);updateUI();return;}
    if(dailyIncidentOccurs(pace,travelWeather)){addTravelJournal(distance,travelDays,lastTravelWeather);randomEvent();updateUI();return;}
    game.weather=weatherForSeason();
  }
  addTravelJournal(distance,travelDays,lastTravelWeather);quietTravelEvent(distance,Math.round(foodConsumed),travelDays);updateUI();
}

function quietTravelEvent(distance,foodConsumed,travelDays=5){
  const paceText={prudent:"L’allure prudente a ménagé le groupe et l’attelage.",soutenu:"L’allure soutenue a laissé une fatigue ordinaire.",epuisant:"Même sans accident, l’allure épuisante a durement éprouvé le groupe et les bœufs."}[game.pace];
  const paceTextEn={prudent:"The steady pace spared the party and the oxen.",soutenu:"The strenuous pace caused ordinary fatigue.",epuisant:"Even without an accident, the grueling pace severely tested the party and the oxen."}[game.pace];
  eventModal("Une étape sans incident",bilingual(`Le convoi a avancé de ${distance} km en ${travelDays} jour${travelDays>1?"s":""}.`,`The wagon party traveled ${distance} km in ${travelDays} day${travelDays===1?"":"s"}.`),bilingual(`${foodConsumed} kg de vivres ${foodConsumed<=1?"a été consommé":"ont été consommés"}. ${paceText}`,`${foodConsumed} kg of food ${foodConsumed===1?"was":"were"} consumed. ${paceTextEn}`),[
    {label:"Poursuivre la route",action:()=>addJournal("Une étape calme et sans incident.")}
  ],stageAsset());
}

function weatherForSeason(){
  return WEATHER[pick(MONTHLY_WEATHER[game.month])];
}

function resolveStarvation(){
  for(const p of alive())p.health=clamp(p.health-18,0,100);
  advanceDate(3);game.weather=weatherForSeason();addJournal("Les vivres sont épuisés. La faim affaiblit tout le monde.");updateDeaths();
  if(game.finished)return;
  updateUI();randomEvent();
}

function updateDeaths(){
  const dying=shuffled(alive().filter(p=>p.health<=0));
  const deaths=dying.slice(0,1);
  for(const p of deaths){
    p.alive=false;p.state="Décédé";addJournal(bilingual(`${p.name} est mort sur la piste.`,`${p.name} died on the trail.`));
  }
  // Une même étape peut affaiblir tout le groupe, mais ne doit pas tuer
  // plusieurs voyageurs simultanément. Les autres restent en état critique.
  for(const p of dying.slice(1)){
    p.health=1;p.state="Très faible";
  }
  if(alive().length===0)finish(false,"La piste a eu raison de tout le convoi.");
}

function eventEligibleTravelers(){return alive().filter(p=>p.sickDays<=0&&!p.needsRemedy)}
function taggedEvent(id,run){run.eventId=id;return run}

function eventPool(){
  if(game.finished||!alive().length)return [];
  const patients=eventEligibleTravelers();
  const wagonEvent=taggedEvent("wagon",()=>{
      const loss=Math.min(game.cart.vivres,rand(12,35));game.cart.vivres-=loss;
      const lossText=loss>0?`${loss} kg de vivres ${loss===1?"est perdu":"sont perdus"}.`:"Les réserves de vivres étaient déjà vides : rien n’a pu être perdu.";
      const lossTextEn=loss>0?`${loss} kg of food ${loss===1?"is":"are"} lost.`:"The food stores were already empty: nothing could be lost.";
      eventModal(bilingual("Mauvaise piste","Rough trail"),bilingual(`Le chariot s’est renversé dans une ornière. ${lossText}`,`The wagon overturned in a rut. ${lossTextEn}`),bilingual("Une journée sera nécessaire pour tout remettre en ordre.","One day will be needed to put everything back in order."),[
        {label:"Réparer et repartir",action:()=>{consumeDelay(1);addJournal(loss>0?bilingual(`Une chute de chariot nous a coûté ${loss} kg de vivres.`,`A wagon fall cost us ${loss} kg of food.`):bilingual("Le chariot s’est renversé, sans perte de vivres.","The wagon overturned without losing any food."))}}
      ],"incident-wagon.webp");
    });
  const axleEvent=taggedEvent("axle",()=>{
      if(game.cart.pieces>0){
        const days=game.profession==="charpentier"?1:2;game.cart.pieces--;
        eventModal("Essieu brisé","Un choc sec — l’essieu du chariot vient de céder.",bilingual(`Vous utilisez une pièce de rechange et perdez ${days===1?"une journée":"deux jours"}.`,`You use a spare part and lose ${days===1?"one day":"two days"}.`),[
          {label:"Effectuer la réparation",action:()=>{consumeDelay(days);addJournal(bilingual(`L’essieu a été remplacé avec une pièce de rechange en ${days} jour${days>1?"s":""}.`,`The axle was replaced with a spare part in ${days} day${days===1?"":"s"}.`))}}
        ],"incident-axle.webp");
      }else{
        const discardedFood=Math.min(game.cart.vivres,rand(20,45));
        const discardedBlankets=Math.min(game.cart.vetements,1);
        eventModal("Essieu brisé","Votre essieu est rompu et vous n’avez aucune pièce.","Une famille de passage propose une pièce pour 45 $.",[
          {label:"Acheter la pièce (45 $)",disabled:game.money<45,action:()=>{game.money-=45;consumeDelay(2);addJournal(bilingual("Une pièce achetée en urgence a permis de remplacer l’essieu en deux jours.","An emergency spare part purchase allowed us to replace the axle in two days."))}},
          {label:"Alléger et improviser",action:()=>{
            consumeDelay(4);const actualFood=Math.min(game.cart.vivres,discardedFood);game.cart.vivres-=actualFood;game.cart.vetements-=discardedBlankets;
            alive().forEach(p=>p.health=clamp(p.health-7,0,100));
            const losses=[];if(actualFood)losses.push(`${actualFood} kg de vivres`);if(discardedBlankets)losses.push("une couverture");
            addJournal(bilingual(`Faute de pièce, le chariot a été allégé${losses.length?` de ${losses.join(" et ")}`:""} pour reprendre la piste.`,`Without a spare part, the wagon was lightened${losses.length?` by discarding ${losses.map(loss=>languageText(loss,"en")).join(" and ")}`:""} to return to the trail.`));
          }}
        ],"incident-axle.webp");
      }
    });
  const events=[wagonEvent,axleEvent,taggedEvent("encounter",()=>{
      const found=loadFood(rand(10,25));
      const details=found?bilingual(`Vous recevez ${found} kg de vivres et quelques conseils.`,`You receive ${found} kg of food and some advice.`):bilingual("Le chariot est déjà plein : vous échangez plutôt des conseils sur la piste.","The wagon is already full, so you exchange advice about the trail instead.");
      eventModal("Une bonne rencontre","Des voyageurs revenant de l’Oregon partagent leurs provisions.",details,[
        {label:"Les remercier",action:()=>addJournal(found?"Une famille généreuse nous a ravitaillés.":bilingual("Une famille généreuse nous a conseillé sur la route à venir.","A generous family shared advice about the road ahead."))}
      ],"incident-encounter.webp");
    }),taggedEvent("theft",theftEvent),taggedEvent("trade",tradeEvent),taggedEvent("attack",attackEvent)];
  let injuryEventChoice=null,oxEventChoice=null;
  if(patients.length){
    events.push(taggedEvent("fever",()=>feverEvent(pick(patients))));
    injuryEventChoice=taggedEvent("injury",()=>injuryEvent(pick(patients)));events.push(injuryEventChoice);
    events.push(taggedEvent("dysentery",()=>dysenteryEvent(pick(patients))));
  }
  if(patients.length>=2)events.push(taggedEvent("contagious",()=>contagiousDiseaseEvent(patients)));
  if(game.weather.name==="Pluvieux")events.push(taggedEvent("rain",()=>{
    const days=rand(2,4);
    eventModal("Pluies diluviennes","La boue avale les roues. Impossible d’avancer.",bilingual(`${days} jours de retard, mais le convoi reste à l’abri.`,`${days} days lost, but the wagon party remains sheltered.`),[
      {label:"Attendre l’éclaircie",action:()=>{consumeDelay(days);addJournal(bilingual(`${days} jours perdus dans les pluies diluviennes.`,`${days} days lost in torrential rain.`))}}
    ],"incident-rain.webp");
  }));
  if(game.cart.vetements>0&&(game.weather.temp<=5||game.weather.name==="Pluvieux"))events.push(taggedEvent("blankets",blanketLossEvent));
  if(patients.length&&(game.weather.temp<=5||game.weather.temp>=27))events.push(taggedEvent("climate-injury",()=>climateInjuryEvent(pick(patients))));
  if(game.cart.boeufs>0){oxEventChoice=taggedEvent("ox-injury",oxInjuryEvent);events.push(oxEventChoice)}
  if(game.pace==="soutenu")events.push(wagonEvent,...(injuryEventChoice?[injuryEventChoice]:[]));
  if(game.pace==="epuisant"){
    events.push(wagonEvent,wagonEvent,axleEvent,axleEvent,...(injuryEventChoice?[injuryEventChoice,injuryEventChoice]:[]));
    if(oxEventChoice)events.push(oxEventChoice,oxEventChoice,oxEventChoice);
  }
  if(oxEventChoice&&game.oxStrain>=6)events.push(oxEventChoice,oxEventChoice,oxEventChoice);
  return events;
}

function randomEvent(){
  const events=eventPool();if(!events.length)return;
  const withoutRepeat=events.filter(event=>event.eventId!==game.lastEvent),selected=pick(withoutRepeat.length?withoutRepeat:events);
  game.lastEvent=selected.eventId;selected();
}

function feverEvent(p){
  if(!p)return;
  p.health=clamp(p.health-rand(12,22),1,100);p.state="Fièvre";p.sickDays=10;
  eventModal("La fièvre",bilingual(`${p.name} souffre d’une forte fièvre.`,`${p.name} is suffering from a high fever.`),"Un remède améliore nettement ses chances.",[
    {label:remedyLabel("Utiliser un remède"),disabled:game.cart.medicaments<1,action:()=>{game.cart.medicaments--;p.health=clamp(p.health+18,1,100);p.sickDays=4;addJournal(bilingual(`${p.name} a reçu un remède.`,`${p.name} received medicine.`))}},
    {label:"Continuer prudemment",action:()=>{p.health=clamp(p.health-5,0,100);addJournal(bilingual(`${p.name} reste fiévreux.`,`${p.name} remains feverish.`))}}
  ],"incident-fever.webp");
}

function oxInjuryEvent(){
  const meat=rand(35,55),loadableMeat=Math.min(meat,SHOP.vivres.max-game.cart.vivres),lastOx=game.cart.boeufs===1;
  const slaughterLabel=loadableMeat?bilingual(`L’abattre et charger ${loadableMeat} kg`,`Slaughter it and load ${loadableMeat} kg`):bilingual("L’abattre sans pouvoir charger la viande","Slaughter it with no room for the meat");
  eventModal("Un bœuf blessé","Une pierre a fait chuter l’un des bœufs. Sa patte enflée ne supporte plus le joug.",lastOx?"C’est votre dernier bœuf. L’abattre laisserait le chariot sans attelage.":"Vous pouvez tenter de le soigner ou transformer l’animal en provisions.",[
    {label:remedyLabel("Le soigner et attendre 2 jours"),disabled:game.cart.medicaments<1,action:()=>{
      game.cart.medicaments--;consumeDelay(2);game.oxStrain=clamp(game.oxStrain-4,0,10);addJournal(bilingual("Un remède et deux jours de repos ont remis un bœuf sur pied.","Medicine and two days of rest got an ox back on its feet."));
    }},
    {label:slaughterLabel,action:()=>{
      game.cart.boeufs--;const loaded=loadFood(meat);game.oxStrain=clamp(game.oxStrain-2,0,10);addJournal(loaded?bilingual(`Un bœuf blessé a été abattu. Sa viande ajoute ${loaded} kg aux réserves.`,`An injured ox was slaughtered. Its meat adds ${loaded} kg to the food stores.`):bilingual("Un bœuf blessé a été abattu, mais le chariot était trop plein pour charger sa viande.","An injured ox was slaughtered, but the wagon was too full to load its meat."));
    }}
  ],"incident-ox-injury.webp");
}

function injuryEvent(p=pick(eventEligibleTravelers())){
  if(!p)return;
  const damage=rand(14,24);p.health=clamp(p.health-damage,1,100);p.state="Blessé";p.sickDays=8;
  eventModal("Blessure sur la piste",bilingual(`${p.name} a fait une mauvaise chute près du chariot.`,`${p.name} took a bad fall near the wagon.`),bilingual(`Sa blessure l’a fortement affaibli. Un remède et des bandages accéléreraient sa guérison.`,`The injury has left ${p.name} badly weakened. Medicine and bandages would speed recovery.`),[
    {label:remedyLabel("Utiliser un remède"),disabled:game.cart.medicaments<1,action:()=>{game.cart.medicaments--;p.health=clamp(p.health+16,1,100);p.sickDays=3;p.state="Convalescent";addJournal(bilingual(`${p.name} a été soigné après sa chute.`,`${p.name} was treated after the fall.`))}},
    {label:"Poser une attelle",action:()=>{consumeDelay(1);p.sickDays=6;addJournal(bilingual(`${p.name} voyage avec une attelle improvisée.`,`${p.name} travels with an improvised splint.`))}}
  ],"incident-injury.webp");
}

function dysenteryEvent(p=pick(eventEligibleTravelers())){
  if(!p)return;
  const damage=rand(18,28);p.health=clamp(p.health-damage,1,100);p.state="Dysenterie";p.sickDays=12;
  eventModal("Dysenterie",bilingual(`${p.name} est pris de violentes douleurs et se déshydrate rapidement.`,`${p.name} suffers violent pain and is rapidly becoming dehydrated.`),bilingual(`Son état s’est sérieusement dégradé. Du repos, de l’eau bouillie et un remède peuvent éviter le pire.`,`${p.name}’s condition has seriously deteriorated. Rest, boiled water, and medicine may prevent the worst.`),[
    {label:remedyLabel("Donner un remède"),disabled:game.cart.medicaments<1,action:()=>{game.cart.medicaments--;p.health=clamp(p.health+18,1,100);p.sickDays=5;p.state="Convalescent";addJournal(bilingual(`${p.name} a reçu un remède contre la dysenterie.`,`${p.name} received medicine for dysentery.`))}},
    {label:"Faire halte 2 jours",action:()=>{consumeDelay(2);if(p.health>0)p.health=clamp(p.health+6,1,100);p.sickDays=8;addJournal(bilingual(`Le convoi s’est arrêté pour soigner la dysenterie de ${p.name}.`,`The wagon party stopped to treat ${p.name}’s dysentery.`))}},
    {label:"Continuer",action:()=>{p.health=clamp(p.health-8,1,100);addJournal(bilingual(`${p.name} reste gravement atteint de dysenterie.`,`${p.name} remains seriously ill with dysentery.`))}}
  ],"incident-dysentery.webp");
}

function climateInjuryEvent(p=pick(eventEligibleTravelers())){
  if(!p)return;
  const cold=game.weather.temp<=5,damage=cold?rand(14,23):rand(8,16);
  p.health=clamp(p.health-damage,1,100);p.state=cold?"Engelures":"Piqûres";p.sickDays=cold?9:6;
  const title=cold?"Engelures":"Piqûres d’insectes";
  const text=bilingual(cold?`${p.name} souffre d’engelures après une longue exposition au froid.`:`${p.name} est couvert de piqûres douloureuses après une halte sous une chaleur étouffante.`,cold?`${p.name} suffers from frostbite after prolonged exposure to the cold.`:`${p.name} is covered in painful insect bites after a stop in oppressive heat.`);
  const details=cold?"Il faut réchauffer progressivement les zones atteintes.":"Les piqûres se sont infectées et doivent être nettoyées.";
  eventModal(title,text,bilingual(`${details} ${p.name} en ressort affaibli.`,`${languageText(details,"en")} ${p.name} is left weakened.`),[
    {label:remedyLabel("Utiliser un remède"),disabled:game.cart.medicaments<1,action:()=>{game.cart.medicaments--;p.health=clamp(p.health+(cold?17:12),1,100);p.sickDays=3;p.state="Convalescent";addJournal(bilingual(`${p.name} a été soigné pour ${cold?"des engelures":"des piqûres d’insectes"}.`,`${p.name} was treated for ${cold?"frostbite":"insect bites"}.`))}},
    {label:cold?"Réchauffer et attendre":"Nettoyer et repartir",action:()=>{if(cold)consumeDelay(1);p.sickDays=cold?6:4;addJournal(bilingual(`${p.name} récupère lentement après ${cold?"ses engelures":"ses piqûres"}.`,`${p.name} is recovering slowly from ${cold?"frostbite":"the bites"}.`))}}
  ],cold?"incident-frostbite.webp":"incident-bites.webp");
}

function contagiousDiseaseEvent(candidates=eventEligibleTravelers()){
  const patients=shuffled(candidates).slice(0,Math.min(candidates.length,rand(2,3)));if(!patients.length)return;
  patients.forEach(p=>{p.health=clamp(p.health-rand(9,16),1,100);p.state="Malade";p.sickDays=Math.max(p.sickDays,10)});
  const count=patients.length;
  eventModal("Maladie contagieuse",bilingual(`${count} voyageur${count>1?"s":""} présente${count>1?"nt":""} les mêmes symptômes.`,`${count} traveler${count===1?"":"s"} ${count===1?"shows":"show"} the same symptoms.`),bilingual(`La maladie risque d’épuiser rapidement le groupe. Vous avez ${itemQuantityFor("medicaments",game.cart.medicaments,"fr")}.`,`The disease may quickly exhaust the party. You have ${itemQuantityFor("medicaments",game.cart.medicaments,"en")}.`),[
    {label:remedyLabel(bilingual(`Distribuer ${count} remède${count>1?"s":""}`,`Give ${count} dose${count===1?"":"s"}`),count),disabled:game.cart.medicaments<count,action:()=>{game.cart.medicaments-=count;patients.forEach(p=>{p.health=clamp(p.health+14,1,100);p.sickDays=4;p.state="Convalescent"});addJournal(bilingual(`${count} malade${count>1?"s ont":" a"} reçu un remède.`,`${count} sick traveler${count===1?"":"s"} received medicine.`))}},
    {label:"Isoler les malades 2 jours",action:()=>{consumeDelay(2);patients.forEach(p=>p.sickDays=7);addJournal("Le convoi s’est arrêté pour isoler les malades.")}},
    {label:"Continuer la route",action:()=>{patients.forEach(p=>p.health=clamp(p.health-5,1,100));addJournal("La maladie contagieuse affaiblit le groupe.")}}
  ],"incident-contagious.webp");
}

function blanketLossEvent(){
  const cold=game.weather.temp<=5,loss=Math.min(game.cart.vetements,rand(1,2));game.cart.vetements-=loss;
  const blankets=`${loss} couverture${loss>1?"s":""}`;
  const cause=cold?bilingual("Une nuit glaciale et humide détrempe les couvertures les plus exposées.","A freezing, damp night soaks the most exposed blankets."):bilingual("La pluie s’est infiltrée dans le chariot pendant la nuit.","Rain leaked into the wagon during the night.");
  eventModal("Couvertures hors d’usage",cause,bilingual(`${blankets} ${loss===1?"est devenue":"sont devenues"} inutilisable${loss>1?"s":""}.`,`${loss} blanket${loss===1?" has":"s have"} become unusable.`),[
    {label:"Réorganiser le chargement",action:()=>addJournal(cold?bilingual(`${blankets} perdue${loss>1?"s":""} pendant une nuit de grand froid.`,`${loss} blanket${loss===1?" was":"s were"} lost during a bitterly cold night.`):bilingual(`${blankets} perdue${loss>1?"s":""} après une nuit de pluie.`,`${loss} blanket${loss===1?" was":"s were"} lost after a rainy night.`))}
  ],"incident-blankets.webp");
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
  if(!stolen){eventModal("Tentative de vol","Des traces entourent le camp, mais le chargement est intact.","Les coffres étaient heureusement vides ou bien verrouillés.",[{label:"Redoubler de vigilance",action:()=>addJournal("Une tentative de vol a échoué.")}],"incident-theft.webp");return;}
  if(stolen.key==="money")game.money-=stolen.amount;else game.cart[stolen.key]-=stolen.amount;
  const stolenLabel=stolen.key==="money"?`${stolen.amount} $`:itemQuantityFor(stolen.key,stolen.amount,"fr");
  const stolenLabelEn=stolen.key==="money"?`$${stolen.amount}`:itemQuantityFor(stolen.key,stolen.amount,"en");
  const description=`${stolenLabel} ${stolen.amount===1?"a":"ont"} disparu.`;
  eventModal("Vol au camp","Au lever du jour, un coffre est ouvert et des traces s’éloignent du camp.",bilingual(description,`${stolenLabelEn} ${stolen.amount===1?"is":"are"} missing.`),[
    {label:"Sécuriser le chargement",action:()=>addJournal(bilingual(`Un vol nous a coûté ${stolenLabel}.`,`A theft cost us ${stolenLabelEn}.`))}
  ],"incident-theft.webp");
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
  const canAcceptOffer=offer=>offer.mode==="buy"?game.money>=offer.price&&game.cart[offer.key]+offer.qty<=SHOP[offer.key].max:game.cart[offer.key]>=offer.qty;
  const viableOffers=offers.filter(canAcceptOffer),offer=pick(viableOffers.length?viableOffers:offers),buying=offer.mode==="buy",offerLabelEn=itemQuantityFor(offer.key,offer.qty,"en");
  const canAccept=canAcceptOffer(offer);
  const text=bilingual(buying?`Un marchand vous propose ${offer.label} pour ${offer.price} $.`:`Un voyageur vous offre ${offer.price} $ pour ${offer.label}.`,buying?`A merchant offers you ${offerLabelEn} for $${offer.price}.`:`A traveler offers you $${offer.price} for ${offerLabelEn}.`);
  eventModal("Une proposition sur la piste",text,"La quantité et le prix sont fixes. Acceptez-vous l’offre ?",[
    {label:"Accepter",disabled:!canAccept,action:()=>{if(buying){game.money-=offer.price;game.cart[offer.key]+=offer.qty;}else{game.money+=offer.price;game.cart[offer.key]-=offer.qty;}addJournal(bilingual(`Marché conclu : ${offer.label} pour ${offer.price} $.`,`Trade completed: ${offerLabelEn} for $${offer.price}.`))}},
    {label:"Refuser",action:()=>addJournal("Nous avons refusé une proposition commerciale.")}
  ],"incident-trade.webp");
}

function attackEvent(){
  eventModal("Attaque du convoi","Les indiens approchent rapidement à cheval et des projectiles frappent autour des chariots.","Mettez le groupe à couvert et tenez jusqu’à leur retrait.",[
    {label:"Protéger le convoi",action:()=>setTimeout(startAttack,0)}
  ],"incident-attack.webp");
}

function landmark(mark){
  const weather=weatherVisual(),art=mark.kind==="fort"?fortArrivalAsset(mark,weather):stageAsset(mark,weather);showLandmarkArt(mark,art,weather);
  if(mark.kind==="river") riverEvent(mark,art);
  else if(mark.kind==="fort") fortEvent(mark,art);
  else eventModal(bilingual(mark.name,landmarkName(mark)),bilingual(`Le convoi atteint ${mark.name}.`,`The wagon party reaches ${landmarkName(mark)}.`),"Un repère bienvenu sur l’immensité de la piste.",[{label:"Graver nos noms et repartir",action:()=>{addJournal(bilingual(`Nous avons atteint ${mark.name}.`,`We reached ${landmarkName(mark)}.`));setTrailScene();}}],art);
}

function riverEvent(mark,art=stageAsset(mark),depth=null,observation=""){
  const measured=depth??riverDepth(mark),shown=formatDepth(measured);
  const cost=55+Math.round(measured*25+game.km/KM_TOTAL*30);
  const shownEn=measured.toFixed(1);
  const details=observation?bilingual(`${languageText(observation,"fr")} Comment ferez-vous traverser le chariot ?`,`${languageText(observation,"en")} How will you get the wagon across?`):"Comment ferez-vous traverser le chariot ?";
  eventModal(bilingual(mark.name,landmarkName(mark)),bilingual(`Le courant est rapide et la profondeur mesurée atteint environ ${shown} mètre${measured>=2?"s":""}.`,`The current is swift and the measured depth is about ${shownEn} meter${measured===1?"":"s"}.`),details,[
    {label:bilingual(`Prendre le bac (${cost} $)`,`Take the ferry ($${cost})`),disabled:game.money<cost,action:()=>{game.money-=cost;const food=consumeDelay(1);addJournal(bilingual(`Traversée de ${mark.name} en bac, sans incident, avec une profondeur de ${shown} m.`,`We crossed ${landmarkName(mark)} by ferry without incident at a depth of ${shownEn} m.`));queueRiverOutcome(mark,"ferry",{method:bilingual("Bac","Ferry"),days:1,food:food.consumed,text:"Le bac a transporté le chariot et tout le groupe jusqu’à l’autre rive.",result:bilingual(`Traversée sans perte · Profondeur : ${shown} m · Coût : ${cost} $`,`Crossing without loss · Depth: ${shownEn} m · Cost: $${cost}`)})}},
    {label:"Calfater et flotter",action:()=>riverRisk(mark,measured)},
    {label:"Attendre 3 jours et remesurer",action:()=>{
      consumeDelay(3);game.oxStrain=clamp(game.oxStrain-2,0,10);
      const next=riverDepth(mark,measured),nextShown=formatDepth(next);
      const displayedChange=Math.round(next*10)-Math.round(measured*10);
      const change=displayedChange>0?"a monté":displayedChange<0?"a baissé":"est resté stable",changeEn=displayedChange>0?"rose":displayedChange<0?"fell":"remained stable";
      addJournal(bilingual(`Après trois jours d’attente à ${mark.name}, le niveau ${change} : de ${shown} m à ${nextShown} m.`,`After waiting three days at ${landmarkName(mark)}, the water level ${changeEn}: from ${measured.toFixed(1)} m to ${next.toFixed(1)} m.`));
      setTimeout(()=>{if(!game.finished)riverEvent(mark,stageAsset(mark),next,bilingual(`Après l’attente, le niveau ${change}.`,`After waiting, the water level ${changeEn}.`))},0);
    }}
  ],art);
}

function queueRiverOutcome(mark,outcome,data){setTimeout(()=>showRiverOutcome(mark,outcome,data),0)}

function showRiverOutcome(mark,outcome,data){
  activeRiverOutcome={mark,outcome,...data};renderRiverOutcome();$("#dialogue-bilan-riviere").showModal();
}

function renderRiverOutcome(){
  if(!activeRiverOutcome)return;
  const {mark,outcome,method,days,food,text,result}=activeRiverOutcome;
  const art=$("#bilan-riviere-art");art.style.backgroundImage=`url('assets/river-${mark.visual}-${outcome}.webp')`;art.setAttribute("aria-label",currentLanguage==="en"?`${languageText(method)} at ${landmarkName(mark)}`:`${languageText(method)} à ${mark.name}`);
  $("#titre-bilan-riviere").textContent=currentLanguage==="en"?`Report — ${landmarkName(mark)}`:`Bilan — ${mark.name}`;$("#bilan-riviere-texte").textContent=languageText(text);$("#bilan-riviere-methode").textContent=languageText(method);
  $("#bilan-riviere-duree").textContent=currentLanguage==="en"?`${days} day${days===1?"":"s"}`:`${days} jour${days>1?"s":""}`;$("#bilan-riviere-vivres").textContent=`${Math.round(food)} kg`;$("#bilan-riviere-resultat").textContent=languageText(result);
}

function riverRisk(mark,depth){
  const travelFood=consumeDelay(1);
  game.oxStrain=clamp(game.oxStrain+1,0,10);
  const risk=clamp(depth*.17+(game.cart.boeufs<4?.14:0)+(game.cart.pieces===0?.09:0),.08,.65);
  if(Math.random()<risk){
    const cargoLosses=[
      {key:"vivres",amount:Math.min(game.cart.vivres,rand(25,70))},
      {key:"munitions",amount:Math.min(game.cart.munitions,rand(5,20))},
      {key:"vetements",amount:Math.random()<.45?Math.min(game.cart.vetements,rand(1,2)):0},
      {key:"pieces",amount:Math.random()<.35?Math.min(game.cart.pieces,1):0},
      {key:"medicaments",amount:Math.random()<.3?Math.min(game.cart.medicaments,rand(1,2)):0}
    ];
    const losses=[],lossesEn=[];
    for(const loss of cargoLosses){
      if(!loss.amount)continue;
      game.cart[loss.key]-=loss.amount;losses.push(itemQuantityFor(loss.key,loss.amount,"fr"));lossesEn.push(itemQuantityFor(loss.key,loss.amount,"en"));
    }
    const maxOxLoss=game.cart.boeufs;
    const oxLoss=maxOxLoss&&Math.random()<clamp(.18+depth*.12,.2,.45)?Math.min(maxOxLoss,depth>=1.5?rand(1,2):1):0;
    if(oxLoss){game.cart.boeufs-=oxLoss;losses.push(`${oxLoss} bœuf${oxLoss>1?"s":""}`);lossesEn.push(`${oxLoss} ${oxLoss===1?"ox":"oxen"}`);}
    alive().forEach(p=>p.health=clamp(p.health-rand(2,9),0,100));
    addJournal(losses.length?bilingual(`À ${mark.name}, le chariot a pris l’eau par ${depth.toFixed(1).replace(".",",")} m de profondeur. Le courant emporte ${joinList(losses,"fr")}.`,`At ${landmarkName(mark)}, the wagon took on water at a depth of ${depth.toFixed(1)} m. The current swept away ${joinList(lossesEn,"en")}.`):bilingual(`Le chariot a pris l’eau à ${mark.name}, sans perte de chargement.`,`The wagon took on water at ${landmarkName(mark)}, without losing any cargo.`));toast("Le courant a secoué le convoi.");
    queueRiverOutcome(mark,"float-accident",{method:"Chariot calfaté",days:1,food:travelFood.consumed,text:"Le chariot a pris l’eau dans le courant avant d’atteindre difficilement l’autre rive.",result:losses.length?bilingual(`Profondeur : ${depth.toFixed(1).replace(".",",")} m · Pertes : ${joinList(losses,"fr")}`,`Depth: ${depth.toFixed(1)} m · Losses: ${joinList(lossesEn,"en")}`):bilingual(`Profondeur : ${depth.toFixed(1).replace(".",",")} m · Aucune provision perdue, mais le groupe a été éprouvé`,`Depth: ${depth.toFixed(1)} m · No supplies lost, but the party was shaken`)});
  } else {addJournal(bilingual(`Le chariot a traversé ${mark.name} à flot sans incident, par ${depth.toFixed(1).replace(".",",")} m de profondeur.`,`The wagon floated across ${landmarkName(mark)} without incident at a depth of ${depth.toFixed(1)} m.`));queueRiverOutcome(mark,"float-success",{method:"Chariot calfaté",days:1,food:travelFood.consumed,text:"Le chariot a flotté jusqu’à l’autre rive sous le contrôle des cordes et des bœufs.",result:bilingual(`Traversée réussie sans perte · Profondeur : ${depth.toFixed(1).replace(".",",")} m`,`Successful crossing without loss · Depth: ${depth.toFixed(1)} m`)})}
  setTrailScene();updateDeaths();
}

function fortEvent(mark,art=fortArrivalAsset(mark)){
  const price=Math.round(1.3+game.km/KM_TOTAL*.7);
  const foodCost=20*price, ammoCost=6*price;
  const equipment=shuffled([
    {key:"boeufs",qty:2,cost:60*price,label:"2 bœufs",labelEn:"2 oxen"},
    {key:"vetements",qty:2,cost:22*price,label:"2 couvertures",labelEn:"2 blankets"},
    {key:"pieces",qty:1,cost:28*price,label:"1 pièce de rechange",labelEn:"1 spare part"},
    {key:"medicaments",qty:2,cost:28*price,label:"2 remèdes",labelEn:"2 doses of medicine"}
  ]).slice(0,2);
  const actions=[
    {label:bilingual(`Acheter 50 kg de vivres (${foodCost} $)`,`Buy 50 kg of food ($${foodCost})`),keepOpen:true,disabled:()=>game.money<foodCost||game.cart.vivres+50>SHOP.vivres.max,action:()=>{game.money-=foodCost;loadFood(50);addJournal(bilingual(`Ravitaillement à ${mark.name}.`,`Resupplied at ${landmarkName(mark)}.`))}},
    {label:bilingual(`Acheter 40 balles (${ammoCost} $)`,`Buy 40 bullets ($${ammoCost})`),keepOpen:true,disabled:()=>game.money<ammoCost||game.cart.munitions+40>SHOP.munitions.max,action:()=>{game.money-=ammoCost;game.cart.munitions+=40;addJournal(bilingual(`Achat de munitions à ${mark.name}.`,`Bought ammunition at ${landmarkName(mark)}.`))}},
    ...equipment.map(item=>({label:bilingual(`Acheter ${item.label} (${item.cost} $)`,`Buy ${item.labelEn} ($${item.cost})`),keepOpen:true,disabled:()=>game.money<item.cost||game.cart[item.key]+item.qty>SHOP[item.key].max,action:()=>{game.money-=item.cost;game.cart[item.key]+=item.qty;addJournal(bilingual(`Achat de ${item.label} à ${mark.name}.`,`Bought ${item.labelEn} at ${landmarkName(mark)}.`))}})),
    {label:"Se reposer 2 jours",keepOpen:true,disabled:()=>game.cart.vivres<alive().length*4,action:()=>{consumeDelay(2,2);game.oxStrain=clamp(game.oxStrain-3,0,10);alive().forEach(p=>p.health=clamp(p.health+6,0,100));refreshFortArrivalArt(mark);addJournal(bilingual(`Halte réparatrice à ${mark.name}.`,`A restorative stop at ${landmarkName(mark)}.`))}},
    {label:"Repartir",primary:true,action:()=>addJournal(bilingual(`Passage à ${mark.name}.`,`Passed through ${landmarkName(mark)}.`))}
  ];
  eventModal(bilingual(mark.name,landmarkName(mark)),"Palissades, forge et odeur de pain frais : une halte bienvenue.","Le stock d’équipement varie à chaque fort. Vous pouvez effectuer plusieurs achats avant de repartir.",actions,art);
}

function eventModal(title,text,details,actions,art="trail"){
  const d=$("#dialogue-evenement");$("#event-title").textContent=languageText(title);$("#event-text").textContent=languageText(text);$("#event-details").textContent=languageText(details);
  const artFile=art.includes(".")?art:`${art}.webp`;
  if(artFile.startsWith("incident-"))addJournal(bilingualJoin(title," — ",text));
  $("#event-art").style.backgroundImage=`url('assets/${artFile}')`;
  const box=$("#event-actions");box.innerHTML="";
  const hasExplicitPrimary=actions.some(a=>a.primary),defaultPrimary=hasExplicitPrimary?-1:actions.findIndex(a=>!actionDisabled(a));
  const buttons=[];
  actions.forEach((a,i)=>{
    const b=document.createElement("button");b.type="button";b.className=`btn ${a.primary||i===defaultPrimary?"primary":"secondary"}`;b.textContent=languageText(a.label);b.disabled=actionDisabled(a);
    b.addEventListener("click",()=>{
      if(actionDisabled(a))return;
      a.action();updateDeaths();
      if(game.finished||checkJourneyFailure()){d.close();return;}
      updateUI();
      if(a.keepOpen){
        activeEventModal.withInventory=true;refreshEventModalLanguage();
        return;
      }
      d.close();setTrailScene();returnToTrailTop();
    });
    buttons.push({action:a,button:b});box.appendChild(b);
  });
  activeEventModal={title,text,details,buttons,withInventory:false};refreshEventModalLanguage();
  if(!d.open)d.showModal();
}

function actionDisabled(action){return typeof action.disabled==="function"?action.disabled():!!action.disabled}

function refreshEventModalLanguage(){
  if(!activeEventModal)return;
  const {title,text,details,buttons,withInventory}=activeEventModal;
  $("#event-title").textContent=languageText(title);$("#event-text").textContent=languageText(text);
  const base=languageText(details);
  $("#event-details").textContent=withInventory?(currentLanguage==="en"?`${base} You have ${money(game.money)}, ${itemQuantity("vivres",Math.round(game.cart.vivres))}, and ${itemQuantity("munitions",game.cart.munitions)} left.`:`${base} Il vous reste ${money(game.money)}, ${itemQuantity("vivres",Math.round(game.cart.vivres))} et ${itemQuantity("munitions",game.cart.munitions)}.`):base;
  buttons.forEach(({action,button})=>{button.textContent=languageText(action.label);button.disabled=actionDisabled(action)});
}

function rest(){
  if(checkJourneyFailure())return;
  if(game.cart.vivres<alive().length*4){toast("Pas assez de vivres pour camper deux jours.");return;}
  consumeDelay(2,2);game.oxStrain=clamp(game.oxStrain-3,0,10);alive().forEach(p=>{p.health=clamp(p.health+7,0,100);if(p.health>60&&p.sickDays<=0&&!p.needsRemedy)p.state="En forme"});addJournal("Deux jours de repos ont remonté le moral du groupe et soulagé l’attelage.");updateDeaths();if(!game.finished)updateUI();returnToTrailTop();
}

function renderTrailMap(){
  const stops=[{km:0,name:"Independence"},...LANDMARKS,{km:KM_TOTAL,name:"Oregon"}],left=45,width=830;
  const x=km=>left+km/KM_TOTAL*width,current=x(game.km);
  return `<section class="map-card" aria-labelledby="titre-carte"><h3 id="titre-carte">${languageText("Carte de la piste")}</h3><div class="trail-map-scroll"><svg class="trail-map" viewBox="0 0 920 210" role="img" aria-label="${currentLanguage==="en"?"Progress from Independence to the Willamette Valley":"Progression de Independence jusqu’à la vallée de Willamette"}"><path class="map-route" d="M ${left} 105 H ${left+width}"/><path class="map-progress" d="M ${left} 105 H ${current}"/>${stops.map((stop,i)=>{const px=x(stop.km),top=i%2===0;return `<g><circle class="map-stop" cx="${px}" cy="105" r="5"/><path class="map-tick" d="M ${px} 96 V ${top?70:140}"/><text x="${px}" y="${top?61:157}" text-anchor="middle">${escapeHtml(landmarkName(stop))}</text></g>`}).join("")}<g class="map-current"><path d="M ${current} 78 l 10 18 h -20 z"/><text x="${current}" y="72" text-anchor="middle">${languageText("Vous êtes ici")}</text></g></svg></div><p>${currentLanguage==="en"?`${Math.round(game.km).toLocaleString(currentLocale())} km traveled · ${Math.max(0,KM_TOTAL-Math.round(game.km)).toLocaleString(currentLocale())} km remaining`:`${Math.round(game.km).toLocaleString(currentLocale())} km parcourus · ${Math.max(0,KM_TOTAL-Math.round(game.km)).toLocaleString(currentLocale())} km restants`}</p></section>`;
}

function showInventory(){
  activeInfoView="inventory";renderInfoView();
  $("#dialogue-info").showModal();
}

function showMap(){
  activeInfoView="map";renderInfoView();
  $("#dialogue-info").showModal();
}

function showJournal(){
  activeInfoView="journal";renderInfoView();$("#dialogue-info").showModal();
}

function renderInfoView(){
  if(activeInfoView==="inventory"){
  $("#info-title").textContent=languageText("Inventaire du chariot");
  $("#info-content").innerHTML=`<table class="inventory-table"><tbody>${Object.entries(SHOP).map(([k,v])=>`<tr><td>${languageText(v.label)}</td><td>${game.cart[k]} ${unitLabel(v,game.cart[k])}</td></tr>`).join("")}<tr><td>${languageText("Argent restant")}</td><td>${money(game.money)}</td></tr></tbody></table><p>${languageText("Le chariot transporte aussi vos outils, de la vaisselle et les souvenirs du voyage.")}</p>`;
  }else if(activeInfoView==="map"){
  $("#info-title").textContent=languageText("Carte de la piste");
  $("#info-content").innerHTML=renderTrailMap();
  }else if(activeInfoView==="journal"){
  $("#info-title").textContent=languageText("Journal de bord");
  $("#info-content").innerHTML=`<ol class="journal-list">${journalItems(game.journal)}</ol>`;
  }
}

function showHelp(){
  openGuide("ecran-voyage");
}

function finish(win,message=""){
  game.finished=true;const avg=alive().length?alive().reduce((n,p)=>n+p.health,0)/alive().length:0;
  const equipment=game.cart.munitions*.2+game.cart.vetements*12+game.cart.pieces*20+game.cart.medicaments*14+game.cart.boeufs*30;
  const assets=Math.max(0,game.money+game.cart.vivres*2+equipment+alive().length*250+avg*10+(game.profession==="fermier"?1200:game.profession==="charpentier"?600:0));
  // L'arrivée compte davantage que les économies laissées dans un chariot abandonné.
  const progress=clamp(game.km/KM_TOTAL,0,1);
  const score=win?Math.max(2250,Math.round(assets+1000)):Math.min(2249,Math.round(assets*progress*.45));
  game.score=score;game.finishState={win,message};renderFinish();
}

function renderFinish(){
  const {win,message}=game.finishState,score=game.score;
  $("#ecran-fin").classList.toggle("defeat",!win);
  $("#fin-kicker").textContent=languageText(win?"Vallée de Willamette · Oregon":"La piste s’arrête ici");
  $("#titre-fin").textContent=languageText(win?"Vous avez atteint l’Oregon":"Le convoi n’ira pas plus loin");
  $("#texte-fin").textContent=message?languageText(message):(win?(currentLanguage==="en"?`${alive().length} traveler${alive().length===1?"":"s"} finally ${alive().length===1?"looks":"look"} upon the valley. After ${game.days} days on the trail, a new life begins.`:`${alive().length} voyageur${alive().length>1?"s":""} contemple${alive().length>1?"nt":""} enfin la vallée. Après ${game.days} jours sur la piste, une nouvelle vie commence.`):languageText("La faim, la maladie et la route ont eu raison de votre expédition."));
  $("#rang-fin").textContent=endingRank(score);
  $("#score-fin").textContent=`${currentLanguage==="en"?"Score":"Score"} · ${score.toLocaleString(currentLocale())}${win?"":` · ${currentLanguage==="en"?"Distance":"Distance"} · ${Math.round(game.km).toLocaleString(currentLocale())} km`}`;
  $("#journal-fin").innerHTML=journalItems(game.journal)||`<li>${languageText("Aucune entrée dans le journal.")}</li>`;
  showScreen("ecran-fin");
}

// Mini-jeu de chasse
const HUNT_SPECIES={
  bison:{size:25,speed:[82,116],loot:[20,28],y:[205,330],hit:.86},
  deer:{size:18,speed:[115,158],loot:[11,17],y:[180,320],hit:.77},
  rabbit:{size:10,speed:[158,220],loot:[3,6],y:[315,370],hit:.68},
  bird:{size:9,speed:[180,245],loot:[2,4],y:[65,175],hit:.66}
};

function huntWildlife(){
  if(game.weather.name==="Neige")return {count:3,pool:["bison","deer","rabbit","rabbit","bird","bird","bird"]};
  if(game.weather.name==="Pluvieux")return {count:5,pool:["bison","deer","deer","deer","rabbit","rabbit","rabbit","bird","bird","bird","bird","bird","bird","bird"]};
  return {count:5,pool:["bison","bison","deer","deer","rabbit","rabbit","rabbit","bird","bird","bird"]};
}

function huntBackground(){
  const key=weatherVisual().key;
  return {cold:"hunt-cold.webp",hot:"hunt-hot.webp",rain:"hunt-rain.webp",mild:"hunt.webp"}[key];
}

function startHunt(){
  if(game.cart.munitions<=0){toast("Vous n’avez plus de munitions.");return;}
  if(game.cart.vivres>=SHOP.vivres.max){toast("Le chariot ne peut pas charger davantage de vivres.");return;}
  consumeDelay(1,2,false);updateDeaths();
  if(game.finished)return;
  const wildlife=huntWildlife();
  hunt={time:14,loot:0,limit:Math.min(90,SHOP.vivres.max-game.cart.vivres),shots:0,background:huntBackground(),cross:{x:380,y:210},animals:[],species:wildlife.pool,last:performance.now(),running:true};
  for(let i=0;i<wildlife.count;i++)spawnAnimal(i*145);
  const canvas=$("#canvas-chasse");canvas.style.backgroundImage=`url('assets/${hunt.background}')`;
  $("#dialogue-chasse .eyebrow").textContent=languageText(regionVisual().title);
  $("#chasse-balles").textContent=game.cart.munitions;$("#chasse-butin").textContent=0;$("#chasse-temps").textContent=14;
  $("#dialogue-chasse").showModal();canvas.focus();requestAnimationFrame(huntLoop);
}

function spawnAnimal(offset=0){
  const species=pick(hunt.species),cfg=HUNT_SPECIES[species],direction=Math.random()<.25?-1:1;
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
  if(hunt.time<=0||game.cart.munitions<=0||hunt.loot>=hunt.limit){endHunt();return;}requestAnimationFrame(huntLoop);
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
  if(hit){const range=HUNT_SPECIES[hit.species].loot,gain=Math.min(hunt.limit-hunt.loot,rand(...range));hunt.loot+=gain;resetAnimal(hit)}
  $("#chasse-balles").textContent=game.cart.munitions;$("#chasse-butin").textContent=hunt.loot;
  if(hunt.loot>=hunt.limit)endHunt();
}

function endHunt(){
  if(!hunt?.running)return;
  const result={shots:hunt.shots,remaining:game.cart.munitions,loot:hunt.loot,background:hunt.background};hunt.running=false;loadFood(result.loot);game.weather=weatherForSeason();
  addJournal(result.loot?bilingual(`La chasse rapporte ${result.loot} kg de viande pour ${result.shots} balle${result.shots>1?"s":""} tirée${result.shots>1?"s":""}.`,`The hunt yielded ${result.loot} kg of meat for ${result.shots} bullet${result.shots===1?"":"s"} fired.`):bilingual("La chasse ne rapporte rien cette fois.","The hunt yielded nothing this time."));
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
  const candidates=shuffled(alive()),affected=Math.min(candidates.length,Math.ceil(hits/2)),wounded=[],dead=[];
  for(const p of candidates.slice(0,affected)){
    const lethalChance=Math.max(0,(hits-4)*.07);
    if(dead.length===0&&Math.random()<lethalChance){p.health=0;p.alive=false;p.state="Décédé";dead.push(p);}
    else{p.health=clamp(p.health-rand(18,32)-Math.floor(hits/3),1,100);p.state="Blessé";p.needsRemedy=true;wounded.push(p);}
  }
  attackOutcome={hits,wounded,dead};showAttackOutcome();
}

function showAttackOutcome(){
  const {hits,wounded,dead}=attackOutcome;$("#bilan-attaque-impacts").textContent=hits;$("#bilan-attaque-blesses").textContent=wounded.length;$("#bilan-attaque-deces").textContent=dead.length;
  const entries=[...wounded.map(p=>`<li><b>${escapeHtml(p.name)}</b><span>${languageText(injuryCondition(p.health))}</span></li>`),...dead.map(p=>`<li><b>${escapeHtml(p.name)}</b><span>${languageText("Décédé")}</span></li>`)];
  $("#bilan-attaque-liste").innerHTML=entries.length?entries.join(""):`<li><b>${languageText("Aucune victime")}</b><span>${languageText("Le convoi a tenu bon.")}</span></li>`;
  const untreated=wounded.filter(p=>p.needsRemedy).length,usable=Math.min(untreated,game.cart.medicaments);
  $("#soigner-attaque").disabled=usable===0;
  $("#soigner-attaque").textContent=untreated===0?languageText("Aucun remède nécessaire"):usable?(currentLanguage==="en"?`Use ${usable} dose${usable===1?"":"s"} of medicine`:`Utiliser ${usable} remède${usable>1?"s":""}`):languageText("Aucun remède disponible");
  if(!$("#dialogue-bilan-attaque").open)$("#dialogue-bilan-attaque").showModal();
}

function treatAttackWounds(){
  if(!attackOutcome)return;const patients=attackOutcome.wounded.filter(p=>p.needsRemedy).slice(0,game.cart.medicaments);
  for(const p of patients){game.cart.medicaments--;p.health=clamp(p.health+24,1,100);p.needsRemedy=false;p.state="Convalescent";}
  showAttackOutcome();
}

function continueAfterAttack(){
  if(!attackOutcome)return;const {hits,wounded,dead}=attackOutcome;$("#dialogue-bilan-attaque").close();
  addJournal(bilingual(`L’attaque se termine après ${hits} impact${hits>1?"s":""} : ${wounded.length} blessé${wounded.length>1?"s":""}, ${dead.length} mort${dead.length>1?"s":""}.`,`The attack ended after ${hits} hit${hits===1?"":"s"}: ${wounded.length} wounded, ${dead.length} dead.`));attackOutcome=null;
  if(!alive().length){finish(false,"Aucun membre du convoi n’a survécu à l’attaque.");return;}updateUI();returnToTrailTop();
}

function bindEvents(){
  $("#nouvelle-partie").addEventListener("click",()=>showScreen("ecran-groupe"));
  $("#guide-accueil").addEventListener("click",()=>openGuide("ecran-accueil"));
  $("#guide-boutique").addEventListener("click",()=>openGuide("ecran-boutique"));
  $("#retour-aide").addEventListener("click",()=>showScreen(helpReturnScreen));
  $("#form-groupe").addEventListener("submit",e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const names=[0,1,2,3,4].map(i=>String(fd.get(`nom${i}`)).trim());if(names.some(name=>!name)){toast("Donnez un nom à chaque voyageur.");return;}cart=Object.fromEntries(Object.entries(SHOP).map(([k,v])=>[k,v.start]));game=baseGame(names,fd.get("profession"),fd.get("mois"));renderShop();showScreen("ecran-boutique")});
  $("#liste-boutique").addEventListener("click",e=>{const b=e.target.closest("[data-shop]");if(b)changeCart(b.dataset.shop,Number(b.dataset.dir))});
  $("#retour-groupe").addEventListener("click",()=>showScreen("ecran-groupe"));$("#partir").addEventListener("click",leaveTown);
  $("#rythme").addEventListener("change",e=>game.pace=e.target.value);$("#rations").addEventListener("change",e=>game.rations=e.target.value);
  $("#avancer").addEventListener("click",travel);$("#repos").addEventListener("click",rest);$("#chasser").addEventListener("click",startHunt);$("#carte-btn").addEventListener("click",showMap);$("#inventaire-btn").addEventListener("click",showInventory);$("#journal-plus").addEventListener("click",showJournal);$("#aide").addEventListener("click",showHelp);
  $("#rejouer").addEventListener("click",()=>{game=null;showScreen("ecran-groupe")});$("#fermer-chasse").addEventListener("click",endHunt);
  $("#dialogue-evenement").addEventListener("cancel",e=>e.preventDefault());
  $("#dialogue-chasse").addEventListener("cancel",e=>{e.preventDefault();endHunt()});
  $("#dialogue-attaque").addEventListener("cancel",e=>e.preventDefault());$("#dialogue-bilan-attaque").addEventListener("cancel",e=>e.preventDefault());
  $("#dialogue-evenement").addEventListener("close",()=>{activeEventModal=null;returnToTrailTop()});
  $("#dialogue-bilan-riviere").addEventListener("close",()=>{activeRiverOutcome=null;returnToTrailTop()});
  $("#dialogue-bilan-chasse").addEventListener("close",returnToTrailTop);
  $("#dialogue-info").addEventListener("close",()=>{activeInfoView=null});
  $("#attaque-gauche").addEventListener("click",()=>moveAttack(-1));$("#attaque-droite").addEventListener("click",()=>moveAttack(1));$("#soigner-attaque").addEventListener("click",treatAttackWounds);$("#continuer-attaque").addEventListener("click",continueAfterAttack);
  const canvas=$("#canvas-chasse");canvas.addEventListener("pointermove",e=>{if(e.pointerType==="mouse")aimHuntAt(e)});canvas.addEventListener("pointerdown",e=>{if(!e.isPrimary||!hunt)return;e.preventDefault();aimHuntAt(e);shoot(e.pointerType!=="mouse")});canvas.addEventListener("keydown",e=>{if(!hunt)return;const step=18;if(e.key==="ArrowLeft")hunt.cross.x-=step;if(e.key==="ArrowRight")hunt.cross.x+=step;if(e.key==="ArrowUp")hunt.cross.y-=step;if(e.key==="ArrowDown")hunt.cross.y+=step;if(e.code==="Space"){e.preventDefault();shoot()}hunt.cross.x=clamp(hunt.cross.x,0,canvas.width);hunt.cross.y=clamp(hunt.cross.y,0,canvas.height)});
  $("#canvas-attaque").addEventListener("keydown",e=>{if(e.key==="ArrowLeft"){e.preventDefault();moveAttack(-1)}if(e.key==="ArrowRight"){e.preventDefault();moveAttack(1)}});
  document.addEventListener("keydown",e=>{
    const typing=e.target.matches?.("input, textarea, select, [contenteditable='true']");
    if(e.key!=="&"||typing||!game||game.finished||!$("#ecran-voyage").classList.contains("active")||$("dialog[open]")||hunt||attack)return;
    e.preventDefault();attackEvent();
  });
}

window.refreshGameLanguage=()=>{
  if(!game)return;
  if($("#ecran-boutique").classList.contains("active"))renderShop();
  if(game.finishState)renderFinish();else updateUI();
  if(activeEventModal&&$("#dialogue-evenement").open)refreshEventModalLanguage();
  if(activeRiverOutcome&&$("#dialogue-bilan-riviere").open)renderRiverOutcome();
  if(attackOutcome&&$("#dialogue-bilan-attaque").open)showAttackOutcome();
  if(activeInfoView&&$("#dialogue-info").open)renderInfoView();
  if(hunt?.running)$("#dialogue-chasse .eyebrow").textContent=languageText(regionVisual().title);
};

bindEvents();
