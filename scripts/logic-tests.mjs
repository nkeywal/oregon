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

test("the initial wagon is empty and leaves the full budget to the player",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);({cart:game.cart,money:game.money,empty:Object.values(game.cart).every(quantity=>quantity===0)})`);
  assert.equal(result.empty,true);assert.equal(result.money,800);
});

test("all ammunition prices use the tripled price scale",()=>{
  assert.equal(scenario(`SHOP.munitions.price`),9);
  assert.equal(scenario(`ammoPrice(6)`),18);
  assert.equal(scenario(`ammoPrice(14)`),42);
  assert.equal(scenario(`ammoPrice(18)`),54);
});

test("complete party loss uses art distinct from victory",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);const victory=endingArtAsset(true);const stopped=endingArtAsset(false);game.party.forEach(p=>p.alive=false);const totalLoss=endingArtAsset(false);({victory,stopped,totalLoss})`);
  assert.equal(result.victory,"victory.webp");assert.equal(result.stopped,"trail.webp");assert.equal(result.totalLoss,"defeat.webp");assert.notEqual(result.totalLoss,result.victory);
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

test("an uneventful travel outcome stays in the same journal entry",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);eventModal=(title,text,details,actions)=>actions[0].action();const entry=addTravelJournal(70,5,[{name:"Pluvieux",distance:70,days:5}],ROUTE_SEGMENTS[8]);quietTravelEvent(70,50,5,entry);({count:game.journal.length,text:game.journal[0].text.fr})`);
  assert.equal(result.count,1);assert.match(result.text,/70 km parcourus/);assert.match(result.text,/Une étape calme et sans incident/);
});

test("incident outcomes merge into their original dated journal entry",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);const entry=addJournal(bilingual("Un bœuf blessé — accident.","An injured ox — accident."));game.day=3;journalMergeTarget=entry;addJournal(bilingual("Le bœuf a été abattu.","The ox was slaughtered."));journalMergeTarget=null;({count:game.journal.length,day:game.journal[0].day,text:game.journal[0].text})`);
  assert.equal(result.count,1);assert.equal(result.day,1);assert.match(result.text.fr,/accident\. Le bœuf a été abattu/);assert.match(result.text.en,/accident\. The ox was slaughtered/);
});

