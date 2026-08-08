import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import vm from "node:vm";

const source=(await readFile(new URL("../game.js",import.meta.url),"utf8")).replace(/\nbindEvents\(\);\s*$/,"\n");

function scenario(code){
  const isolatedMath=Object.create(Math);isolatedMath.random=Math.random;
  const context=vm.createContext({
    console,Math:isolatedMath,setTimeout:fn=>fn(),clearTimeout(){},requestAnimationFrame(){},performance:{now:()=>0},window:{},
    document:{querySelector(){return null},querySelectorAll(){return []},createElement(){return {textContent:"",innerHTML:""}}},
    currentLanguage:"fr",currentLocale:()=>"fr-FR",
    languageText:(value,language="fr")=>value&&typeof value==="object"&&"fr" in value?(value[language]??value.fr):String(value??""),
    bilingual:(fr,en)=>({fr,en}),bilingualJoin:(left,separator,right)=>({fr:`${left?.fr??left}${separator}${right?.fr??right}`,en:`${left?.en??left}${separator}${right?.en??right}`})
  });
  vm.runInContext(source,context,{filename:"game.js"});
  return vm.runInContext(code,context,{filename:"logic-test.js"});
}

const tests=[];
function test(name,run){tests.push({name,run})}

test("initial state includes event cooldown",()=>{
  assert.equal(scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.lastEvent`),null);
});

test("calendar handles the 1848 leap day",()=>{
  assert.equal(scenario(`game=baseGame(["A","B","C","D","E"],"fermier",1);game.day=28;advanceDate(1);game.day+":"+game.month`),"29:1");
  assert.equal(scenario(`game=baseGame(["A","B","C","D","E"],"fermier",1);game.day=29;advanceDate(1);game.day+":"+game.month`),"1:2");
});

test("food consumption counts living travelers only",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.party[4].alive=false;game.cart.vivres=100;const food=consumeFood(2,1.5);({needed:food.needed,left:game.cart.vivres})`);
  assert.equal(result.needed,12);assert.equal(result.left,88);
});

test("resource quantities distinguish food, blankets, and spare parts",()=>{
  const result=scenario(`({food:itemQuantityFor("vivres",25,"fr"),blanket:itemQuantityFor("vetements",1,"fr"),part:itemQuantityFor("pieces",1,"fr")})`);
  assert.equal(result.food,"25 kg de vivres");assert.equal(result.blanket,"1 couverture");assert.equal(result.part,"1 pièce");
});

test("loss lists use a single final conjunction",()=>{
  assert.equal(scenario(`joinList(["vivres","balles","un bœuf"],"fr")`),"vivres, balles et un bœuf");
});

test("shortages during delays consume days and weaken the party",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.vivres=0;consumeDelay(2,2,false);({days:game.days,health:game.party[0].health,journal:game.journal.length})`);
  assert.equal(result.days,2);assert.equal(result.health,84);assert.equal(result.journal,1);
});

test("partial shortages scale their penalty",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.vivres=10;consumeDelay(2,2,false);({health:game.party[0].health,food:game.cart.vivres})`);
  assert.equal(result.health,92);assert.equal(result.food,0);
});

test("weather is refreshed after elapsed non-travel days",()=>{
  assert.equal(scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);weatherForSeason=()=>WEATHER[1];consumeDelay(2,2);game.weather.name`),"Chaud");
});

test("multi-day stops evolve weather once per elapsed day",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);let rolls=0;weatherForSeason=()=>{rolls++;return WEATHER[rolls%2?2:0]};consumeDelay(3,2);({rolls,days:game.days,history:game.weatherHistory})`);
  assert.equal(result.rolls,3);assert.equal(result.days,3);assert.equal(result.history.length,3);
});

