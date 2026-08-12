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
const ENDING_COMMENTS = [
  bilingual("La piste n’a gardé de votre convoi qu’un silence.","The trail kept only silence from your wagon party."),
  bilingual("L’Ouest vous a dévoré avant que l’aventure ne commence vraiment.","The West swallowed you before the adventure truly began."),
  bilingual("La maladie a eu le dernier mot.","Disease had the final word."),
  bilingual("Vous avez quitté la piste avant de trouver l’Oregon.","You lost the trail before finding Oregon."),
  bilingual("La volonté ne remplace pas les provisions.","Determination is no substitute for provisions."),
  bilingual("Beaucoup d’espoirs, bien peu à rapporter.","High hopes, with very little to show for them."),
  bilingual("Vous avez voyagé ; la piste, elle, n’est guère impressionnée.","You traveled; the trail remains unimpressed."),
  bilingual("C’est bien, mais vous pouviez mener le troupeau plus loin.","A fair result, though you could have driven the herd farther."),
  bilingual("Vous avez trouvé la direction, pas encore la maîtrise.","You found the way, but not yet mastery of it."),
  bilingual("Vous êtes arrivé : c’est déjà une victoire.","You made it: that alone is a victory."),
  bilingual("Un voyage raisonnable, mené sans éclat mais avec jugement.","A sensible journey, led without glory but with sound judgment."),
  bilingual("Le convoi pouvait compter sur vous.","The wagon party knew it could count on you."),
  bilingual("La piste vous connaît désormais par votre nom.","The trail now knows you by name."),
  bilingual("Vous avez transformé l’arrivée en avenir.","You turned arrival into a future."),
  bilingual("Votre passage laissera une adresse sur la carte.","Your passage will leave a place on the map."),
  bilingual("Peu de pionniers dirigent un convoi avec une telle autorité.","Few pioneers command a wagon party with such authority."),
  bilingual("Vous appartenez à l’élite de la piste.","You belong among the trail’s elite."),
  bilingual("L’Ouest a cédé devant votre détermination.","The West yielded to your determination."),
  bilingual("Votre aventure sera racontée longtemps après votre arrivée.","Your adventure will be told long after your arrival."),
  bilingual("Vous n’avez pas seulement atteint l’Oregon : vous avez contribué à le fonder.","You did not merely reach Oregon: you helped build it.")
];

const SHOP = {
  boeufs: { label:"Bœufs", desc:"Une paire coûte 50 $. Il en faut au moins quatre.", unit:"bête", plural:"bêtes", unitEn:"ox", pluralEn:"oxen", step:2, price:50, max:12, start:0 },
  vivres: { label:"Vivres", desc:"Farine, lard, café et haricots. Prix pour 10 kg.", unit:"kg", plural:"kg", unitEn:"kg", pluralEn:"kg", step:10, price:4, max:800, start:0 },
  munitions: { label:"Munitions", desc:"À Independence, 20 balles coûtent 2 $.", unit:"balle", plural:"balles", unitEn:"bullet", pluralEn:"bullets", step:20, price:2, max:600, start:0 },
  vetements: { label:"Couvertures", desc:"Chacune protège un voyageur du froid et de l’humidité.", unit:"couverture", plural:"couvertures", unitEn:"blanket", pluralEn:"blankets", step:1, price:10, max:15, start:0 },
  pieces: { label:"Pièces de rechange", desc:"Roues, essieux et timons pour les avaries.", unit:"pièce", plural:"pièces", unitEn:"spare part", pluralEn:"spare parts", step:1, price:18, max:12, start:0 },
  medicaments: { label:"Remèdes", desc:"Bandages et fortifiants pour soigner le groupe.", unit:"dose", plural:"doses", unitEn:"dose", pluralEn:"doses", step:1, price:12, max:15, start:0 }
};

