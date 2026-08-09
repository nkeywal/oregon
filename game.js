"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const KM_TOTAL = 3200;
const AMMO_PRICE_MULTIPLIER = 3;
function ammoPrice(basePrice){return basePrice*AMMO_PRICE_MULTIPLIER}
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
  boeufs: { label:"Bœufs", desc:"Une paire coûte 40 $. Il en faut au moins quatre.", unit:"bête", plural:"bêtes", unitEn:"ox", pluralEn:"oxen", step:2, price:40, max:12, start:0 },
  vivres: { label:"Vivres", desc:"Farine, lard, café et haricots. Prix pour 10 kg.", unit:"kg", plural:"kg", unitEn:"kg", pluralEn:"kg", step:10, price:4, max:800, start:0 },
  munitions: { label:"Munitions", desc:"Boîtes de 20 balles pour la chasse.", unit:"balle", plural:"balles", unitEn:"bullet", pluralEn:"bullets", step:20, price:ammoPrice(3), max:600, start:0 },
  vetements: { label:"Couvertures", desc:"Chacune protège un voyageur du froid et de l’humidité.", unit:"couverture", plural:"couvertures", unitEn:"blanket", pluralEn:"blankets", step:1, price:10, max:15, start:0 },
  pieces: { label:"Pièces de rechange", desc:"Roues, essieux et timons pour les avaries.", unit:"pièce", plural:"pièces", unitEn:"spare part", pluralEn:"spare parts", step:1, price:18, max:12, start:0 },
  medicaments: { label:"Remèdes", desc:"Bandages et fortifiants pour soigner le groupe.", unit:"dose", plural:"doses", unitEn:"dose", pluralEn:"doses", step:1, price:12, max:15, start:0 }
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

const ROUTE_SEGMENTS = [
  {start:0,end:165,key:"kansas-prairie",terrain:{fr:"Prairies du Kansas",en:"Kansas prairie"},slope:{fr:"terrain ondulé",en:"rolling ground"},road:{fr:"piste bien marquée",en:"well-marked trail"},climate:{fr:"continental humide",en:"humid continental"},summary:{fr:"Terrain ondulé · bonne piste · climat humide",en:"Rolling ground · good trail · humid climate"},speed:.97,risk:.01,tempOffset:0,rain:1,allowSnow:true,allowHot:true},
  {start:165,end:490,key:"great-plains",terrain:{fr:"Grandes Plaines",en:"Great Plains"},slope:{fr:"montée presque imperceptible",en:"barely perceptible ascent"},road:{fr:"piste ferme et visible",en:"firm, visible trail"},climate:{fr:"prairie venteuse",en:"windy grassland"},summary:{fr:"Montée légère · bonne piste · prairie venteuse",en:"Slight ascent · good trail · windy grassland"},speed:.96,risk:.01,tempOffset:-1,rain:.8,allowSnow:true,allowHot:true},
  {start:490,end:980,key:"platte-valley",terrain:{fr:"Vallée de la Platte",en:"Platte Valley"},slope:{fr:"longue montée douce",en:"long gentle ascent"},road:{fr:"piste fréquentée",en:"well-traveled trail"},climate:{fr:"semi-aride et venteux",en:"semi-arid and windy"},summary:{fr:"Montée douce · piste fréquentée · climat semi-aride",en:"Gentle ascent · traveled trail · semi-arid climate"},speed:.94,risk:.02,tempOffset:-2,rain:.65,allowSnow:true,allowHot:true},
  {start:980,end:1240,key:"rockies-foothills",terrain:{fr:"Contreforts des Rocheuses",en:"Rocky Mountain foothills"},slope:{fr:"montée irrégulière",en:"uneven ascent"},road:{fr:"ornières et pierres",en:"ruts and stones"},climate:{fr:"sec, nuits fraîches",en:"dry with cool nights"},summary:{fr:"Montée irrégulière · piste pierreuse · climat sec",en:"Uneven ascent · stony trail · dry climate"},speed:.84,risk:.07,tempOffset:-4,rain:.55,allowSnow:true,allowHot:true},
  {start:1240,end:1510,key:"high-plains",terrain:{fr:"Hautes plaines",en:"High Plains"},slope:{fr:"montée régulière",en:"steady ascent"},road:{fr:"sol dur mais pierreux",en:"firm but stony ground"},climate:{fr:"frais et peu humide",en:"cool and rather dry"},summary:{fr:"Montée régulière · piste dure · climat frais",en:"Steady ascent · firm trail · cool climate"},speed:.87,risk:.05,tempOffset:-5,rain:.5,allowSnow:true,allowHot:false},
  {start:1510,end:1810,key:"south-pass",terrain:{fr:"Sweetwater et South Pass",en:"Sweetwater and South Pass"},slope:{fr:"longue montée douce vers un col large",en:"long gentle ascent to a broad pass"},road:{fr:"piste visible mais très exposée",en:"visible but highly exposed trail"},climate:{fr:"haute altitude et changeant",en:"high-altitude and changeable"},summary:{fr:"Montée douce · piste exposée · climat d’altitude",en:"Gentle ascent · exposed trail · high-altitude climate"},speed:.86,risk:.06,tempOffset:-8,rain:.7,allowSnow:true,allowHot:false},
  {start:1810,end:2320,key:"high-desert",terrain:{fr:"Bassin aride",en:"High desert basin"},slope:{fr:"longue descente accidentée",en:"long, broken descent"},road:{fr:"piste sèche et difficile",en:"dry, difficult trail"},climate:{fr:"désertique, très sec",en:"desert, very dry"},summary:{fr:"Descente accidentée · piste difficile · désert sec",en:"Broken descent · difficult trail · dry desert"},speed:.83,risk:.08,tempOffset:2,rain:.12,allowSnow:false,allowHot:true},
  {start:2320,end:2580,key:"snake-plain",terrain:{fr:"Plaine de la Snake",en:"Snake River Plain"},slope:{fr:"faibles montées et descentes",en:"gentle rises and dips"},road:{fr:"poussière et roches volcaniques",en:"dust and volcanic rock"},climate:{fr:"aride et chaud",en:"arid and hot"},summary:{fr:"Relief faible · piste rocheuse · désert chaud",en:"Gentle relief · rocky trail · hot desert"},speed:.88,risk:.06,tempOffset:3,rain:.18,allowSnow:false,allowHot:true},
  {start:2580,end:2920,key:"blue-mountains",terrain:{fr:"Blue Mountains",en:"Blue Mountains"},slope:{fr:"montées raides puis descentes",en:"steep climbs followed by descents"},road:{fr:"piste forestière mauvaise",en:"poor forest trail"},climate:{fr:"montagnard et humide",en:"mountainous and wet"},summary:{fr:"Fortes pentes · mauvaise piste · montagne humide",en:"Steep slopes · poor trail · wet mountains"},speed:.68,risk:.14,tempOffset:-7,rain:1.05,allowSnow:true,allowHot:false},
  {start:2920,end:KM_TOTAL,key:"columbia",terrain:{fr:"Gorge de la Columbia",en:"Columbia Gorge"},slope:{fr:"descente raide vers Willamette",en:"steep descent toward Willamette"},road:{fr:"piste boueuse et encombrée",en:"muddy, obstructed trail"},climate:{fr:"océanique très humide",en:"very wet maritime"},summary:{fr:"Forte descente · piste boueuse · climat très humide",en:"Steep descent · muddy trail · very wet climate"},speed:.74,risk:.11,tempOffset:-2,rain:1.65,allowSnow:true,allowHot:false}
];

const WEATHER = [
  {name:"Doux",temp:18,cls:""},{name:"Chaud",temp:31,cls:""},{name:"Pluvieux",temp:13,cls:"rain"},
  {name:"Froid",temp:4,cls:""},{name:"Neige",temp:-4,cls:""}
];
const MONTHLY_BASE_TEMPERATURE = [-2,1,7,13,18,24,28,27,21,14,6,0];
// Calibré sur 12 à 15 miles par journée de marche en moyenne sur l'ensemble de la piste.
const PACES = {
  prudent:{km:130,health:1,food:.8,incident:.38,strain:-1},
  soutenu:{km:170,health:-1,food:1,incident:.62,strain:1},
  epuisant:{km:210,health:-7,food:1.45,incident:.92,strain:3}
};
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
let journalMergeTarget = null;
let queuedEventReturn = null;

