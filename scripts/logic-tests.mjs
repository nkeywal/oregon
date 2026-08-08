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

test("travel journal records the supplied end-of-leg weather",()=>{
  const text=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.weather=WEATHER[1];addTravelJournal(25,2,WEATHER[3]);game.journal[0].text.fr`);
  assert.match(text,/Temps froid en fin d’étape/);assert.doesNotMatch(text,/chaud/);
});

test("event pool excludes new illnesses for already affected travelers",()=>{
  const ids=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.party.forEach(p=>{p.sickDays=5;p.state="Malade"});eventPool().map(e=>e.eventId).join(",")`);
  for(const id of ["fever","injury","dysentery","contagious","climate-injury"])assert.doesNotMatch(ids,new RegExp(`(^|,)${id}(,|$)`));
});

test("five-day incident settings are converted into daily probabilities",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);const daily=dailyIncidentChance(PACES.prudent,WEATHER[0]);({daily,five:1-Math.pow(1-daily,5)})`);
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
  assert.equal(result.days,2);assert.equal(result.km,32);assert.equal(result.food,485);assert.equal(result.event,true);
});

test("an uneventful travel command resolves five daily simulations",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.vivres=500;updateUI=()=>{};setTrailScene=()=>{};dailyIncidentOccurs=()=>false;weatherForSeason=()=>WEATHER[0];quietTravelEvent=(distance,food,days)=>{game.report={distance,food,days}};travel();({days:game.days,km:game.km,food:game.cart.vivres,report:game.report})`);
  assert.equal(result.days,5);assert.equal(result.km,80);assert.equal(result.food,462.5);assert.equal(result.report.days,5);assert.equal(result.report.food,38);
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