const TRAIL_ADVICE = [
  bilingual("Ne chassez pas deux fois de suite au même endroit : les animaux abattus ne reviennent pas et le reste du gibier se disperse.","Do not hunt twice in a row at the same place: killed animals do not return, and the remaining game scatters."),
  bilingual("Consultez la carte avant de chasser : les espèces présentes changent fortement d’un terrain à l’autre.","Check the map before hunting: available species change greatly from one terrain to another."),
  bilingual("À l’intérieur d’un fort, les voleurs et les attaques ne menacent pas le camp : c’est l’endroit le plus sûr pour dormir.","Inside a fort, thieves and attacks do not threaten the camp: it is the safest place to sleep."),
  bilingual("Au fort, les murs et les bâtiments protègent du mauvais temps : même un groupe à court de couvertures peut y récupérer correctement.","At a fort, walls and buildings protect against bad weather: even a party short of blankets can recover properly there."),
  bilingual("Six bœufs donnent une bonne allure de référence au chariot.","Six oxen give the wagon a solid standard pace."),
  bilingual("Au-delà de huit bœufs, l’attelage n’avance presque plus vite : gardez plutôt votre argent pour la piste.","Beyond eight oxen, the team moves hardly any faster: save your money for the trail instead."),
  bilingual("Avec quatre bœufs le chariot ralentit déjà ; avec deux, chaque mauvaise piste devient interminable.","With four oxen the wagon already slows down; with two, every rough trail becomes painfully long."),
  bilingual("Gardez toujours un dernier bœuf sous le joug : sans lui, le voyage s’arrête.","Always keep one last ox under the yoke: without it, the journey ends."),
  bilingual("Quand les sacs sont vides, un bœuf peut nourrir le groupe — mais seulement si un autre reste pour tirer.","When the sacks are empty, an ox can feed the party—but only if another remains to pull."),
  bilingual("Chaque voyageur vivant mange tous les jours ; un groupe nombreux vide très vite les réserves.","Every living traveler eats each day; a large party drains the stores quickly."),
  bilingual("La chasse et le repos consomment eux aussi la ration choisie, même quand le chariot ne progresse pas.","Hunting and resting also consume the selected ration, even when the wagon makes no progress."),
  bilingual("Une allure prudente économise un peu de vivres ; forcer l’allure en consomme davantage.","A cautious pace saves a little food; forcing the pace consumes more."),
  bilingual("Les rations maigres font durer les sacs, mais elles laissent les voyageurs plus vulnérables.","Meager rations stretch the stores, but leave travelers more vulnerable."),
  bilingual("L’allure la plus rapide use les voyageurs et les bœufs bien avant que le chariot n’atteigne les montagnes.","The fastest pace wears down travelers and oxen long before the wagon reaches the mountains."),
  bilingual("Ralentir réduit surtout les chutes, blessures et avaries liées à la distance ; cela n’éloigne ni les voleurs ni les maladies.","Slowing down mainly reduces falls, injuries, and breakdowns tied to distance; it does not deter thieves or disease."),
  bilingual("La carte décrit les cent cinquante kilomètres à venir : lisez-la avant de choisir l’allure.","The map describes the next one hundred and fifty kilometers: read it before choosing a pace."),
  bilingual("Le désert ne donne pas de neige, mais sa chaleur fatigue vite les hommes et les bœufs.","The desert brings no snow, but its heat quickly tires people and oxen."),
  bilingual("Le temps garde souvent la mémoire de la veille : préparez-vous à plusieurs jours difficiles plutôt qu’à une seule mauvaise journée.","Weather often remembers the previous day: prepare for several hard days rather than one bad day."),
  bilingual("La pluie, la neige et les grandes chaleurs réduisent réellement la distance parcourue dans la journée.","Rain, snow, and great heat genuinely reduce the distance covered in a day."),
  bilingual("Les pentes et les mauvaises pistes ralentissent le convoi et multiplient les accidents.","Slopes and poor trails slow the wagon party and multiply accidents."),
  bilingual("Plus l’Oregon approche, plus les marchandises des forts deviennent chères.","The closer Oregon gets, the more expensive fort supplies become."),
  bilingual("Un marchand augmente le prix d’un équipement demandé plusieurs fois au même fort.","A merchant raises the price of equipment bought repeatedly at the same fort."),
  bilingual("Les vivres gardent le même prix au sein d’un fort, même après plusieurs achats le même jour.","Food keeps the same price within a fort, even after several purchases on the same day."),
  bilingual("Tous les forts vendent des remèdes, même lorsque leur autre équipement manque.","Every fort sells medicine, even when other equipment is unavailable."),
  bilingual("Une pièce de rechange peut épargner plusieurs jours de réparation et éviter d’abandonner du chargement.","A spare part can save several repair days and prevent cargo from being abandoned."),
  bilingual("Même par temps modéré, les nuits sont fraîches : une couverture par voyageur aide vraiment la récupération.","Even in mild weather, nights are cool: one blanket per traveler genuinely helps recovery."),
  bilingual("Plusieurs haltes successives rendent de moins en moins de forces ; reposez-vous avant que tout le groupe ne soit épuisé.","Repeated stops restore less and less strength; rest before the whole party is exhausted."),
  bilingual("Le repos aide les blessures à cicatriser, mais une maladie continue de suivre son cours.","Rest helps wounds heal, but an illness continues to run its course."),
  bilingual("Le repos dans un fort est plus réparateur et ne souffre ni du froid ni du manque de couvertures.","Rest at a fort is more restorative and suffers neither from cold nor from too few blankets."),
  bilingual("Un remède améliore les chances d’un malade, mais ne guérit ni la fièvre ni la dysenterie en une nuit.","Medicine improves a sick traveler’s chances, but cures neither fever nor dysentery overnight."),
  bilingual("Les serpents restent cachés dans le froid et la neige ; ils se montrent davantage sous les grandes chaleurs.","Snakes remain hidden in cold and snow; they appear more often in great heat."),
  bilingual("Isoler les malades ralentit la contagion, mais consomme des jours et des vivres.","Isolating the sick slows contagion, but consumes days and food."),
  bilingual("Une balle suffit souvent pour un lapin ou un oiseau ; un cerf ou un bison en exige généralement plusieurs.","One bullet often suffices for a rabbit or bird; deer and bison usually require several."),
  bilingual("Sous la pluie ou dans le froid, le gros gibier devient beaucoup plus rare.","In rain or cold weather, large game becomes much rarer."),
  bilingual("Ne cherchez pas de bison dans le désert : gardez vos balles pour les lapins et les oiseaux.","Do not look for bison in the desert: save your bullets for rabbits and birds."),
  bilingual("Le chariot ne rapporte jamais plus de quatre-vingt-dix kilos d’une seule chasse.","The wagon never brings back more than ninety kilograms from one hunt."),
  bilingual("Attendre devant un fleuve ne garantit rien : la saison et la météo peuvent faire monter l’eau pendant la halte.","Waiting at a river guarantees nothing: season and weather can raise the water during the stop."),
  bilingual("Le bac coûte cher, mais il protège généralement mieux le groupe et le chargement.","The ferry is expensive, but it usually protects the party and cargo better."),
  bilingual("À flot, quelques centimètres d’eau supplémentaires peuvent accroître brutalement les pertes.","When floating, a few extra centimeters of water can sharply increase the losses."),
  bilingual("Un groupe fatigué tient moins bien les cordes d’un chariot flottant ; après un échec, une nouvelle tentative est un peu mieux préparée.","A tired party handles a floating wagon’s ropes less effectively; after a failure, another attempt is slightly better prepared.")
];

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
const FORT_PRICE_MULTIPLIERS={"fort-kearny":1.25,"fort-laramie":1.5,"fort-boise":2};
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
  prudent:{km:117,health:1,food:.95,strain:-1},
  soutenu:{km:153,health:-1,food:1,strain:1},
  epuisant:{km:189,health:-7,food:1.1,strain:3}
};
const INCIDENT_RULES = {
  wagon:{basis:"distance",rate:.00049,pace:{prudent:.45,soutenu:1,epuisant:1.35}},
  injury:{basis:"distance",rate:.00039,pace:{prudent:.55,soutenu:1,epuisant:1.3}},
  axle:{basis:"distance",rate:.0002,pace:{prudent:.65,soutenu:1,epuisant:1.25}},
  "ox-injury":{basis:"distance",rate:.00023,pace:{prudent:.7,soutenu:1,epuisant:1.2}},
  attack:{basis:"day",rate:.005},theft:{basis:"day",rate:.007},encounter:{basis:"day",rate:.014},trade:{basis:"day",rate:.014},
  fever:{basis:"day",rate:.006},dysentery:{basis:"day",rate:.004},contagious:{basis:"day",rate:.005},snakebite:{basis:"day",rate:.00025,perPerson:true},rain:{basis:"day",rate:.008},
  // Ces deux incidents préexistants restent rares et ne sont actifs que
  // lorsque eventPool confirme que le climat et l'équipement les permettent.
  "climate-injury":{basis:"day",rate:.004},blankets:{basis:"day",rate:.004}
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
  const money = {fermier:500,charpentier:800,banquier:1100}[profession];
  return {
    version:1, profession, money, initialMoney:money, cart:{...cart},
    party:names.map(name => ({name,health:100,state:"En forme",alive:true,sickDays:0,treated:false,woundDays:0,woundKind:null,needsRemedy:false,deathCause:null,pendingRecoveryCondition:null,pendingWoundRecoveryKind:null})),
    day:1, month:Number(month), year:1848, km:0, days:0, pace:"soutenu", rations:"normales",
    weather:{...WEATHER[0]}, weatherHistory:["Doux"], landmarkIndex:0, oxStrain:0, lastEvent:null, lastRestDay:null, restStreak:0, huntPressure:{}, riverFailures:{}, fortPurchases:{}, fortAssortments:{}, seenAdvice:[], journal:[], finished:false, score:0,
    pendingDeath:null, deathEventOpen:false, pendingRiverOutcome:null, pendingHuntDay:null
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
function nextTrailAdvice(){
  game.seenAdvice??=[];
  const unseen=TRAIL_ADVICE.map((text,id)=>({id,text})).filter(advice=>!game.seenAdvice.includes(advice.id));
  if(!unseen.length)return null;
  const advice=pick(unseen);game.seenAdvice.push(advice.id);return advice.text;
}
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
function journalNumber(value,language="fr") {
  return (Math.round(Math.max(0,value)*10)/10).toLocaleString(language==="en"?"en-US":"fr-FR",{maximumFractionDigits:1});
}
// Dans l'interface du jeu, zéro conserve le singulier : « 0 pièce ».
function unitLabelFor(item,quantity,language=currentLanguage) { return language==="en"?(quantity<=1?item.unitEn:item.pluralEn):quantity<=1?item.unit:item.plural; }
function unitLabel(item,quantity) { return unitLabelFor(item,quantity); }
function itemQuantityFor(key,quantity,language=currentLanguage) {
  const quantityText=`${journalNumber(quantity,language)} ${unitLabelFor(SHOP[key],quantity,language)}`;
  if(key==="vivres")return language==="en"?`${quantityText} of food`:`${quantityText} de vivres`;
  return language==="en"&&key==="medicaments"?`${quantityText} of medicine`:quantityText;
}
function itemQuantity(key,quantity) { return itemQuantityFor(key,quantity); }
function endingRankIndex(score) { return Math.min(ENDING_RANKS.length-1,Math.floor(Math.max(0,score)/250)); }
function endingRank(score) { return languageText(ENDING_RANKS[endingRankIndex(score)]); }
function endingComment(score) { return languageText(ENDING_COMMENTS[endingRankIndex(score)]); }
function remedyLabel(availableLabel,required=1) {
  if(game.cart.medicaments>=required)return availableLabel;
  if(game.cart.medicaments===0)return "Aucun remède disponible";
  return bilingual(`${required} remèdes nécessaires · ${game.cart.medicaments} disponible`,`${required} doses needed · ${game.cart.medicaments} available`);
}
function dailyFoodPerPerson() { return {copieuses:2,normales:1.5,maigres:1}[game.rations]; }
function foodNeededForDays(days,perPerson=dailyFoodPerPerson()){return perPerson*alive().length*days}

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
  const minimum=game.cart.boeufs>1?1:0;
  alive().forEach(p=>{p.health=clamp(p.health-penalty,minimum,100);if(p.health<=0&&!p.deathCause)p.deathCause=bilingual("de faim","from starvation")});
  addJournal(bilingual(`Les vivres n’ont pas suffi pendant ${days} jour${days>1?"s":""}. La faim a affaibli le groupe.`,`Food ran short for ${days} day${days===1?"":"s"}. Hunger weakened the party.`));
  return penalty;
}
function consumeDelay(days,perPerson=dailyFoodPerPerson(),refreshClimate=true,resting=false,atFort=false) {
  const food={needed:0,consumed:0,missing:0};
  for(let day=0;day<days;day++){
    advanceDate(1,resting,atFort);const daily=consumeFood(1,perPerson);
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
function proportionalLossAmount(quantity,minRate,maxRate,minimum=1){
  if(quantity<=0)return 0;
  const rate=rand(Math.round(minRate*100),Math.round(maxRate*100))/100;
  return Math.min(quantity,Math.max(minimum,Math.round(quantity*rate)));
}
function travelWeatherFactor(weather) { return {Doux:1,Chaud:.85,Pluvieux:.8,Froid:.9,Neige:.65}[weather.name]??1; }
function routeSegmentAt(km=game?.km??0){return ROUTE_SEGMENTS.find(segment=>km>=segment.start&&km<segment.end)||ROUTE_SEGMENTS.at(-1)}
function routeTravelFactor(route=routeSegmentAt()){return route.speed}
function oxenTravelFactor(oxen=game.cart.boeufs){
  if(oxen<=0)return .5;
  const anchors=[[1,.6],[2,.75],[4,.9],[6,1],[8,1.05]];
  if(oxen>=8)return 1.05;
  for(let index=1;index<anchors.length;index++){
    const [upperOxen,upperFactor]=anchors[index],[lowerOxen,lowerFactor]=anchors[index-1];
    if(oxen<=upperOxen)return lowerFactor+(upperFactor-lowerFactor)*(oxen-lowerOxen)/(upperOxen-lowerOxen);
  }
  return 1.05;
}
function plannedDailyDistance(pace,weather,route=routeSegmentAt(),oxen=game.cart.boeufs){
  const oxFactor=oxenTravelFactor(oxen);
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
function riverSeasonLevel(){
  const progress=(game.day-1)/daysInMonth(game.month,game.year),next=(game.month+1)%12;
  return RIVER_SEASON_LEVEL[game.month]*(1-progress)+RIVER_SEASON_LEVEL[next]*progress;
}
function recentRiverWeatherLevel(){
  const recent=[...(game.weatherHistory??[])].slice(-3);
  if(recent.at(-1)!==game.weather.name)recent.push(game.weather.name);
  const names=recent.slice(-3),weights=names.map((_,index)=>index+1),total=weights.reduce((sum,weight)=>sum+weight,0);
  return names.reduce((sum,name,index)=>sum+(RIVER_WEATHER_LEVEL[name]??0)*weights[index],0)/Math.max(1,total);
}
function riverDepth(mark,previous=null) {
  const seasonal=riverSeasonLevel()*(mark.seasonalFlow??1);
  const weather=recentRiverWeatherLevel()*(mark.weatherResponse??1);
  const localVariation=rand(-22,22)/100;
  const expected=mark.baseDepth+seasonal+weather+localVariation;
  if(previous===null)return clamp(expected,.3,3.4);
  // Après trois jours, un grand fleuve peut varier d'environ un mètre autour
  // de son niveau moyen. La saison et la météo déplacent le centre de cette
  // plage, tandis que le bassin versant détermine son amplitude.
  const variationRadius=clamp(mark.baseDepth*.5,.5,1.05);
  const localShock=rand(-Math.round(variationRadius*100),Math.round(variationRadius*100))/100;
  const weatherPulse=game.weather.name==="Pluvieux"?rand(5,24)/100:game.weather.name==="Chaud"?-rand(3,18)/100:["Froid","Neige"].includes(game.weather.name)?-rand(0,10)/100:rand(-5,5)/100;
  const measured=previous*.1+(expected+localShock)*.9+weatherPulse;
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

function journalArtSnapshot(file="trail.webp",weather=game?weatherVisual():{key:"mild"}){
  const safeFile=/^[a-z0-9-]+\.webp$/.test(file)?file:"trail.webp",sprite=safeFile.startsWith("progress-")||safeFile.startsWith("river-weather-");
  return {file:safeFile,size:sprite?"200% 200%":"cover",position:sprite?({mild:"0% 0%",cold:"100% 0%",hot:"0% 100%",rain:"100% 100%"}[weather.key]??"0% 0%"):"center"};
}

function currentJournalArt(){
  if(activeEventModal?.art)return {...activeEventModal.art};
  if(!game)return journalArtSnapshot();
  return journalArtSnapshot(stageAsset(currentStage(),weatherVisual()),weatherVisual());
}

function addJournal(text,art=currentJournalArt()) {
  if(journalMergeTarget?.captureOutcomes){
    journalMergeTarget.outcomeFragments.push(text);
    journalMergeTarget.text=journalMergeTarget.outcomeFragments.reduce((combined,fragment,index)=>index?bilingualJoin(combined," ",fragment):fragment);
    journalMergeTarget.art??=art;
    return journalMergeTarget;
  }
  if(journalMergeTarget)return mergeJournalEntry(journalMergeTarget,text);
  const entry={day:game.day,month:game.month,year:game.year,text,art};
  game.journal.unshift(entry);return entry;
}

function addJournalStandalone(text,art=currentJournalArt()){
  const entry={day:game.day,month:game.month,year:game.year,text,art};
  game.journal.unshift(entry);return entry;
}

function mergeJournalEntry(entry,text) {
  if(!entry)return addJournal(text);
  entry.text=bilingualJoin(entry.text," ",text);entry.art??=currentJournalArt();return entry;
}

function journalDate(entry){return formatDate(entry.day,entry.month,entry.year)}
function journalItems(entries){return entries.map(j=>`<li><time>${escapeHtml(journalDate(j))}</time>${escapeHtml(languageText(j.text))}</li>`).join("")}

function recoveryJournal(traveler,condition){
  const stillWeak=traveler.health<=44;
  const fr={Dysenterie:stillWeak?`La dysenterie a enfin quitté ${traveler.name}, qui reste pourtant très affaibli.`:`${traveler.name} a enfin vaincu la dysenterie et reprend sa place dans le convoi.`,Fièvre:`La fièvre de ${traveler.name} est enfin tombée.`,Malade:`${traveler.name} s’est remis de la maladie qui frappait le camp.`,Blessé:`La blessure de ${traveler.name} s’est refermée ; la piste peut reprendre.`,Engelures:`${traveler.name} ne souffre plus de ses engelures.`,Piqûres:`Les piqûres de ${traveler.name} ont fini par guérir.`,Convalescent:`${traveler.name} a achevé sa convalescence.`}[condition]??`${traveler.name} est de nouveau en forme.`;
  const en={Dysenterie:stillWeak?`Dysentery has finally released ${traveler.name}, who nevertheless remains very weak.`:`${traveler.name} has finally overcome dysentery and returns to their place in the wagon party.`,Fièvre:`${traveler.name}’s fever has finally broken.`,Malade:`${traveler.name} has recovered from the illness that struck the camp.`,Blessé:`${traveler.name}’s wound has closed; the trail may continue.`,Engelures:`${traveler.name} has recovered from frostbite.`,Piqûres:`${traveler.name}’s infected bites have finally healed.`,Convalescent:`${traveler.name} has completed their recovery.`}[condition]??`${traveler.name} is well again.`;
  addJournal(bilingual(fr,en));
}

function recoveryWithWoundJournal(traveler,condition){
  const fr={Dysenterie:`${traveler.name} s’est remis de la dysenterie, mais sa blessure exige encore des soins.`,Fièvre:`La fièvre de ${traveler.name} est tombée, mais sa blessure exige encore des soins.`,Malade:`${traveler.name} s’est remis de sa maladie, mais sa blessure exige encore des soins.`,Blessé:`${traveler.name} se remet de sa première blessure, mais celle de l’attaque exige encore des soins.`,Engelures:`${traveler.name} ne souffre plus de ses engelures, mais sa blessure exige encore des soins.`,Piqûres:`Les piqûres de ${traveler.name} ont guéri, mais sa blessure exige encore des soins.`,Convalescent:`${traveler.name} a achevé sa convalescence, mais sa blessure exige encore des soins.`}[condition]??`${traveler.name} va mieux, mais sa blessure exige encore des soins.`;
  const en={Dysenterie:`${traveler.name} has recovered from dysentery, but the wound still needs care.`,Fièvre:`${traveler.name}’s fever has broken, but the wound still needs care.`,Malade:`${traveler.name} has recovered from illness, but the wound still needs care.`,Blessé:`${traveler.name} has recovered from the first injury, but the attack wound still needs care.`,Engelures:`${traveler.name} has recovered from frostbite, but the wound still needs care.`,Piqûres:`${traveler.name}’s bites have healed, but the wound still needs care.`,Convalescent:`${traveler.name} has completed recovery, but the wound still needs care.`}[condition]??`${traveler.name} is better, but the wound still needs care.`;
  addJournal(bilingual(fr,en));
}

function completePendingRecovery(traveler){
  const condition=traveler.pendingRecoveryCondition;
  if(!condition||traveler.health<=0)return false;
  traveler.pendingRecoveryCondition=null;traveler.treated=false;
  traveler.state=(traveler.woundDays??0)>0?(traveler.needsRemedy?"Blessé":"Convalescent"):"En forme";
  if((traveler.woundDays??0)>0)recoveryWithWoundJournal(traveler,condition);
  else recoveryJournal(traveler,condition);
  return true;
}

function completePendingWoundRecovery(traveler){
  const woundKind=traveler.pendingWoundRecoveryKind;
  if(!woundKind||traveler.health<=0)return false;
  traveler.pendingWoundRecoveryKind=null;
  if(woundKind==="snakebite")addJournal(traveler.sickDays>0?bilingual(`Le venin ne menace plus ${traveler.name}, qui reste toutefois malade.`,`The venom no longer threatens ${traveler.name}, who nevertheless remains ill.`):bilingual(`${traveler.name} a enfin surmonté les suites de la morsure de serpent.`,`${traveler.name} has finally recovered from the snakebite.`));
  else if(traveler.sickDays>0)addJournal(bilingual(`La blessure d’attaque de ${traveler.name} s’est refermée, mais ${traveler.name} reste malade.`,`${traveler.name}’s attack wound has healed, but ${traveler.name} remains ill.`));
  else addJournal(bilingual(`La blessure d’attaque de ${traveler.name} a fini par se refermer.`,`${traveler.name}’s attack wound has finally healed.`));
  return true;
}

function advanceDate(days,resting=false,atFort=false) {
  for(let i=0;i<days;i++){
    game.day++; game.days++;
    const lengths=[31,(game.year%4===0?29:28),31,30,31,30,31,31,30,31,30,31];
    if(game.day>lengths[game.month]){game.day=1;game.month++;if(game.month>11){game.month=0;game.year++;}}
    for(const p of alive()){
      const previousCondition=p.state,wasSick=p.sickDays>0,wasWounded=(p.woundDays??0)>0,previousWoundKind=p.woundKind;
      let dailyLoss=0;
      if(p.sickDays>0){
        const injury=["Blessé","Convalescent","Engelures","Piqûres"].includes(p.state);
        const untreatedLoss=({Dysenterie:3,Fièvre:2,Malade:2,Blessé:2,Engelures:2,Piqûres:1,Convalescent:1}[p.state]??1);
        if(!(resting&&injury))dailyLoss+=p.treated?Math.max(1,Math.floor(untreatedLoss/2)):untreatedLoss;
        p.sickDays=Math.max(0,p.sickDays-(resting&&injury?(atFort?3:2):1));
      }
      if((p.woundDays??0)>0){
        const venom=p.woundKind==="snakebite";
        if(!resting||venom)dailyLoss+=p.needsRemedy?2:1;
        p.woundDays=Math.max(0,p.woundDays-(venom?1:resting?(atFort?3:2):1));
        if(p.woundDays<=0)p.needsRemedy=false;
      }
      p.health=clamp(p.health-dailyLoss,0,100);
      if(p.health<=0&&dailyLoss>0&&!p.deathCause)p.deathCause=previousWoundKind==="snakebite"?bilingual("des suites d’une morsure de serpent venimeux","from a venomous snakebite"):deathCauseFor({...p,state:previousCondition});
      const illnessEnded=wasSick&&p.sickDays<=0,woundEnded=wasWounded&&(p.woundDays??0)<=0;
      if(illnessEnded){
        p.pendingRecoveryCondition=previousCondition;
      } else if(p.sickDays<=0&&!p.pendingRecoveryCondition){
        p.treated=false;
        p.state=(p.woundDays??0)>0?(p.needsRemedy?"Blessé":"Convalescent"):"En forme";
      }
      if(woundEnded&&!illnessEnded)p.pendingWoundRecoveryKind=previousWoundKind??"attack";
      if(woundEnded)p.woundKind=null;
    }
  }
}

function restRecovery(traveler,streak=1,atFort=false){
  const fatigueFactor=clamp((105-traveler.health)/55,.12,1);
  const streakFactors=[1,.8,.65,.55],streakFactor=streakFactors[Math.min(Math.max(0,streak-1),streakFactors.length-1)];
  const maximum=10*(atFort?1.25:1);
  return Math.round(maximum*fatigueFactor*streakFactor*2)/2;
}

function restWeatherPenalty(weather,hasBlanket,atFort=false){return atFort?0:weatherExposurePenalty(weather,hasBlanket)}

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

function fortRestFeedback(){
  const [state]=groupHealthSummary();
  return bilingual(`Repos terminé · État du groupe : ${languageText(state,"fr")}.`,`Rest complete · Party condition: ${languageText(state,"en")}.`);
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
  const snapshot=journalArtSnapshot(file,weather),sprite=file.startsWith("progress-");
  element.style.backgroundImage=`url('assets/${file}')`;
  element.style.backgroundSize=sprite?"200% 200%":"cover";
  element.style.backgroundPosition=sprite?({mild:"0% 0%",cold:"100% 0%",hot:"0% 100%",rain:"100% 100%"}[weather.key]):"center";
  element.dataset??={};element.dataset.artFile=snapshot.file;element.dataset.artSize=snapshot.size;element.dataset.artPosition=snapshot.position;
}

function applyWeatherSprite(element,file,weather=weatherVisual()){
  const snapshot=journalArtSnapshot(file,weather);
  element.style.backgroundImage=`url('assets/${file}')`;
  element.style.backgroundSize="200% 200%";
  element.style.backgroundPosition=({mild:"0% 0%",cold:"100% 0%",hot:"0% 100%",rain:"100% 100%"}[weather.key]??"0% 0%");
  element.dataset??={};element.dataset.artFile=snapshot.file;element.dataset.artSize="200% 200%";element.dataset.artPosition=element.style.backgroundPosition;
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
  $("#stat-vivres").textContent=`${journalNumber(game.cart.vivres,currentLanguage)} kg`;
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
  if(next===cart[key])return false;
  const trial={...cart,[key]:next};
  const spent=Object.entries(trial).reduce((sum,[k,q])=>sum+q/SHOP[k].step*SHOP[k].price,0);
  if(spent>game.initialMoney){toast("Vous n’avez pas assez d’argent.");return false;}
  cart=trial;renderShop();return true;
}

function leaveTown(){
  if(cart.boeufs<4){toast("Il vous faut au moins quatre bœufs.");return;}
  if(cart.vivres<100){toast("Emportez au moins 100 kg de vivres.");return;}
  const spent=Object.entries(cart).reduce((sum,[k,q])=>sum+q/SHOP[k].step*SHOP[k].price,0);
  game.cart={...cart};game.money=game.initialMoney-spent;
  game.weather=weatherForPosition(game.month,game.day,game.year,0,[]);game.weatherHistory=[game.weather.name];
  addJournal(departureJournal());
  showScreen("ecran-voyage");updateUI();
}

function cargoJournalSummary(language="fr"){
  const count=(quantity,singular,plural)=>`${journalNumber(quantity,language)} ${quantity>1?plural:singular}`;
  const cargo=language==="en"?[
    count(game.cart.boeufs,"ox","oxen"),`${journalNumber(game.cart.vivres,language)} kg of food`,count(game.cart.munitions,"bullet","bullets"),
    count(game.cart.vetements,"blanket","blankets"),count(game.cart.pieces,"spare part","spare parts"),count(game.cart.medicaments,"dose of medicine","doses of medicine")
  ]:[
    count(game.cart.boeufs,"bœuf","bœufs"),`${journalNumber(game.cart.vivres,language)} kg de vivres`,count(game.cart.munitions,"balle","balles"),
    count(game.cart.vetements,"couverture","couvertures"),count(game.cart.pieces,"pièce de rechange","pièces de rechange"),count(game.cart.medicaments,"remède","remèdes")
  ];
  return joinList(cargo,language);
}

function departureJournal(){
  const leader=game.party[0]?.name??bilingual("Le chef de convoi","The wagon leader"),companions=game.party.slice(1).map(traveler=>traveler.name);
  const professionFr=professionNarrativeLabel(game.profession,"fr"),professionEn=professionNarrativeLabel(game.profession,"en");
  const companyFr=companions.length?` avec ${joinList(companions,"fr")}`:"",companyEn=companions.length?` with ${joinList(companions,"en")}`:"";
  return bilingual(`À Independence, ${leader}, ${professionFr} dans l’Est, prend la tête du convoi${companyFr}. Le chariot emporte ${cargoJournalSummary("fr")} ; ${journalNumber(game.money,"fr")} $ ${game.money===1?"reste":"restent"} en caisse. La piste s’ouvre devant eux.`,`At Independence, ${leader}, a ${professionEn} back East, takes charge of the wagon party${companyEn}. The wagon carries ${cargoJournalSummary("en")}; $${journalNumber(game.money,"en")} remains in cash. The trail opens before them.`);
}

function humanFatigueLevel(){return Math.min(3,Math.floor(travelerFatigueRisk()*4))}
function oxFatigueLevel(){return Math.min(3,Math.floor(clamp(game.oxStrain,0,10)/3))}
function cargoLoadRatio(){
  const weight=game.cart.vivres+game.cart.munitions*.03+game.cart.vetements*4+game.cart.pieces*25+game.cart.medicaments*.5;
  return weight/800;
}
function difficultTerrain(route=routeSegmentAt()){return route.risk>=.06}
function blanketShortageFactor(){
  const survivors=alive().length;if(!survivors)return 1;
  const uncovered=Math.max(0,survivors-Math.min(game.cart.vetements,survivors));
  return 1+.25*uncovered/survivors;
}

function incidentMultiplier(eventId,weather=game.weather,route=routeSegmentAt()){
  const pace=game.pace,hard=difficultTerrain(route),heavy=cargoLoadRatio()>.8;
  const humanLevel=humanFatigueLevel(),oxLevel=oxFatigueLevel();
  const snow=weather.name==="Neige",cold=weather.name==="Froid"||snow,rain=weather.name==="Pluvieux",hot=weather.name==="Chaud";
  const coldBlanketFactor=cold?blanketShortageFactor():1;
  let multiplier=INCIDENT_RULES[eventId]?.pace?.[pace]??1;
  if(eventId==="wagon")multiplier*=(hard?1.5:1)*(rain?1.35:snow?1.5:1)*(heavy?1.15:1);
  if(eventId==="injury")multiplier*=(hard?1.4:1)*(rain?1.15:snow?1.25:1)*Math.pow(1.15,humanLevel);
  if(eventId==="axle")multiplier*=(hard?1.6:1)*(rain?1.1:snow?1.2:1)*(heavy?1.2:1);
  if(eventId==="ox-injury")multiplier*=(hard?1.4:1)*(hot?1.25:snow?1.2:cold?1.1:1)*Math.pow(1.12,oxLevel);
  if(eventId==="fever")multiplier*=(hot?1.25:cold?1.2:1)*Math.pow(1.15,humanLevel)*coldBlanketFactor;
  if(eventId==="dysentery")multiplier*=(hot?1.4:1)*Math.pow(1.15,humanLevel);
  if(eventId==="contagious")multiplier*=(cold?1.2:1)*Math.pow(1.15,humanLevel)*coldBlanketFactor;
  if(eventId==="snakebite")multiplier*=cold?0:hot?(weather.temp>=34?2:1.5):1;
  return multiplier;
}

function incidentProbability(eventId,{distance=0,weather=game.weather,route=routeSegmentAt()}={}){
  const rule=INCIDENT_RULES[eventId];if(!rule)return 0;
  const unitChance=clamp(rule.rate*incidentMultiplier(eventId,weather,route),0,.95);
  if(rule.basis==="distance")return 1-Math.pow(1-unitChance,Math.max(0,distance));
  if(!rule.perPerson)return unitChance;
  return 1-Math.pow(1-unitChance,snakebiteEligibleTravelers().length);
}
function dailyIncidentOccurs(_pace,weather,context={}){return selectDailyIncident({...context,weather})}

function weatherExposurePenalty(weather,hasBlanket){
  if(hasBlanket)return 0;
  if(weather.name==="Neige"||weather.temp<0)return 4;
  if(weather.name==="Froid"||weather.temp<=5)return 3;
  if(weather.name==="Pluvieux")return 2;
  if(weather.name==="Doux")return 1;
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

function recordTravelWeather(breakdown,weather,distance,uncovered=0){
  let entry=breakdown.find(item=>item.name===weather.name);
  if(!entry){entry={name:weather.name,distance:0,days:0,uncovered:0};breakdown.push(entry)}
  entry.distance+=distance;entry.days++;entry.uncovered+=uncovered;
}

function travelPaceLabel(pace=game.pace,language=currentLanguage){
  const labels={
    prudent:{fr:"prudente",en:"cautious"},
    soutenu:{fr:"normale",en:"normal"},
    epuisant:{fr:"le plus vite possible",en:"as fast as possible"}
  };
  return labels[pace]?.[language]??labels.soutenu[language];
}

function addTravelJournal(distance,days,weatherBreakdown=[],route=routeSegmentAt(),foodConsumed=0,foodRemaining=game.cart.vivres){
  const breakdown=weatherBreakdown.length?weatherBreakdown:[{name:game.weather.name,distance,days}];
  const detailsFr=joinList(breakdown.map(item=>`${item.distance} km par ${travelWeatherLabel(item.name,"fr")}`),"fr");
  const detailsEn=joinList(breakdown.map(item=>`${item.distance} km in ${travelWeatherLabel(item.name,"en")}`),"en");
  const paceJournal=game.pace==="epuisant"?" Le rythme épuisant a durement éprouvé le convoi.":"";
  const paceJournalEn=game.pace==="epuisant"?" The grueling pace severely tested the wagon party.":"";
  const weatherTextFr=breakdown.length===1?`par ${travelWeatherLabel(breakdown[0].name,"fr")}`:`: ${detailsFr}`;
  const weatherTextEn=breakdown.length===1?`in ${travelWeatherLabel(breakdown[0].name,"en")}`:`: ${detailsEn}`;
  const routeTextFr=` Allure : ${travelPaceLabel(game.pace,"fr")}. Terrain : ${route.terrain.fr} ; ${route.slope.fr} ; ${route.road.fr} ; climat ${route.climate.fr}.`;
  const routeTextEn=` Pace: ${travelPaceLabel(game.pace,"en")}. Terrain: ${route.terrain.en}; ${route.slope.en}; ${route.road.en}; ${route.climate.en} climate.`;
  const blanketExposure=breakdown.some(item=>(item.uncovered??0)>0),blanketFr=blanketExposure?" Le manque de couvertures a fragilisé le groupe.":"",blanketEn=blanketExposure?" Too few blankets weakened the party.":"";
  const foodFr=` Vivres : ${journalNumber(foodConsumed,"fr")} kg consommé${foodConsumed===1?"":"s"} ; ${journalNumber(foodRemaining,"fr")} kg ${foodRemaining===1?"reste":"restent"} dans le chariot.`;
  const foodEn=` Food: ${journalNumber(foodConsumed,"en")} kg consumed; ${journalNumber(foodRemaining,"en")} kg ${foodRemaining===1?"remains":"remain"} in the wagon.`;
  return addJournal(bilingual(`${distance} km parcourus en ${days} jour${days>1?"s":""} ${weatherTextFr}.${routeTextFr}${foodFr}${paceJournal}${blanketFr}`,`${distance} km traveled in ${days} day${days===1?"":"s"} ${weatherTextEn}.${routeTextEn}${foodEn}${paceJournalEn}${blanketEn}`));
}

function travel(daysToTravel=5){
  if(game.finished)return;
  if(checkJourneyFailure())return;
  if(game.pendingDeath){showPendingDeathEvent();updateUI();return;}
  if(game.km>=KM_TOTAL){finish(true);return;}
  const reached=LANDMARKS[game.landmarkIndex];
  if(reached&&game.km>=reached.km){game.landmarkIndex++;landmark(reached);updateUI();return;}
  const pace=PACES[game.pace],travelRoute=routeSegmentAt();
  let distance=0,foodConsumed=0,travelDays=0;const travelWeatherBreakdown=[];
  for(let day=0;day<daysToTravel;day++){
    const requiredFood=alive().length*dailyFoodPerPerson()*pace.food;
    if(game.cart.vivres<requiredFood&&game.cart.boeufs>1){
      if(travelDays)addTravelJournal(distance,travelDays,travelWeatherBreakdown,travelRoute,foodConsumed,game.cart.vivres);
      offerOxForFood(()=>travel(daysToTravel-travelDays),requiredFood);updateUI();return;
    }
    if(game.cart.vivres<=0){
      if(travelDays)addTravelJournal(distance,travelDays,travelWeatherBreakdown,travelRoute,foodConsumed,game.cart.vivres);
      resolveStarvation();updateUI();return;
    }
    const travelWeather=game.weather,plannedDistance=plannedDailyDistance(pace,travelWeather,travelRoute);
    const next=LANDMARKS[game.landmarkIndex];
    const remainingToStop=Math.min(next?next.km-game.km:Infinity,KM_TOTAL-game.km);
    const dayDistance=Math.max(0,Math.min(plannedDistance,remainingToStop));
    const travelers=alive(),blankets=Math.min(game.cart.vetements,travelers.length);
    game.km+=dayDistance;distance+=dayDistance;recordTravelWeather(travelWeatherBreakdown,travelWeather,dayDistance,Math.max(0,travelers.length-blankets));advanceDate(1);travelDays++;
    const food=consumeFood(1,dailyFoodPerPerson()*pace.food),foodShortage=food.missing>0;
    foodConsumed+=food.consumed;game.oxStrain=clamp((game.oxStrain||0)+pace.strain/5+Math.max(0,6-game.cart.boeufs)*.04,0,10);
    travelers.forEach((p,index)=>{
      const rationHealth={copieuses:1,normales:-1,maigres:-5}[game.rations];
      // Les couvertures sont partagées à tour de rôle lorsque le groupe n'en a pas assez.
      const hasBlanket=blankets>=travelers.length||((index+game.days)%travelers.length)<blankets;
      const exposurePenalty=weatherExposurePenalty(travelWeather,hasBlanket);
      const heatPenalty=travelWeather.temp>=27?-2:0;
      const strainPenalty=game.oxStrain>=7?-2:game.oxStrain>=4?-1:0;
      const starvationPenalty=foodShortage?Math.max(1,Math.ceil(8*food.missing/food.needed)):0;
      p.health=clamp(p.health+(pace.health+rationHealth+heatPenalty+strainPenalty)/5-exposurePenalty-starvationPenalty,0,100);
      if(p.health<=0&&foodShortage&&!p.deathCause)p.deathCause=bilingual("de faim","from starvation");
    });
    updateDeaths();
    if(game.pendingDeath){
      addTravelJournal(distance,travelDays,travelWeatherBreakdown,travelRoute,foodConsumed,game.cart.vivres);showPendingDeathEvent();updateUI();return;
    }
    if(game.finished)return;
    if(game.km>=KM_TOTAL){addTravelJournal(distance,travelDays,travelWeatherBreakdown,travelRoute,foodConsumed,game.cart.vivres);finish(true);return;}
    if(next&&game.km>=next.km){addTravelJournal(distance,travelDays,travelWeatherBreakdown,travelRoute,foodConsumed,game.cart.vivres);game.landmarkIndex++;landmark(next);updateUI();return;}
    const incident=dailyIncidentOccurs(pace,travelWeather,{distance:dayDistance,route:travelRoute});
    if(incident){addTravelJournal(distance,travelDays,travelWeatherBreakdown,travelRoute,foodConsumed,game.cart.vivres);randomEvent(incident===true?undefined:incident);updateUI();return;}
    refreshWeather();
  }
  const travelEntry=addTravelJournal(distance,travelDays,travelWeatherBreakdown,travelRoute,foodConsumed,game.cart.vivres);quietTravelEvent(distance,foodConsumed,travelDays,travelEntry);updateUI();
}

function quietTravelEvent(distance,foodConsumed,travelDays=5,travelEntry=null){
  const paceText={prudent:"L’allure prudente a ménagé le groupe et l’attelage.",soutenu:"L’allure soutenue a laissé une fatigue ordinaire.",epuisant:"Même sans accident, l’allure épuisante a durement éprouvé le groupe et les bœufs."}[game.pace];
  const paceTextEn={prudent:"The steady pace spared the party and the oxen.",soutenu:"The strenuous pace caused ordinary fatigue.",epuisant:"Even without an accident, the grueling pace severely tested the party and the oxen."}[game.pace];
  eventModal("Une étape sans incident",bilingual(`Le convoi a avancé de ${distance} km en ${travelDays} jour${travelDays>1?"s":""}.`,`The wagon party traveled ${distance} km in ${travelDays} day${travelDays===1?"":"s"}.`),bilingual(`${journalNumber(foodConsumed,"fr")} kg de vivres ${foodConsumed===1?"a été consommé":"ont été consommés"}. ${paceText}`,`${journalNumber(foodConsumed,"en")} kg of food ${foodConsumed===1?"was":"were"} consumed. ${paceTextEn}`),[
    {label:"Poursuivre la route",action:()=>mergeJournalEntry(travelEntry,bilingual("Aucun incident n’a troublé l’étape.","No incident troubled the leg."))}
  ],stageAsset());
}

function weatherForSeason(){
  return weatherForPosition(game.month,game.day,game.year,game.km,game.weatherHistory??[]);
}

function slaughterOxForFood(requiredFood=1){
  if(game.cart.boeufs<=1||game.cart.vivres>=requiredFood)return 0;
  const meat=rand(42,58);game.cart.boeufs--;const loaded=loadFood(meat);
  addJournal(bilingual(`Les vivres ne suffisaient plus : un bœuf a été abattu et a fourni ${loaded} kg de viande. ${oxenJournalStatus("fr")}`,`The food stores were no longer sufficient: an ox was slaughtered for ${loaded} kg of meat. ${oxenJournalStatus("en")}`));
  return loaded;
}

function offerOxForFood(afterFeeding=null,requiredFood=1,afterRefusal=null){
  if(game.cart.vivres>=requiredFood||game.cart.boeufs<=1)return false;
  const missing=Math.max(0,requiredFood-game.cart.vivres),missingFr=journalNumber(missing,"fr"),missingEn=journalNumber(missing,"en"),empty=game.cart.vivres<=0;
  eventModal(bilingual(empty?"Les vivres sont épuisés":"Les vivres ne suffisent pas",empty?"The food stores are empty":"The food stores are insufficient"),bilingual(empty?"Le groupe n’a plus rien à manger. Un bœuf pourrait être abattu pour nourrir le convoi.":`Il manque ${missingFr} kg de vivres pour poursuivre. Un bœuf pourrait compléter les réserves.`,empty?"The party has nothing left to eat. An ox could be slaughtered to feed the wagon party.":`${missingEn} kg of food ${Math.abs(missing-1)<.0001?"is":"are"} missing to continue. An ox could replenish the stores.`),bilingual(`Il resterait ${game.cart.boeufs-1} bœuf${game.cart.boeufs-1>1?"s":""} pour tirer le chariot.`,`There would be ${game.cart.boeufs-1} ${game.cart.boeufs-1===1?"ox":"oxen"} left to pull the wagon.`),[
    {label:bilingual("Abattre un bœuf","Slaughter an ox"),action:()=>slaughterOxForFood(requiredFood),afterClose:afterFeeding},
    {label:bilingual("Conserver l’attelage","Keep the team"),action:()=>addJournal(bilingual(empty?"Le convoi a conservé son attelage et affronte désormais la faim.":"Le convoi a conservé son attelage malgré le manque de vivres.",empty?"The wagon party kept its team and now faces starvation.":"The wagon party kept its team despite the shortage of food.")),afterClose:afterRefusal??(()=>resolveStarvation(false))}
  ],"incident-ox-slaughter.webp");
  return true;
}

function resolveStarvation(recordInJournal=true){
  for(const p of alive())p.health=clamp(p.health-18,0,100);
  for(let day=0;day<3;day++){advanceDate(1);refreshWeather()}if(recordInJournal)addJournal("Les vivres sont épuisés. La faim affaiblit tout le monde.");updateDeaths(bilingual("de faim","from starvation"));
  if(showPendingDeathEvent()||game.finished)return;
  updateUI();randomEvent();
}

function deathCauseFor(traveler,explicitCause=null){
  if(traveler.deathCause)return traveler.deathCause;
  if(explicitCause)return explicitCause;
  if(traveler.state==="Dysenterie")return bilingual("de la dysenterie","from dysentery");
  if(traveler.state==="Fièvre")return bilingual("de la fièvre","from fever");
  if(traveler.state==="Engelures")return bilingual("des suites de ses engelures","from frostbite");
  if(traveler.state==="Piqûres")return bilingual("des suites de piqûres infectées","from infected bites");
  if((traveler.woundDays??0)>0||traveler.needsRemedy||["Blessé","Convalescent"].includes(traveler.state))return bilingual("des suites de ses blessures","from their wounds");
  if(traveler.state==="Malade"||traveler.sickDays>0)return bilingual("de maladie","from illness");
  return bilingual("d’épuisement sur la piste","from exhaustion on the trail");
}

function deathNotice(traveler){
  const cause=traveler.deathCause??deathCauseFor(traveler);
  const fr={
    "de la dysenterie":`${traveler.name} a succombé à la dysenterie.`,
    "de la fièvre":`La fièvre a fini par emporter ${traveler.name}.`,
    "des suites de ses engelures":`${traveler.name} n’a pas survécu aux engelures.`,
    "des suites de piqûres infectées":`${traveler.name} a succombé à l’infection de ses piqûres.`,
    "des suites de ses blessures":`${traveler.name} a succombé à ses blessures.`,
    "des suites d’une morsure de serpent venimeux":`Le venin a fini par emporter ${traveler.name}.`,
    "de maladie":`${traveler.name} a succombé à la maladie.`,
    "de faim":`${traveler.name} n’a pas survécu à la faim.`,
    "d’épuisement sur la piste":`${traveler.name} s’est éteint sur la piste, vaincu par l’épuisement.`
  }[cause.fr]??(cause.fr.startsWith("pendant ")?`${traveler.name} a perdu la vie ${cause.fr}.`:`${traveler.name} a succombé ${cause.fr}.`);
  const en={
    "from dysentery":`${traveler.name} succumbed to dysentery.`,
    "from fever":`Fever finally claimed ${traveler.name}.`,
    "from frostbite":`${traveler.name} did not survive the frostbite.`,
    "from infected bites":`${traveler.name} succumbed to infected bites.`,
    "from their wounds":`${traveler.name} succumbed to their wounds.`,
    "from a venomous snakebite":`The venom finally claimed ${traveler.name}.`,
    "from illness":`${traveler.name} succumbed to illness.`,
    "from starvation":`${traveler.name} did not survive starvation.`,
    "from exhaustion on the trail":`${traveler.name} passed away on the trail, overcome by exhaustion.`
  }[cause.en]??(cause.en.startsWith("during ")?`${traveler.name} lost their life ${cause.en}.`:`${traveler.name} succumbed ${cause.en}.`);
  return bilingual(fr,en);
}

function updateDeaths(cause=null){
  const dying=shuffled(alive().filter(p=>p.health<=0));
  const deaths=dying.slice(0,1);
  for(const p of deaths){
    p.deathCause=deathCauseFor(p,cause);p.pendingRecoveryCondition=null;p.pendingWoundRecoveryKind=null;p.alive=false;p.state="Décédé";game.pendingDeath=p;
  }
  // Une même étape peut affaiblir tout le groupe, mais ne doit pas tuer
  // plusieurs voyageurs simultanément. Les autres restent en état critique.
  for(const p of dying.slice(1)){
    p.health=1;p.deathCause=null;
  }
  for(const p of alive()){
    completePendingRecovery(p);
    completePendingWoundRecovery(p);
  }
  return deaths[0]??null;
}

function deathEventAsset(remaining=alive().length){
  return remaining<=0?"incident-death-last.webp":`incident-death-${clamp(Math.round(remaining),1,4)}.webp`;
}

function showPendingDeathEvent(){
  const traveler=game.pendingDeath;
  if(!traveler)return false;
  game.pendingDeath=null;game.deathEventOpen=true;const remaining=alive().length;
  const details=remaining?bilingual("Le convoi s’arrête pour lui offrir une sépulture avant de reprendre la route.","The wagon party stops to give them a burial before returning to the trail."):bilingual("Le dernier voyageur s’est éteint près du chariot immobilisé. Il ne reste personne pour l’ensevelir ni pour reprendre la piste.","The last traveler died beside the stranded wagon. No one remains to bury them or return to the trail.");
  eventModal(bilingual("Dernier adieu","A final farewell"),deathNotice(traveler),details,[
    {label:remaining?bilingual("Rendre un dernier hommage et repartir","Pay your last respects and leave"):bilingual("Voir le bilan du convoi","View the wagon party’s final report"),action:()=>{game.deathEventOpen=false;if(!remaining){finish(false,"La piste a eu raison de tout le convoi.");return;}setTimeout(showPendingRiverOutcome,0)}}
  ],deathEventAsset());
  return true;
}

function eventEligibleTravelers(){return alive().filter(p=>p.sickDays<=0&&(p.woundDays??0)<=0&&!p.needsRemedy)}
function snakebiteEligibleTravelers(){return alive().filter(p=>(p.woundDays??0)<=0&&!p.needsRemedy)}
function taggedEvent(id,run){run.eventId=id;return run}

function eventPool(weather=game.weather){
  if(game.finished||!alive().length)return [];
  const patients=eventEligibleTravelers();
  const wagonEvent=taggedEvent("wagon",()=>{
      const loss=proportionalLossAmount(game.cart.vivres,.06,.15);game.cart.vivres-=loss;
      const lossText=loss>0?`${loss} kg de vivres ${loss===1?"est perdu":"sont perdus"}.`:"Les réserves de vivres étaient déjà vides : rien n’a pu être perdu.";
      const lossTextEn=loss>0?`${loss} kg of food ${loss===1?"is":"are"} lost.`:"The food stores were already empty: nothing could be lost.";
      eventModal(bilingual("Mauvaise piste","Rough trail"),bilingual(`Le chariot s’est renversé dans une ornière. ${lossText}`,`The wagon overturned in a rut. ${lossTextEn}`),bilingual("Une journée sera nécessaire pour tout remettre en ordre.","One day will be needed to put everything back in order."),[
        {label:"Réparer et repartir",foodDays:1,action:()=>{consumeDelay(1);addJournal(loss>0?bilingual(`Une chute de chariot nous a coûté ${loss} kg de vivres. Il reste ${journalNumber(game.cart.vivres,"fr")} kg de vivres dans le chariot.`,`A wagon fall cost us ${loss} kg of food. ${journalNumber(game.cart.vivres,"en")} kg of food remain in the wagon.`):bilingual("Le chariot s’est renversé, sans perte de vivres.","The wagon overturned without losing any food."))}}
      ],"incident-wagon.webp");
    });
  const axleEvent=taggedEvent("axle",()=>{
      if(game.cart.pieces>0){
        const days=game.profession==="charpentier"?1:2;game.cart.pieces--;
        eventModal("Essieu brisé","Un choc sec — l’essieu du chariot vient de céder.",bilingual(`Vous utilisez une pièce de rechange et perdez ${days===1?"une journée":"deux jours"}.`,`You use a spare part and lose ${days===1?"one day":"two days"}.`),[
          {label:"Effectuer la réparation",foodDays:days,action:()=>{consumeDelay(days);addJournal(bilingual(`L’essieu a été remplacé avec une pièce de rechange en ${days} jour${days>1?"s":""}.`,`The axle was replaced with a spare part in ${days} day${days===1?"":"s"}.`))}}
        ],"incident-axle.webp");
      }else{
        const discardedFood=proportionalLossAmount(game.cart.vivres,.1,.25);
        const discardedBlankets=proportionalLossAmount(game.cart.vetements,.2,.5);
        eventModal("Essieu brisé","Votre essieu est rompu et vous n’avez aucune pièce.","Une famille de passage propose une pièce pour 45 $.",[
          {label:"Acheter la pièce (45 $)",disabled:game.money<45,foodDays:2,action:()=>{game.money-=45;consumeDelay(2);addJournal(bilingual("Une pièce achetée en urgence a permis de remplacer l’essieu en deux jours.","An emergency spare part purchase allowed us to replace the axle in two days."))}},
          {label:"Alléger et improviser",foodDays:4,action:()=>{
            consumeDelay(4);const actualFood=Math.min(game.cart.vivres,discardedFood);game.cart.vivres-=actualFood;game.cart.vetements-=discardedBlankets;
            alive().forEach(p=>p.health=clamp(p.health-7,0,100));
            const losses=[];if(actualFood)losses.push(`${actualFood} kg de vivres`);if(discardedBlankets)losses.push("une couverture");
            const remainingFr=`Il reste ${journalNumber(game.cart.vivres,"fr")} kg de vivres et ${game.cart.vetements} couverture${game.cart.vetements>1?"s":""}.`,remainingEn=`${journalNumber(game.cart.vivres,"en")} kg of food and ${game.cart.vetements} blanket${game.cart.vetements===1?"":"s"} remain.`;
            addJournal(bilingual(`Faute de pièce, le chariot a été allégé${losses.length?` de ${losses.join(" et ")}`:""} pour reprendre la piste. ${remainingFr}`,`Without a spare part, the wagon was lightened${losses.length?` by discarding ${losses.map(loss=>languageText(loss,"en")).join(" and ")}`:""} to return to the trail. ${remainingEn}`));
          }}
        ],"incident-axle.webp");
      }
    });
  const events=[wagonEvent,axleEvent,taggedEvent("encounter",()=>{
      const found=loadFood(rand(10,25)),advice=nextTrailAdvice(),adviceFr=advice?` Conseil reçu : « ${advice.fr} »`:"",adviceEn=advice?` Advice received: “${advice.en}”`:"";
      const details=found?bilingual(`Vous recevez ${found} kg de vivres.${adviceFr}`,`You receive ${found} kg of food.${adviceEn}`):bilingual(`Le chariot est déjà plein.${adviceFr}`,`The wagon is already full.${adviceEn}`);
      const journalFr=found?`Une famille nous a donné ${found} kg de vivres ; les réserves contiennent désormais ${journalNumber(game.cart.vivres,"fr")} kg.${adviceFr}`:advice?`Une famille nous a conseillé sur la route.${adviceFr}`:"Une famille de passage a trouvé notre chariot déjà plein ; nous avons seulement échangé quelques nouvelles.";
      const journalEn=found?`A family gave us ${found} kg of food; the stores now contain ${journalNumber(game.cart.vivres,"en")} kg.${adviceEn}`:advice?`A family gave us advice about the trail.${adviceEn}`:"A passing family found our wagon already full; we merely exchanged some news.";
      eventModal("Une bonne rencontre","Des voyageurs revenant de l’Oregon partagent leurs provisions.",details,[
        {label:"Les remercier",action:()=>addJournal(bilingual(journalFr,journalEn))}
      ],"incident-encounter.webp");
    }),taggedEvent("theft",theftEvent),taggedEvent("trade",tradeEvent),taggedEvent("attack",attackEvent)];
  if(patients.length){
    events.push(taggedEvent("fever",()=>feverEvent(pick(patients))));
    events.push(taggedEvent("injury",()=>injuryEvent(pick(patients))));
    events.push(taggedEvent("dysentery",()=>dysenteryEvent(pick(patients))));
  }
  if(patients.length>=2)events.push(taggedEvent("contagious",()=>contagiousDiseaseEvent(patients)));
  const snakebiteCandidates=snakebiteEligibleTravelers();
  if(snakebiteCandidates.length&&!['Froid','Neige'].includes(weather.name))events.push(taggedEvent("snakebite",()=>snakebiteEvent(pick(snakebiteCandidates))));
  if(weather.name==="Pluvieux")events.push(taggedEvent("rain",()=>{
    const days=rand(2,4);
    eventModal("Pluies diluviennes","La boue avale les roues. Impossible d’avancer.",bilingual(`${days} jours de retard, mais le convoi reste à l’abri.`,`${days} days lost, but the wagon party remains sheltered.`),[
      {label:"Attendre l’éclaircie",foodDays:days,action:()=>{consumeDelay(days);addJournal(bilingual(`${days} jours perdus dans les pluies diluviennes.`,`${days} days lost in torrential rain.`))}}
    ],"incident-rain.webp");
  }));
  if(game.cart.vetements>0&&(weather.temp<=5||weather.name==="Pluvieux"))events.push(taggedEvent("blankets",blanketLossEvent));
  if(patients.length&&((weather.temp<=5&&game.cart.vetements<alive().length)||weather.temp>=27))events.push(taggedEvent("climate-injury",()=>climateInjuryEvent(pick(patients),weather.temp<=5)));
  if(game.cart.boeufs>0)events.push(taggedEvent("ox-injury",oxInjuryEvent));
  return events;
}

function selectDailyIncident({distance=0,weather=game.weather,route=routeSegmentAt(),resting=false}={}){
  const events=eventPool(weather).filter(event=>!resting||REST_EVENT_IDS.has(event.eventId));
  const triggered=[];
  for(const event of events){
    const probability=incidentProbability(event.eventId,{distance,weather,route});
    if(probability>0&&Math.random()<probability)triggered.push({value:event,weight:probability});
  }
  return triggered.length?weightedPick(triggered):null;
}

function randomEvent(selected=selectDailyIncident()){
  if(!selected)return false;
  game.lastEvent=selected.eventId;selected();
  return true;
}

const REST_EVENT_IDS=new Set(["attack","theft","trade","encounter","fever","dysentery","contagious","snakebite","rain","climate-injury","blankets"]);

function restEventPool(){return eventPool().filter(event=>REST_EVENT_IDS.has(event.eventId))}

function selectRestEvent(){
  return selectDailyIncident({distance:0,weather:game.weather,route:routeSegmentAt(),resting:true});
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

function restEventJournalLabel(eventId,language=currentLanguage){
  const labels={
    attack:{fr:"une attaque contre le camp",en:"an attack on the camp"},
    theft:{fr:"un vol au camp",en:"a theft at camp"},
    trade:{fr:"une proposition commerciale",en:"a trade offer"},
    encounter:{fr:"une rencontre avec d’autres voyageurs",en:"an encounter with other travelers"},
    fever:{fr:"une forte fièvre",en:"a high fever"},
    dysentery:{fr:"un cas de dysenterie",en:"a case of dysentery"},
    contagious:{fr:"une maladie contagieuse",en:"a contagious illness"},
    snakebite:{fr:"une morsure de serpent venimeux",en:"a venomous snakebite"},
    "climate-injury":{fr:"une blessure liée au climat",en:"a weather-related injury"},
    blankets:{fr:"la perte de couvertures",en:"the loss of blankets"}
  };
  return labels[eventId]?.[language]??(language==="en"?"an incident at camp":"un incident au camp");
}

function performRest(days=2,atFort=false){
  const streak=game.lastRestDay===game.days?(game.restStreak??0)+1:1;
  const requiredFood=foodNeededForDays(days);
  if(game.cart.vivres<requiredFood&&game.cart.boeufs>1)return {days:0,streak,event:null,needsFood:requiredFood};
  let rested=0,foodConsumed=0,selected=null,blanketRecoveryStrained=false;
  for(let day=0;day<days;day++){
    const restWeather=game.weather,food=consumeDelay(1,dailyFoodPerPerson(),true,true,atFort);foodConsumed+=food.consumed;rested++;
    const restingTravelers=alive(),blankets=Math.min(game.cart.vetements,restingTravelers.length);
    restingTravelers.forEach((traveler,index)=>{
      const hasBlanket=atFort||blankets>=restingTravelers.length||((index+game.days)%restingTravelers.length)<blankets;
      const exposurePenalty=restWeatherPenalty(restWeather,hasBlanket,atFort);
      if(exposurePenalty>0)blanketRecoveryStrained=true;
      traveler.health=clamp(traveler.health+restRecovery(traveler,streak,atFort)/Math.max(1,days)-exposurePenalty,0,100);
      if(traveler.health>0&&traveler.deathCause)traveler.deathCause=null;
    });
    updateDeaths();
    if(game.pendingDeath||game.finished)break;
    if(!atFort){const incident=dailyIncidentOccurs(null,restWeather,{distance:0,route:routeSegmentAt(),resting:true});selected=incident===true?selectRestEvent():incident;if(selected)break;}
  }
  const portion=rested/Math.max(1,days);
  game.oxStrain=clamp(game.oxStrain-3*portion,0,10);
  game.restStreak=streak;game.lastRestDay=game.days;
  const interruptionFr=selected?` La halte a été interrompue par ${restEventJournalLabel(selected.eventId,"fr")}.`:"",interruptionEn=selected?` The halt was interrupted by ${restEventJournalLabel(selected.eventId,"en")}.`:"";
  const blanketFr=blanketRecoveryStrained?" Le manque de couvertures a fragilisé la récupération du groupe.":"",blanketEn=blanketRecoveryStrained?" Too few blankets hampered the party’s recovery.":"";
  const foodFr=` ${journalNumber(foodConsumed,"fr")} kg de vivres consommé${foodConsumed===1?"":"s"} ; ${journalNumber(game.cart.vivres,"fr")} kg ${game.cart.vivres===1?"reste":"restent"}.`;
  const foodEn=` ${journalNumber(foodConsumed,"en")} kg of food consumed; ${journalNumber(game.cart.vivres,"en")} kg ${game.cart.vivres===1?"remains":"remain"}.`;
  const state=groupJournalSummary();
  addJournal(bilingual(`${rested} jour${rested>1?"s":""} de repos ${rested===1?"a":"ont"} soulagé le groupe et l’attelage.${foodFr}${interruptionFr}${blanketFr} ${state.fr}`,`${rested} day${rested===1?"":"s"} of rest eased the party and the oxen.${foodEn}${interruptionEn}${blanketEn} ${state.en}`));
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
    {label:remedyLabel("Le soigner et attendre 2 jours"),disabled:game.cart.medicaments<1,foodDays:2,action:()=>{
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
    {label:"Poser une attelle",foodDays:1,action:()=>{consumeDelay(1);p.sickDays=8;addJournal(bilingual(`${p.name} voyage avec une attelle improvisée.`,`${p.name} travels with an improvised splint.`))}}
  ],"incident-injury.webp");
}

function dysenteryEvent(p=pick(eventEligibleTravelers())){
  if(!p)return;
  const damage=rand(24,36);p.health=clamp(p.health-damage,0,100);p.state="Dysenterie";p.sickDays=19;p.treated=false;
  eventModal("Dysenterie",bilingual(`${p.name} est pris de violentes douleurs et se déshydrate rapidement.`,`${p.name} suffers violent pain and is rapidly becoming dehydrated.`),bilingual(`Son état s’est sérieusement dégradé. Du repos, de l’eau bouillie et un remède peuvent éviter le pire.`,`${p.name}’s condition has seriously deteriorated. Rest, boiled water, and medicine may prevent the worst.`),[
    {label:remedyLabel("Donner un remède"),disabled:game.cart.medicaments<1,action:()=>{game.cart.medicaments--;p.health=clamp(p.health+18,1,100);p.sickDays=13;p.treated=true;addJournal(bilingual(`${p.name} a reçu un remède contre la dysenterie, mais restera malade plusieurs jours.`,`${p.name} received medicine for dysentery but will remain ill for several days.`))}},
    {label:"Faire halte 2 jours",foodDays:2,action:()=>{consumeDelay(2);if(p.health>0)p.health=clamp(p.health+2,1,100);p.sickDays=Math.max(p.sickDays,15);addJournal(bilingual(`Le convoi s’est arrêté pour soigner la dysenterie de ${p.name}. Deux jours ne suffisent pas à la faire disparaître.`,`The wagon party stopped to treat ${p.name}’s dysentery. Two days are not enough for it to pass.`))}},
    {label:"Continuer",action:()=>{p.health=clamp(p.health-8,0,100);addJournal(bilingual(`${p.name} reste gravement atteint de dysenterie.`,`${p.name} remains seriously ill with dysentery.`))}}
  ],"incident-dysentery.webp");
}

function snakebiteEvent(p=pick(snakebiteEligibleTravelers())){
  if(!p)return;
  p.health=clamp(p.health-rand(10,16),0,100);p.woundDays=8;p.woundKind="snakebite";p.needsRemedy=true;
  if(p.sickDays<=0)p.state="Blessé";
  eventModal(bilingual("Morsure de serpent venimeux","Venomous snakebite"),bilingual(`${p.name} a été mordu à la jambe par un serpent à sonnette.`,`${p.name} was bitten on the leg by a rattlesnake.`),bilingual("Le venin agira pendant huit jours. Un remède peut en limiter fortement les effets.","The venom will affect the traveler for eight days. Medicine can greatly limit its effects."),[
    {label:remedyLabel(bilingual("Administrer un remède","Administer medicine")),disabled:game.cart.medicaments<1,action:()=>{
      game.cart.medicaments--;p.health=clamp(p.health+10,1,100);p.needsRemedy=false;if(p.sickDays<=0)p.state="Convalescent";
      addJournal(bilingual(`${p.name} a reçu un remède contre le venin, mais restera en convalescence pendant huit jours.`,`${p.name} received medicine for the venom but will remain in recovery for eight days.`));
    }},
    {label:bilingual("Immobiliser la jambe sans remède","Immobilize the leg without medicine"),action:()=>{
      p.health=clamp(p.health-22,0,100);if(p.health<=0)p.deathCause=bilingual("des suites d’une morsure de serpent venimeux","from a venomous snakebite");
      addJournal(bilingual(`Sans remède, le venin affaiblit gravement ${p.name}.`, `Without medicine, the venom leaves ${p.name} severely weakened.`));
    }}
  ],"incident-snakebite.webp");
}

function climateInjuryEvent(p=pick(eventEligibleTravelers()),coldWeather=null){
  if(!p)return;
  const cold=coldWeather??(game.weather.temp<=5),damage=cold?rand(14,23):rand(8,16);
  p.health=clamp(p.health-damage,0,100);p.state=cold?"Engelures":"Piqûres";p.sickDays=cold?11:7;
  const title=cold?"Engelures":"Piqûres d’insectes";
  const text=bilingual(cold?`${p.name} souffre d’engelures après une longue exposition au froid.`:`${p.name} est couvert de piqûres douloureuses après une halte sous une chaleur étouffante.`,cold?`${p.name} suffers from frostbite after prolonged exposure to the cold.`:`${p.name} is covered in painful insect bites after a stop in oppressive heat.`);
  const details=cold?"Il faut réchauffer progressivement les zones atteintes.":"Les piqûres se sont infectées et doivent être nettoyées.";
  eventModal(title,text,bilingual(`${details} ${p.name} en ressort affaibli.`,`${languageText(details,"en")} ${p.name} is left weakened.`),[
    {label:remedyLabel("Utiliser un remède"),disabled:game.cart.medicaments<1,action:()=>{game.cart.medicaments--;p.health=clamp(p.health+(cold?17:12),1,100);p.sickDays=4;p.state="Convalescent";addJournal(bilingual(`${p.name} a été soigné pour ${cold?"des engelures":"des piqûres d’insectes"}.`,`${p.name} was treated for ${cold?"frostbite":"insect bites"}.`))}},
    {label:cold?"Réchauffer et attendre":"Nettoyer et repartir",foodDays:cold?1:0,action:()=>{if(cold)consumeDelay(1);p.sickDays=cold?8:5;addJournal(bilingual(`${p.name} récupère lentement après ${cold?"ses engelures":"ses piqûres"}.`,`${p.name} is recovering slowly from ${cold?"frostbite":"the bites"}.`))}}
  ],cold?"incident-frostbite.webp":"incident-bites.webp");
}

function contagiousDiseaseEvent(candidates=eventEligibleTravelers()){
  const patients=shuffled(candidates).slice(0,Math.min(candidates.length,rand(2,3)));if(!patients.length)return;
  patients.forEach(p=>{p.health=clamp(p.health-rand(12,22),0,100);p.state="Malade";p.sickDays=Math.max(p.sickDays,17);p.treated=false});
  const count=patients.length,namesFr=joinList(patients.map(p=>p.name),"fr"),namesEn=joinList(patients.map(p=>p.name),"en");
  eventModal("Maladie contagieuse",bilingual(`${count} voyageur${count>1?"s":""} présente${count>1?"nt":""} les mêmes symptômes : ${namesFr}.`,`${count} traveler${count===1?"":"s"} ${count===1?"shows":"show"} the same symptoms: ${namesEn}.`),bilingual(`La maladie risque d’épuiser rapidement le groupe. Vous avez ${itemQuantityFor("medicaments",game.cart.medicaments,"fr")}.`,`The disease may quickly exhaust the party. You have ${itemQuantityFor("medicaments",game.cart.medicaments,"en")}.`),[
    {label:remedyLabel(bilingual(`Distribuer ${count} remède${count>1?"s":""}`,`Give ${count} dose${count===1?"":"s"}`),count),disabled:game.cart.medicaments<count,action:()=>{game.cart.medicaments-=count;patients.forEach(p=>{p.health=clamp(p.health+14,1,100);p.sickDays=11;p.treated=true});addJournal(bilingual(`${namesFr} ${count>1?"ont":"a"} reçu un remède, mais la maladie suivra encore son cours.`,`${namesEn} ${count===1?"has":"have"} received medicine, but the illness will still run its course.`))}},
    {label:"Isoler les malades 2 jours",foodDays:2,action:()=>{consumeDelay(2);patients.forEach(p=>p.sickDays=Math.max(p.sickDays,13));addJournal(bilingual(`${namesFr} ${count>1?"ont été isolés":"a été isolé"} pendant deux jours pour protéger le convoi.`,`${namesEn} ${count===1?"was":"were"} isolated for two days to protect the wagon party.`))}},
    {label:"Continuer la route",action:()=>{patients.forEach(p=>p.health=clamp(p.health-5,0,100));addJournal(bilingual(`${namesFr} ${count>1?"poursuivent":"poursuit"} la route malgré la maladie contagieuse.`,`${namesEn} ${count===1?"continues":"continue"} on the trail despite the contagious disease.`))}}
  ],"incident-contagious.webp");
}

function blanketLossEvent(){
  const cold=game.weather.temp<=5,loss=proportionalLossAmount(game.cart.vetements,.2,.45);game.cart.vetements-=loss;
  const blankets=`${loss} couverture${loss>1?"s":""}`;
  const cause=cold?bilingual("Une nuit glaciale et humide détrempe les couvertures les plus exposées.","A freezing, damp night soaks the most exposed blankets."):bilingual("La pluie s’est infiltrée dans le chariot pendant la nuit.","Rain leaked into the wagon during the night.");
  eventModal("Couvertures hors d’usage",cause,bilingual(`${blankets} ${loss===1?"est devenue":"sont devenues"} inutilisable${loss>1?"s":""}.`,`${loss} blanket${loss===1?" has":"s have"} become unusable.`),[
    {label:"Réorganiser le chargement",action:()=>addJournal(cold?bilingual(`${blankets} perdue${loss>1?"s":""} pendant une nuit de grand froid ; il en reste ${game.cart.vetements}.`,`${loss} blanket${loss===1?" was":"s were"} lost during a bitterly cold night; ${game.cart.vetements} ${game.cart.vetements===1?"remains":"remain"}.`):bilingual(`${blankets} perdue${loss>1?"s":""} après une nuit de pluie ; il en reste ${game.cart.vetements}.`,`${loss} blanket${loss===1?" was":"s were"} lost after a rainy night; ${game.cart.vetements} ${game.cart.vetements===1?"remains":"remain"}.`))}
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
  const remainingQuantity=stolen.key==="money"?game.money:game.cart[stolen.key];
  const remainingFr=stolen.key==="money"?`${game.money} $ ${game.money===1?"reste":"restent"} en caisse`:stolen.key==="boeufs"?oxenJournalStatus("fr"):`Il reste ${fortStockText(stolen.key,"fr")}`;
  const remainingEn=stolen.key==="money"?`$${game.money} remains in cash`:stolen.key==="boeufs"?oxenJournalStatus("en"):`${fortStockText(stolen.key,"en")} ${remainingQuantity===1?"remains":"remain"}`;
  const outcomeFr=`Un vol nous a coûté ${stolenLabel}. ${remainingFr}${remainingFr.endsWith(".")?"":"."}`,outcomeEn=`A theft cost us ${stolenLabelEn}. ${remainingEn}${remainingEn.endsWith(".")?"":"."}`;
  const description=`${stolenLabel} ${stolen.amount===1?"a":"ont"} disparu.`;
  eventModal("Vol au camp","Au lever du jour, un coffre est ouvert et des traces s’éloignent du camp.",bilingual(description,`${stolenLabelEn} ${stolen.amount===1?"is":"are"} missing.`),[
    {label:"Sécuriser le chargement",action:()=>addJournal(bilingual(outcomeFr,outcomeEn))}
  ],"incident-theft.webp");
}

function tradeEvent(){
  const offers=[
    {mode:"buy",key:"vivres",qty:50,price:34,label:"50 kg de vivres"},
    {mode:"buy",key:"munitions",qty:40,price:8,label:"40 balles"},
    {mode:"buy",key:"pieces",qty:1,price:28,label:"1 pièce de rechange"},
    {mode:"buy",key:"medicaments",qty:2,price:30,label:"2 remèdes"},
    {mode:"buy",key:"boeufs",qty:2,price:85,label:"2 bœufs"},
    {mode:"buy",key:"vetements",qty:2,price:24,label:"2 couvertures"},
    {mode:"sell",key:"vivres",qty:40,price:22,label:"40 kg de vivres"},
    {mode:"sell",key:"munitions",qty:30,price:5,label:"30 balles"},
    {mode:"sell",key:"vetements",qty:1,price:14,label:"1 couverture"},
    {mode:"sell",key:"pieces",qty:1,price:20,label:"1 pièce de rechange"},
    {mode:"sell",key:"medicaments",qty:1,price:18,label:"1 remède"}
  ];
  const canAcceptOffer=offer=>offer.mode==="buy"?game.money>=offer.price&&game.cart[offer.key]+offer.qty<=SHOP[offer.key].max:game.cart[offer.key]>=offer.qty;
  const viableOffers=offers.filter(canAcceptOffer),offer=pick(viableOffers.length?viableOffers:offers),buying=offer.mode==="buy",offerLabelEn=itemQuantityFor(offer.key,offer.qty,"en");
  const canAccept=canAcceptOffer(offer);
  const text=bilingual(buying?`Un marchand vous propose ${offer.label} pour ${offer.price} $.`:`Un voyageur vous offre ${offer.price} $ pour ${offer.label}.`,buying?`A merchant offers you ${offerLabelEn} for $${offer.price}.`:`A traveler offers you $${offer.price} for ${offerLabelEn}.`);
  const refusal=bilingual(buying?`Nous avons refusé d’acheter ${offer.label} pour ${offer.price} $.`:`Nous avons refusé de vendre ${offer.label} contre ${offer.price} $.`,buying?`We declined to buy ${offerLabelEn} for $${offer.price}.`:`We declined to sell ${offerLabelEn} for $${offer.price}.`);
  eventModal("Une proposition sur la piste",text,"La quantité et le prix sont fixes. Acceptez-vous l’offre ?",[
    {label:"Accepter",disabled:!canAccept,action:()=>{if(buying){game.money-=offer.price;game.cart[offer.key]+=offer.qty;}else{game.money+=offer.price;game.cart[offer.key]-=offer.qty;}addJournal(bilingual(`${buying?"Achat":"Vente"} conclu${buying?"":"e"} : ${offer.label} pour ${offer.price} $. Le chariot compte désormais ${fortStockText(offer.key,"fr")} et il reste ${game.money} $ en caisse.`,`${buying?"Purchase":"Sale"} completed: ${offerLabelEn} for $${offer.price}. The wagon now holds ${fortStockText(offer.key,"en")}, with $${game.money} remaining.`))}},
    {label:"Refuser",action:()=>addJournal(refusal)}
  ],"incident-trade.webp");
}

function attackEvent(){
  const responses=[
    {id:"none",name:bilingual("Aucune riposte","No return fire"),ammo:0,duration:25},
    {id:"light",name:bilingual("Riposte légère","Light return fire"),ammo:10,duration:20},
    {id:"sustained",name:bilingual("Riposte soutenue","Sustained return fire"),ammo:40,duration:12},
    {id:"maximum",name:bilingual("Riposte maximale","Maximum return fire"),ammo:100,duration:6}
  ];
  const survivors=alive().length,maximumManpowerBlocked=survivors<3;
  const actions=responses.map(response=>{
    const manpowerBlocked=response.id==="maximum"&&maximumManpowerBlocked;
    const requirement=manpowerBlocked?bilingual(" · 3 voyageurs nécessaires"," · 3 travelers required"):bilingual("","");
    return {
      label:bilingual(`${response.name.fr} · ${response.ammo} balle${response.ammo>1?"s":""} · ${response.duration} s${requirement.fr}`,`${response.name.en} · ${response.ammo} bullet${response.ammo===1?"":"s"} · ${response.duration}s${requirement.en}`),
      disabled:()=>game.cart.munitions<response.ammo||manpowerBlocked,
      deferReturn:true,
      action:()=>{
        const incidentEntry=journalMergeTarget,returnCallback=activeEventModal?.returnCallback??null;
        game.cart.munitions-=response.ammo;
        const choiceFr=response.ammo?`${response.name.fr} : ${response.ammo} balles utilisées ; le convoi devra tenir environ ${response.duration} secondes. Il reste ${game.cart.munitions} balle${game.cart.munitions>1?"s":""}.`:`${response.name.fr} : le convoi devra tenir environ ${response.duration} secondes.`;
        const choiceEn=response.ammo?`${response.name.en}: ${response.ammo} bullets used; the wagon party must hold out for about ${response.duration} seconds. ${game.cart.munitions} bullet${game.cart.munitions===1?" remains":"s remain"}.`:`${response.name.en}: the wagon party must hold out for about ${response.duration} seconds.`;
        const limitationFr=maximumManpowerBlocked?` Avec seulement ${survivors} survivant${survivors>1?"s":""}, la riposte maximale était impossible.`:"";
        const limitationEn=maximumManpowerBlocked?` With only ${survivors} survivor${survivors===1?"":"s"}, maximum return fire was impossible.`:"";
        addJournal(bilingual(`${choiceFr}${limitationFr}`,`${choiceEn}${limitationEn}`));
        setTimeout(()=>startAttack(incidentEntry,returnCallback,response),0);
      }
    };
  });
  eventModal("Attaque du convoi","Les indiens approchent rapidement à cheval et des projectiles frappent autour des chariots.",bilingual(`Vous disposez de ${game.cart.munitions} balle${game.cart.munitions>1?"s":""}. Une riposte raccourcit l’attaque, mais la riposte maximale exige au moins trois voyageurs vivants.`,`You have ${game.cart.munitions} bullet${game.cart.munitions===1?"":"s"}. Return fire shortens the attack, but maximum return fire requires at least three living travelers.`),actions,"incident-attack.webp");
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
    {label:bilingual(`Prendre le bac (${cost} $)`,`Take the ferry ($${cost})`),disabled:game.money<cost,foodDays:1,action:()=>{game.money-=cost;clearRiverFailures(mark);const food=consumeDelay(1);addJournal(bilingual(`Traversée de ${mark.name} en bac, sans incident, avec une profondeur de ${shown} m.`,`We crossed ${landmarkName(mark)} by ferry without incident at a depth of ${shownEn} m.`));queueRiverOutcome(mark,"ferry",{method:bilingual("Bac","Ferry"),days:1,food:food.consumed,weather:crossingWeather,text:"Le bac a transporté le chariot et tout le groupe jusqu’à l’autre rive.",result:bilingual(`Traversée sans perte · Profondeur : ${shown} m · Coût : ${cost} $`,`Crossing without loss · Depth: ${shownEn} m · Cost: $${cost}`)})}},
    {label:"Calfater et flotter",foodDays:1,action:()=>riverRisk(mark,measured,crossingWeather)},
    {label:"Attendre 3 jours et remesurer",foodDays:3,action:()=>{
      consumeDelay(3);game.oxStrain=clamp(game.oxStrain-2,0,10);
      const next=riverDepth(mark,measured),nextShown=formatDepth(next);
      const displayedChange=Math.round(next*10)-Math.round(measured*10);
      const change=displayedChange>0?"a monté":displayedChange<0?"a baissé":"est resté stable",changeEn=displayedChange>0?"rose":displayedChange<0?"fell":"remained stable";
      addJournal(bilingual(`Après trois jours d’attente à ${mark.name}, le niveau ${change} : de ${shown} m à ${nextShown} m.`,`After waiting three days at ${landmarkName(mark)}, the water level ${changeEn}: from ${measured.toFixed(1)} m to ${next.toFixed(1)} m.`));
      setTimeout(()=>{if(!game.finished)riverEvent(mark,stageAsset(mark),next,bilingual(`Après l’attente, le niveau ${change}.`,`After waiting, the water level ${changeEn}.`))},0);
    }}
  ],art);
}

function queueRiverOutcome(mark,outcome,data){
  const art=journalArtSnapshot(`river-weather-${mark.visual}-${outcome}.webp`,data.weather??weatherVisual());
  if(game.journal[0])game.journal[0].art=art;
  game.pendingRiverOutcome={mark,outcome,data};setTimeout(showPendingRiverOutcome,0);
}

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

function riverFailureCount(mark){return game.riverFailures?.[mark.visual]??0}
function riverRetryFailureChance(depth,fatigue,mark,oxen=game.cart.boeufs,hasParts=game.cart.pieces>0){
  return floatCrossingFailureChance(depth,fatigue,oxen,hasParts)*Math.pow(.9,riverFailureCount(mark));
}
function recordRiverFailure(mark){game.riverFailures??={};game.riverFailures[mark.visual]=riverFailureCount(mark)+1}
function clearRiverFailures(mark){if(game.riverFailures)delete game.riverFailures[mark.visual]}

function riverRisk(mark,depth,crossingWeather=weatherVisual()){
  const fatigue=riverFatigueRisk(),crossingFailed=Math.random()<riverRetryFailureChance(depth,fatigue,mark);
  if(crossingFailed)recordRiverFailure(mark);else clearRiverFailures(mark);
  const travelFood=consumeDelay(1);
  game.oxStrain=clamp(game.oxStrain+1,0,10);
  const cargoCandidates=[
      {key:"vivres",amount:proportionalLossAmount(game.cart.vivres,.12,.35)},
      {key:"munitions",amount:proportionalLossAmount(game.cart.munitions,.15,.35)},
      {key:"vetements",amount:proportionalLossAmount(game.cart.vetements,.25,.6)},
      {key:"pieces",amount:proportionalLossAmount(game.cart.pieces,.25,.6)},
      {key:"medicaments",amount:proportionalLossAmount(game.cart.medicaments,.25,.6)}
    ].filter(loss=>loss.amount>0);
  const cargoAccident=cargoCandidates.length>0&&Math.random()<floatCargoLossChance(depth);
  const handlingAccident=Math.random()<clamp(.08+(game.cart.boeufs<4?.16:0)+(game.cart.pieces===0?.12:0)+depth*.04+fatigue*.34,.08,.68);
  if(crossingFailed||cargoAccident||handlingAccident){
    const cargoDamaged=cargoCandidates.length>0&&(cargoAccident||crossingFailed);
    const cargoCount=crossingFailed?(depth>=2.2?rand(3,5):rand(2,3)):(depth>=2.2?rand(3,5):depth>=1.4?rand(2,3):1);
    const cargoLosses=cargoDamaged?shuffled(cargoCandidates).slice(0,Math.min(cargoCandidates.length,cargoCount)):[];
    const losses=[],lossesEn=[],remaining=[],remainingEn=[];
    for(const loss of cargoLosses){
      if(!loss.amount)continue;
      game.cart[loss.key]-=loss.amount;losses.push(itemQuantityFor(loss.key,loss.amount,"fr"));lossesEn.push(itemQuantityFor(loss.key,loss.amount,"en"));remaining.push(itemQuantityFor(loss.key,game.cart[loss.key],"fr"));remainingEn.push(itemQuantityFor(loss.key,game.cart[loss.key],"en"));
    }
    const maxOxLoss=game.cart.boeufs,oxLossChance=crossingFailed?clamp(.38+depth*.12+fatigue*.18,.42,.82):clamp(.18+depth*.12+fatigue*.08,.2,.52);
    const oxLoss=maxOxLoss&&Math.random()<oxLossChance?proportionalLossAmount(maxOxLoss,crossingFailed?.2:.1,crossingFailed?.45:.3):0;
    if(oxLoss){game.cart.boeufs-=oxLoss;losses.push(`${oxLoss} bœuf${oxLoss>1?"s":""}`);lossesEn.push(`${oxLoss} ${oxLoss===1?"ox":"oxen"}`);remaining.push(`${game.cart.boeufs} bœuf${game.cart.boeufs>1?"s":""}`);remainingEn.push(`${game.cart.boeufs} ${game.cart.boeufs===1?"ox":"oxen"}`);}
    const remainingSuffixFr=remaining.length?` Chargement restant : ${joinList(remaining,"fr")}.`:"",remainingSuffixEn=remainingEn.length?` Remaining cargo: ${joinList(remainingEn,"en")}.`:"";
    const healthDamage=crossingFailed?rand(10,22)+Math.round(fatigue*8):rand(2,9)+Math.round(fatigue*4);
    alive().forEach(p=>p.health=clamp(p.health-healthDamage,0,100));
    if(crossingFailed){
      const lossSuffixFr=losses.length?` Le courant emporte ${joinList(losses,"fr")}.${remainingSuffixFr}${oxLoss?` ${oxenJournalStatus("fr")}`:""}`:"";
      const lossSuffixEn=losses.length?` The current sweeps away ${joinList(lossesEn,"en")}.${remainingSuffixEn}${oxLoss?` ${oxenJournalStatus("en")}`:""}`:"";
      addJournal(bilingual(`La traversée de ${mark.name} échoue par ${depth.toFixed(1).replace(".",",")} m de profondeur : les cordes cèdent et le convoi regagne la rive de départ.${lossSuffixFr}`,`The crossing of ${landmarkName(mark)} fails at a depth of ${depth.toFixed(1)} m: the ropes give way and the wagon party returns to the original bank.${lossSuffixEn}`));toast(bilingual("Le courant a repoussé le convoi.","The current drove the wagon party back."));
      queueRiverOutcome(mark,"float-accident",{method:"Chariot calfaté",days:1,food:travelFood.consumed,weather:crossingWeather,retry:true,previousDepth:depth,text:bilingual("Les cordes ont cédé. Après avoir lutté contre le courant, le convoi a regagné la rive de départ.","The ropes gave way. After struggling against the current, the wagon party returned to the original bank."),result:losses.length?bilingual(`Échec de la traversée · Profondeur : ${depth.toFixed(1).replace(".",",")} m · Pertes : ${joinList(losses,"fr")}`,`Crossing failed · Depth: ${depth.toFixed(1)} m · Losses: ${joinList(lossesEn,"en")}`):bilingual(`Échec de la traversée · Profondeur : ${depth.toFixed(1).replace(".",",")} m · Groupe très éprouvé`,`Crossing failed · Depth: ${depth.toFixed(1)} m · Party severely exhausted`)});
    }else{
      addJournal(losses.length?bilingual(`À ${mark.name}, le chariot a pris l’eau par ${depth.toFixed(1).replace(".",",")} m de profondeur. Le courant emporte ${joinList(losses,"fr")}.${remainingSuffixFr}${oxLoss?` ${oxenJournalStatus("fr")}`:""}`,`At ${landmarkName(mark)}, the wagon took on water at a depth of ${depth.toFixed(1)} m. The current swept away ${joinList(lossesEn,"en")}.${remainingSuffixEn}${oxLoss?` ${oxenJournalStatus("en")}`:""}`):bilingual(`Le chariot a pris l’eau à ${mark.name}, sans perte de chargement.`,`The wagon took on water at ${landmarkName(mark)}, without losing any cargo.`));toast("Le courant a secoué le convoi.");
      queueRiverOutcome(mark,"float-accident",{method:"Chariot calfaté",days:1,food:travelFood.consumed,weather:crossingWeather,text:"Le chariot a pris l’eau dans le courant avant d’atteindre difficilement l’autre rive.",result:losses.length?bilingual(`Profondeur : ${depth.toFixed(1).replace(".",",")} m · Pertes : ${joinList(losses,"fr")}`,`Depth: ${depth.toFixed(1)} m · Losses: ${joinList(lossesEn,"en")}`):bilingual(`Profondeur : ${depth.toFixed(1).replace(".",",")} m · Aucune provision perdue, mais le groupe a été éprouvé`,`Depth: ${depth.toFixed(1)} m · No supplies lost, but the party was shaken`)});
    }
  } else {addJournal(bilingual(`Le chariot a traversé ${mark.name} à flot sans incident, par ${depth.toFixed(1).replace(".",",")} m de profondeur.`,`The wagon floated across ${landmarkName(mark)} without incident at a depth of ${depth.toFixed(1)} m.`));queueRiverOutcome(mark,"float-success",{method:"Chariot calfaté",days:1,food:travelFood.consumed,weather:crossingWeather,text:"Le chariot a flotté jusqu’à l’autre rive sous le contrôle des cordes et des bœufs.",result:bilingual(`Traversée réussie sans perte · Profondeur : ${depth.toFixed(1).replace(".",",")} m`,`Successful crossing without loss · Depth: ${depth.toFixed(1)} m`)})}
  setTrailScene();updateDeaths(bilingual(`pendant la traversée de ${mark.name}`,`during the crossing of ${landmarkName(mark)}`));
}

function reopenFort(mark){
  fortEvent(mark,fortArrivalAsset(mark),false);
}

function restAtFort(mark){
  const required=foodNeededForDays(2);
  if(game.cart.vivres<required){
    setTimeout(()=>offerOxForFood(()=>{performRest(2,true);reopenFort(mark)},required,()=>reopenFort(mark)),0);
    return;
  }
  performRest(2,true);refreshFortArrivalArt(mark);
}

function fortPurchaseKey(mark,key){return `${mark.visual}:${key}`}
function fortPurchasePrice(mark,key,baseCost){return Math.round(baseCost*(key==="vivres"?1:Math.pow(1.2,game.fortPurchases?.[fortPurchaseKey(mark,key)]??0)))}
function fortPriceMultiplier(mark){return FORT_PRICE_MULTIPLIERS[mark.visual]??1}
function fortBaseCost(mark,key,quantity){return SHOP[key].price*quantity/SHOP[key].step*fortPriceMultiplier(mark)}
function recordFortPurchase(mark,key){if(key==="vivres")return;game.fortPurchases??={};const priceKey=fortPurchaseKey(mark,key);game.fortPurchases[priceKey]=(game.fortPurchases[priceKey]??0)+1}
function fortStockText(key,language=currentLanguage){
  const quantity=game.cart[key];
  if(key==="boeufs")return language==="en"?`${quantity} ${quantity===1?"ox":"oxen"}`:`${quantity} bœuf${quantity>1?"s":""}`;
  return itemQuantityFor(key,quantity,language);
}
function fortPurchaseQuantity(key,quantity,language="fr"){
  const amount=journalNumber(quantity,language);
  if(language==="en"){
    if(key==="boeufs")return `${amount} ${quantity===1?"ox":"oxen"}`;
    if(key==="vivres")return `${amount} kg of food`;
    if(key==="munitions")return `${amount} bullet${quantity===1?"":"s"}`;
    if(key==="vetements")return `${amount} blanket${quantity===1?"":"s"}`;
    if(key==="pieces")return `${amount} spare part${quantity===1?"":"s"}`;
    return `${amount} ${quantity===1?"dose":"doses"} of medicine`;
  }
  if(key==="boeufs")return `${amount} bœuf${quantity>1?"s":""}`;
  if(key==="vivres")return `${amount} kg de vivres`;
  if(key==="munitions")return `${amount} balle${quantity>1?"s":""}`;
  if(key==="vetements")return `${amount} couverture${quantity>1?"s":""}`;
  if(key==="pieces")return `${amount} pièce${quantity>1?"s":""} de rechange`;
  return `${amount} remède${quantity>1?"s":""}`;
}
function recordFortPurchaseJournal(mark,item,cost){
  let entry=game.journal.find(candidate=>candidate.kind==="fort-purchases"&&candidate.fort===mark.visual&&candidate.day===game.day&&candidate.month===game.month&&candidate.year===game.year);
  if(!entry){entry=addJournal(bilingual("",""));entry.kind="fort-purchases";entry.fort=mark.visual;entry.purchaseItems={};}
  const purchase=entry.purchaseItems[item.key]??={quantity:0,cost:0};purchase.quantity+=item.qty;purchase.cost+=cost;entry.purchaseItems[item.key]=purchase;
  const purchases=Object.entries(entry.purchaseItems),frLines=purchases.map(([key,value])=>`${fortPurchaseQuantity(key,value.quantity,"fr")} pour ${value.cost} $`),enLines=purchases.map(([key,value])=>`${fortPurchaseQuantity(key,value.quantity,"en")} for $${value.cost}`);
  const frStocks=purchases.map(([key])=>fortPurchaseQuantity(key,game.cart[key],"fr")),enStocks=purchases.map(([key])=>fortPurchaseQuantity(key,game.cart[key],"en"));
  entry.text=bilingual(`Achats à ${mark.name} : ${joinList(frLines,"fr")}. Stocks correspondants : ${joinList(frStocks,"fr")}. Argent restant : ${game.money} $.`,`Purchases at ${landmarkName(mark)}: ${joinList(enLines,"en")}. Corresponding stocks: ${joinList(enStocks,"en")}. Money remaining: $${game.money}.`);
  return entry;
}
function fortPurchaseAction(mark,item){
  let lastPurchase=null;
  const action={
    keepOpen:true,
    disabled:()=>game.money<fortPurchasePrice(mark,item.key,item.baseCost)||game.cart[item.key]+item.qty>SHOP[item.key].max,
    action:()=>{
      const cost=fortPurchasePrice(mark,item.key,item.baseCost);game.money-=cost;game.cart[item.key]+=item.qty;recordFortPurchase(mark,item.key);lastPurchase={cost,money:game.money};
      recordFortPurchaseJournal(mark,item,cost);
    },
    feedback:()=>lastPurchase?bilingual(`Achat effectué : ${item.label} pour ${lastPurchase.cost} $. Nouveau stock : ${fortStockText(item.key,"fr")}. Il reste ${lastPurchase.money} $.`,`Purchase complete: ${item.labelEn} for $${lastPurchase.cost}. New stock: ${fortStockText(item.key,"en")}. $${lastPurchase.money} remains.`):null
  };
  Object.defineProperty(action,"label",{get(){const cost=fortPurchasePrice(mark,item.key,item.baseCost);return bilingual(`Acheter ${item.label} (${cost} $)`,`Buy ${item.labelEn} ($${cost})`)}});
  return action;
}

function fortEquipment(mark){
  const catalog={
    boeufs:{key:"boeufs",qty:1,label:"1 bœuf",labelEn:"1 ox"},
    vetements:{key:"vetements",qty:1,label:"1 couverture",labelEn:"1 blanket"},
    pieces:{key:"pieces",qty:1,label:"1 pièce de rechange",labelEn:"1 spare part"}
  };
  game.fortAssortments??={};
  const keys=game.fortAssortments[mark.visual]??=shuffled(Object.keys(catalog)).slice(0,2);
  return keys.map(key=>catalog[key]);
}

function fortEvent(mark,art=fortArrivalAsset(mark),recordArrival=true){
  if(recordArrival)addJournal(bilingual(`Arrivée à ${mark.name}.`,`Arrived at ${landmarkName(mark)}.`),journalArtSnapshot(art,weatherVisual()));
  const equipment=fortEquipment(mark).map(item=>({...item,baseCost:fortBaseCost(mark,item.key,item.qty)}));
  const merchandise=[
    {key:"vivres",qty:SHOP.vivres.step,baseCost:fortBaseCost(mark,"vivres",SHOP.vivres.step),label:"10 kg de vivres",labelEn:"10 kg of food"},
    {key:"munitions",qty:SHOP.munitions.step,baseCost:fortBaseCost(mark,"munitions",SHOP.munitions.step),label:"20 balles",labelEn:"20 bullets"},
    {key:"medicaments",qty:SHOP.medicaments.step,baseCost:fortBaseCost(mark,"medicaments",SHOP.medicaments.step),label:"1 remède",labelEn:"1 dose of medicine"},
    ...equipment
  ];
  const actions=[
    ...merchandise.map(item=>fortPurchaseAction(mark,item)),
    {label:"Se reposer 2 jours",keepOpen:true,disabled:()=>game.cart.vivres<foodNeededForDays(2)&&game.cart.boeufs<=1,action:()=>restAtFort(mark),feedback:fortRestFeedback},
    {label:"Inventaire",keepOpen:true,withInventory:false,action:showInventory},
    {label:"Repartir",primary:true,action:()=>addJournal(bilingual(`Départ de ${mark.name} : le convoi reprend la piste.`,`Departed ${landmarkName(mark)}: the wagon party returns to the trail.`))}
  ];
  eventModal(bilingual(mark.name,landmarkName(mark)),"Palissades, forge et odeur de pain frais : une halte bienvenue.","Chaque fort vend des remèdes ; le reste du stock d’équipement varie. Vous pouvez effectuer plusieurs achats avant de repartir.",actions,art);
}

function eventModal(title,text,details,actions,art="trail"){
  const returnCallback=queuedEventReturn;queuedEventReturn=null;
  const d=$("#dialogue-evenement");$("#event-title").textContent=languageText(title);$("#event-text").textContent=languageText(text);$("#event-details").textContent=languageText(details);
  const artFile=art.includes(".")?art:`${art}.webp`,artState=journalArtSnapshot(artFile,weatherVisual());
  applyStageArt($("#event-art"),artFile,weatherVisual());
  const incidentEntry=artFile.startsWith("incident-")?addJournal(bilingualJoin(title," — ",text),artState):null;
  if(incidentEntry){incidentEntry.captureOutcomes=true;incidentEntry.outcomeFragments=[];}
  const box=$("#event-actions");box.innerHTML="";
  const hasExplicitPrimary=actions.some(a=>a.primary),defaultPrimary=hasExplicitPrimary?-1:actions.findIndex(a=>!actionDisabled(a));
  const buttons=[];
  actions.forEach((a,i)=>{
    const b=document.createElement("button");b.type="button";b.className=`btn ${a.primary||i===defaultPrimary?"primary":"secondary"}`;b.textContent=languageText(a.label);b.disabled=actionDisabled(a);
    b.addEventListener("click",()=>{
      if(actionDisabled(a))return;
      const executeAction=()=>{
        journalMergeTarget=incidentEntry;
        try{a.action()}finally{journalMergeTarget=null;if(incidentEntry){delete incidentEntry.captureOutcomes;delete incidentEntry.outcomeFragments}}
        updateDeaths();
        if(showPendingDeathEvent()){updateUI();return;}
        if(game.finished||checkJourneyFailure()){d.close();return;}
        updateUI();
        if(a.keepOpen&&d.open){
          activeEventModal.withInventory=a.withInventory??true;activeEventModal.feedback=a.feedback??null;refreshEventModalLanguage();
          return;
        }
        d.close();
        if(a.afterClose){setTimeout(a.afterClose,0);return;}
        if(returnCallback&&!a.deferReturn){setTimeout(returnCallback,0);return;}
        setTrailScene();returnToTrailTop();
      };
      const requiredFood=a.foodDays?foodNeededForDays(a.foodDays):0;
      if(requiredFood>game.cart.vivres&&game.cart.boeufs>1){
        d.close();setTimeout(()=>offerOxForFood(executeAction,requiredFood,executeAction),0);return;
      }
      executeAction();
    });
    buttons.push({action:a,button:b});box.appendChild(b);
  });
  activeEventModal={title,text,details,buttons,withInventory:false,feedback:null,returnCallback,art:artState};refreshEventModalLanguage();
  if(!d.open)d.showModal();
}

function actionDisabled(action){return typeof action.disabled==="function"?action.disabled():!!action.disabled}

function refreshEventModalLanguage(){
  if(!activeEventModal)return;
  const {title,text,details,buttons,withInventory,feedback}=activeEventModal;
  $("#event-title").textContent=languageText(title);$("#event-text").textContent=languageText(text);
  const base=languageText(details);
  $("#event-details").textContent=withInventory?(currentLanguage==="en"?`${base} You have ${money(game.money)}, ${itemQuantity("vivres",game.cart.vivres)}, and ${itemQuantity("munitions",game.cart.munitions)} left.`:`${base} Il vous reste ${money(game.money)}, ${itemQuantity("vivres",game.cart.vivres)} et ${itemQuantity("munitions",game.cart.munitions)}.`):base;
  const feedbackElement=$("#event-feedback"),feedbackText=typeof feedback==="function"?feedback():feedback;
  feedbackElement.hidden=!feedbackText;feedbackElement.textContent=feedbackText?languageText(feedbackText):"";
  buttons.forEach(({action,button})=>{button.textContent=languageText(action.label);button.disabled=actionDisabled(action)});
}

function rest(){
  if(checkJourneyFailure())return;
  const required=foodNeededForDays(2);
  if(game.cart.vivres<required){
    if(!offerOxForFood(()=>rest(),required,()=>{updateUI();returnToTrailTop()}))toast("Pas assez de vivres pour camper deux jours.");
    return;
  }
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
  const abundance=profile.abundance>=.85?(language==="en"?"plentiful":"abondant"):profile.abundance>=.6?(language==="en"?"scattered":"peu abondant"):(language==="en"?"scarce":"rare");
  return language==="en"?`${abundance} game: ${joinList(names,"en")}`:`gibier ${abundance} : ${joinList(names,"fr")}`;
}

function currentWildlifeDescription(language=currentLanguage){
  const setup=huntWildlife(routeSegmentAt(),game.weather),species=[...new Set(setup.pool)].map(name=>HUNT_SPECIES_NAMES[name][language]);
  const abundance=setup.count>=4?(language==="en"?"plentiful":"abondant"):setup.count>=2?(language==="en"?"scattered":"peu abondant"):(language==="en"?"scarce":"rare");
  const weather=languageText(game.weather.name,language).toLowerCase();
  return language==="en"?`${abundance} game in the current ${weather} weather: ${joinList(species,"en")}.`:`Gibier ${abundance} par le temps ${weather} actuel : ${joinList(species,"fr")}.`;
}

function renderTrailOutlook(distance=150){
  const start=Math.min(game.km,KM_TOTAL),end=Math.min(KM_TOTAL,start+distance),span=Math.max(0,Math.round(end-start));
  const currentGame=`<div class="current-wildlife"><h4>${currentLanguage==="en"?"Game here today":"Gibier ici aujourd’hui"}</h4><p>${escapeHtml(currentWildlifeDescription())}</p></div>`;
  if(!span)return `${currentGame}<div class="trail-outlook"><h4>${currentLanguage==="en"?"Ahead of the wagon":"Devant le convoi"}</h4><p>${currentLanguage==="en"?"The trail ends here.":"La piste s’achève ici."}</p></div>`;
  const entries=ROUTE_SEGMENTS.filter(route=>route.end>start&&route.start<end).map(route=>{
    const covered=Math.max(1,Math.round(Math.min(route.end,end)-Math.max(route.start,start))),terrain=route.terrain[currentLanguage]??route.terrain.fr,slope=route.slope[currentLanguage]??route.slope.fr,road=route.road[currentLanguage]??route.road.fr;
    const text=currentLanguage==="en"?`${slope}; ${road}; ${routeSpeedDescription(route,"en")}; ${wildlifeDescription(route,"en")}.`:`${slope} ; ${road} ; ${routeSpeedDescription(route,"fr")} ; ${wildlifeDescription(route,"fr")}.`;
    return `<li><strong>${covered} km · ${escapeHtml(terrain)}</strong><span>${escapeHtml(text)}</span></li>`;
  }).join("");
  return `${currentGame}<div class="trail-outlook"><h4>${currentLanguage==="en"?`The next ${span} km`:`Les ${span} prochains kilomètres`}</h4><ul>${entries}</ul></div>`;
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
  $("#info-content").innerHTML=`<table class="inventory-table"><tbody>${Object.entries(SHOP).map(([k,v])=>`<tr><td>${languageText(v.label)}</td><td>${journalNumber(game.cart[k],currentLanguage)} ${unitLabel(v,game.cart[k])}</td></tr>`).join("")}<tr><td>${languageText("Argent restant")}</td><td>${money(game.money)}</td></tr></tbody></table><p>${languageText("Le chariot transporte aussi vos outils, de la vaisselle et les souvenirs du voyage.")}</p>`;
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

function professionNarrativeLabel(profession=game.profession,language=currentLanguage){
  const labels={fermier:{fr:"fermier",en:"farmer"},charpentier:{fr:"charpentier",en:"carpenter"},banquier:{fr:"banquier",en:"banker"}};
  return labels[profession]?.[language]??labels.fermier[language];
}

function finishNarrative(win,message=""){
  if(!win)return message||bilingual("La faim, la maladie et la route ont eu raison de votre expédition.","Hunger, disease, and the road defeated your expedition.");
  const survivors=alive().map(traveler=>traveler.name),lost=game.party.filter(traveler=>!traveler.alive).map(traveler=>traveler.name);
  const namesFr=joinList(survivors,"fr"),namesEn=joinList(survivors,"en");
  const professionFr=professionNarrativeLabel(game.profession,"fr"),professionEn=professionNarrativeLabel(game.profession,"en");
  const arrival=bilingual(`${namesFr} ${survivors.length===1?"contemple":"contemplent"} enfin la vallée. Après ${game.days} jours sur la piste, vous n’êtes plus le ${professionFr} que vous étiez dans l’Est. Votre nouvelle vie commence.`,`${namesEn} finally ${survivors.length===1?"looks":"look"} upon the valley. After ${game.days} days on the trail, you are no longer the ${professionEn} you once were back East. Your new life begins.`);
  if(!lost.length)return arrival;
  const lostFr=joinList(lost,"fr"),lostEn=joinList(lost,"en");
  return bilingual(`${arrival.fr} Les survivants ont une dernière pensée pour ${lostFr}, ${lost.length===1?"disparu":"disparus"} sur la piste.`,`${arrival.en} The survivors spare a final thought for ${lostEn}, ${lost.length===1?"lost":"all lost"} on the trail.`);
}

function arrivalPartyCondition(language="fr"){
  return joinList(alive().map(traveler=>{
    const healthFr=healthLabel(traveler.health)[0],health=language==="en"?({"Bonne santé":"good health","Fatigué":"tired","Très faible":"very weak","Décédé":"dead"}[healthFr]??healthFr):healthFr.toLocaleLowerCase("fr-FR");
    if(traveler.state==="En forme")return `${traveler.name} (${health})`;
    const condition=language==="en"?({Blessé:"injured",Convalescent:"recovering",Fièvre:"fever",Dysenterie:"dysentery",Engelures:"frostbite",Piqûres:"infected bites",Malade:"sick"}[traveler.state]??traveler.state.toLowerCase()):traveler.state.toLocaleLowerCase("fr-FR");
    return language==="en"?`${traveler.name} (${condition}; overall condition: ${health})`:`${traveler.name} (${condition} ; état général : ${health})`;
  }),language);
}

function finalJourneyJournal(win){
  const survivors=alive().map(traveler=>traveler.name);
  if(win){
    const cashFr=`${journalNumber(game.money,"fr")} $ ${game.money===1?"reste":"restent"} en caisse`,cashEn=`$${journalNumber(game.money,"en")} remains in cash`;
    return addJournalStandalone(bilingual(`${arrivalPartyCondition("fr")} ${survivors.length===1?"atteint":"atteignent"} la vallée de Willamette : le convoi est arrivé en Oregon. Le chariot conserve ${cargoJournalSummary("fr")} ; ${cashFr}.`,`${arrivalPartyCondition("en")} ${survivors.length===1?"reaches":"reach"} the Willamette Valley: the wagon party has arrived in Oregon. The wagon still carries ${cargoJournalSummary("en")}; ${cashEn}.`),journalArtSnapshot(endingArtAsset(true)));
  }
  const route=routeSegmentAt(),km=Math.round(game.km);
  if(survivors.length){
    return addJournalStandalone(bilingual(`Le voyage de ${joinList(survivors,"fr")} s’achève au kilomètre ${km}, dans la région « ${route.terrain.fr} ».`,`The journey of ${joinList(survivors,"en")} ends at kilometer ${km}, in the ${route.terrain.en}.`),journalArtSnapshot(endingArtAsset(false)));
  }
  return addJournalStandalone(bilingual(`Le convoi a disparu au kilomètre ${km}, dans la région « ${route.terrain.fr} ».`,`The wagon party vanished at kilometer ${km}, in the ${route.terrain.en}.`),journalArtSnapshot(endingArtAsset(false,0)));
}

function finishScoreText(win,score){
  const distance=win?"":` · ${currentLanguage==="en"?"Distance":"Distance"} · ${Math.round(game.km).toLocaleString(currentLocale())} km`;
  return `Score · ${score.toLocaleString(currentLocale())}${distance}`;
}

function finish(win,message=""){
  if(game.finished)return;
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
  game.score=score;game.finishState={win,message,deaths,deathPenalty,baseDeathPenalty,professionMultiplier};finalJourneyJournal(win);renderFinish();
}

function endingArtAsset(win,survivors=alive().length){return win?"victory.webp":survivors===0?"incident-death-last.webp":"trail.webp"}

function renderFinish(){
  const {win,message}=game.finishState,score=game.score;
  const totalLoss=!win&&alive().length===0;
  $("#ecran-fin").classList.toggle("defeat",!win);$("#ecran-fin").classList.toggle("total-loss",totalLoss);
  $("#fin-art").style.backgroundImage=`url('assets/${endingArtAsset(win)}')`;
  $("#fin-art").setAttribute("aria-label",currentLanguage==="en"?(win?"The wagon party reaches Oregon":totalLoss?"The last traveler lies beside the abandoned wagon, with no one left to bury them":"The wagon party can go no farther"):(win?"Le convoi atteint l’Oregon":totalLoss?"Le dernier voyageur gît près du chariot abandonné, sans personne pour l’ensevelir":"Le convoi ne peut plus poursuivre sa route"));
  $("#fin-kicker").textContent=languageText(win?"Vallée de Willamette · Oregon":"La piste s’arrête ici");
  $("#titre-fin").textContent=languageText(win?"Vous avez atteint l’Oregon":"Le convoi n’ira pas plus loin");
  $("#texte-fin").textContent=languageText(finishNarrative(win,message));
  $("#rang-fin").textContent=endingRank(score);
  $("#commentaire-rang-fin").textContent=endingComment(score);
  $("#score-fin").textContent=finishScoreText(win,score);
  $("#journal-fin").innerHTML=journalItems(game.journal)||`<li>${languageText("Aucune entrée dans le journal.")}</li>`;
  showScreen("ecran-fin");
}

function journalDateForLanguage(entry,language=currentLanguage){
  return language==="en"?`${MONTHS_EN[entry.month]} ${entry.day}, ${entry.year}`:`${entry.day} ${MONTHS[entry.month]} ${entry.year}`;
}

function journalAlbumGroups(entries=game?.journal??[]){
  const groups=[],byImage=new Map();
  for(const entry of [...entries].reverse()){
    const raw=entry.art?.file?entry.art:journalArtSnapshot("trail.webp"),art={file:raw.file,size:raw.size||"cover",position:raw.position||"center"},key=`${art.file}|${art.size}|${art.position}`;
    if(!byImage.has(key)){
      const group={art:{...art},entries:[]};byImage.set(key,group);groups.push(group);
    }
    byImage.get(key).entries.push(entry);
  }
  return groups;
}

function memoirGroupsHtml(groups=journalAlbumGroups(),language=currentLanguage,assetRoot="assets/"){
  return groups.map((group,index)=>{
    const first=group.entries[0],last=group.entries.at(-1),firstDate=journalDateForLanguage(first,language),lastDate=journalDateForLanguage(last,language);
    const period=firstDate===lastDate?firstDate:(language==="en"?`${firstDate} to ${lastDate}`:`${firstDate} au ${lastDate}`);
    const imageUrl=`${assetRoot}${group.art.file}`;
    const entries=group.entries.map(entry=>`<li><time>${escapeHtml(journalDateForLanguage(entry,language))}</time><p>${escapeHtml(languageText(entry.text,language))}</p></li>`).join("");
    const label=language==="en"?`Journey scene ${index+1}`:`Scène du voyage ${index+1}`;
    return `<article class="memoir-card"><div class="memoir-art" role="img" aria-label="${label}" style="background-image:url('${imageUrl}');background-size:${group.art.size};background-position:${group.art.position}"></div><div class="memoir-copy"><p class="memoir-period">${escapeHtml(period)}</p><ol>${entries}</ol></div></article>`;
  }).join("");
}

function renderJourneyMemoir(){
  const groups=journalAlbumGroups();
  $("#recit-contenu").innerHTML=groups.length?memoirGroupsHtml(groups):`<p>${languageText("Aucune entrée dans le journal.")}</p>`;
  $("#partage-recit-statut").textContent=currentLanguage==="en"?`${groups.length} unique scene${groups.length===1?"":"s"} for the complete journey.`:`${groups.length} illustration${groups.length>1?"s":""} unique${groups.length>1?"s":""} pour l’ensemble du voyage.`;
  showScreen("ecran-recit");
}

function journeyMemoirDocument(){
  const language=currentLanguage,groups=journalAlbumGroups(),title=language==="en"?"My Oregon Vibe journey":"Mon périple dans Oregon Vibe";
  const assetRoot=new URL("assets/",document.baseURI).href,gameUrl=new URL("./",document.baseURI).href;
  const outcome=game.finishState?.win?(language==="en"?"The wagon party reached Oregon.":"Le convoi a atteint l’Oregon."):(language==="en"?"The journey ended on the trail.":"Le voyage s’est achevé sur la piste.");
  return `<!doctype html><html lang="${language}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>:root{color-scheme:light;--ink:#29271f;--paper:#eee4cf;--rust:#8f3f2c;--gold:#c9953e}*{box-sizing:border-box}body{margin:0;background:#24241d;color:var(--ink);font:16px/1.55 Georgia,serif}header{padding:clamp(2rem,7vw,5rem) max(1rem,calc((100% - 1050px)/2));background:linear-gradient(135deg,#34382e,#171712);color:#fff}h1{margin:.2rem 0;font-size:clamp(2.2rem,7vw,4.8rem);line-height:1}.lead{max-width:650px;color:#eee4cf}.timeline{width:min(1050px,calc(100% - 2rem));margin:2rem auto;display:grid;gap:2rem}.card{display:grid;grid-template-columns:minmax(260px,1.05fr) minmax(0,1fr);overflow:hidden;background:var(--paper);box-shadow:0 15px 40px #0005}.art{min-height:310px;background:#6b7059 center/cover no-repeat}.copy{padding:1.5rem}.period{margin:0 0 1rem;color:var(--rust);font-weight:700;text-transform:uppercase;letter-spacing:.08em;font-size:.78rem}ol{list-style:none;margin:0;padding:0}li{padding:.8rem 0;border-top:1px solid #cbbd9f}time{display:block;color:var(--rust);font:bold .72rem Arial,sans-serif;text-transform:uppercase}li p{margin:.25rem 0 0}footer{padding:2.5rem 1rem;text-align:center;color:#eee4cf}a{display:inline-block;padding:.85rem 1.2rem;background:var(--gold);color:#171712;text-decoration:none;font:bold .85rem Arial,sans-serif;text-transform:uppercase;letter-spacing:.06em}@media(max-width:720px){.card{grid-template-columns:1fr}.art{min-height:0;aspect-ratio:16/9}.copy{padding:1rem}}</style></head><body><header><p>OREGON VIBE · 1848</p><h1>${escapeHtml(title)}</h1><p class="lead">${escapeHtml(outcome)} ${language==="en"?`${game.days} days on the trail · Score ${game.score}.`:`${game.days} jours sur la piste · Score ${game.score}.`}</p></header><main class="timeline">${memoirGroupsHtml(groups,language,assetRoot).replaceAll("memoir-card","card").replaceAll("memoir-art","art").replaceAll("memoir-copy","copy").replaceAll("memoir-period","period")}</main><footer><p>${language==="en"?"Think you can lead a wagon party farther?":"À votre tour de mener un convoi plus loin."}</p><a href="${gameUrl}">${language==="en"?"Start a new game":"Commencer une nouvelle partie"}</a></footer></body></html>`;
}

function memoirFile(){
  const leader=(game.party[0]?.name??"voyage").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"").toLowerCase()||"voyage";
  return new File([journeyMemoirDocument()],`oregon-vibe-${leader}.html`,{type:"text/html"});
}

function downloadMemoir(file){
  const link=document.createElement("a"),url=URL.createObjectURL(file);link.href=url;link.download=file.name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

async function shareJourneyMemoir(){
  const status=$("#partage-recit-statut"),title=currentLanguage==="en"?"My Oregon Vibe journey":"Mon périple dans Oregon Vibe";
  try{
    const file=memoirFile();let canShareFile=false;
    if(navigator.share&&typeof navigator.canShare==="function"){try{canShareFile=navigator.canShare({files:[file]})}catch{canShareFile=false}}
    if(canShareFile){
      await navigator.share({title,text:currentLanguage==="en"?"Here is my complete Oregon Vibe trail journal.":"Voici le journal complet de mon périple dans Oregon Vibe.",files:[file]});
      status.textContent=currentLanguage==="en"?"The complete illustrated story has been shared.":"Le récit illustré complet a été partagé.";return;
    }
    downloadMemoir(file);status.textContent=currentLanguage==="en"?"Your browser cannot share a file directly. The complete story has been downloaded and is ready to send.":"Ce navigateur ne peut pas partager directement un fichier. Le récit complet a été téléchargé et peut maintenant être envoyé.";
  }catch(error){if(error?.name!=="AbortError")status.textContent=currentLanguage==="en"?"Sharing failed. Please try again.":"Le partage a échoué. Vous pouvez réessayer.";}
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
  bison:{size:25,speed:[82,116],loot:[20,28],y:[205,330],hit:.86,kill:.2},
  deer:{size:18,speed:[115,158],loot:[11,17],y:[180,320],hit:.77,kill:.4},
  rabbit:{size:10,speed:[158,220],loot:[3,6],y:[315,370],hit:.68,kill:1},
  bird:{size:9,speed:[180,245],loot:[2,4],y:[65,175],hit:.66,kill:1}
};

function huntTerrainProfile(route=routeSegmentAt()){return HUNT_TERRAIN[route.key]??HUNT_TERRAIN["great-plains"]}

function huntSiteKey(km=game.km){return `${routeSegmentAt(km).key}:${Math.floor(km/50)}`}

function huntPressureAt(siteKey=huntSiteKey()){
  return game.huntPressure?.[siteKey]??{hunts:0,kills:{}};
}

function recordHuntPressure(siteKey,kills={}){
  game.huntPressure??={};
  const pressure=game.huntPressure[siteKey]??={hunts:0,kills:{}};pressure.hunts++;
  for(const [species,count] of Object.entries(kills))pressure.kills[species]=(pressure.kills[species]??0)+count;
  return pressure;
}

function huntWildlife(route=routeSegmentAt(),weather=game.weather,siteKey=huntSiteKey()){
  const terrain=huntTerrainProfile(route),climate=HUNT_WEATHER[weather.name]??HUNT_WEATHER.Doux,pool=[];
  const pressure=huntPressureAt(siteKey),totalKills=Object.values(pressure.kills).reduce((sum,count)=>sum+count,0);
  for(const species of Object.keys(HUNT_SPECIES)){
    const baseTickets=Math.round((terrain.weights[species]??0)*(climate.weights[species]??0)*4);
    const tickets=Math.max(0,baseTickets-(pressure.kills[species]??0)*5);
    for(let i=0;i<tickets;i++)pool.push(species);
  }
  if(!pool.length)pool.push(Object.keys(terrain.weights).filter(species=>terrain.weights[species]>0).sort((left,right)=>(pressure.kills[left]??0)-(pressure.kills[right]??0))[0]??"bird");
  const guaranteedSmallGame=pressure.hunts>0?["rabbit","bird"].filter(species=>(terrain.weights[species]??0)>0):[];
  for(const species of guaranteedSmallGame)if(!pool.includes(species))pool.push(species);
  const baseCount=Math.round(5*terrain.abundance*climate.abundance),depletion=Math.ceil(totalKills*.35+pressure.hunts*.5);
  return {count:clamp(Math.max(guaranteedSmallGame.length,baseCount-depletion),0,5),pool,siteKey,pressure,guaranteedSmallGame};
}

function huntBackground(){
  const key=weatherVisual().key;
  return {cold:"hunt-cold.webp",hot:"hunt-hot.webp",rain:"hunt-rain.webp",mild:"hunt.webp"}[key];
}

function huntLootLimit(){return 90}

function startHunt(){
  if(game.cart.munitions<=0){toast("Vous n’avez plus de munitions.");return;}
  if(game.cart.vivres>=SHOP.vivres.max){toast("Le chariot ne peut pas charger davantage de vivres.");return;}
  const siteKey=huntSiteKey(),wildlife=huntWildlife(routeSegmentAt(),game.weather,siteKey);
  hunt={time:14,loot:0,limit:huntLootLimit(),shots:0,kills:{},siteKey,background:huntBackground(),cross:{x:380,y:210},animals:[],species:wildlife.pool,last:performance.now(),running:true};
  for(let i=0;i<wildlife.count;i++)spawnAnimal(i*145,wildlife.guaranteedSmallGame[i]);
  const canvas=$("#canvas-chasse");canvas.style.backgroundImage=`url('assets/${hunt.background}')`;
  $("#dialogue-chasse .eyebrow").textContent=languageText(regionVisual().title);
  $("#chasse-balles").textContent=game.cart.munitions;$("#chasse-butin").textContent=0;$("#chasse-temps").textContent=14;
  $("#dialogue-chasse").showModal();canvas.focus();requestAnimationFrame(huntLoop);
}

function completeHuntDay(){
  const food=consumeDelay(1,dailyFoodPerPerson(),false);
  refreshWeather();
  const deceased=updateDeaths();
  return {food,deceased};
}

function resolveHuntDay(loot){
  const loaded=loadFood(loot),requiredFood=alive().length*dailyFoodPerPerson();
  if(game.cart.vivres<requiredFood&&game.cart.boeufs>1){game.pendingHuntDay={requiredFood};return {loaded,food:null,deceased:null,pending:true}}
  return {loaded,...completeHuntDay(),pending:false};
}

function spawnAnimal(offset=0,speciesOverride=null){
  const species=speciesOverride??pick(hunt.species),cfg=HUNT_SPECIES[species],direction=Math.random()<.25?-1:1;
  hunt.animals.push({species,size:cfg.size,vx:rand(...cfg.speed)*direction,y:rand(...cfg.y),x:direction>0?-60-offset:820+offset,phase:Math.random()*6,hits:0});
}

function resetAnimal(a){
  const replacement=[];spawnAnimal(rand(40,180));replacement.push(hunt.animals.pop());Object.assign(a,replacement[0]);
}

function huntShouldEnd(){return hunt.time<=0||game.cart.munitions<=0||hunt.loot>=hunt.limit}

function huntLoop(now){
  if(!hunt?.running)return;const dt=Math.min(.04,(now-hunt.last)/1000);hunt.last=now;hunt.time-=dt;
  const c=$("#canvas-chasse"),ctx=c.getContext("2d");ctx.clearRect(0,0,c.width,c.height);
  hunt.animals.forEach(a=>{a.x+=a.vx*dt;a.phase+=dt*5;if(a.species==="bird")a.y+=Math.sin(a.phase)*.7;if((a.vx>0&&a.x>c.width+60)||(a.vx<0&&a.x<-60))resetAnimal(a);drawAnimal(ctx,a)});
  ctx.strokeStyle="#f7e4b2";ctx.lineWidth=2;ctx.beginPath();ctx.arc(hunt.cross.x,hunt.cross.y,11,0,Math.PI*2);ctx.moveTo(hunt.cross.x-17,hunt.cross.y);ctx.lineTo(hunt.cross.x+17,hunt.cross.y);ctx.moveTo(hunt.cross.x,hunt.cross.y-17);ctx.lineTo(hunt.cross.x,hunt.cross.y+17);ctx.stroke();
  $("#chasse-temps").textContent=Math.max(0,Math.ceil(hunt.time));
  if(huntShouldEnd()){endHunt();return;}requestAnimationFrame(huntLoop);
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

function shotKillsSpecies(species,roll=Math.random()){return roll<(HUNT_SPECIES[species]?.kill??0)}

function accurateShotKillsAnimal(animal,roll=Math.random()){
  animal.hits=(animal.hits??0)+1;
  return animal.hits>=5||shotKillsSpecies(animal.species,roll);
}

function shoot(touchAssist=false){
  if(!hunt?.running||game.cart.munitions<=0)return;hunt.shots++;game.cart.munitions--;
  const hit=hunt.animals.find(a=>Math.hypot(a.x-hunt.cross.x,a.y-hunt.cross.y)<a.size*HUNT_SPECIES[a.species].hit+(touchAssist?14:0));
  if(hit&&accurateShotKillsAnimal(hit)){const species=hit.species,range=HUNT_SPECIES[species].loot,gain=Math.min(hunt.limit-hunt.loot,rand(...range));hunt.loot+=gain;hunt.kills[species]=(hunt.kills[species]??0)+1;resetAnimal(hit)}
  $("#chasse-balles").textContent=game.cart.munitions;$("#chasse-butin").textContent=hunt.loot;
  if(hunt.loot>=hunt.limit)endHunt();
}

function endHunt(){
  if(!hunt?.running)return;
  const result={shots:hunt.shots,remaining:game.cart.munitions,loot:hunt.loot,kills:{...hunt.kills},siteKey:hunt.siteKey,background:hunt.background,weather:weatherVisual()};hunt.running=false;recordHuntPressure(result.siteKey,result.kills);
  const consequences=resolveHuntDay(result.loot);result.loot=consequences.loaded;
  addJournal(result.loot?bilingual(`La chasse rapporte ${result.loot} kg de viande pour ${result.shots} balle${result.shots>1?"s":""} tirée${result.shots>1?"s":""}.`,`The hunt yielded ${result.loot} kg of meat for ${result.shots} bullet${result.shots===1?"":"s"} fired.`):bilingual("La chasse ne rapporte rien cette fois.","The hunt yielded nothing this time."),journalArtSnapshot(result.background,result.weather));
  $("#dialogue-chasse").close();updateUI();hunt=null;
  const resultArt=$("#dialogue-bilan-chasse .hunt-result-art");resultArt.style.backgroundImage=`url('assets/${result.background}')`;
  resultArt.setAttribute("aria-label",currentLanguage==="en"?`The hunting ground in ${languageText(result.weather.label,"en")}`:`Le terrain de chasse par ${languageText(result.weather.label,"fr")}`);
  $("#bilan-balles-tirees").textContent=result.shots;$("#bilan-balles-restantes").textContent=result.remaining;$("#bilan-viande").textContent=result.loot;
  $("#dialogue-bilan-chasse").showModal();
}

function continueAfterHuntReport(){
  if(game.pendingHuntDay){
    const {requiredFood}=game.pendingHuntDay;
    const finishDay=()=>{game.pendingHuntDay=null;completeHuntDay();if(showPendingDeathEvent()){updateUI();return;}if(checkJourneyFailure())return;returnToTrailTop()};
    if(offerOxForFood(finishDay,requiredFood,()=>{game.pendingHuntDay=null;resolveStarvation(false)}))return;
    finishDay();return;
  }
  if(showPendingDeathEvent()){updateUI();return;}
  if(checkJourneyFailure())return;
  if(game.cart.vivres<=0&&offerOxForFood())return;
  returnToTrailTop();
}

// Mini-jeu défensif : la riposte choisie détermine le temps à tenir.
function attackDifficultyAt(km=game.km,duration=25){
  const progress=clamp(km/KM_TOTAL,0,1);
  return {progress,duration,speed:1+progress*.25,spawnBase:.48-progress*.07,minSpawn:.16,spawnDecay:.012};
}

function attackOutcomeRisk(hits,progress=clamp(game.km/KM_TOTAL,0,1)){
  return {
    affected:Math.ceil(hits/1.5),
    lethalChance:clamp(Math.max(0,hits-2)*.075+progress*.04,0,.58),
    damageBonus:Math.floor(hits/2)+Math.round(progress*4)
  };
}

function startAttack(journalEntry=null,returnCallback=null,response={id:"none",ammo:0,duration:25}){
  if(game.finished||!alive().length)return;
  const difficulty=attackDifficultyAt(game.km,response.duration);
  attack={time:difficulty.duration,duration:difficulty.duration,hits:0,x:330,projectiles:[],spawnIn:.3,last:performance.now(),running:true,journalEntry,returnCallback,response,...difficulty};
  $("#attaque-temps").textContent=difficulty.duration;$("#attaque-impacts").textContent=0;
  $("#dialogue-attaque").showModal();$("#canvas-attaque").focus();requestAnimationFrame(attackLoop);
}

function moveAttack(direction){if(attack?.running)attack.x=clamp(attack.x+direction*42,20,640);}

function applyAttackWound(traveler,damage){
  traveler.health=clamp(traveler.health-damage,1,100);
  traveler.needsRemedy=true;traveler.woundDays=Math.max(traveler.woundDays??0,16);
  if(traveler.sickDays<=0)traveler.state="Blessé";
}

function treatAttackWound(traveler){
  traveler.health=clamp(traveler.health+24,1,100);
  traveler.needsRemedy=false;traveler.woundDays=Math.min(traveler.woundDays??9,9);
  if(traveler.sickDays<=0)traveler.state="Convalescent";
}

function attackLoop(now){
  if(!attack?.running)return;const dt=Math.min(.04,(now-attack.last)/1000);attack.last=now;attack.time-=dt;attack.spawnIn-=dt;
  const c=$("#canvas-attaque"),ctx=c.getContext("2d");ctx.clearRect(0,0,c.width,c.height);
  if(attack.spawnIn<=0){const elapsed=attack.duration-attack.time;attack.projectiles.push({x:rand(20,740),y:-20,vx:rand(-35,35)*attack.speed,vy:rand(180,260)*attack.speed});attack.spawnIn=Math.max(attack.minSpawn,attack.spawnBase-elapsed*attack.spawnDecay);}
  ctx.strokeStyle="#ead8ad";ctx.lineWidth=3;
  attack.projectiles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*.06,p.y-18);ctx.stroke();if(!p.hit&&p.y>345&&p.y<410&&p.x>attack.x&&p.x<attack.x+100){p.hit=true;attack.hits++;$("#attaque-impacts").textContent=attack.hits;}});
  attack.projectiles=attack.projectiles.filter(p=>p.y<440&&!p.hit);
  ctx.fillStyle="#3b2a1d";ctx.fillRect(attack.x,360,100,35);ctx.fillStyle="#e6d7b3";ctx.beginPath();ctx.arc(attack.x+50,360,42,Math.PI,0);ctx.fill();ctx.strokeStyle="#3b2a1d";ctx.beginPath();ctx.arc(attack.x+20,398,15,0,Math.PI*2);ctx.arc(attack.x+80,398,15,0,Math.PI*2);ctx.stroke();
  $("#attaque-temps").textContent=Math.max(0,Math.ceil(attack.time));
  if(attack.time<=0){endAttack();return;}requestAnimationFrame(attackLoop);
}

function endAttack(){
  if(!attack?.running)return;const {hits,journalEntry,returnCallback,progress}=attack;attack.running=false;$("#dialogue-attaque").close();attack=null;
  const candidates=shuffled(alive()),risk=attackOutcomeRisk(hits,progress),affected=Math.min(candidates.length,risk.affected),wounded=[],dead=[];
  for(const p of candidates.slice(0,affected)){
    if(dead.length===0&&Math.random()<risk.lethalChance){p.health=0;p.deathCause=bilingual("pendant l’attaque","during the attack");p.alive=false;p.state="Décédé";game.pendingDeath=p;dead.push(p);}
    else{applyAttackWound(p,rand(22,38)+risk.damageBonus);wounded.push(p);}
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
  const shopList=$("#liste-boutique");let shopRepeatDelay=null,shopRepeatInterval=null;
  const stopShopRepeat=()=>{clearTimeout(shopRepeatDelay);clearInterval(shopRepeatInterval);shopRepeatDelay=null;shopRepeatInterval=null};
  shopList.addEventListener("pointerdown",e=>{
    const button=e.target.closest("[data-shop]");if(!button||button.disabled||!e.isPrimary||e.button!==0)return;
    e.preventDefault();stopShopRepeat();const key=button.dataset.shop,dir=Number(button.dataset.dir);if(!changeCart(key,dir))return;
    shopRepeatDelay=setTimeout(()=>{shopRepeatInterval=setInterval(()=>{if(!changeCart(key,dir))stopShopRepeat()},75)},350);
  });
  shopList.addEventListener("click",e=>{const button=e.target.closest("[data-shop]");if(button&&e.detail===0)changeCart(button.dataset.shop,Number(button.dataset.dir))});
  document.addEventListener("pointerup",stopShopRepeat);document.addEventListener("pointercancel",stopShopRepeat);window.addEventListener("blur",stopShopRepeat);
  $("#retour-groupe").addEventListener("click",()=>showScreen("ecran-groupe"));$("#partir").addEventListener("click",leaveTown);
  $("#rythme").addEventListener("change",e=>game.pace=e.target.value);$("#rations").addEventListener("change",e=>game.rations=e.target.value);
  $("#avancer").addEventListener("click",()=>travel());$("#repos").addEventListener("click",rest);$("#chasser").addEventListener("click",startHunt);$("#carte-btn").addEventListener("click",showMap);$("#inventaire-btn").addEventListener("click",showInventory);$("#journal-plus").addEventListener("click",showJournal);$("#aide").addEventListener("click",showHelp);
  const restart=()=>{game=null;showScreen("ecran-groupe")};
  $("#rejouer").addEventListener("click",restart);$("#revivre-voyage").addEventListener("click",renderJourneyMemoir);$("#retour-fin").addEventListener("click",renderFinish);$("#partager-recit").addEventListener("click",shareJourneyMemoir);$("#rejouer-recit").addEventListener("click",restart);$("#fermer-chasse").addEventListener("click",endHunt);
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
  const memoirWasOpen=$("#ecran-recit").classList.contains("active");
  if($("#ecran-boutique").classList.contains("active"))renderShop();
  if(game.finishState)renderFinish();else updateUI();
  if(memoirWasOpen)renderJourneyMemoir();
  if(activeEventModal&&$("#dialogue-evenement").open)refreshEventModalLanguage();
  if(activeRiverOutcome&&$("#dialogue-bilan-riviere").open)renderRiverOutcome();
  if(attackOutcome&&$("#dialogue-bilan-attaque").open)showAttackOutcome();
  if(activeInfoView&&$("#dialogue-info").open)renderInfoView();
  if(hunt?.running)$("#dialogue-chasse .eyebrow").textContent=languageText(regionVisual().title);
};

bindEvents();