function baseGame(names, profession, month) {
  const money = {fermier:800,charpentier:1000,banquier:1600}[profession];
  return {
    version:1, profession, money, initialMoney:money, cart:{...cart},
    party:names.map(name => ({name,health:100,state:"En forme",alive:true,sickDays:0,treated:false,woundDays:0,needsRemedy:false})),
    day:1, month:Number(month), year:1848, km:0, days:0, pace:"soutenu", rations:"normales",
    weather:{...WEATHER[0]}, weatherHistory:["Doux"], landmarkIndex:0, oxStrain:0, lastEvent:null, lastRestDay:null, restStreak:0, journal:[], finished:false, score:0,
    pendingDeath:null, deathEventOpen:false, pendingRiverOutcome:null
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
function weightedPick(entries){
  const total=entries.reduce((sum,entry)=>sum+Math.max(0,entry.weight),0);
  if(total<=0)return entries[0]?.value;
  let roll=Math.random()*total;
  for(const entry of entries){roll-=Math.max(0,entry.weight);if(roll<=0)return entry.value}
  return entries.at(-1)?.value;
}
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

function oxenJournalStatus(language=currentLanguage){
  const count=game.cart.boeufs;
  if(count<=0)return language==="en"?"No ox remains: the wagon is stranded.":"Il ne reste aucun bœuf : le chariot est immobilisé.";
  if(count===1)return language==="en"?"Only one ox remains: the wagon will be drastically slowed.":"Il ne reste qu’un bœuf : l’allure sera fortement ralentie.";
  if(count<4)return language==="en"?`${count} oxen remain: the weakened team will be drastically slowed.`:`Il reste ${count} bœufs : l’attelage affaibli sera fortement ralenti.`;
  if(count<6)return language==="en"?`${count} oxen remain: the wagon will now move more slowly.`:`Il reste ${count} bœufs : le chariot avancera désormais plus lentement.`;
  return language==="en"?`${count} oxen remain; the team can still hold its pace.`:`Il reste ${count} bœufs ; l’attelage peut encore tenir l’allure.`;
}
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
function consumeDelay(days,perPerson=dailyFoodPerPerson(),refreshClimate=true) {
  const food={needed:0,consumed:0,missing:0};
  for(let day=0;day<days;day++){
    advanceDate(1);const daily=consumeFood(1,perPerson);
    food.needed+=daily.needed;food.consumed+=daily.consumed;food.missing+=daily.missing;
    if(refreshClimate)refreshWeather();
  }
  applyFoodShortage(food,days);
  return food;
}
function loadFood(amount){
  const loaded=Math.max(0,Math.min(amount,SHOP.vivres.max-game.cart.vivres));
  game.cart.vivres+=loaded;return loaded;
}
function travelWeatherFactor(weather) { return {Doux:1,Chaud:.85,Pluvieux:.8,Froid:.9,Neige:.65}[weather.name]??1; }
function routeSegmentAt(km=game?.km??0){return ROUTE_SEGMENTS.find(segment=>km>=segment.start&&km<segment.end)||ROUTE_SEGMENTS.at(-1)}
function routeTravelFactor(route=routeSegmentAt()){return route.speed}
function plannedDailyDistance(pace,weather,route=routeSegmentAt(),oxen=game.cart.boeufs){
  const oxFactor=clamp(.45+oxen*.075,.5,1.35);
  return Math.max(1,Math.round(pace.km/5*oxFactor*travelWeatherFactor(weather)*routeTravelFactor(route)));
}
function daysInMonth(month,year=game?.year??1848){return month===1?(year%4===0?29:28):[3,5,8,10].includes(month)?30:31}
function seasonalTemperature(month,day,year=1848){
  const progress=(day-1)/daysInMonth(month,year),next=(month+1)%12;
  return MONTHLY_BASE_TEMPERATURE[month]*(1-progress)+MONTHLY_BASE_TEMPERATURE[next]*progress;
}
function weatherTransitionAllowed(previous,next){
  const allowed={Neige:["Neige","Froid"],Froid:["Neige","Froid","Pluvieux","Doux"],Pluvieux:["Froid","Pluvieux","Doux"],Doux:["Froid","Pluvieux","Doux","Chaud"],Chaud:["Doux","Chaud"]};
  return !previous||allowed[previous]?.includes(next);
}
function weatherWeights(route,expected,history=[]){
  const previous=history.at(-1);
  const weights={
    Doux:Math.max(.4,8-Math.abs(expected-18)*.55),
    Chaud:route.allowHot?Math.max(0,(expected-20)*.85):0,
    Pluvieux:Math.max(.08,route.rain*2.2)*(expected<=0?.2:1),
    Froid:Math.max(0,(13-expected)*.6),
    Neige:route.allowSnow&&expected<=5?Math.max(0,(6-expected)*.7):0
  };
  for(const name of Object.keys(weights)){
    if(!weatherTransitionAllowed(previous,name))weights[name]=0;
    if(name===previous)weights[name]*=4;
    weights[name]*=1+history.filter(item=>item===name).length*.65;
  }
  if(Object.values(weights).every(weight=>weight<=0))weights[previous==="Neige"?"Froid":previous==="Chaud"?"Doux":"Doux"]=1;
  return weights;
}
function weatherForPosition(month,day,year,km,history=[]){
  const route=routeSegmentAt(km),expected=seasonalTemperature(month,day,year)+route.tempOffset;
  const weights=weatherWeights(route,expected,history);
  const name=weightedPick(Object.entries(weights).map(([value,weight])=>({value,weight})))||"Doux";
  const temp={
    Chaud:clamp(Math.round(expected+rand(-1,4)),27,38),
    Doux:clamp(Math.round(expected+rand(-3,3)),10,25),
    Pluvieux:clamp(Math.round(expected+rand(-4,1)),6,22),
    Froid:clamp(Math.round(expected+rand(-4,1)),-2,9),
    Neige:clamp(Math.round(expected+rand(-5,-1)),-10,1)
  }[name];
  return {name,temp,cls:name==="Pluvieux"?"rain":""};
}
function refreshWeather(){
  game.weather=weatherForSeason();game.weatherHistory=[...(game.weatherHistory??[]),game.weather.name].slice(-3);return game.weather;
}
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
  // Le bilan d'un fleuve doit être présenté avant une éventuelle fin de partie
  // causée par les pertes subies pendant la traversée.
  if(game.pendingRiverOutcome)return false;
  if(alive().length===0&&!game.pendingDeath&&!game.deathEventOpen){
    finish(false,"La piste a eu raison de tout le convoi.");
    return true;
  }
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
  if(journalMergeTarget?.captureOutcomes){
    journalMergeTarget.outcomeFragments.push(text);
    journalMergeTarget.text=journalMergeTarget.outcomeFragments.reduce((combined,fragment,index)=>index?bilingualJoin(combined," ",fragment):fragment);
    return journalMergeTarget;
  }
  if(journalMergeTarget)return mergeJournalEntry(journalMergeTarget,text);
  const entry={day:game.day,month:game.month,year:game.year,text};
  game.journal.unshift(entry);return entry;
}

function mergeJournalEntry(entry,text) {
  if(!entry)return addJournal(text);
  entry.text=bilingualJoin(entry.text," ",text);return entry;
}

function journalDate(entry){return formatDate(entry.day,entry.month,entry.year)}
function journalItems(entries){return entries.map(j=>`<li><time>${escapeHtml(journalDate(j))}</time>${escapeHtml(languageText(j.text))}</li>`).join("")}

function recoveryJournal(traveler,condition){
  const fr={Dysenterie:`${traveler.name} a enfin vaincu la dysenterie et reprend sa place dans le convoi.`,Fièvre:`La fièvre de ${traveler.name} est enfin tombée.`,Malade:`${traveler.name} s’est remis de la maladie qui frappait le camp.`,Blessé:`La blessure de ${traveler.name} s’est refermée ; la piste peut reprendre.`,Engelures:`${traveler.name} ne souffre plus de ses engelures.`,Piqûres:`Les piqûres de ${traveler.name} ont fini par guérir.`,Convalescent:`${traveler.name} a achevé sa convalescence.`}[condition]??`${traveler.name} est de nouveau en forme.`;
  const en={Dysenterie:`${traveler.name} has finally overcome dysentery and returns to their place in the wagon party.`,Fièvre:`${traveler.name}’s fever has finally broken.`,Malade:`${traveler.name} has recovered from the illness that struck the camp.`,Blessé:`${traveler.name}’s wound has closed; the trail may continue.`,Engelures:`${traveler.name} has recovered from frostbite.`,Piqûres:`${traveler.name}’s infected bites have finally healed.`,Convalescent:`${traveler.name} has completed their recovery.`}[condition]??`${traveler.name} is well again.`;
  addJournal(bilingual(fr,en));
}

function advanceDate(days) {
  for(let i=0;i<days;i++){
    game.day++; game.days++;
    const lengths=[31,(game.year%4===0?29:28),31,30,31,30,31,31,30,31,30,31];
    if(game.day>lengths[game.month]){game.day=1;game.month++;if(game.month>11){game.month=0;game.year++;}}
    for(const p of alive()){
      const previousCondition=p.state,wasSick=p.sickDays>0,wasWounded=(p.woundDays??0)>0;
      let dailyLoss=0;
      if(p.sickDays>0){
        const untreatedLoss=({Dysenterie:3,Fièvre:2,Malade:2,Blessé:2,Engelures:2,Piqûres:1,Convalescent:1}[p.state]??1);
        dailyLoss+=p.treated?Math.max(1,Math.floor(untreatedLoss/2)):untreatedLoss;
        p.sickDays--;
      }
      if((p.woundDays??0)>0){
        dailyLoss+=p.needsRemedy?2:1;p.woundDays--;
        if(p.woundDays<=0)p.needsRemedy=false;
      }
      p.health=clamp(p.health-dailyLoss,0,100);
      if(p.sickDays<=0){
        p.treated=false;
        p.state=(p.woundDays??0)>0?(p.needsRemedy?"Blessé":"Convalescent"):"En forme";
      }
      const illnessEnded=wasSick&&p.sickDays<=0,woundEnded=wasWounded&&(p.woundDays??0)<=0;
      if(illnessEnded){
        if((p.woundDays??0)>0)addJournal(bilingual(`${p.name} a vaincu ${previousCondition.toLowerCase()}, mais sa blessure exige encore des soins.`,`${p.name} has overcome ${languageText(previousCondition,"en").toLowerCase()}, but the wound still needs care.`));
        else recoveryJournal(p,previousCondition);
      }
      if(woundEnded&&!illnessEnded){
        if(p.sickDays>0)addJournal(bilingual(`La blessure d’attaque de ${p.name} s’est refermée, mais ${p.name} reste malade.`,`${p.name}’s attack wound has healed, but ${p.name} remains ill.`));
        else addJournal(bilingual(`La blessure d’attaque de ${p.name} a fini par se refermer.`,`${p.name}’s attack wound has finally healed.`));
      }
    }
  }
}

function restRecovery(traveler,streak=1,atFort=false){
  const maximum=traveler.sickDays>0||(traveler.woundDays??0)>0?5.5:atFort?6:7;
  const fatigueFactor=clamp((105-traveler.health)/55,.12,1),streakFactor=Math.pow(.62,Math.max(0,streak-1));
  return Math.round(maximum*fatigueFactor*streakFactor*2)/2;
}

function healthLabel(value) {
  if(value>74)return ["Bonne santé","good"];
  if(value>44)return ["Fatigué","warn"];
  if(value>0)return ["Très faible","bad"];
  return ["Décédé","dead"];
}

function travelerStatusClass(traveler) {
  if(!traveler.alive)return "dead";
  if(traveler.state==="En forme")return healthLabel(traveler.health)[1];
  return traveler.state==="Convalescent"?"warn":"bad";
}

function groupHealthSummary() {
  const travelers=alive();
  if(!travelers.length)return healthLabel(0);
  const average=travelers.reduce((sum,traveler)=>sum+traveler.health,0)/travelers.length;
  const summary=healthLabel(average);
  if(summary[1]==="good"&&travelers.some(traveler=>traveler.state!=="En forme"))return [bilingual("Maladie en cours","Illness in party"),"warn"];
  return summary;
}

function injuryCondition(value) {
  if(value>64)return "Blessure légère";
  if(value>34)return "Sérieusement affaibli";
  return "État critique";
}

function weatherVisual() {
  if(game.weather.name==="Pluvieux")return {key:"rain",label:"temps pluvieux"};
  if(game.weather.name==="Froid"||game.weather.name==="Neige")return {key:"cold",label:"temps froid"};
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

function stageApproachPhase(stage=currentStage()){
  const index=LANDMARKS.indexOf(stage),start=index>0?LANDMARKS[index-1].km:index===0?0:LANDMARKS.at(-1).km;
  const progress=clamp((game.km-start)/Math.max(1,stage.km-start),0,1);
  return progress<.45?"far":progress<.78?"mid":"near";
}

function stageAsset(stage=currentStage(),weather=weatherVisual()) {
  const phase=stageApproachPhase(stage);
  return phase==="near"?`stage-${stage.visual}-${weather.key}.webp`:`progress-${stage.visual}-${phase}.webp`;
}

function applyStageArt(element,file,weather=weatherVisual()){
  const sprite=file.startsWith("progress-");
  element.style.backgroundImage=`url('assets/${file}')`;
  element.style.backgroundSize=sprite?"200% 200%":"cover";
  element.style.backgroundPosition=sprite?({mild:"0% 0%",cold:"100% 0%",hot:"0% 100%",rain:"100% 100%"}[weather.key]):"center";
}

function applyWeatherSprite(element,file,weather=weatherVisual()){
  element.style.backgroundImage=`url('assets/${file}')`;
  element.style.backgroundSize="200% 200%";
  element.style.backgroundPosition=({mild:"0% 0%",cold:"100% 0%",hot:"0% 100%",rain:"100% 100%"}[weather.key]??"0% 0%");
}

function fortArrivalAsset(fort,weather=weatherVisual()) {
  return `arrival-${fort.visual}-${weather.key}.webp`;
}

function showLandmarkArt(mark,art,weather=weatherVisual()) {
  const scene=$("#scene");scene.className="scene landmark-scene";applyStageArt(scene,art,weather);
  scene.setAttribute("aria-label",mark.kind==="fort"?(currentLanguage==="en"?`Arriving at the gate of ${landmarkName(mark)}, in ${languageText(weather.label)}`:`Arrivée à la porte de ${mark.name}, par ${weather.label}`):(currentLanguage==="en"?`${landmarkName(mark)}, in ${languageText(weather.label)}`:`${mark.name}, par ${weather.label}`));
}

function refreshFortArrivalArt(mark) {
  const weather=weatherVisual(),art=fortArrivalAsset(mark,weather);showLandmarkArt(mark,art,weather);
  applyStageArt($("#event-art"),art,weather);
}

function setTrailScene() {
  const weather=weatherVisual(),stage=currentStage(),scene=$("#scene");
  scene.className=`scene trail-scene stage-scene weather-${weather.key}`;
  applyStageArt(scene,stageAsset(stage,weather),weather);
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
  const [global,cls]=groupHealthSummary(); $("#sante-globale").textContent=languageText(global); $("#sante-globale").className=`status ${cls}`;
  $("#liste-groupe").innerHTML=game.party.map(p=>{const [label]=healthLabel(p.health),state=p.state!=="En forme"?p.state:label;return `<li><span class="health-dot ${travelerStatusClass(p)}" aria-hidden="true"></span><b>${escapeHtml(p.name)}</b><span class="party-state">${escapeHtml(languageText(p.alive?state:label))}</span></li>`}).join("");
  $("#journal").innerHTML=journalItems(game.journal.slice(0,4));
  const next=LANDMARKS.find(l=>l.km>game.km);
  const route=routeSegmentAt();
  $("#lieu").textContent=next?`${landmarkName(next)} · ${Math.max(0,Math.round(next.km-game.km))} km`:languageText("Vallée de Willamette");
  $("#meteo").textContent=`${languageText(game.weather.name)} · ${game.weather.temp} °C`;
  $("#conditions-route").textContent=languageText(route.summary);
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
  game.weather=weatherForPosition(game.month,game.day,game.year,0,[]);game.weatherHistory=[game.weather.name];
  addJournal("Nous avons quitté Independence. La piste s’ouvre devant nous.");
  showScreen("ecran-voyage");updateUI();
}

function dailyIncidentChance(pace,weather,route=routeSegmentAt()){
  const weatherRisk={Doux:0,Chaud:.04,Pluvieux:.08,Froid:.04,Neige:.1}[weather.name]||0;
  const blanketShortage=alive().length?Math.max(0,alive().length-game.cart.vetements)/alive().length:0;
  const blanketRisk=blanketShortage*(weather.name==="Neige"?.14:weather.temp<=5?.1:weather.name==="Pluvieux"?.06:0);
  const equipmentRisk=(game.cart.pieces===0?.07:0)+(game.cart.boeufs<4?.06:0)+blanketRisk;
  const journeyChance=clamp(pace.incident+weatherRisk+equipmentRisk+route.risk+game.oxStrain*.012,.24,.97);
  return 1-Math.pow(1-journeyChance,1/5);
}

function dailyIncidentOccurs(pace,weather){return Math.random()<dailyIncidentChance(pace,weather)}

function weatherExposurePenalty(weather,hasBlanket){
  if(hasBlanket)return 0;
  if(weather.name==="Neige"||weather.temp<0)return 4;
  if(weather.temp<=5)return 2;
  if(weather.name==="Pluvieux")return 1;
  return 0;
}

function travelWeatherLabel(weatherName,language=currentLanguage){
  const labels={
    Doux:{fr:"temps modéré",en:"mild weather"},
    Chaud:{fr:"temps très chaud",en:"very hot weather"},
    Pluvieux:{fr:"temps pluvieux",en:"rainy weather"},
    Froid:{fr:"temps froid",en:"cold weather"},
    Neige:{fr:"temps de neige",en:"snowy weather"}
  };
  return labels[weatherName]?.[language]??String(weatherName).toLowerCase();
}

function recordTravelWeather(breakdown,weather,distance){
  let entry=breakdown.find(item=>item.name===weather.name);
  if(!entry){entry={name:weather.name,distance:0,days:0};breakdown.push(entry)}
  entry.distance+=distance;entry.days++;
}

function addTravelJournal(distance,days,weatherBreakdown=[],route=routeSegmentAt()){
  const breakdown=weatherBreakdown.length?weatherBreakdown:[{name:game.weather.name,distance,days}];
  const detailsFr=joinList(breakdown.map(item=>`${item.distance} km par ${travelWeatherLabel(item.name,"fr")}`),"fr");
  const detailsEn=joinList(breakdown.map(item=>`${item.distance} km in ${travelWeatherLabel(item.name,"en")}`),"en");
  const paceJournal=game.pace==="epuisant"?" Le rythme épuisant a durement éprouvé le convoi.":"";
  const paceJournalEn=game.pace==="epuisant"?" The grueling pace severely tested the wagon party.":"";
  const weatherTextFr=breakdown.length===1?`par ${travelWeatherLabel(breakdown[0].name,"fr")}`:`: ${detailsFr}`;
  const weatherTextEn=breakdown.length===1?`in ${travelWeatherLabel(breakdown[0].name,"en")}`:`: ${detailsEn}`;
  const routeTextFr=` Terrain : ${route.terrain.fr} ; ${route.slope.fr} ; ${route.road.fr} ; climat ${route.climate.fr}.`;
  const routeTextEn=` Terrain: ${route.terrain.en}; ${route.slope.en}; ${route.road.en}; ${route.climate.en} climate.`;
  return addJournal(bilingual(`${distance} km parcourus en ${days} jour${days>1?"s":""} ${weatherTextFr}.${routeTextFr}${paceJournal}`,`${distance} km traveled in ${days} day${days===1?"":"s"} ${weatherTextEn}.${routeTextEn}${paceJournalEn}`));
}

function travel(daysToTravel=5){
  if(game.finished)return;
  if(checkJourneyFailure())return;
  if(game.cart.vivres<=0){if(!offerOxForFood(()=>travel(daysToTravel)))resolveStarvation();return;}
  const pace=PACES[game.pace],travelRoute=routeSegmentAt();
  let distance=0,foodConsumed=0,travelDays=0;const travelWeatherBreakdown=[];
  for(let day=0;day<daysToTravel;day++){
    if(game.cart.vivres<=0){
      if(travelDays)addTravelJournal(distance,travelDays,travelWeatherBreakdown,travelRoute);
      if(!offerOxForFood(()=>travel(daysToTravel-travelDays)))resolveStarvation();updateUI();return;
    }
    const travelWeather=game.weather,plannedDistance=plannedDailyDistance(pace,travelWeather,travelRoute);
    const next=LANDMARKS[game.landmarkIndex];
    const remainingToStop=Math.min(next?next.km-game.km:Infinity,KM_TOTAL-game.km);
    const dayDistance=Math.max(0,Math.min(plannedDistance,remainingToStop));
    game.km+=dayDistance;distance+=dayDistance;recordTravelWeather(travelWeatherBreakdown,travelWeather,dayDistance);advanceDate(1);travelDays++;
    const food=consumeFood(1,dailyFoodPerPerson()*pace.food),foodShortage=food.missing>0;
    foodConsumed+=food.consumed;game.oxStrain=clamp((game.oxStrain||0)+pace.strain/5+Math.max(0,6-game.cart.boeufs)*.04,0,10);
    const travelers=alive(),blankets=Math.min(game.cart.vetements,travelers.length);
    travelers.forEach((p,index)=>{
      const rationHealth={copieuses:1,normales:-1,maigres:-5}[game.rations];
      // Les couvertures sont partagées à tour de rôle lorsque le groupe n'en a pas assez.
      const hasBlanket=blankets>=travelers.length||((index+game.days)%travelers.length)<blankets;
      const exposurePenalty=weatherExposurePenalty(travelWeather,hasBlanket);
      const heatPenalty=travelWeather.temp>=27?-2:0;
      const strainPenalty=game.oxStrain>=7?-2:game.oxStrain>=4?-1:0;
      const starvationPenalty=foodShortage?Math.max(1,Math.ceil(8*food.missing/food.needed)):0;
      p.health=clamp(p.health+(pace.health+rationHealth+heatPenalty+strainPenalty)/5-exposurePenalty-starvationPenalty,0,100);
    });
    updateDeaths();
    if(game.pendingDeath){
      addTravelJournal(distance,travelDays,travelWeatherBreakdown,travelRoute);showPendingDeathEvent();updateUI();return;
    }
    if(game.finished)return;
    if(game.km>=KM_TOTAL){addTravelJournal(distance,travelDays,travelWeatherBreakdown,travelRoute);finish(true);return;}
    if(next&&game.km>=next.km){addTravelJournal(distance,travelDays,travelWeatherBreakdown,travelRoute);game.landmarkIndex++;landmark(next);updateUI();return;}
    if(dailyIncidentOccurs(pace,travelWeather)){addTravelJournal(distance,travelDays,travelWeatherBreakdown,travelRoute);randomEvent();updateUI();return;}
    refreshWeather();
  }
  const travelEntry=addTravelJournal(distance,travelDays,travelWeatherBreakdown,travelRoute);quietTravelEvent(distance,Math.round(foodConsumed),travelDays,travelEntry);updateUI();
}

function quietTravelEvent(distance,foodConsumed,travelDays=5,travelEntry=null){
  const paceText={prudent:"L’allure prudente a ménagé le groupe et l’attelage.",soutenu:"L’allure soutenue a laissé une fatigue ordinaire.",epuisant:"Même sans accident, l’allure épuisante a durement éprouvé le groupe et les bœufs."}[game.pace];
  const paceTextEn={prudent:"The steady pace spared the party and the oxen.",soutenu:"The strenuous pace caused ordinary fatigue.",epuisant:"Even without an accident, the grueling pace severely tested the party and the oxen."}[game.pace];
  eventModal("Une étape sans incident",bilingual(`Le convoi a avancé de ${distance} km en ${travelDays} jour${travelDays>1?"s":""}.`,`The wagon party traveled ${distance} km in ${travelDays} day${travelDays===1?"":"s"}.`),bilingual(`${foodConsumed} kg de vivres ${foodConsumed<=1?"a été consommé":"ont été consommés"}. ${paceText}`,`${foodConsumed} kg of food ${foodConsumed===1?"was":"were"} consumed. ${paceTextEn}`),[
    {label:"Poursuivre la route",action:()=>mergeJournalEntry(travelEntry,"Une étape calme et sans incident.")}
  ],stageAsset());
}

function weatherForSeason(){
  return weatherForPosition(game.month,game.day,game.year,game.km,game.weatherHistory??[]);
}

function slaughterOxForFood(){
  if(game.cart.boeufs<=1||game.cart.vivres>0)return 0;
  const meat=rand(42,58);game.cart.boeufs--;const loaded=loadFood(meat);
  addJournal(bilingual(`Les vivres étaient épuisés : un bœuf a été abattu et a fourni ${loaded} kg de viande. ${oxenJournalStatus("fr")}`,`With the food stores empty, an ox was slaughtered for ${loaded} kg of meat. ${oxenJournalStatus("en")}`));
  return loaded;
}

function offerOxForFood(afterFeeding=null){
  if(game.cart.vivres>0||game.cart.boeufs<=1)return false;
  eventModal(bilingual("Les vivres sont épuisés","The food stores are empty"),bilingual("Le groupe n’a plus rien à manger. Un bœuf pourrait être abattu pour nourrir le convoi.","The party has nothing left to eat. An ox could be slaughtered to feed the wagon party."),bilingual(`Il resterait ${game.cart.boeufs-1} bœuf${game.cart.boeufs-1>1?"s":""} pour tirer le chariot.`,`There would be ${game.cart.boeufs-1} ${game.cart.boeufs-1===1?"ox":"oxen"} left to pull the wagon.`),[
    {label:bilingual("Abattre un bœuf","Slaughter an ox"),action:slaughterOxForFood,afterClose:afterFeeding},
    {label:bilingual("Conserver l’attelage","Keep the team"),action:()=>addJournal(bilingual("Le convoi a conservé son dernier attelage et affronte désormais la faim.","The wagon party kept its remaining team and now faces starvation.")),afterClose:()=>resolveStarvation(false)}
  ],"incident-ox-injury.webp");
  return true;
}

function resolveStarvation(recordInJournal=true){
  for(const p of alive())p.health=clamp(p.health-18,0,100);
  for(let day=0;day<3;day++){advanceDate(1);refreshWeather()}if(recordInJournal)addJournal("Les vivres sont épuisés. La faim affaiblit tout le monde.");updateDeaths();
  if(showPendingDeathEvent()||game.finished)return;
  updateUI();randomEvent();
}

function updateDeaths(){
  const dying=shuffled(alive().filter(p=>p.health<=0));
  const deaths=dying.slice(0,1);
  for(const p of deaths){
    p.alive=false;p.state="Décédé";game.pendingDeath=p;
  }
  // Une même étape peut affaiblir tout le groupe, mais ne doit pas tuer
  // plusieurs voyageurs simultanément. Les autres restent en état critique.
  for(const p of dying.slice(1)){
    p.health=1;p.state="Très faible";
  }
  return deaths[0]??null;
}

function deathEventAsset(remaining=alive().length){
  return `incident-death-${clamp(Math.round(remaining),0,4)}.webp`;
}

function showPendingDeathEvent(){
  const traveler=game.pendingDeath;
  if(!traveler)return false;
  game.pendingDeath=null;game.deathEventOpen=true;const remaining=alive().length;
  const details=remaining?bilingual("Le convoi s’arrête pour lui offrir une sépulture avant de reprendre la route.","The wagon party stops to give them a burial before returning to the trail."):bilingual("Le chariot demeure seul près des tombes. Plus personne ne reprendra la piste.","The wagon stands alone beside the graves. No one remains to return to the trail.");
  eventModal(bilingual("Un compagnon est mort","A companion has died"),bilingual(`${traveler.name} est mort sur la piste.`,`${traveler.name} died on the trail.`),details,[
    {label:remaining?bilingual("Rendre un dernier hommage et repartir","Pay your last respects and leave"):bilingual("Voir le bilan du convoi","View the wagon party’s final report"),action:()=>{game.deathEventOpen=false;if(!remaining){finish(false,"La piste a eu raison de tout le convoi.");return;}setTimeout(showPendingRiverOutcome,0)}}
  ],deathEventAsset());
  return true;
}

function eventEligibleTravelers(){return alive().filter(p=>p.sickDays<=0&&(p.woundDays??0)<=0&&!p.needsRemedy)}
function taggedEvent(id,run){run.eventId=id;return run}

function eventPool(){
  if(game.finished||!alive().length)return [];
  const patients=eventEligibleTravelers(),route=routeSegmentAt();
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
  if(patients.length&&((game.weather.temp<=5&&game.cart.vetements<alive().length)||game.weather.temp>=27))events.push(taggedEvent("climate-injury",()=>climateInjuryEvent(pick(patients))));
  if(game.cart.boeufs>0){oxEventChoice=taggedEvent("ox-injury",oxInjuryEvent);events.push(oxEventChoice)}
  if(game.pace==="soutenu")events.push(wagonEvent,...(injuryEventChoice?[injuryEventChoice]:[]));
  if(game.pace==="epuisant"){
    events.push(wagonEvent,wagonEvent,axleEvent,axleEvent,...(injuryEventChoice?[injuryEventChoice,injuryEventChoice]:[]));
    if(oxEventChoice)events.push(oxEventChoice,oxEventChoice,oxEventChoice);
  }
  if(route.risk>=.06)events.push(wagonEvent);
  if(route.risk>=.1)events.push(axleEvent);
  if(oxEventChoice&&game.oxStrain>=6)events.push(oxEventChoice,oxEventChoice,oxEventChoice);
  return events;
}

function selectEvent(events){
  if(!events.length)return null;
  const withoutRepeat=events.filter(event=>event.eventId!==game.lastEvent);
  return pick(withoutRepeat.length?withoutRepeat:events);
}

function randomEvent(){
  const selected=selectEvent(eventPool());if(!selected)return;
  game.lastEvent=selected.eventId;selected();
}

function restEventPool(){
  const allowed=new Set(["attack","theft","trade","encounter","fever","dysentery","contagious","climate-injury","blankets"]);
  return eventPool().filter(event=>allowed.has(event.eventId));
}

function groupJournalSummary(){
  const travelers=alive();if(!travelers.length)return bilingual("Le camp est silencieux : plus personne ne répond à l’appel.","The camp is silent: no one answers the call.");
  const average=travelers.reduce((sum,traveler)=>sum+traveler.health,0)/travelers.length,unwell=travelers.filter(traveler=>traveler.state!=="En forme");
  if(unwell.length){
    const statesFr=joinList(unwell.map(traveler=>`${traveler.name} (${traveler.state.toLowerCase()})`),"fr"),statesEn=joinList(unwell.map(traveler=>`${traveler.name} (${languageText(traveler.state,"en").toLowerCase()})`),"en");
    return bilingual(`${statesFr} ${unwell.length===1?"reste éprouvé":"restent éprouvés"}. ${average>55?"Le groupe tient encore debout.":"Le convoi repart avec des forces très fragiles."}`,`${statesEn} ${unwell.length===1?"remains":"remain"} unwell. ${average>55?"The party is still standing.":"The wagon party moves on with dangerously little strength."}`);
  }
  if(average>74)return bilingual("Le groupe repart d’un pas plus sûr, prêt à affronter la piste.","The party sets out with a steadier step, ready to face the trail.");
  if(average>44)return bilingual("Le repos a aidé, mais la fatigue demeure visible sur tous les visages.","The rest helped, but fatigue still shows on every face.");
  return bilingual("Le groupe reste au bord de l’épuisement malgré la halte.","The party remains near exhaustion despite the halt.");
}

function performRest(days=2,atFort=false){
  const streak=game.lastRestDay===game.days?(game.restStreak??0)+1:1,pace=PACES[game.pace];
  let rested=0,selected=null;
  for(let day=0;day<days;day++){
    const restWeather=game.weather;consumeDelay(1,2);rested++;updateDeaths();
    if(game.pendingDeath||game.finished)break;
    if(!atFort&&dailyIncidentOccurs(pace,restWeather)){selected=selectEvent(restEventPool());if(selected)break;}
  }
  const portion=rested/Math.max(1,days);
  game.oxStrain=clamp(game.oxStrain-3*portion,0,10);
  alive().forEach(traveler=>traveler.health=clamp(traveler.health+restRecovery(traveler,streak,atFort)*portion,0,100));
  game.restStreak=streak;game.lastRestDay=game.days;
  const repeatFr=streak>1?" Les haltes successives apportent chaque fois moins de répit.":"",repeatEn=streak>1?" Each successive halt brings less relief.":"";
  const interruptionFr=selected?" La halte a été interrompue par un événement au camp.":"",interruptionEn=selected?" An event in camp interrupted the halt.":"";
  const state=groupJournalSummary();
  addJournal(bilingual(`${rested} jour${rested>1?"s":""} de repos ont soulagé le groupe et l’attelage.${repeatFr}${interruptionFr} ${state.fr}`,`${rested} day${rested===1?"":"s"} of rest eased the party and the oxen.${repeatEn}${interruptionEn} ${state.en}`));
  return {days:rested,streak,event:selected};
}

function runRestEvent(event,returnCallback=null){
  if(!event)return false;queuedEventReturn=returnCallback;game.lastEvent=event.eventId;event();return true;
}

function feverEvent(p){
  if(!p)return;
  p.health=clamp(p.health-rand(16,28),0,100);p.state="Fièvre";p.sickDays=14;p.treated=false;
  eventModal("La fièvre",bilingual(`${p.name} souffre d’une forte fièvre.`,`${p.name} is suffering from a high fever.`),"Un remède améliore nettement ses chances.",[
    {label:remedyLabel("Utiliser un remède"),disabled:game.cart.medicaments<1,action:()=>{game.cart.medicaments--;p.health=clamp(p.health+18,1,100);p.sickDays=10;p.treated=true;addJournal(bilingual(`${p.name} a reçu un remède. La fièvre demandera encore plusieurs jours de convalescence.`,`${p.name} received medicine. The fever will still require several days of recovery.`))}},
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
      game.cart.boeufs--;const loaded=loadFood(meat);game.oxStrain=clamp(game.oxStrain-2,0,10);
      const resultFr=loaded?`Un bœuf blessé a été abattu. Sa viande ajoute ${loaded} kg aux réserves.`:"Un bœuf blessé a été abattu, mais le chariot était trop plein pour charger sa viande.";
      const resultEn=loaded?`An injured ox was slaughtered. Its meat adds ${loaded} kg to the food stores.`:"An injured ox was slaughtered, but the wagon was too full to load its meat.";
      addJournal(bilingual(`${resultFr} ${oxenJournalStatus("fr")}`,`${resultEn} ${oxenJournalStatus("en")}`));
    }}
  ],"incident-ox-injury.webp");
}