test("contagious disease identifies every affected traveler",()=>{
  const result=scenario(`game=baseGame(["Alice","Benoît","Clara"],"fermier",3);Math.random=()=>.999;let notice;eventModal=(title,text)=>notice=text;contagiousDiseaseEvent(game.party);notice`);
  assert.match(result.fr,/3 voyageurs/);for(const name of ["Alice","Benoît","Clara"])assert.match(result.fr,new RegExp(name));
  for(const name of ["Alice","Benoît","Clara"])assert.match(result.en,new RegExp(name));
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

test("strenuous travel matches the historical 12 to 15 miles per travel day",()=>{
  const result=scenario(`const oxFactor=clamp(.45+6*.075,.5,1.35),representativeWeather=.92;const days=ROUTE_SEGMENTS.reduce((total,route)=>total+(route.end-route.start)/(PACES.soutenu.km/5*oxFactor*route.speed*representativeWeather),0);({days,kmPerDay:KM_TOTAL/days})`);
  assert.ok(result.kmPerDay>=12*1.60934);assert.ok(result.kmPerDay<=15*1.60934);assert.ok(result.days>=120&&result.days<=150);
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

test("cold and snow make bison and rabbits rarer during hunts",()=>{
  const result=scenario(`const wildlife=name=>{game=baseGame(["A","B","C","D","E"],"fermier",3);game.weather={...WEATHER.find(weather=>weather.name===name)};const setup=huntWildlife(),frequency=species=>setup.pool.filter(item=>item===species).length/setup.pool.length;return {count:setup.count,bison:frequency("bison"),rabbit:frequency("rabbit")}};({mild:wildlife("Doux"),cold:wildlife("Froid"),snow:wildlife("Neige")})`);
  assert.ok(result.cold.count<result.mild.count);assert.ok(result.snow.count<result.cold.count);
  assert.ok(result.cold.bison<result.mild.bison);assert.equal(result.cold.bison,0);assert.equal(result.snow.bison,0);
  assert.ok(result.cold.rabbit<result.mild.rabbit);assert.ok(result.snow.rabbit<result.cold.rabbit);
});

test("big game stays scarce in every non-ideal hunting climate",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);const climates=["Chaud","Pluvieux","Froid","Neige"],shares=[];for(const route of ROUTE_SEGMENTS)for(const name of climates){const setup=huntWildlife(route,WEATHER.find(weather=>weather.name===name));const large=setup.pool.filter(species=>species==="bison"||species==="deer").length/setup.pool.length;shares.push({route:route.key,name,large,count:setup.count})}({maximum:Math.max(...shares.map(item=>item.large)),minimumCount:Math.min(...shares.map(item=>item.count)),shares})`);
  assert.ok(result.maximum<=.2,JSON.stringify(result.shares.filter(item=>item.large===result.maximum)));
  assert.ok(result.minimumCount>=1);
});

test("terrain controls both hunting abundance and available species",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.weather={...WEATHER[0]};const plains=huntWildlife(ROUTE_SEGMENTS.find(route=>route.key==="great-plains"));const desert=huntWildlife(ROUTE_SEGMENTS.find(route=>route.key==="high-desert"));const mountains=huntWildlife(ROUTE_SEGMENTS.find(route=>route.key==="blue-mountains"));({plains,desert,mountains})`);
  assert.ok(result.desert.count<result.plains.count);assert.ok(result.plains.pool.includes("bison"));
  assert.equal(result.desert.pool.includes("bison"),false);assert.equal(result.mountains.pool.includes("bison"),false);
  assert.ok(result.desert.pool.includes("rabbit")&&result.desert.pool.includes("bird"));
});

test("the map describes terrain, pace, and game for the next 150 km",()=>{
  const html=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.km=1900;escapeHtml=value=>String(value);renderTrailOutlook(150)`);
  assert.match(html,/150 prochains kilomètres/);assert.match(html,/Bassin aride/);assert.match(html,/progression lente/);
  assert.match(html,/lapins/);assert.match(html,/oiseaux/);assert.doesNotMatch(html,/bisons/);
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

test("each stage advances through far, middle, and near artwork",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);const stage=LANDMARKS[1];const phaseAt=km=>{game.km=km;return {phase:stageApproachPhase(stage),asset:stageAsset(stage,{key:"mild"})}};({far:phaseAt(166),mid:phaseAt(340),near:phaseAt(460)})`);
  assert.equal(result.far.phase,"far");assert.equal(result.far.asset,"progress-fort-kearny-far.webp");
  assert.equal(result.mid.phase,"mid");assert.equal(result.mid.asset,"progress-fort-kearny-mid.webp");
  assert.equal(result.near.phase,"near");assert.equal(result.near.asset,"stage-fort-kearny-mild.webp");
});

test("progress sprite quadrants map all four weather variants",()=>{
  const styleFor=key=>scenario(`const element={style:{}};applyStageArt(element,"progress-kansas-far.webp",{key:"${key}"});element.style`);
  assert.equal(styleFor("mild").backgroundPosition,"0% 0%");assert.equal(styleFor("cold").backgroundPosition,"100% 0%");
  assert.equal(styleFor("hot").backgroundPosition,"0% 100%");assert.equal(styleFor("rain").backgroundPosition,"100% 100%");
  const reset=scenario(`const element={style:{}};applyStageArt(element,"progress-kansas-far.webp",{key:"rain"});applyStageArt(element,"incident-fever.webp",{key:"rain"});element.style`);
  assert.equal(reset.backgroundSize,"cover");assert.equal(reset.backgroundPosition,"center");
});