test("travel journal associates distance with each encountered weather",()=>{
  const text=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);addTravelJournal(25,2,[{name:"Neige",distance:12,days:1},{name:"Doux",distance:13,days:1}]);game.journal[0].text.fr`);
  assert.equal(text,"25 km parcourus en 2 jours : 12 km par temps de neige et 13 km par temps modéré. Terrain : Prairies du Kansas ; terrain ondulé ; piste bien marquée ; climat continental humide.");
});

test("weather directly changes travel distance",()=>{
  const factors=scenario(`Object.fromEntries(WEATHER.map(weather=>[weather.name,travelWeatherFactor(weather)]))`);
  assert.equal(factors.Doux,1);assert.ok(factors.Chaud<factors.Doux);assert.ok(factors.Pluvieux<factors.Doux);assert.ok(factors.Neige<factors.Pluvieux);
});

test("route geography covers the entire trail without gaps",()=>{
  const result=scenario(`({covered:Array.from({length:KM_TOTAL},(_,km)=>routeSegmentAt(km)).every(Boolean),starts:ROUTE_SEGMENTS.map(segment=>segment.start),ends:ROUTE_SEGMENTS.map(segment=>segment.end)})`);
  assert.equal(result.covered,true);assert.equal(result.starts[0],0);assert.equal(result.ends.at(-1),3200);
  for(let i=1;i<result.starts.length;i++)assert.equal(result.starts[i],result.ends[i-1]);
});

test("terrain and trail quality change travel speed",()=>{
  const result=scenario(`({plains:routeTravelFactor(routeSegmentAt(500)),pass:routeTravelFactor(routeSegmentAt(1600)),desert:routeTravelFactor(routeSegmentAt(2000)),mountains:routeTravelFactor(routeSegmentAt(2700))})`);
  assert.ok(result.pass<result.plains);assert.ok(result.mountains<result.desert);assert.ok(result.plains<=1);
});

test("daily distance combines oxen, weather, and route difficulty",()=>{
  const result=scenario(`({plain:plannedDailyDistance(PACES.soutenu,WEATHER[0],routeSegmentAt(500),6),snow:plannedDailyDistance(PACES.soutenu,WEATHER[4],routeSegmentAt(500),6),mountains:plannedDailyDistance(PACES.soutenu,WEATHER[0],routeSegmentAt(2700),6),fewOxen:plannedDailyDistance(PACES.soutenu,WEATHER[0],routeSegmentAt(500),3)})`);
  assert.ok(result.plain>result.snow);assert.ok(result.plain>result.mountains);assert.ok(result.plain>result.fewOxen);
});

test("weather depends on the date and recent weather history",()=>{
  const result=scenario(`const route=routeSegmentAt(500),expected=18;({winter:seasonalTemperature(0,15),summer:seasonalTemperature(6,15),fresh:weatherWeights(route,expected,[]).Doux,persistent:weatherWeights(route,expected,["Doux","Doux","Doux"]).Doux})`);
  assert.ok(result.winter<result.summer);assert.ok(result.persistent>result.fresh*5);
});

test("weather cannot jump directly between snow and heat",()=>{
  assert.equal(scenario(`weatherTransitionAllowed("Neige","Chaud")`),false);
  assert.equal(scenario(`weatherTransitionAllowed("Chaud","Neige")`),false);
  assert.equal(scenario(`weatherTransitionAllowed("Neige","Froid")`),true);
});

test("desert segments never generate snow",()=>{
  const result=scenario(`let names=[];for(const km of [1900,2400])for(let month=0;month<12;month++)for(let i=0;i<30;i++)names.push(weatherForPosition(month,15,1848,km,["Neige"]).name);({snow:names.includes("Neige"),desert:routeSegmentAt(1900).allowSnow,snake:routeSegmentAt(2400).allowSnow})`);
  assert.equal(result.snow,false);assert.equal(result.desert,false);assert.equal(result.snake,false);
});

test("generated daily weather always respects transition constraints",()=>{
  const result=scenario(`let history=["Neige"],valid=true;for(let i=0;i<500;i++){const km=[500,1600,1900,2700,3000][i%5],next=weatherForPosition(i%12,15,1848,km,history);if(!weatherTransitionAllowed(history.at(-1),next.name))valid=false;history=[...history,next.name].slice(-3)}valid`);
  assert.equal(result,true);
});

test("local geography changes temperature and rainfall tendencies",()=>{
  const result=scenario(`const summer=seasonalTemperature(6,15);const pass=routeSegmentAt(1600),desert=routeSegmentAt(2000),columbia=routeSegmentAt(3000);({passTemp:summer+pass.tempOffset,desertTemp:summer+desert.tempOffset,desertRain:weatherWeights(desert,20,[]).Pluvieux,columbiaRain:weatherWeights(columbia,20,[]).Pluvieux})`);
  assert.ok(result.desertTemp>result.passTemp);assert.ok(result.columbiaRain>result.desertRain*5);
});

test("cold weather always uses cold artwork without a snow overlay",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.weather={name:"Froid",temp:9,cls:""};({visual:weatherVisual().key,snowClass:WEATHER.find(weather=>weather.name==="Neige").cls})`);
  assert.equal(result.visual,"cold");assert.equal(result.snowClass,"");
});