function injuryEvent(p=pick(eventEligibleTravelers())){
  if(!p)return;
  const damage=rand(18,30);p.health=clamp(p.health-damage,0,100);p.state="Blessé";p.sickDays=10;
  eventModal("Blessure sur la piste",bilingual(`${p.name} a fait une mauvaise chute près du chariot.`,`${p.name} took a bad fall near the wagon.`),bilingual(`Sa blessure l’a fortement affaibli. Un remède et des bandages accéléreraient sa guérison.`,`The injury has left ${p.name} badly weakened. Medicine and bandages would speed recovery.`),[
    {label:remedyLabel("Utiliser un remède"),disabled:game.cart.medicaments<1,action:()=>{game.cart.medicaments--;p.health=clamp(p.health+16,1,100);p.sickDays=4;p.state="Convalescent";addJournal(bilingual(`${p.name} a été soigné après sa chute.`,`${p.name} was treated after the fall.`))}},
    {label:"Poser une attelle",action:()=>{consumeDelay(1);p.sickDays=8;addJournal(bilingual(`${p.name} voyage avec une attelle improvisée.`,`${p.name} travels with an improvised splint.`))}}
  ],"incident-injury.webp");
}

function dysenteryEvent(p=pick(eventEligibleTravelers())){
  if(!p)return;
  const damage=rand(24,36);p.health=clamp(p.health-damage,0,100);p.state="Dysenterie";p.sickDays=19;p.treated=false;
  eventModal("Dysenterie",bilingual(`${p.name} est pris de violentes douleurs et se déshydrate rapidement.`,`${p.name} suffers violent pain and is rapidly becoming dehydrated.`),bilingual(`Son état s’est sérieusement dégradé. Du repos, de l’eau bouillie et un remède peuvent éviter le pire.`,`${p.name}’s condition has seriously deteriorated. Rest, boiled water, and medicine may prevent the worst.`),[
    {label:remedyLabel("Donner un remède"),disabled:game.cart.medicaments<1,action:()=>{game.cart.medicaments--;p.health=clamp(p.health+18,1,100);p.sickDays=13;p.treated=true;addJournal(bilingual(`${p.name} a reçu un remède contre la dysenterie, mais restera malade plusieurs jours.`,`${p.name} received medicine for dysentery but will remain ill for several days.`))}},
    {label:"Faire halte 2 jours",action:()=>{consumeDelay(2);if(p.health>0)p.health=clamp(p.health+2,1,100);p.sickDays=Math.max(p.sickDays,15);addJournal(bilingual(`Le convoi s’est arrêté pour soigner la dysenterie de ${p.name}. Deux jours ne suffisent pas à la faire disparaître.`,`The wagon party stopped to treat ${p.name}’s dysentery. Two days are not enough for it to pass.`))}},
    {label:"Continuer",action:()=>{p.health=clamp(p.health-8,0,100);addJournal(bilingual(`${p.name} reste gravement atteint de dysenterie.`,`${p.name} remains seriously ill with dysentery.`))}}
  ],"incident-dysentery.webp");
}