test("river report sprites map all four weather variants",()=>{
  const styleFor=key=>scenario(`const element={style:{}};applyWeatherSprite(element,"river-weather-kansas-ferry.webp",{key:"${key}"});element.style`);
  assert.equal(styleFor("mild").backgroundPosition,"0% 0%");assert.equal(styleFor("cold").backgroundPosition,"100% 0%");
  assert.equal(styleFor("hot").backgroundPosition,"0% 100%");assert.equal(styleFor("rain").backgroundPosition,"100% 100%");
  assert.equal(styleFor("rain").backgroundSize,"200% 200%");
});

test("river outcomes retain the weather observed at the start of the crossing",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);Object.assign(game.cart,{boeufs:6,vivres:500});game.money=500;game.weather={...WEATHER.find(weather=>weather.name==="Pluvieux")};let actions;eventModal=(title,text,details,value)=>actions=value;weatherForSeason=()=>WEATHER.find(weather=>weather.name==="Chaud");queueRiverOutcome=(mark,outcome,data)=>{game.report={outcome,data}};riverEvent(LANDMARKS.find(mark=>mark.kind==="river"),"stage-kansas-rain.webp",1);actions[0].action();({current:weatherVisual().key,reported:game.report.data.weather.key,outcome:game.report.outcome})`);
  assert.equal(result.current,"hot");assert.equal(result.reported,"rain");assert.equal(result.outcome,"ferry");
});

test("sickness never receives a green individual or group indicator",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);const traveler=game.party[0];traveler.health=96;traveler.state="Dysenterie";traveler.sickDays=8;({individual:travelerStatusClass(traveler),group:groupHealthSummary()})`);
  assert.equal(result.individual,"bad");assert.equal(result.group[1],"warn");assert.equal(result.group[0].fr,"Maladie en cours");
});

test("event pool excludes new illnesses for already affected travelers",()=>{
  const ids=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.party.forEach(p=>{p.sickDays=5;p.state="Malade"});eventPool().map(e=>e.eventId).join(",")`);
  for(const id of ["fever","injury","dysentery","contagious","climate-injury"])assert.doesNotMatch(ids,new RegExp(`(^|,)${id}(,|$)`));
});

test("treated dysentery still lasts well beyond two days of rest",()=>{
  const result=scenario(`game=baseGame(["Alice","B","C","D","E"],"fermier",3);game.cart.medicaments=1;const patient=game.party[0];eventModal=(title,text,details,actions)=>actions[0].action();dysenteryEvent(patient);consumeDelay(2,2,false);({state:patient.state,sickDays:patient.sickDays,treated:patient.treated})`);
  assert.equal(result.state,"Dysenterie");assert.equal(result.sickDays,8);assert.equal(result.treated,true);
});

test("two days of rest alone do not cure dysentery",()=>{
  const result=scenario(`game=baseGame(["Alice","B","C","D","E"],"fermier",3);const patient=game.party[0];eventModal=(title,text,details,actions)=>actions[1].action();dysenteryEvent(patient);({state:patient.state,sickDays:patient.sickDays})`);
  assert.equal(result.state,"Dysenterie");assert.ok(result.sickDays>=12);
});

test("five-day incident settings are converted into daily probabilities",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);Object.assign(game.cart,{pieces:3,boeufs:6,vetements:5});const daily=dailyIncidentChance(PACES.prudent,WEATHER[0],{risk:0});({daily,five:1-Math.pow(1-daily,5)})`);
  assert.ok(result.daily>0&&result.daily<.38);assert.ok(Math.abs(result.five-.38)<1e-12);
});