test("event pool excludes new illnesses for already affected travelers",()=>{
  const ids=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.party.forEach(p=>{p.sickDays=5;p.state="Malade"});eventPool().map(e=>e.eventId).join(",")`);
  for(const id of ["fever","injury","dysentery","contagious","climate-injury"])assert.doesNotMatch(ids,new RegExp(`(^|,)${id}(,|$)`));
});

test("five-day incident settings are converted into daily probabilities",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);const daily=dailyIncidentChance(PACES.prudent,WEATHER[0],{risk:0});({daily,five:1-Math.pow(1-daily,5)})`);
  assert.ok(result.daily>0&&result.daily<.38);assert.ok(Math.abs(result.five-.38)<1e-12);
});

test("missing equipment increases incident risk in relevant conditions",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);const baseline=dailyIncidentChance(PACES.soutenu,WEATHER[0]);game.cart.pieces=0;const noParts=dailyIncidentChance(PACES.soutenu,WEATHER[0]);game.weather=WEATHER[3];game.cart.vetements=0;const exposed=dailyIncidentChance(PACES.soutenu,WEATHER[3]);({baseline,noParts,exposed})`);
  assert.ok(result.noParts>result.baseline);assert.ok(result.exposed>result.noParts);
});

test("event conditions follow weather and available equipment",()=>{
  const rainy=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.weather=WEATHER[2];eventPool().map(e=>e.eventId).join(",")`);
  assert.match(rainy,/(^|,)rain(,|$)/);assert.match(rainy,/(^|,)blankets(,|$)/);assert.doesNotMatch(rainy,/(^|,)climate-injury(,|$)/);
  const coldNoBlankets=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.weather=WEATHER[3];game.cart.vetements=0;eventPool().map(e=>e.eventId).join(",")`);
  assert.match(coldNoBlankets,/(^|,)climate-injury(,|$)/);assert.doesNotMatch(coldNoBlankets,/(^|,)blankets(,|$)/);
});

test("grueling pace weights breakdowns, injuries, and ox trouble",()=>{
  const counts=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.pace="epuisant";const pool=eventPool();Object.fromEntries([...new Set(pool.map(e=>e.eventId))].map(id=>[id,pool.filter(e=>e.eventId===id).length]))`);
  assert.equal(counts.wagon,3);assert.equal(counts.axle,3);assert.equal(counts.injury,3);assert.equal(counts["ox-injury"],4);
});

test("high ox strain further increases ox injury weight",()=>{
  assert.equal(scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.pace="epuisant";game.oxStrain=7;eventPool().filter(e=>e.eventId==="ox-injury").length`),7);
});

test("the same random event cannot occur twice in succession",()=>{
  assert.equal(scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);eventModal=()=>{};let previous=null,valid=true;for(let i=0;i<200;i++){randomEvent();if(game.lastEvent===previous)valid=false;previous=game.lastEvent}valid`),true);
});

test("medical incidents always retain a non-medicine alternative",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.medicaments=0;eventModal=(title,text,details,actions)=>{game.actions=actions};feverEvent(game.party[0]);({label:game.actions[0].label,medicineDisabled:game.actions[0].disabled,alternativeDisabled:!!game.actions[1].disabled})`);
  assert.equal(result.label,"Aucun remède disponible");assert.equal(result.medicineDisabled,true);assert.equal(result.alternativeDisabled,false);
});

test("trade selection prefers an offer the player can accept",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.money=0;for(const key of Object.keys(game.cart))game.cart[key]=0;game.cart.pieces=1;eventModal=(title,text,details,actions)=>{game.actions=actions};tradeEvent();({acceptDisabled:game.actions[0].disabled,before:game.cart.pieces})`);
  assert.equal(result.acceptDisabled,false);assert.equal(result.before,1);
});