function climateInjuryEvent(p=pick(eventEligibleTravelers())){
  if(!p)return;
  const cold=game.weather.temp<=5,damage=cold?rand(14,23):rand(8,16);
  p.health=clamp(p.health-damage,0,100);p.state=cold?"Engelures":"Piqûres";p.sickDays=cold?11:7;
  const title=cold?"Engelures":"Piqûres d’insectes";
  const text=bilingual(cold?`${p.name} souffre d’engelures après une longue exposition au froid.`:`${p.name} est couvert de piqûres douloureuses après une halte sous une chaleur étouffante.`,cold?`${p.name} suffers from frostbite after prolonged exposure to the cold.`:`${p.name} is covered in painful insect bites after a stop in oppressive heat.`);
  const details=cold?"Il faut réchauffer progressivement les zones atteintes.":"Les piqûres se sont infectées et doivent être nettoyées.";
  eventModal(title,text,bilingual(`${details} ${p.name} en ressort affaibli.`,`${languageText(details,"en")} ${p.name} is left weakened.`),[
    {label:remedyLabel("Utiliser un remède"),disabled:game.cart.medicaments<1,action:()=>{game.cart.medicaments--;p.health=clamp(p.health+(cold?17:12),1,100);p.sickDays=4;p.state="Convalescent";addJournal(bilingual(`${p.name} a été soigné pour ${cold?"des engelures":"des piqûres d’insectes"}.`,`${p.name} was treated for ${cold?"frostbite":"insect bites"}.`))}},
    {label:cold?"Réchauffer et attendre":"Nettoyer et repartir",action:()=>{if(cold)consumeDelay(1);p.sickDays=cold?8:5;addJournal(bilingual(`${p.name} récupère lentement après ${cold?"ses engelures":"ses piqûres"}.`,`${p.name} is recovering slowly from ${cold?"frostbite":"the bites"}.`))}}
  ],cold?"incident-frostbite.webp":"incident-bites.webp");
}