test("grueling pace remains both harsher and much more eventful",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);Object.assign(game.cart,{pieces:3,boeufs:6,vetements:5});const fiveDay=pace=>1-Math.pow(1-dailyIncidentChance(PACES[pace],WEATHER[0],{risk:0}),5);({prudent:fiveDay("prudent"),soutenu:fiveDay("soutenu"),epuisant:fiveDay("epuisant"),health:{prudent:PACES.prudent.health,soutenu:PACES.soutenu.health,epuisant:PACES.epuisant.health},strain:{prudent:PACES.prudent.strain,soutenu:PACES.soutenu.strain,epuisant:PACES.epuisant.strain}})`);
  assert.ok(result.epuisant>=.9&&result.epuisant>result.soutenu&&result.soutenu>result.prudent);
  assert.ok(result.health.epuisant<result.health.soutenu&&result.strain.epuisant>result.strain.soutenu);
});

test("missing equipment increases incident risk in relevant conditions",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);Object.assign(game.cart,{pieces:3,boeufs:6,vetements:5});const baseline=dailyIncidentChance(PACES.soutenu,WEATHER[0]);game.cart.pieces=0;const noParts=dailyIncidentChance(PACES.soutenu,WEATHER[0]);game.weather=WEATHER[3];game.cart.vetements=0;const exposed=dailyIncidentChance(PACES.soutenu,WEATHER[3]);({baseline,noParts,exposed})`);
  assert.ok(result.noParts>result.baseline);assert.ok(result.exposed>result.noParts);
});

test("event conditions follow weather and available equipment",()=>{
  const rainy=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.weather=WEATHER[2];game.cart.vetements=5;eventPool().map(e=>e.eventId).join(",")`);
  assert.match(rainy,/(^|,)rain(,|$)/);assert.match(rainy,/(^|,)blankets(,|$)/);assert.doesNotMatch(rainy,/(^|,)climate-injury(,|$)/);
  const coldNoBlankets=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.weather=WEATHER[3];game.cart.vetements=0;eventPool().map(e=>e.eventId).join(",")`);
  assert.match(coldNoBlankets,/(^|,)climate-injury(,|$)/);assert.doesNotMatch(coldNoBlankets,/(^|,)blankets(,|$)/);
  const coldPrepared=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.weather=WEATHER[3];game.cart.vetements=5;eventPool().map(e=>e.eventId).join(",")`);
  assert.doesNotMatch(coldPrepared,/(^|,)climate-injury(,|$)/);
});

test("blankets prevent substantial cold and snow exposure",()=>{
  const result=scenario(`({covered:weatherExposurePenalty(WEATHER[4],true),mild:weatherExposurePenalty(WEATHER[0],false),cold:weatherExposurePenalty(WEATHER[3],false),snow:weatherExposurePenalty(WEATHER[4],false),rain:weatherExposurePenalty(WEATHER[2],false)})`);
  assert.equal(result.covered,0);assert.equal(result.mild,0);assert.equal(result.cold,2);assert.equal(result.snow,4);assert.equal(result.rain,1);
});

test("serious untreated illness can now become lethal quickly",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);const patient=game.party[0];patient.health=5;patient.state="Dysenterie";patient.sickDays=2;advanceDate(2);updateDeaths();({alive:patient.alive,pending:game.pendingDeath?.name})`);
  assert.equal(result.alive,false);assert.equal(result.pending,"A");
});

test("an empty party cannot continue without a pending death report",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.party.forEach(p=>p.alive=false);renderFinish=()=>{};const failed=checkJourneyFailure();({failed,finished:game.finished,win:game.finishState.win})`);
  assert.equal(result.failed,true);assert.equal(result.finished,true);assert.equal(result.win,false);
});

test("grueling pace weights breakdowns, injuries, and ox trouble",()=>{
  const counts=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.pace="epuisant";game.cart.boeufs=6;const pool=eventPool();Object.fromEntries([...new Set(pool.map(e=>e.eventId))].map(id=>[id,pool.filter(e=>e.eventId===id).length]))`);
  assert.equal(counts.wagon,3);assert.equal(counts.axle,3);assert.equal(counts.injury,3);assert.equal(counts["ox-injury"],4);
});