test("one resolution kills at most one traveler",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.party.forEach(p=>p.health=0);updateDeaths();({dead:game.party.filter(p=>!p.alive).length,critical:game.party.filter(p=>p.alive&&p.health===1).length})`);
  assert.equal(result.dead,1);assert.equal(result.critical,4);
});

test("travel stops on the exact incident day",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.vivres=500;updateUI=()=>{};setTrailScene=()=>{};weatherForSeason=()=>WEATHER[0];let rolls=0;dailyIncidentOccurs=()=>++rolls===2;randomEvent=()=>{game.testEvent=true};travel();({days:game.days,km:game.km,food:game.cart.vivres,event:game.testEvent})`);
  assert.equal(result.days,2);assert.equal(result.km,48);assert.equal(result.food,485);assert.equal(result.event,true);
});

test("an uneventful travel command resolves five daily simulations",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.vivres=500;updateUI=()=>{};setTrailScene=()=>{};dailyIncidentOccurs=()=>false;weatherForSeason=()=>WEATHER[0];quietTravelEvent=(distance,food,days)=>{game.report={distance,food,days}};travel();({days:game.days,km:game.km,food:game.cart.vivres,report:game.report})`);
  assert.equal(result.days,5);assert.equal(result.km,120);assert.equal(result.food,462.5);assert.equal(result.report.days,5);assert.equal(result.report.food,38);
});

test("a changing forecast affects each day and is detailed in the journal",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.vivres=500;updateUI=()=>{};setTrailScene=()=>{};dailyIncidentOccurs=()=>false;const forecast=[WEATHER[4],WEATHER[1],WEATHER[2],WEATHER[0]];weatherForSeason=()=>forecast.shift()??WEATHER[0];quietTravelEvent=()=>{};travel();({km:game.km,text:game.journal[0].text.fr})`);
  assert.equal(result.km,105);assert.equal(result.text,"105 km parcourus en 5 jours : 48 km par temps modéré, 16 km par temps de neige, 21 km par temps très chaud et 20 km par temps pluvieux. Terrain : Prairies du Kansas ; terrain ondulé ; piste bien marquée ; climat continental humide.");
});

test("river depth stays physical across seasonal and weather variation",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);const mark=LANDMARKS.find(m=>m.kind==="river");let min=10,max=0;for(const month of [0,3,7,10])for(const weather of WEATHER){game.month=month;game.weather=weather;for(let i=0;i<50;i++){const depth=riverDepth(mark);min=Math.min(min,depth);max=Math.max(max,depth)}}({min,max})`);
  assert.ok(result.min>=.3);assert.ok(result.max<=3.4);assert.ok(result.max>result.min);
});

test("a dangerous river crossing can take the last ox and still queue its report",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.boeufs=1;game.cart.vivres=100;Math.random=()=>0;setTrailScene=()=>{};updateDeaths=()=>{};toast=()=>{};queueRiverOutcome=(mark,outcome,data)=>{game.report={outcome,data}};riverRisk(LANDMARKS.find(m=>m.kind==="river"),2);({oxen:game.cart.boeufs,outcome:game.report.outcome})`);
  assert.equal(result.oxen,0);assert.equal(result.outcome,"float-accident");
});

test("food loading never exceeds capacity",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.vivres=795;const loaded=loadFood(25);({loaded,left:game.cart.vivres})`);
  assert.equal(result.loaded,5);assert.equal(result.left,800);
});

test("fort rest cost follows the current party size",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.vivres=18;eventModal=(title,text,details,actions)=>{game.actions=actions};fortEvent(LANDMARKS.find(m=>m.kind==="fort"));const restAction=game.actions.find(action=>String(action.label).includes("reposer"));const before=actionDisabled(restAction);game.party[4].alive=false;const after=actionDisabled(restAction);({before,after})`);
  assert.equal(result.before,true);assert.equal(result.after,false);
});

let passed=0;
for(const {name,run} of tests){try{run();passed++}catch(error){console.error(`FAIL: ${name}`);throw error}}
console.log(`Passed ${passed} logic tests.`);