function contagiousDiseaseEvent(candidates=eventEligibleTravelers()){
  const patients=shuffled(candidates).slice(0,Math.min(candidates.length,rand(2,3)));if(!patients.length)return;
  patients.forEach(p=>{p.health=clamp(p.health-rand(12,22),0,100);p.state="Malade";p.sickDays=Math.max(p.sickDays,17);p.treated=false});
  const count=patients.length,namesFr=joinList(patients.map(p=>p.name),"fr"),namesEn=joinList(patients.map(p=>p.name),"en");
  eventModal("Maladie contagieuse",bilingual(`${count} voyageur${count>1?"s":""} présente${count>1?"nt":""} les mêmes symptômes : ${namesFr}.`,`${count} traveler${count===1?"":"s"} ${count===1?"shows":"show"} the same symptoms: ${namesEn}.`),bilingual(`La maladie risque d’épuiser rapidement le groupe. Vous avez ${itemQuantityFor("medicaments",game.cart.medicaments,"fr")}.`,`The disease may quickly exhaust the party. You have ${itemQuantityFor("medicaments",game.cart.medicaments,"en")}.`),[
    {label:remedyLabel(bilingual(`Distribuer ${count} remède${count>1?"s":""}`,`Give ${count} dose${count===1?"":"s"}`),count),disabled:game.cart.medicaments<count,action:()=>{game.cart.medicaments-=count;patients.forEach(p=>{p.health=clamp(p.health+14,1,100);p.sickDays=11;p.treated=true});addJournal(bilingual(`${namesFr} ${count>1?"ont":"a"} reçu un remède, mais la maladie suivra encore son cours.`,`${namesEn} ${count===1?"has":"have"} received medicine, but the illness will still run its course.`))}},
    {label:"Isoler les malades 2 jours",action:()=>{consumeDelay(2);patients.forEach(p=>p.sickDays=Math.max(p.sickDays,13));addJournal(bilingual(`${namesFr} ${count>1?"ont été isolés":"a été isolé"} pendant deux jours pour protéger le convoi.`,`${namesEn} ${count===1?"was":"were"} isolated for two days to protect the wagon party.`))}},
    {label:"Continuer la route",action:()=>{patients.forEach(p=>p.health=clamp(p.health-5,0,100));addJournal(bilingual(`${namesFr} ${count>1?"poursuivent":"poursuit"} la route malgré la maladie contagieuse.`,`${namesEn} ${count===1?"continues":"continue"} on the trail despite the contagious disease.`))}}
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
    {label:"Sécuriser le chargement",action:()=>addJournal(bilingual(`Un vol nous a coûté ${stolenLabel}.${stolen.key==="boeufs"?` ${oxenJournalStatus("fr")}`:""}`,`A theft cost us ${stolenLabelEn}.${stolen.key==="boeufs"?` ${oxenJournalStatus("en")}`:""}`))}
  ],"incident-theft.webp");
}

function tradeEvent(){
  const offers=[
    {mode:"buy",key:"vivres",qty:50,price:34,label:"50 kg de vivres"},
    {mode:"buy",key:"munitions",qty:40,price:ammoPrice(18),label:"40 balles"},
    {mode:"buy",key:"pieces",qty:1,price:28,label:"1 pièce de rechange"},
    {mode:"buy",key:"medicaments",qty:2,price:30,label:"2 remèdes"},
    {mode:"buy",key:"boeufs",qty:2,price:85,label:"2 bœufs"},
    {mode:"buy",key:"vetements",qty:2,price:24,label:"2 couvertures"},
    {mode:"sell",key:"vivres",qty:40,price:22,label:"40 kg de vivres"},
    {mode:"sell",key:"munitions",qty:30,price:ammoPrice(14),label:"30 balles"},
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
    {label:"Protéger le convoi",deferReturn:true,action:()=>{const incidentEntry=journalMergeTarget,returnCallback=activeEventModal?.returnCallback??null;setTimeout(()=>startAttack(incidentEntry,returnCallback),0)}}
  ],"incident-attack.webp");
}

function landmark(mark){
  const weather=weatherVisual(),art=mark.kind==="fort"?fortArrivalAsset(mark,weather):stageAsset(mark,weather);showLandmarkArt(mark,art,weather);
  if(mark.kind==="river") riverEvent(mark,art);
  else if(mark.kind==="fort") fortEvent(mark,art);
  else eventModal(bilingual(mark.name,landmarkName(mark)),bilingual(`Le convoi atteint ${mark.name}.`,`The wagon party reaches ${landmarkName(mark)}.`),"Un repère bienvenu sur l’immensité de la piste.",[{label:"Graver nos noms et repartir",action:()=>{addJournal(bilingual(`Nous avons atteint ${mark.name}.`,`We reached ${landmarkName(mark)}.`));setTrailScene();}}],art);
}