test("high ox strain further increases ox injury weight",()=>{
  assert.equal(scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.pace="epuisant";game.cart.boeufs=6;game.oxStrain=7;eventPool().filter(e=>e.eventId==="ox-injury").length`),7);
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
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.party.forEach(p=>p.health=0);const deceased=updateDeaths();({dead:game.party.filter(p=>!p.alive).length,critical:game.party.filter(p=>p.alive&&p.health===1).length,pending:game.pendingDeath.name,deceased:deceased.name})`);
  assert.equal(result.dead,1);assert.equal(result.critical,4);assert.equal(result.pending,result.deceased);
});

test("a death opens a specific illustrated event",()=>{
  const result=scenario(`game=baseGame(["Lou","B","C","D","E"],"fermier",3);game.party[0].health=0;eventModal=(title,text,details,actions,art)=>{game.deathEvent={title,text,details,actions,art}};updateDeaths();const shown=showPendingDeathEvent();({shown,art:game.deathEvent.art,title:game.deathEvent.title.fr,text:game.deathEvent.text.en,open:game.deathEventOpen})`);
  assert.equal(result.shown,true);assert.equal(result.art,"incident-death.webp");assert.equal(result.title,"Un compagnon est mort");assert.equal(result.text,"Lou died on the trail.");assert.equal(result.open,true);
});

test("each death applies an explicit final score penalty",()=>{
  const result=scenario(`renderFinish=()=>{};const scoreFor=dead=>{game=baseGame(["A","B","C","D","E"],"charpentier",3);game.km=KM_TOTAL;game.money=200;for(const key of Object.keys(game.cart))game.cart[key]=0;if(dead)game.party[4].alive=false;finish(true);return {score:game.score,rank:endingRank(game.score),penalty:game.finishState.deathPenalty}};({intact:scoreFor(false),loss:scoreFor(true)})`);
  assert.equal(result.intact.penalty,0);assert.equal(result.loss.penalty,750);assert.equal(result.intact.score-result.loss.score,750);
  assert.equal(result.intact.rank,"Maître de la piste de l’Oregon");assert.notEqual(result.loss.rank,result.intact.rank);
});

test("travel stops on the exact incident day",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);Object.assign(game.cart,{boeufs:6,vivres:500,vetements:5});updateUI=()=>{};setTrailScene=()=>{};weatherForSeason=()=>WEATHER[0];let rolls=0;dailyIncidentOccurs=()=>++rolls===2;randomEvent=()=>{game.testEvent=true};travel();({days:game.days,km:game.km,food:game.cart.vivres,event:game.testEvent})`);
  assert.equal(result.days,2);assert.equal(result.km,60);assert.equal(result.food,485);assert.equal(result.event,true);
});

test("an uneventful travel command resolves five daily simulations",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);Object.assign(game.cart,{boeufs:6,vivres:500,vetements:5});updateUI=()=>{};setTrailScene=()=>{};dailyIncidentOccurs=()=>false;weatherForSeason=()=>WEATHER[0];quietTravelEvent=(distance,food,days)=>{game.report={distance,food,days}};travel();({days:game.days,km:game.km,food:game.cart.vivres,report:game.report})`);
  assert.equal(result.days,5);assert.equal(result.km,150);assert.equal(result.food,462.5);assert.equal(result.report.days,5);assert.equal(result.report.food,38);
});

test("a changing forecast affects each day and is detailed in the journal",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);Object.assign(game.cart,{boeufs:6,vivres:500,vetements:5});updateUI=()=>{};setTrailScene=()=>{};dailyIncidentOccurs=()=>false;const forecast=[WEATHER[4],WEATHER[1],WEATHER[2],WEATHER[0]];weatherForSeason=()=>forecast.shift()??WEATHER[0];quietTravelEvent=()=>{};travel();({km:game.km,text:game.journal[0].text.fr})`);
  assert.equal(result.km,128);assert.equal(result.text,"128 km parcourus en 5 jours : 60 km par temps modéré, 19 km par temps de neige, 25 km par temps très chaud et 24 km par temps pluvieux. Terrain : Prairies du Kansas ; terrain ondulé ; piste bien marquée ; climat continental humide.");
});

test("river depth stays physical across seasonal and weather variation",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);const mark=LANDMARKS.find(m=>m.kind==="river");let min=10,max=0;for(const month of [0,3,7,10])for(const weather of WEATHER){game.month=month;game.weather=weather;for(let i=0;i<50;i++){const depth=riverDepth(mark);min=Math.min(min,depth);max=Math.max(max,depth)}}({min,max})`);
  assert.ok(result.min>=.3);assert.ok(result.max<=3.4);assert.ok(result.max>result.min);
});