function riverEvent(mark,art=stageAsset(mark),depth=null,observation=""){
  const measured=depth??riverDepth(mark),shown=formatDepth(measured),crossingWeather=weatherVisual();
  const cost=55+Math.round(measured*25+game.km/KM_TOTAL*30);
  const shownEn=measured.toFixed(1);
  const condition=riverFatigueDescription(),observationFr=observation?`${languageText(observation,"fr")} `:"",observationEn=observation?`${languageText(observation,"en")} `:"";
  const details=bilingual(`${observationFr}${condition.fr} Comment ferez-vous traverser le chariot ?`,`${observationEn}${condition.en} How will you get the wagon across?`);
  eventModal(bilingual(mark.name,landmarkName(mark)),bilingual(`Le courant est rapide et la profondeur mesurée atteint environ ${shown} mètre${measured>=2?"s":""}.`,`The current is swift and the measured depth is about ${shownEn} meter${measured===1?"":"s"}.`),details,[
    {label:bilingual(`Prendre le bac (${cost} $)`,`Take the ferry ($${cost})`),disabled:game.money<cost,action:()=>{game.money-=cost;const food=consumeDelay(1);addJournal(bilingual(`Traversée de ${mark.name} en bac, sans incident, avec une profondeur de ${shown} m.`,`We crossed ${landmarkName(mark)} by ferry without incident at a depth of ${shownEn} m.`));queueRiverOutcome(mark,"ferry",{method:bilingual("Bac","Ferry"),days:1,food:food.consumed,weather:crossingWeather,text:"Le bac a transporté le chariot et tout le groupe jusqu’à l’autre rive.",result:bilingual(`Traversée sans perte · Profondeur : ${shown} m · Coût : ${cost} $`,`Crossing without loss · Depth: ${shownEn} m · Cost: $${cost}`)})}},
    {label:"Calfater et flotter",action:()=>riverRisk(mark,measured,crossingWeather)},
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

function queueRiverOutcome(mark,outcome,data){game.pendingRiverOutcome={mark,outcome,data};setTimeout(showPendingRiverOutcome,0)}

function showPendingRiverOutcome(){
  if(!game.pendingRiverOutcome||game.pendingDeath||game.deathEventOpen)return;
  const {mark,outcome,data}=game.pendingRiverOutcome;game.pendingRiverOutcome=null;showRiverOutcome(mark,outcome,data);
}

function showRiverOutcome(mark,outcome,data){
  activeRiverOutcome={mark,outcome,...data};renderRiverOutcome();$("#dialogue-bilan-riviere").showModal();
}

function renderRiverOutcome(){
  if(!activeRiverOutcome)return;
  const {mark,outcome,method,days,food,text,result,retry,weather=weatherVisual()}=activeRiverOutcome;
  const art=$("#bilan-riviere-art");applyWeatherSprite(art,`river-weather-${mark.visual}-${outcome}.webp`,weather);art.setAttribute("aria-label",currentLanguage==="en"?`${languageText(method)} at ${landmarkName(mark)}, in ${languageText(weather.label)}`:`${languageText(method)} à ${mark.name}, par ${languageText(weather.label)}`);
  $("#titre-bilan-riviere").textContent=currentLanguage==="en"?`Report — ${landmarkName(mark)}`:`Bilan — ${mark.name}`;$("#bilan-riviere-texte").textContent=languageText(text);
  $("#bilan-riviere-rive").textContent=retry?(currentLanguage==="en"?"The same bank":"La même rive"):(currentLanguage==="en"?"The far bank":"L’autre rive");
  $("#fermer-bilan-riviere").textContent=retry?(currentLanguage==="en"?"Reconsider the crossing":"Revoir les options"):(currentLanguage==="en"?"Return to the trail":"Reprendre la piste");
  $("#bilan-riviere-methode").textContent=languageText(method);
  $("#bilan-riviere-duree").textContent=currentLanguage==="en"?`${days} day${days===1?"":"s"}`:`${days} jour${days>1?"s":""}`;$("#bilan-riviere-vivres").textContent=`${Math.round(food)} kg`;$("#bilan-riviere-resultat").textContent=languageText(result);
}

function floatCargoLossChance(depth){
  return clamp(.04*Math.exp(1.6*Math.max(0,depth)),.08,.97);
}

function travelerFatigueRisk(){
  const travelers=alive();if(!travelers.length)return 1;
  const average=travelers.reduce((sum,p)=>sum+p.health,0)/travelers.length;
  const weakened=travelers.filter(p=>p.health<45).length/travelers.length;
  const unwell=travelers.filter(p=>p.sickDays>0||(p.woundDays??0)>0||p.needsRemedy).length/travelers.length;
  return clamp(clamp((78-average)/58,0,1)*.6+weakened*.25+unwell*.15,0,1);
}

function riverFatigueRisk(){return clamp(travelerFatigueRisk()*.75+clamp(game.oxStrain/10,0,1)*.25,0,1)}

function riverFatigueDescription(){
  const fatigue=travelerFatigueRisk();
  if(fatigue<.2)return bilingual("Le groupe paraît reposé.","The party appears rested.");
  if(fatigue<.5)return bilingual("Plusieurs voyageurs sont fatigués.","Several travelers are tired.");
  return bilingual("Le groupe est très éprouvé et manquera de force dans le courant.","The party is exhausted and will lack strength in the current.");
}

function floatCrossingFailureChance(depth,fatigue=riverFatigueRisk(),oxen=game.cart.boeufs,hasParts=game.cart.pieces>0){
  const waterRisk=clamp(.17*(Math.exp(1.35*Math.max(0,depth-.9))-1),0,.84);
  return clamp(waterRisk+fatigue*.42+Math.max(0,4-oxen)*.07+(hasParts?0:.08),0,.95);
}

function riverRisk(mark,depth,crossingWeather=weatherVisual()){
  const fatigue=riverFatigueRisk(),crossingFailed=Math.random()<floatCrossingFailureChance(depth,fatigue);
  const travelFood=consumeDelay(1);
  game.oxStrain=clamp(game.oxStrain+1,0,10);
  const cargoCandidates=[
      {key:"vivres",amount:Math.min(game.cart.vivres,rand(25,70))},
      {key:"munitions",amount:Math.min(game.cart.munitions,rand(5,20))},
      {key:"vetements",amount:Math.min(game.cart.vetements,rand(1,2))},
      {key:"pieces",amount:Math.min(game.cart.pieces,1)},
      {key:"medicaments",amount:Math.min(game.cart.medicaments,rand(1,2))}
    ].filter(loss=>loss.amount>0);
  const cargoAccident=cargoCandidates.length>0&&Math.random()<floatCargoLossChance(depth);
  const handlingAccident=Math.random()<clamp(.08+(game.cart.boeufs<4?.16:0)+(game.cart.pieces===0?.12:0)+depth*.04+fatigue*.34,.08,.68);
  if(crossingFailed||cargoAccident||handlingAccident){
    const cargoDamaged=cargoCandidates.length>0&&(cargoAccident||crossingFailed);
    const cargoCount=crossingFailed?(depth>=2.2?rand(3,5):rand(2,3)):(depth>=2.2?rand(3,5):depth>=1.4?rand(2,3):1);
    const cargoLosses=cargoDamaged?shuffled(cargoCandidates).slice(0,Math.min(cargoCandidates.length,cargoCount)):[];
    const losses=[],lossesEn=[];
    for(const loss of cargoLosses){
      if(!loss.amount)continue;
      game.cart[loss.key]-=loss.amount;losses.push(itemQuantityFor(loss.key,loss.amount,"fr"));lossesEn.push(itemQuantityFor(loss.key,loss.amount,"en"));
    }
    const maxOxLoss=game.cart.boeufs,oxLossChance=crossingFailed?clamp(.38+depth*.12+fatigue*.18,.42,.82):clamp(.18+depth*.12+fatigue*.08,.2,.52);
    const oxLoss=maxOxLoss&&Math.random()<oxLossChance?Math.min(maxOxLoss,crossingFailed?(depth>=2.2?rand(2,3):rand(1,2)):(depth>=1.5?rand(1,2):1)):0;
    if(oxLoss){game.cart.boeufs-=oxLoss;losses.push(`${oxLoss} bœuf${oxLoss>1?"s":""}`);lossesEn.push(`${oxLoss} ${oxLoss===1?"ox":"oxen"}`);}
    const healthDamage=crossingFailed?rand(10,22)+Math.round(fatigue*8):rand(2,9)+Math.round(fatigue*4);
    alive().forEach(p=>p.health=clamp(p.health-healthDamage,0,100));
    if(crossingFailed){
      const lossSuffixFr=losses.length?` Le courant emporte ${joinList(losses,"fr")}.${oxLoss?` ${oxenJournalStatus("fr")}`:""}`:"";
      const lossSuffixEn=losses.length?` The current sweeps away ${joinList(lossesEn,"en")}.${oxLoss?` ${oxenJournalStatus("en")}`:""}`:"";
      addJournal(bilingual(`La traversée de ${mark.name} échoue par ${depth.toFixed(1).replace(".",",")} m de profondeur : les cordes cèdent et le convoi regagne la rive de départ.${lossSuffixFr}`,`The crossing of ${landmarkName(mark)} fails at a depth of ${depth.toFixed(1)} m: the ropes give way and the wagon party returns to the original bank.${lossSuffixEn}`));toast(bilingual("Le courant a repoussé le convoi.","The current drove the wagon party back."));
      queueRiverOutcome(mark,"float-accident",{method:"Chariot calfaté",days:1,food:travelFood.consumed,weather:crossingWeather,retry:true,previousDepth:depth,text:bilingual("Les cordes ont cédé. Après avoir lutté contre le courant, le convoi a regagné la rive de départ.","The ropes gave way. After struggling against the current, the wagon party returned to the original bank."),result:losses.length?bilingual(`Échec de la traversée · Profondeur : ${depth.toFixed(1).replace(".",",")} m · Pertes : ${joinList(losses,"fr")}`,`Crossing failed · Depth: ${depth.toFixed(1)} m · Losses: ${joinList(lossesEn,"en")}`):bilingual(`Échec de la traversée · Profondeur : ${depth.toFixed(1).replace(".",",")} m · Groupe très éprouvé`,`Crossing failed · Depth: ${depth.toFixed(1)} m · Party severely exhausted`)});
    }else{
      addJournal(losses.length?bilingual(`À ${mark.name}, le chariot a pris l’eau par ${depth.toFixed(1).replace(".",",")} m de profondeur. Le courant emporte ${joinList(losses,"fr")}.${oxLoss?` ${oxenJournalStatus("fr")}`:""}`,`At ${landmarkName(mark)}, the wagon took on water at a depth of ${depth.toFixed(1)} m. The current swept away ${joinList(lossesEn,"en")}.${oxLoss?` ${oxenJournalStatus("en")}`:""}`):bilingual(`Le chariot a pris l’eau à ${mark.name}, sans perte de chargement.`,`The wagon took on water at ${landmarkName(mark)}, without losing any cargo.`));toast("Le courant a secoué le convoi.");
      queueRiverOutcome(mark,"float-accident",{method:"Chariot calfaté",days:1,food:travelFood.consumed,weather:crossingWeather,text:"Le chariot a pris l’eau dans le courant avant d’atteindre difficilement l’autre rive.",result:losses.length?bilingual(`Profondeur : ${depth.toFixed(1).replace(".",",")} m · Pertes : ${joinList(losses,"fr")}`,`Depth: ${depth.toFixed(1)} m · Losses: ${joinList(lossesEn,"en")}`):bilingual(`Profondeur : ${depth.toFixed(1).replace(".",",")} m · Aucune provision perdue, mais le groupe a été éprouvé`,`Depth: ${depth.toFixed(1)} m · No supplies lost, but the party was shaken`)});
    }
  } else {addJournal(bilingual(`Le chariot a traversé ${mark.name} à flot sans incident, par ${depth.toFixed(1).replace(".",",")} m de profondeur.`,`The wagon floated across ${landmarkName(mark)} without incident at a depth of ${depth.toFixed(1)} m.`));queueRiverOutcome(mark,"float-success",{method:"Chariot calfaté",days:1,food:travelFood.consumed,weather:crossingWeather,text:"Le chariot a flotté jusqu’à l’autre rive sous le contrôle des cordes et des bœufs.",result:bilingual(`Traversée réussie sans perte · Profondeur : ${depth.toFixed(1).replace(".",",")} m`,`Successful crossing without loss · Depth: ${depth.toFixed(1)} m`)})}
  setTrailScene();updateDeaths();
}

function fortEvent(mark,art=fortArrivalAsset(mark)){
  const price=Math.round(1.3+game.km/KM_TOTAL*.7);
  const foodCost=20*price, ammoCost=ammoPrice(6)*price;
  const equipment=shuffled([
    {key:"boeufs",qty:2,cost:60*price,label:"2 bœufs",labelEn:"2 oxen"},
    {key:"vetements",qty:2,cost:22*price,label:"2 couvertures",labelEn:"2 blankets"},
    {key:"pieces",qty:1,cost:28*price,label:"1 pièce de rechange",labelEn:"1 spare part"},
    {key:"medicaments",qty:2,cost:28*price,label:"2 remèdes",labelEn:"2 doses of medicine"}
  ]).slice(0,2);
  const actions=[
    {label:bilingual(`Acheter 50 kg de vivres (${foodCost} $)`,`Buy 50 kg of food ($${foodCost})`),keepOpen:true,disabled:()=>game.money<foodCost||game.cart.vivres+50>SHOP.vivres.max,action:()=>{game.money-=foodCost;loadFood(50);addJournal(bilingual(`Ravitaillement à ${mark.name}.`,`Resupplied at ${landmarkName(mark)}.`))},feedback:()=>bilingual(`Achat effectué : 50 kg de vivres. Vous avez maintenant ${itemQuantityFor("vivres",Math.round(game.cart.vivres),"fr")}.`,`Purchase complete: 50 kg of food. You now have ${itemQuantityFor("vivres",Math.round(game.cart.vivres),"en")}.`)},
    {label:bilingual(`Acheter 40 balles (${ammoCost} $)`,`Buy 40 bullets ($${ammoCost})`),keepOpen:true,disabled:()=>game.money<ammoCost||game.cart.munitions+40>SHOP.munitions.max,action:()=>{game.money-=ammoCost;game.cart.munitions+=40;addJournal(bilingual(`Achat de munitions à ${mark.name}.`,`Bought ammunition at ${landmarkName(mark)}.`))},feedback:()=>bilingual(`Achat effectué : 40 balles. Vous avez maintenant ${itemQuantityFor("munitions",game.cart.munitions,"fr")}.`,`Purchase complete: 40 bullets. You now have ${itemQuantityFor("munitions",game.cart.munitions,"en")}.`)},
    ...equipment.map(item=>({label:bilingual(`Acheter ${item.label} (${item.cost} $)`,`Buy ${item.labelEn} ($${item.cost})`),keepOpen:true,disabled:()=>game.money<item.cost||game.cart[item.key]+item.qty>SHOP[item.key].max,action:()=>{game.money-=item.cost;game.cart[item.key]+=item.qty;addJournal(bilingual(`Achat de ${item.label} à ${mark.name}.`,`Bought ${item.labelEn} at ${landmarkName(mark)}.`))},feedback:()=>bilingual(`Achat effectué : ${item.label}. Vous avez maintenant ${itemQuantityFor(item.key,game.cart[item.key],"fr")}.`,`Purchase complete: ${item.labelEn}. You now have ${itemQuantityFor(item.key,game.cart[item.key],"en")}.`)})),
    {label:"Se reposer 2 jours",keepOpen:true,disabled:()=>game.cart.vivres<alive().length*4,action:()=>{const outcome=performRest(2,true);refreshFortArrivalArt(mark);if(outcome.event)setTimeout(()=>runRestEvent(outcome.event,()=>fortEvent(mark)),0)},feedback:()=>bilingual("Repos terminé : consultez le journal pour connaître l’état du groupe.","Rest complete: consult the journal for the party’s condition.")},
    {label:"Inventaire",keepOpen:true,withInventory:false,action:showInventory},
    {label:"Repartir",primary:true,action:()=>addJournal(bilingual(`Passage à ${mark.name}.`,`Passed through ${landmarkName(mark)}.`))}
  ];
  eventModal(bilingual(mark.name,landmarkName(mark)),"Palissades, forge et odeur de pain frais : une halte bienvenue.","Le stock d’équipement varie à chaque fort. Vous pouvez effectuer plusieurs achats avant de repartir.",actions,art);
}

function eventModal(title,text,details,actions,art="trail"){
  const returnCallback=queuedEventReturn;queuedEventReturn=null;
  const d=$("#dialogue-evenement");$("#event-title").textContent=languageText(title);$("#event-text").textContent=languageText(text);$("#event-details").textContent=languageText(details);
  const artFile=art.includes(".")?art:`${art}.webp`;
  const incidentEntry=artFile.startsWith("incident-")?addJournal(bilingualJoin(title," — ",text)):null;
  if(incidentEntry){incidentEntry.captureOutcomes=true;incidentEntry.outcomeFragments=[];}
  applyStageArt($("#event-art"),artFile,weatherVisual());
  const box=$("#event-actions");box.innerHTML="";
  const hasExplicitPrimary=actions.some(a=>a.primary),defaultPrimary=hasExplicitPrimary?-1:actions.findIndex(a=>!actionDisabled(a));
  const buttons=[];
  actions.forEach((a,i)=>{
    const b=document.createElement("button");b.type="button";b.className=`btn ${a.primary||i===defaultPrimary?"primary":"secondary"}`;b.textContent=languageText(a.label);b.disabled=actionDisabled(a);
    b.addEventListener("click",()=>{
      if(actionDisabled(a))return;
      journalMergeTarget=incidentEntry;
      try{a.action()}finally{journalMergeTarget=null;if(incidentEntry){delete incidentEntry.captureOutcomes;delete incidentEntry.outcomeFragments}}
      updateDeaths();
      if(showPendingDeathEvent()){updateUI();return;}
      if(game.finished||checkJourneyFailure()){d.close();return;}
      updateUI();
      if(a.keepOpen){
        activeEventModal.withInventory=a.withInventory??true;activeEventModal.feedback=a.feedback??null;refreshEventModalLanguage();
        return;
      }
      d.close();
      if(a.afterClose){setTimeout(a.afterClose,0);return;}
      if(returnCallback&&!a.deferReturn){setTimeout(returnCallback,0);return;}
      setTrailScene();returnToTrailTop();
    });
    buttons.push({action:a,button:b});box.appendChild(b);
  });
  activeEventModal={title,text,details,buttons,withInventory:false,feedback:null,returnCallback};refreshEventModalLanguage();
  if(!d.open)d.showModal();
}

function actionDisabled(action){return typeof action.disabled==="function"?action.disabled():!!action.disabled}

function refreshEventModalLanguage(){
  if(!activeEventModal)return;
  const {title,text,details,buttons,withInventory,feedback}=activeEventModal;
  $("#event-title").textContent=languageText(title);$("#event-text").textContent=languageText(text);
  const base=languageText(details);
  $("#event-details").textContent=withInventory?(currentLanguage==="en"?`${base} You have ${money(game.money)}, ${itemQuantity("vivres",Math.round(game.cart.vivres))}, and ${itemQuantity("munitions",game.cart.munitions)} left.`:`${base} Il vous reste ${money(game.money)}, ${itemQuantity("vivres",Math.round(game.cart.vivres))} et ${itemQuantity("munitions",game.cart.munitions)}.`):base;
  const feedbackElement=$("#event-feedback"),feedbackText=typeof feedback==="function"?feedback():feedback;
  feedbackElement.hidden=!feedbackText;feedbackElement.textContent=feedbackText?languageText(feedbackText):"";
  buttons.forEach(({action,button})=>{button.textContent=languageText(action.label);button.disabled=actionDisabled(action)});
}

function rest(){
  if(checkJourneyFailure())return;
  if(game.cart.vivres<alive().length*4){toast("Pas assez de vivres pour camper deux jours.");return;}
  const outcome=performRest();
  if(showPendingDeathEvent()){updateUI();return;}
  if(game.finished||checkJourneyFailure()){updateUI();return;}
  updateUI();if(!runRestEvent(outcome.event))returnToTrailTop();
}

function routeSpeedDescription(route,language=currentLanguage){
  if(route.speed>=.93)return language==="en"?"generally quick progress":"progression généralement rapide";
  if(route.speed>=.84)return language==="en"?"moderate progress":"progression modérée";
  if(route.speed>=.75)return language==="en"?"slow progress":"progression lente";
  return language==="en"?"very slow progress":"progression très lente";
}

function wildlifeDescription(route,language=currentLanguage){
  const profile=huntTerrainProfile(route),names=Object.entries(profile.weights).filter(([,weight])=>weight>0).map(([species])=>HUNT_SPECIES_NAMES[species][language]);
  const abundance=profile.abundance>=.85?(language==="en"?"plentiful":"abondant"):profile.abundance>=.6?(language==="en"?"scattered":"dispersé"):(language==="en"?"scarce":"rare");
  return language==="en"?`${abundance} game: ${joinList(names,"en")}`:`gibier ${abundance} : ${joinList(names,"fr")}`;
}

function renderTrailOutlook(distance=150){
  const start=Math.min(game.km,KM_TOTAL),end=Math.min(KM_TOTAL,start+distance),span=Math.max(0,Math.round(end-start));
  if(!span)return `<div class="trail-outlook"><h4>${currentLanguage==="en"?"Ahead of the wagon":"Devant le convoi"}</h4><p>${currentLanguage==="en"?"The trail ends here.":"La piste s’achève ici."}</p></div>`;
  const entries=ROUTE_SEGMENTS.filter(route=>route.end>start&&route.start<end).map(route=>{
    const covered=Math.max(1,Math.round(Math.min(route.end,end)-Math.max(route.start,start))),terrain=route.terrain[currentLanguage]??route.terrain.fr,slope=route.slope[currentLanguage]??route.slope.fr,road=route.road[currentLanguage]??route.road.fr;
    const text=currentLanguage==="en"?`${slope}; ${road}; ${routeSpeedDescription(route,"en")}; ${wildlifeDescription(route,"en")}.`:`${slope} ; ${road} ; ${routeSpeedDescription(route,"fr")} ; ${wildlifeDescription(route,"fr")}.`;
    return `<li><strong>${covered} km · ${escapeHtml(terrain)}</strong><span>${escapeHtml(text)}</span></li>`;
  }).join("");
  return `<div class="trail-outlook"><h4>${currentLanguage==="en"?`The next ${span} km`:`Les ${span} prochains kilomètres`}</h4><ul>${entries}</ul></div>`;
}

function renderTrailMap(){
  const stops=[{km:0,name:"Independence"},...LANDMARKS,{km:KM_TOTAL,name:"Oregon"}],left=45,width=830;
  const x=km=>left+km/KM_TOTAL*width,current=x(game.km);
  return `<section class="map-card" aria-labelledby="titre-carte"><h3 id="titre-carte">${languageText("Carte de la piste")}</h3><div class="trail-map-scroll"><svg class="trail-map" viewBox="0 0 920 210" role="img" aria-label="${currentLanguage==="en"?"Progress from Independence to the Willamette Valley":"Progression de Independence jusqu’à la vallée de Willamette"}"><path class="map-route" d="M ${left} 105 H ${left+width}"/><path class="map-progress" d="M ${left} 105 H ${current}"/>${stops.map((stop,i)=>{const px=x(stop.km),top=i%2===0;return `<g><circle class="map-stop" cx="${px}" cy="105" r="5"/><path class="map-tick" d="M ${px} 96 V ${top?70:140}"/><text x="${px}" y="${top?61:157}" text-anchor="middle">${escapeHtml(landmarkName(stop))}</text></g>`}).join("")}<g class="map-current"><path d="M ${current} 78 l 10 18 h -20 z"/><text x="${current}" y="72" text-anchor="middle">${languageText("Vous êtes ici")}</text></g></svg></div><p>${currentLanguage==="en"?`${Math.round(game.km).toLocaleString(currentLocale())} km traveled · ${Math.max(0,KM_TOTAL-Math.round(game.km)).toLocaleString(currentLocale())} km remaining`:`${Math.round(game.km).toLocaleString(currentLocale())} km parcourus · ${Math.max(0,KM_TOTAL-Math.round(game.km)).toLocaleString(currentLocale())} km restants`}</p>${renderTrailOutlook()}</section>`;
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
  const assets=Math.max(0,game.money+game.cart.vivres*2+equipment+game.party.length*250+avg*10);
  const deaths=game.party.length-alive().length,baseDeathPenalty=deaths*750;
  const professionMultiplier={fermier:1,charpentier:.7,banquier:.4}[game.profession]??1;
  const deathPenalty=Math.round(baseDeathPenalty*professionMultiplier);
  // L'arrivée compte davantage que les économies laissées dans un chariot abandonné.
  const progress=clamp(game.km/KM_TOTAL,0,1);
  const rawScore=win?Math.max(0,assets+1000-baseDeathPenalty):Math.min(2249,Math.max(0,(assets-baseDeathPenalty)*progress*.45));
  const score=Math.round(rawScore*professionMultiplier);
  game.score=score;game.finishState={win,message,deaths,deathPenalty,baseDeathPenalty,professionMultiplier};renderFinish();
}

function endingArtAsset(win,survivors=alive().length){return win?"victory.webp":survivors===0?"defeat.webp":"trail.webp"}

function renderFinish(){
  const {win,message,deaths=0,deathPenalty=0}=game.finishState,score=game.score;
  const totalLoss=!win&&alive().length===0;
  $("#ecran-fin").classList.toggle("defeat",!win);$("#ecran-fin").classList.toggle("total-loss",totalLoss);
  $("#fin-art").style.backgroundImage=`url('assets/${endingArtAsset(win)}')`;
  $("#fin-art").setAttribute("aria-label",currentLanguage==="en"?(win?"The wagon party reaches Oregon":totalLoss?"The abandoned wagon and the graves of the lost wagon party":"The wagon party can go no farther"):(win?"Le convoi atteint l’Oregon":totalLoss?"Le chariot abandonné et les tombes du convoi disparu":"Le convoi ne peut plus poursuivre sa route"));
  $("#fin-kicker").textContent=languageText(win?"Vallée de Willamette · Oregon":"La piste s’arrête ici");
  $("#titre-fin").textContent=languageText(win?"Vous avez atteint l’Oregon":"Le convoi n’ira pas plus loin");
  $("#texte-fin").textContent=message?languageText(message):(win?(currentLanguage==="en"?`${alive().length} traveler${alive().length===1?"":"s"} finally ${alive().length===1?"looks":"look"} upon the valley. After ${game.days} days on the trail, a new life begins.`:`${alive().length} voyageur${alive().length>1?"s":""} contemple${alive().length>1?"nt":""} enfin la vallée. Après ${game.days} jours sur la piste, une nouvelle vie commence.`):languageText("La faim, la maladie et la route ont eu raison de votre expédition."));
  $("#rang-fin").textContent=endingRank(score);
  const humanLosses=deaths?(currentLanguage==="en"?` · Human losses: −${deathPenalty.toLocaleString(currentLocale())}`:` · Pertes humaines : −${deathPenalty.toLocaleString(currentLocale())}`):"";
  $("#score-fin").textContent=`${currentLanguage==="en"?"Score":"Score"} · ${score.toLocaleString(currentLocale())}${humanLosses}${win?"":` · ${currentLanguage==="en"?"Distance":"Distance"} · ${Math.round(game.km).toLocaleString(currentLocale())} km`}`;
  $("#journal-fin").innerHTML=journalItems(game.journal)||`<li>${languageText("Aucune entrée dans le journal.")}</li>`;
  showScreen("ecran-fin");
}

// Mini-jeu de chasse
const HUNT_SPECIES_NAMES={
  bison:{fr:"bisons",en:"bison"},deer:{fr:"cerfs",en:"deer"},rabbit:{fr:"lapins",en:"rabbits"},bird:{fr:"oiseaux",en:"birds"}
};

const HUNT_TERRAIN={
  "kansas-prairie":{abundance:.95,weights:{bison:4,deer:3,rabbit:3,bird:3}},
  "great-plains":{abundance:1,weights:{bison:4,deer:3,rabbit:3,bird:3}},
  "platte-valley":{abundance:.9,weights:{bison:3,deer:3,rabbit:3,bird:3}},
  "rockies-foothills":{abundance:.72,weights:{bison:.5,deer:4,rabbit:2,bird:3}},
  "high-plains":{abundance:.75,weights:{bison:1,deer:4,rabbit:2,bird:3}},
  "south-pass":{abundance:.5,weights:{bison:0,deer:3,rabbit:2,bird:3}},
  "high-desert":{abundance:.42,weights:{bison:0,deer:.5,rabbit:5,bird:4}},
  "snake-plain":{abundance:.48,weights:{bison:0,deer:.5,rabbit:5,bird:4}},
  "blue-mountains":{abundance:.65,weights:{bison:0,deer:5,rabbit:2,bird:3}},
  columbia:{abundance:.7,weights:{bison:0,deer:4,rabbit:3,bird:4}}
};

const HUNT_WEATHER={
  Doux:{abundance:1,weights:{bison:1,deer:1,rabbit:1,bird:1}},
  Chaud:{abundance:.75,weights:{bison:.08,deer:.22,rabbit:1,bird:1.1}},
  Pluvieux:{abundance:.62,weights:{bison:.04,deer:.18,rabbit:.75,bird:1.1}},
  Froid:{abundance:.48,weights:{bison:0,deer:.1,rabbit:.28,bird:.8}},
  Neige:{abundance:.28,weights:{bison:0,deer:.04,rabbit:.1,bird:.45}}
};

const HUNT_SPECIES={
  bison:{size:25,speed:[82,116],loot:[20,28],y:[205,330],hit:.86},
  deer:{size:18,speed:[115,158],loot:[11,17],y:[180,320],hit:.77},
  rabbit:{size:10,speed:[158,220],loot:[3,6],y:[315,370],hit:.68},
  bird:{size:9,speed:[180,245],loot:[2,4],y:[65,175],hit:.66}
};

function huntTerrainProfile(route=routeSegmentAt()){return HUNT_TERRAIN[route.key]??HUNT_TERRAIN["great-plains"]}

function huntWildlife(route=routeSegmentAt(),weather=game.weather){
  const terrain=huntTerrainProfile(route),climate=HUNT_WEATHER[weather.name]??HUNT_WEATHER.Doux,pool=[];
  for(const species of Object.keys(HUNT_SPECIES)){
    const tickets=Math.round((terrain.weights[species]??0)*(climate.weights[species]??0)*4);
    for(let i=0;i<tickets;i++)pool.push(species);
  }
  if(!pool.length)pool.push(Object.keys(terrain.weights).find(species=>terrain.weights[species]>0)??"bird");
  return {count:clamp(Math.round(5*terrain.abundance*climate.abundance),1,5),pool};
}

function huntBackground(){
  const key=weatherVisual().key;
  return {cold:"hunt-cold.webp",hot:"hunt-hot.webp",rain:"hunt-rain.webp",mild:"hunt.webp"}[key];
}

function startHunt(){
  if(game.cart.munitions<=0){toast("Vous n’avez plus de munitions.");return;}
  if(game.cart.vivres>=SHOP.vivres.max){toast("Le chariot ne peut pas charger davantage de vivres.");return;}
  const wildlife=huntWildlife();
  hunt={time:14,loot:0,limit:Math.min(90,SHOP.vivres.max-game.cart.vivres),shots:0,background:huntBackground(),cross:{x:380,y:210},animals:[],species:wildlife.pool,last:performance.now(),running:true};
  for(let i=0;i<wildlife.count;i++)spawnAnimal(i*145);
  const canvas=$("#canvas-chasse");canvas.style.backgroundImage=`url('assets/${hunt.background}')`;
  $("#dialogue-chasse .eyebrow").textContent=languageText(regionVisual().title);
  $("#chasse-balles").textContent=game.cart.munitions;$("#chasse-butin").textContent=0;$("#chasse-temps").textContent=14;
  $("#dialogue-chasse").showModal();canvas.focus();requestAnimationFrame(huntLoop);
}

function resolveHuntDay(loot){
  const loaded=loadFood(loot);
  const food=consumeDelay(1,2,false);
  refreshWeather();
  const deceased=updateDeaths();
  return {loaded,food,deceased};
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
  const result={shots:hunt.shots,remaining:game.cart.munitions,loot:hunt.loot,background:hunt.background};hunt.running=false;
  const consequences=resolveHuntDay(result.loot);result.loot=consequences.loaded;
  addJournal(result.loot?bilingual(`La chasse rapporte ${result.loot} kg de viande pour ${result.shots} balle${result.shots>1?"s":""} tirée${result.shots>1?"s":""}.`,`The hunt yielded ${result.loot} kg of meat for ${result.shots} bullet${result.shots===1?"":"s"} fired.`):bilingual("La chasse ne rapporte rien cette fois.","The hunt yielded nothing this time."));
  $("#dialogue-chasse").close();updateUI();hunt=null;
  $("#dialogue-bilan-chasse .hunt-result-art").style.backgroundImage=`url('assets/${result.background}')`;
  $("#bilan-balles-tirees").textContent=result.shots;$("#bilan-balles-restantes").textContent=result.remaining;$("#bilan-viande").textContent=result.loot;
  $("#dialogue-bilan-chasse").showModal();
}

function continueAfterHuntReport(){
  if(showPendingDeathEvent()){updateUI();return;}
  if(checkJourneyFailure())return;
  if(game.cart.vivres<=0&&offerOxForFood())return;
  returnToTrailTop();
}

// Mini-jeu d'attaque : esquive et mise à couvert, sans tir.
function attackDifficultyAt(km=game.km){
  const progress=clamp(km/KM_TOTAL,0,1);
  return {progress,duration:15+Math.round(progress*3),speed:1+progress*.35,spawnBase:.52-progress*.12};
}

function startAttack(journalEntry=null,returnCallback=null){
  if(game.finished||!alive().length)return;
  const difficulty=attackDifficultyAt();
  attack={time:difficulty.duration,duration:difficulty.duration,hits:0,x:330,projectiles:[],spawnIn:.3,last:performance.now(),running:true,journalEntry,returnCallback,...difficulty};
  $("#attaque-temps").textContent=difficulty.duration;$("#attaque-impacts").textContent=0;
  $("#dialogue-attaque").showModal();$("#canvas-attaque").focus();requestAnimationFrame(attackLoop);
}

function moveAttack(direction){if(attack?.running)attack.x=clamp(attack.x+direction*42,20,640);}

function applyAttackWound(traveler,damage){
  traveler.health=clamp(traveler.health-damage,1,100);
  traveler.needsRemedy=true;traveler.woundDays=Math.max(traveler.woundDays??0,13);
  if(traveler.sickDays<=0)traveler.state="Blessé";
}

function treatAttackWound(traveler){
  traveler.health=clamp(traveler.health+24,1,100);
  traveler.needsRemedy=false;traveler.woundDays=Math.min(traveler.woundDays??7,7);
  if(traveler.sickDays<=0)traveler.state="Convalescent";
}

function attackLoop(now){
  if(!attack?.running)return;const dt=Math.min(.04,(now-attack.last)/1000);attack.last=now;attack.time-=dt;attack.spawnIn-=dt;
  const c=$("#canvas-attaque"),ctx=c.getContext("2d");ctx.clearRect(0,0,c.width,c.height);
  if(attack.spawnIn<=0){const elapsed=attack.duration-attack.time;attack.projectiles.push({x:rand(20,740),y:-20,vx:rand(-35,35)*attack.speed,vy:rand(180,260)*attack.speed});attack.spawnIn=Math.max(.12,attack.spawnBase-elapsed*.018);}
  ctx.strokeStyle="#ead8ad";ctx.lineWidth=3;
  attack.projectiles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*.06,p.y-18);ctx.stroke();if(!p.hit&&p.y>345&&p.y<410&&p.x>attack.x&&p.x<attack.x+100){p.hit=true;attack.hits++;$("#attaque-impacts").textContent=attack.hits;}});
  attack.projectiles=attack.projectiles.filter(p=>p.y<440&&!p.hit);
  ctx.fillStyle="#3b2a1d";ctx.fillRect(attack.x,360,100,35);ctx.fillStyle="#e6d7b3";ctx.beginPath();ctx.arc(attack.x+50,360,42,Math.PI,0);ctx.fill();ctx.strokeStyle="#3b2a1d";ctx.beginPath();ctx.arc(attack.x+20,398,15,0,Math.PI*2);ctx.arc(attack.x+80,398,15,0,Math.PI*2);ctx.stroke();
  $("#attaque-temps").textContent=Math.max(0,Math.ceil(attack.time));
  if(attack.time<=0){endAttack();return;}requestAnimationFrame(attackLoop);
}