test("floating cargo-loss probability rises exponentially with water depth",()=>{
  const result=scenario(`const low=floatCargoLossChance(.6),middle=floatCargoLossChance(1.2),high=floatCargoLossChance(1.8),extreme=floatCargoLossChance(2.5);({low,middle,high,extreme,first:middle-low,second:high-middle})`);
  assert.ok(result.low<result.middle&&result.middle<result.high&&result.high<result.extreme);
  assert.ok(result.second>result.first*2);assert.equal(result.extreme,.9);
});

test("traveler fatigue materially raises river-crossing failure risk",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);Object.assign(game.cart,{boeufs:6,pieces:2});const rested=travelerFatigueRisk(),restedRisk=floatCrossingFailureChance(1.8);game.party.forEach(p=>{p.health=38;p.state="Malade";p.sickDays=5});game.oxStrain=8;const exhausted=travelerFatigueRisk(),exhaustedRisk=floatCrossingFailureChance(1.8);({rested,exhausted,restedRisk,exhaustedRisk})`);
  assert.equal(result.rested,0);assert.ok(result.exhausted>.7);assert.ok(result.exhaustedRisk>result.restedRisk+.2);
});

test("deep water can truly fail while shallow water remains relatively safe",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);Object.assign(game.cart,{boeufs:6,pieces:2});({shallow:floatCrossingFailureChance(.8,0),middle:floatCrossingFailureChance(1.8,0),deep:floatCrossingFailureChance(2.5,0)})`);
  assert.ok(result.shallow<.03);assert.ok(result.middle>.1&&result.middle<.25);assert.ok(result.deep>.45);
});

test("a dangerous river crossing can take the last ox and still queue its report",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.boeufs=1;game.cart.vivres=100;Math.random=()=>0;setTrailScene=()=>{};updateDeaths=()=>{};toast=()=>{};queueRiverOutcome=(mark,outcome,data)=>{game.report={outcome,data}};riverRisk(LANDMARKS.find(m=>m.kind==="river"),2);({oxen:game.cart.boeufs,outcome:game.report.outcome,retry:game.report.data.retry})`);
  assert.equal(result.oxen,0);assert.equal(result.outcome,"float-accident");assert.equal(result.retry,true);
});

test("river report is shown before a crossing loss can end the journey",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.boeufs=0;game.pendingRiverOutcome={};let reason=null;finish=(win,text)=>reason=text;const before=checkJourneyFailure();game.pendingRiverOutcome=null;const after=checkJourneyFailure();({before,after,reason})`);
  assert.equal(result.before,false);assert.equal(result.after,true);assert.match(result.reason,/dernier bœuf/);
});

test("fort stops expose the wagon inventory without forcing departure",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);Object.assign(game.cart,{boeufs:6,vivres:500});let actions;eventModal=(title,text,details,value)=>actions=value;fortEvent(LANDMARKS.find(mark=>mark.kind==="fort"));const inventory=actions.find(action=>languageText(action.label)==="Inventaire");({present:!!inventory,keepOpen:inventory?.keepOpen,withInventory:inventory?.withInventory})`);
  assert.equal(result.present,true);assert.equal(result.keepOpen,true);assert.equal(result.withInventory,false);
});

test("food loading never exceeds capacity",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.vivres=795;const loaded=loadFood(25);({loaded,left:game.cart.vivres})`);
  assert.equal(result.loaded,5);assert.equal(result.left,800);
});

test("prepared complete journeys stay in the historical four-to-six-month window",()=>{
  const result=scenario(`let seed=1848;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};finish=win=>{game.finished=true;game.testWin=win};updateUI=()=>{};setTrailScene=()=>{};showLandmarkArt=()=>{};toast=()=>{};returnToTrailTop=()=>{};refreshFortArrivalArt=()=>{};queueRiverOutcome=()=>{};startAttack=()=>{};eventModal=(title,text,details,actions)=>{let action=actions.find(candidate=>!actionDisabled(candidate));if(String(languageText(title)).includes("Fort"))action=actions.find(candidate=>languageText(candidate.label)==="Repartir")||action;if(!action)throw new Error("No playable event action");action.action();updateDeaths();checkJourneyFailure()};const runs={prudent:[],soutenu:[],epuisant:[]};for(const pace of Object.keys(runs))for(let attempt=0;attempt<40;attempt++){game=baseGame(["A","B","C","D","E"],"fermier",3);Object.assign(game.cart,{boeufs:8,vivres:700,munitions:300,vetements:8,pieces:5,medicaments:8});game.money=300;game.pace=pace;game.weather=weatherForPosition(game.month,game.day,game.year,0,[]);game.weatherHistory=[game.weather.name];let turns=0;while(!game.finished&&turns++<500){if(game.cart.vivres<100&&game.cart.munitions>=5){game.cart.munitions-=5;loadFood(55)}const average=alive().reduce((sum,traveler)=>sum+traveler.health,0)/alive().length;if(average<48&&game.cart.vivres>=alive().length*4)rest();else travel()}if(game.testWin)runs[pace].push(game.days)}for(const values of Object.values(runs))values.sort((a,b)=>a-b);const percentile=(values,p)=>values[Math.floor((values.length-1)*p)];({wins:Object.fromEntries(Object.entries(runs).map(([pace,values])=>[pace,values.length])),prudent:{p10:percentile(runs.prudent,.1),p90:percentile(runs.prudent,.9)},soutenu:{p10:percentile(runs.soutenu,.1),p90:percentile(runs.soutenu,.9)}})`);
  assert.ok(result.wins.prudent>=35);assert.ok(result.wins.soutenu>=35);
  assert.ok(result.wins.epuisant<result.wins.soutenu,JSON.stringify(result));
  assert.ok(result.prudent.p10>=120&&result.prudent.p90<=183,JSON.stringify(result));assert.ok(result.soutenu.p10>=120&&result.soutenu.p90<=183,JSON.stringify(result));
});

test("fort rest cost follows the current party size",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.vivres=18;eventModal=(title,text,details,actions)=>{game.actions=actions};fortEvent(LANDMARKS.find(m=>m.kind==="fort"));const restAction=game.actions.find(action=>String(action.label).includes("reposer"));const before=actionDisabled(restAction);game.party[4].alive=false;const after=actionDisabled(restAction);({before,after})`);
  assert.equal(result.before,true);assert.equal(result.after,false);
});

test("fort purchases confirm the item and updated stock",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.money=1000;shuffled=items=>[items[3],...items.slice(0,3)];eventModal=(title,text,details,actions)=>{game.actions=actions};fortEvent(LANDMARKS.find(m=>m.kind==="fort"));const medicine=game.actions.find(action=>languageText(action.label,"fr").includes("remèdes"));const before=game.cart.medicaments;medicine.action();const confirmation=medicine.feedback();({before,after:game.cart.medicaments,fr:confirmation.fr,en:confirmation.en})`);
  assert.equal(result.after,result.before+2);
  assert.match(result.fr,/Achat effectué : 2 remèdes/);assert.match(result.fr,new RegExp(`maintenant ${result.after} doses`));
  assert.match(result.en,/Purchase complete: 2 doses of medicine/);assert.match(result.en,new RegExp(`now have ${result.after} doses of medicine`));
});

let passed=0;
for(const {name,run} of tests){try{run();passed++}catch(error){console.error(`FAIL: ${name}`);throw error}}
console.log(`Passed ${passed} logic tests.`);