function endAttack(){
  if(!attack?.running)return;const {hits,journalEntry,returnCallback}=attack;attack.running=false;$("#dialogue-attaque").close();attack=null;
  const candidates=shuffled(alive()),affected=Math.min(candidates.length,Math.ceil(hits/2)),wounded=[],dead=[];
  for(const p of candidates.slice(0,affected)){
    const lethalChance=Math.max(0,(hits-4)*.07);
    if(dead.length===0&&Math.random()<lethalChance){p.health=0;p.alive=false;p.state="Décédé";game.pendingDeath=p;dead.push(p);}
    else{applyAttackWound(p,rand(18,32)+Math.floor(hits/3));wounded.push(p);}
  }
  attackOutcome={hits,wounded,dead,journalEntry,returnCallback};showAttackOutcome();
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
  for(const p of patients){game.cart.medicaments--;treatAttackWound(p);}
  showAttackOutcome();
}

function continueAfterAttack(){
  if(!attackOutcome)return;const {hits,wounded,dead,journalEntry,returnCallback}=attackOutcome;$("#dialogue-bilan-attaque").close();
  const woundedFr=wounded.length?` ${joinList(wounded.map(traveler=>traveler.name),"fr")} ${wounded.length>1?"sont blessés":"est blessé"}.`:"",woundedEn=wounded.length?` ${joinList(wounded.map(traveler=>traveler.name),"en")} ${wounded.length===1?"is":"are"} wounded.`:"";
  const deadFr=dead.length?` ${joinList(dead.map(traveler=>traveler.name),"fr")} ${dead.length>1?"sont morts":"est mort"}.`:"",deadEn=dead.length?` ${joinList(dead.map(traveler=>traveler.name),"en")} ${dead.length===1?"has":"have"} died.`:"";
  const heldFr=!wounded.length&&!dead.length?" Le convoi a tenu bon.":"",heldEn=!wounded.length&&!dead.length?" The wagon party held firm.":"";
  mergeJournalEntry(journalEntry,bilingual(`L’attaque se termine après ${hits} impact${hits>1?"s":""}.${woundedFr}${deadFr}${heldFr}`,`The attack ended after ${hits} hit${hits===1?"":"s"}.${woundedEn}${deadEn}${heldEn}`));attackOutcome=null;
  if(showPendingDeathEvent()){updateUI();return;}
  if(!alive().length){finish(false,"Aucun membre du convoi n’a survécu à l’attaque.");return;}updateUI();if(returnCallback)setTimeout(returnCallback,0);else returnToTrailTop();
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
  $("#avancer").addEventListener("click",()=>travel());$("#repos").addEventListener("click",rest);$("#chasser").addEventListener("click",startHunt);$("#carte-btn").addEventListener("click",showMap);$("#inventaire-btn").addEventListener("click",showInventory);$("#journal-plus").addEventListener("click",showJournal);$("#aide").addEventListener("click",showHelp);
  $("#rejouer").addEventListener("click",()=>{game=null;showScreen("ecran-groupe")});$("#fermer-chasse").addEventListener("click",endHunt);
  $("#dialogue-evenement").addEventListener("cancel",e=>e.preventDefault());
  $("#dialogue-chasse").addEventListener("cancel",e=>{e.preventDefault();endHunt()});
  $("#dialogue-attaque").addEventListener("cancel",e=>e.preventDefault());$("#dialogue-bilan-attaque").addEventListener("cancel",e=>e.preventDefault());
  $("#dialogue-evenement").addEventListener("close",()=>{activeEventModal=null;returnToTrailTop()});
  $("#dialogue-bilan-riviere").addEventListener("close",()=>{
    const retry=activeRiverOutcome?.retry?{mark:activeRiverOutcome.mark,previousDepth:activeRiverOutcome.previousDepth}:null;activeRiverOutcome=null;
    if(checkJourneyFailure())return;
    if(retry&&!game.finished&&alive().length&&game.cart.boeufs>0){
      const next=riverDepth(retry.mark,retry.previousDepth),weather=weatherVisual(),art=stageAsset(retry.mark,weather);
      showLandmarkArt(retry.mark,art,weather);
      setTimeout(()=>riverEvent(retry.mark,art,next,bilingual("Après l’échec, le niveau a été mesuré de nouveau.","After the failed attempt, the water level was measured again.")),0);
    }else returnToTrailTop();
  });
  $("#dialogue-bilan-chasse").addEventListener("close",continueAfterHuntReport);
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
