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
  const result=scenario(`const budget=profession=>baseGame(["A","B","C","D","E"],profession,3).money;game=baseGame(["A","B","C","D","E"],"fermier",3);({cart:game.cart,empty:Object.values(game.cart).every(quantity=>quantity===0),farmer:budget("fermier"),carpenter:budget("charpentier"),banker:budget("banquier")})`);
  assert.equal(result.empty,true);assert.equal(result.farmer,500);assert.equal(result.carpenter,900);assert.equal(result.banker,1500);
});

test("Independence uses the requested purchase units and prices",()=>{
  const result=scenario(`({oxen:{step:SHOP.boeufs.step,price:SHOP.boeufs.price},food:{step:SHOP.vivres.step,price:SHOP.vivres.price},ammo:{step:SHOP.munitions.step,price:SHOP.munitions.price}})`);
  assert.deepEqual({...result.oxen},{step:2,price:50});assert.deepEqual({...result.food},{step:10,price:4});assert.deepEqual({...result.ammo},{step:20,price:2});
});

test("complete party loss uses art distinct from victory",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);const victory=endingArtAsset(true);const stopped=endingArtAsset(false);game.party.forEach(p=>p.alive=false);const totalLoss=endingArtAsset(false);({victory,stopped,totalLoss})`);
  assert.equal(result.victory,"victory.webp");assert.equal(result.stopped,"trail.webp");assert.equal(result.totalLoss,"incident-death-last.webp");assert.notEqual(result.totalLoss,result.victory);
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

test("accidental cargo losses scale with the quantity carried",()=>{
  const result=scenario(`Math.random=()=>.5;({small:proportionalLossAmount(100,.06,.15),large:proportionalLossAmount(400,.06,.15),parts:proportionalLossAmount(10,.25,.6)})`);
  assert.equal(result.large,result.small*4);assert.ok(result.parts>=3&&result.parts<=6);
});

test("a wagon fall records both food lost and food remaining",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.vivres=200;Math.random=()=>.5;let actions;eventModal=(title,text,details,value)=>actions=value;eventPool().find(event=>event.eventId==="wagon")();const afterAccident=game.cart.vivres;actions[0].action();({loss:200-afterAccident,left:Math.round(game.cart.vivres),text:game.journal[0].text.fr})`);
  assert.ok(result.loss>=12&&result.loss<=30);assert.match(result.text,new RegExp(`coûté ${result.loss} kg`));assert.match(result.text,new RegExp(`reste ${result.left} kg`));
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
  assert.equal(text,"25 km parcourus en 2 jours : 12 km par temps de neige et 13 km par temps modéré. Allure : normale. Terrain : Prairies du Kansas ; terrain ondulé ; piste bien marquée ; climat continental humide.");
});

test("travel journal records every chosen pace",()=>{
  const labels=scenario(`game=baseGame(["A"],"fermier",3);Object.fromEntries(Object.keys(PACES).map(pace=>{game.pace=pace;addTravelJournal(10,1);return [pace,game.journal.shift().text]}))`);
  assert.match(labels.prudent.fr,/Allure : prudente/);assert.match(labels.soutenu.fr,/Allure : normale/);assert.match(labels.epuisant.fr,/Allure : le plus vite possible/);
  assert.match(labels.prudent.en,/Pace: cautious/);assert.match(labels.soutenu.en,/Pace: normal/);assert.match(labels.epuisant.en,/Pace: as fast as possible/);
});

test("an uneventful travel outcome stays in the same journal entry",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);eventModal=(title,text,details,actions)=>actions[0].action();const entry=addTravelJournal(70,5,[{name:"Pluvieux",distance:70,days:5}],ROUTE_SEGMENTS[8]);quietTravelEvent(70,50,5,entry);({count:game.journal.length,text:game.journal[0].text.fr})`);
  assert.equal(result.count,1);assert.match(result.text,/70 km parcourus/);assert.match(result.text,/Une étape calme et sans incident/);
});

test("incident outcomes merge into their original dated journal entry",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);const entry=addJournal(bilingual("Un bœuf blessé — accident.","An injured ox — accident."));game.day=3;journalMergeTarget=entry;addJournal(bilingual("Le bœuf a été abattu.","The ox was slaughtered."));journalMergeTarget=null;({count:game.journal.length,day:game.journal[0].day,text:game.journal[0].text})`);
  assert.equal(result.count,1);assert.equal(result.day,1);assert.match(result.text.fr,/accident\. Le bœuf a été abattu/);assert.match(result.text.en,/accident\. The ox was slaughtered/);
});

test("resolved incident entries keep the outcome without repeating the introduction",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.vivres=0;game.cart.boeufs=4;const elements={};document.querySelector=selector=>elements[selector]??=(selector==="#dialogue-evenement"?{open:false,showModal(){this.open=true},close(){this.open=false}}:selector==="#event-actions"?{innerHTML:"",appendChild(button){game.button=button}}:{textContent:"",style:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){}});document.createElement=()=>({type:"",className:"",textContent:"",disabled:false,addEventListener(type,fn){this.click=fn}});updateUI=()=>{};setTrailScene=()=>{};returnToTrailTop=()=>{};Math.random=()=>0;const event=eventPool().find(candidate=>candidate.eventId==="encounter");event();game.button.click();({count:game.journal.length,text:languageText(game.journal[0].text)})`);
  assert.equal(result.count,1);assert.match(result.text,/donné 10 kg de vivres/);assert.match(result.text,/désormais 10 kg/);assert.doesNotMatch(result.text,/bonne rencontre|partagent/i);
});

test("contagious disease identifies every affected traveler",()=>{
  const result=scenario(`game=baseGame(["Alice","Benoît","Clara"],"fermier",3);Math.random=()=>.999;let notice;eventModal=(title,text)=>notice=text;contagiousDiseaseEvent(game.party);notice`);
  assert.match(result.fr,/3 voyageurs/);for(const name of ["Alice","Benoît","Clara"])assert.match(result.fr,new RegExp(name));
  for(const name of ["Alice","Benoît","Clara"])assert.match(result.en,new RegExp(name));
});

test("contagious-disease outcomes retain the travelers' names",()=>{
  const text=scenario(`game=baseGame(["Alice","Benoît","Clara"],"fermier",3);game.cart.vivres=100;Math.random=()=>.999;let actions;eventModal=(title,body,details,value)=>actions=value;contagiousDiseaseEvent(game.party);actions[1].action();game.journal[0].text.fr`);
  for(const name of ["Alice","Benoît","Clara"])assert.match(text,new RegExp(name));
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

test("ox speed factor follows the requested thresholds and cap",()=>{
  const result=scenario(`({one:oxenTravelFactor(1),two:oxenTravelFactor(2),three:oxenTravelFactor(3),four:oxenTravelFactor(4),five:oxenTravelFactor(5),six:oxenTravelFactor(6),seven:oxenTravelFactor(7),eight:oxenTravelFactor(8),twelve:oxenTravelFactor(12),twenty:oxenTravelFactor(20)})`);
  const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-12,`${actual} != ${expected}`);
  close(result.one,.6);close(result.two,.75);close(result.three,.825);close(result.four,.9);close(result.five,.95);close(result.six,1);close(result.seven,1.025);close(result.eight,1.05);close(result.twelve,1.05);close(result.twenty,1.05);
});

test("profession does not alter incident probability",()=>{
  const result=scenario(`const chance=profession=>{game=baseGame(["A","B","C","D","E"],profession,3);Object.assign(game.cart,{boeufs:6,pieces:2,vetements:5});game.pace="soutenu";return incidentProbability("wagon",{distance:30,weather:WEATHER[0],route:ROUTE_SEGMENTS[0]})};({farmer:chance("fermier"),carpenter:chance("charpentier"),banker:chance("banquier")})`);
  assert.equal(result.farmer,result.carpenter);assert.equal(result.farmer,result.banker);
});

test("strenuous travel matches the historical 12 to 15 miles per travel day",()=>{
  const result=scenario(`const oxFactor=oxenTravelFactor(6),representativeWeather=.92;const days=ROUTE_SEGMENTS.reduce((total,route)=>total+(route.end-route.start)/(PACES.soutenu.km/5*oxFactor*route.speed*representativeWeather),0);({days,kmPerDay:KM_TOTAL/days})`);
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

test("hunting depletes local game and especially species already killed",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.km=200;game.weather={...WEATHER[0]};const site=huntSiteKey(),baseline=huntWildlife(),tickets=(setup,species)=>setup.pool.filter(item=>item===species).length;recordHuntPressure(site,{deer:2});const repeat=huntWildlife();game.km=260;const moved=huntWildlife();({site,baselineCount:baseline.count,repeatCount:repeat.count,movedCount:moved.count,baselineDeer:tickets(baseline,"deer"),repeatDeer:tickets(repeat,"deer"),newSite:huntSiteKey()})`);
  assert.ok(result.repeatCount<result.baselineCount,JSON.stringify(result));assert.ok(result.repeatDeer<result.baselineDeer,JSON.stringify(result));
  assert.equal(result.movedCount,result.baselineCount);assert.notEqual(result.newSite,result.site);
});

test("a depleted hunting ground still shows a rabbit and a bird",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.km=200;game.weather={...WEATHER[4]};const site=huntSiteKey();recordHuntPressure(site,{bison:20,deer:20,rabbit:20,bird:20});const setup=huntWildlife();({count:setup.count,guaranteed:setup.guaranteedSmallGame,pool:setup.pool})`);
  assert.ok(result.count>=2);assert.deepEqual([...result.guaranteed],["rabbit","bird"]);assert.ok(result.pool.includes("rabbit")&&result.pool.includes("bird"));
});

test("French game abundance descriptions avoid the awkward 'gibier dispersé'",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.km=2700;game.weather={...WEATHER[0]};({forecast:wildlifeDescription(routeSegmentAt(),"fr"),current:currentWildlifeDescription("fr")})`);
  assert.doesNotMatch(`${result.forecast} ${result.current}`,/gibier dispersé/i);assert.match(`${result.forecast} ${result.current}`,/gibier peu abondant/i);
});

test("the map describes terrain, pace, and game for the next 150 km",()=>{
  const html=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.km=1900;escapeHtml=value=>String(value);renderTrailOutlook(150)`);
  assert.match(html,/150 prochains kilomètres/);assert.match(html,/Bassin aride/);assert.match(html,/progression lente/);
  assert.match(html,/lapins/);assert.match(html,/oiseaux/);assert.doesNotMatch(html,/bisons/);
});

test("the map distinguishes game available here today from the forecast ahead",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.km=1900;game.weather=WEATHER.find(weather=>weather.name==="Froid");escapeHtml=value=>String(value);const current=currentWildlifeDescription("fr"),html=renderTrailOutlook(150);({current,html})`);
  assert.match(result.html,/Gibier ici aujourd’hui/);assert.match(result.html,/Les 150 prochains kilomètres/);
  assert.match(result.current,/lapins|oiseaux/);assert.doesNotMatch(result.current,/bisons/);
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
  assert.equal(result.state,"Dysenterie");assert.equal(result.sickDays,11);assert.equal(result.treated,true);
});

test("two days of rest alone do not cure dysentery",()=>{
  const result=scenario(`game=baseGame(["Alice","B","C","D","E"],"fermier",3);const patient=game.party[0];eventModal=(title,text,details,actions)=>actions[1].action();dysenteryEvent(patient);({state:patient.state,sickDays:patient.sickDays})`);
  assert.equal(result.state,"Dysenterie");assert.ok(result.sickDays>=17);
});

test("all medical conditions use the longer recovery schedule",()=>{
  const result=scenario(`const durations={};let actions;eventModal=(title,text,details,value)=>actions=value;const fresh=()=>{game=baseGame(["Alice","B","C","D","E"],"fermier",3);game.cart.medicaments=10;return game.party[0]};let p=fresh();feverEvent(p);durations.fever=[p.sickDays,(actions[0].action(),p.sickDays)];p=fresh();dysenteryEvent(p);durations.dysentery=[p.sickDays,(actions[0].action(),p.sickDays)];p=fresh();injuryEvent(p);durations.injury=[p.sickDays,(actions[0].action(),p.sickDays)];p=fresh();game.weather=WEATHER.find(weather=>weather.name==="Froid");climateInjuryEvent(p);durations.frostbite=[p.sickDays,(actions[0].action(),p.sickDays)];p=fresh();game.weather=WEATHER.find(weather=>weather.name==="Chaud");climateInjuryEvent(p);durations.bites=[p.sickDays,(actions[0].action(),p.sickDays)];p=fresh();contagiousDiseaseEvent(game.party);const patient=game.party.find(traveler=>traveler.sickDays>0);durations.contagious=[patient.sickDays,(actions[0].action(),patient.sickDays)];durations`);
  assert.deepEqual([...result.fever],[14,10]);assert.deepEqual([...result.dysentery],[19,13]);assert.deepEqual([...result.contagious],[17,11]);
  assert.deepEqual([...result.injury],[10,4]);assert.deepEqual([...result.frostbite],[11,4]);assert.deepEqual([...result.bites],[7,4]);
});

test("medicine reduces but no longer cancels daily illness damage",()=>{
  const result=scenario(`game=baseGame(["Alice"],"fermier",3);const patient=game.party[0];Object.assign(patient,{health:100,state:"Dysenterie",sickDays:3,treated:true});advanceDate(1);({health:patient.health,days:patient.sickDays,state:patient.state})`);
  assert.equal(result.health,99);assert.equal(result.days,2);assert.equal(result.state,"Dysenterie");
});

test("rest cannot improve health during untreated dysentery",()=>{
  const result=scenario(`game=baseGame(["Alice"],"fermier",3);game.cart.vivres=20;const patient=game.party[0];Object.assign(patient,{health:100,state:"Dysenterie",sickDays:10,treated:false});consumeDelay(2,2,false);patient.health=clamp(patient.health+restRecovery(patient),0,100);({health:patient.health,days:patient.sickDays})`);
  assert.ok(result.health<100);assert.equal(result.days,8);
});

test("an attack wound evolves alongside rather than replacing dysentery",()=>{
  const result=scenario(`game=baseGame(["Alice"],"fermier",3);const patient=game.party[0];Object.assign(patient,{health:90,state:"Dysenterie",sickDays:13,treated:true});applyAttackWound(patient,20);const wounded={state:patient.state,sickDays:patient.sickDays,woundDays:patient.woundDays,needsRemedy:patient.needsRemedy};treatAttackWound(patient);const treated={state:patient.state,sickDays:patient.sickDays,woundDays:patient.woundDays,needsRemedy:patient.needsRemedy};advanceDate(5);({wounded,treated,after:{state:patient.state,sickDays:patient.sickDays,woundDays:patient.woundDays,needsRemedy:patient.needsRemedy}})`);
  assert.equal(result.wounded.state,"Dysenterie");assert.equal(result.wounded.sickDays,13);assert.equal(result.wounded.woundDays,16);
  assert.equal(result.treated.state,"Dysenterie");assert.equal(result.treated.sickDays,13);assert.equal(result.treated.woundDays,9);assert.equal(result.treated.needsRemedy,false);
  assert.equal(result.after.state,"Dysenterie");assert.equal(result.after.sickDays,8);assert.equal(result.after.woundDays,4);
});

test("an untreated attack wound eventually clears its remedy flag",()=>{
  const result=scenario(`game=baseGame(["Alice"],"fermier",3);const patient=game.party[0];applyAttackWound(patient,10);advanceDate(16);({state:patient.state,woundDays:patient.woundDays,needsRemedy:patient.needsRemedy,eligible:eventEligibleTravelers().includes(patient)})`);
  assert.equal(result.state,"En forme");assert.equal(result.woundDays,0);assert.equal(result.needsRemedy,false);assert.equal(result.eligible,true);
});

test("named recoveries are preserved in the journal without internal health values",()=>{
  const text=scenario(`game=baseGame(["Alice"],"fermier",3);Object.assign(game.party[0],{state:"Fièvre",sickDays:1,health:80});advanceDate(1);game.journal[0].text.fr`);
  assert.match(text,/Alice/);assert.match(text,/fièvre/);assert.doesNotMatch(text,/point|%/i);
});

test("recovery alongside an attack wound uses natural French",()=>{
  const text=scenario(`game=baseGame(["Sacha"],"fermier",3);const sacha=game.party[0];Object.assign(sacha,{state:"Fièvre",sickDays:1,woundDays:5,needsRemedy:true});advanceDate(1);game.journal[0].text.fr`);
  assert.match(text,/La fièvre de Sacha est tombée/);assert.match(text,/blessure exige encore des soins/);assert.doesNotMatch(text,/vaincu fièvre/);
});

test("rest reports the party condition and gives diminishing returns",()=>{
  const result=scenario(`game=baseGame(["Alice","B","C","D","E"],"fermier",3);game.cart.vivres=100;game.party.forEach(p=>p.health=45);game.party[0].state="Blessé";game.party[0].sickDays=8;dailyIncidentOccurs=()=>false;const before=game.party[1].health;const first=performRest(2);const afterFirst=game.party[1].health;const firstText=game.journal[0].text.fr;const second=performRest(2);({firstGain:afterFirst-before,secondGain:game.party[1].health-afterFirst,streak:second.streak,firstText,secondText:game.journal[0].text.fr})`);
  assert.ok(result.firstGain>result.secondGain);assert.equal(result.streak,2);
  assert.match(result.firstText,/Alice \(blessé\)|état|groupe/i);assert.doesNotMatch(result.secondText,/moins de répit|haltes successives/i);
});

test("wounds keep healing through successive rests",()=>{
  const result=scenario(`game=baseGame(["Alice","B"],"fermier",3);game.cart.vivres=100;dailyIncidentOccurs=()=>false;const attackWound=game.party[0],trailWound=game.party[1];Object.assign(attackWound,{health:45,state:"Blessé",woundDays:8,needsRemedy:true});Object.assign(trailWound,{health:45,state:"Blessé",sickDays:8});performRest(2);const first={attack:attackWound.woundDays,trail:trailWound.sickDays};performRest(2);({first,second:{attack:attackWound.woundDays,trail:trailWound.sickDays},states:[attackWound.state,trailWound.state],health:[attackWound.health,trailWound.health]})`);
  assert.ok(result.first.attack<8&&result.first.trail<8);assert.equal(result.second.attack,0);assert.equal(result.second.trail,0);
  assert.ok(result.health.every(value=>value>45),JSON.stringify(result));
});

test("a fed critical patient receives the day's rest before death is resolved",()=>{
  const result=scenario(`game=baseGame(["Lou"],"fermier",3);game.cart.vivres=20;dailyIncidentOccurs=()=>false;const lou=game.party[0];Object.assign(lou,{health:1,state:"Fièvre",sickDays:8});const outcome=performRest(1);({alive:lou.alive,health:lou.health,cause:lou.deathCause,days:outcome.days,text:game.journal[0].text.fr})`);
  assert.equal(result.alive,true);assert.ok(result.health>0);assert.equal(result.cause,null);assert.match(result.text,/1 jour de repos a soulagé/);
});

test("rest summaries identify the event that interrupted the halt",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);Object.assign(game.cart,{vivres:100,boeufs:6,pieces:2,vetements:5});dailyIncidentOccurs=()=>true;selectRestEvent=()=>restEventPool().find(event=>event.eventId==="attack");performRest(2);game.journal[0].text`);
  assert.match(result.fr,/attaque contre le camp/);assert.match(result.en,/attack on the camp/);assert.doesNotMatch(result.fr,/un événement au camp/);
});

test("rest recovery mainly benefits exhausted travelers",()=>{
  const result=scenario(`game=baseGame(["A","B"],"fermier",3);game.party[0].health=95;game.party[1].health=35;({rested:restRecovery(game.party[0]),exhausted:restRecovery(game.party[1]),repeat:restRecovery(game.party[1],3)})`);
  assert.ok(result.exhausted>result.rested*3);assert.ok(result.repeat<result.exhausted/2);
});

test("rest days use daily incident rolls but exclude trail accidents",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);Object.assign(game.cart,{vivres:100,boeufs:6,pieces:2,vetements:5});let rolls=0;dailyIncidentOccurs=()=>{rolls++;return rolls===2};const allowed=[...new Set(restEventPool().map(event=>event.eventId))];selectRestEvent=()=>restEventPool().find(event=>event.eventId==="attack");const outcome=performRest(3);({rolls,days:outcome.days,event:outcome.event?.eventId,allowed})`);
  assert.equal(result.rolls,2);assert.equal(result.days,2);assert.ok(result.event);
  for(const id of ["wagon","axle","ox-injury","injury","rain"])assert.ok(!result.allowed.includes(id));
  for(const id of ["attack","theft"])assert.ok(result.allowed.includes(id));
});

test("distance-based incidents have zero probability during rest",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);Object.fromEntries(["wagon","axle","injury","ox-injury","attack","theft"].map(id=>[id,incidentProbability(id,{distance:0,weather:WEATHER[0],route:ROUTE_SEGMENTS[0]})]))`);
  for(const id of ["wagon","axle","injury","ox-injury"])assert.equal(result[id],0);
  assert.equal(result.attack,.005);assert.equal(result.theft,.007);
});

test("five travel days get five rolls while two rest days get only two",()=>{
  const result=scenario(`const setup=()=>{game=baseGame(["A","B","C","D","E"],"fermier",3);Object.assign(game.cart,{vivres:500,boeufs:6,pieces:2,vetements:5});updateUI=()=>{};setTrailScene=()=>{};quietTravelEvent=()=>{};weatherForSeason=()=>WEATHER[0]};setup();let travelRolls=0;dailyIncidentOccurs=()=>{travelRolls++;return false};travel();setup();let restRolls=0;dailyIncidentOccurs=()=>{restRolls++;return false};performRest(2);({travelRolls,restRolls})`);
  assert.equal(result.travelRolls,5);assert.equal(result.restRolls,2);
});

test("resting at a fort is safe from every incident",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.vivres=100;let rolls=0;dailyIncidentOccurs=()=>{rolls++;return true};const outcome=performRest(2,true);({rolls,days:outcome.days,event:outcome.event})`);
  assert.equal(result.rolls,0);assert.equal(result.days,2);assert.equal(result.event,null);
});

test("fort rest feedback displays the group condition directly",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.party.forEach(traveler=>traveler.health=42);const feedback=fortRestFeedback();({fr:feedback.fr,en:feedback.en})`);
  assert.match(result.fr,/État du groupe : Très faible/);assert.doesNotMatch(result.fr,/journal/i);assert.doesNotMatch(result.en,/journal/i);
});

test("losing an ox records the remaining team and its effect on pace",()=>{
  const text=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.boeufs=5;game.cart.vivres=0;eventModal=(title,body,details,actions)=>actions[1].action();oxInjuryEvent();game.journal[0].text.fr`);
  assert.match(text,/Il reste 4 bœufs/);assert.match(text,/plus lentement/);
});

test("attacks become longer, faster, and denser farther west",()=>{
  const result=scenario(`game=baseGame(["A"],"fermier",3);({east:attackDifficultyAt(0),west:attackDifficultyAt(KM_TOTAL)})`);
  assert.ok(result.west.duration>result.east.duration);assert.ok(result.west.duration<=result.east.duration+2);
  assert.ok(result.west.speed>result.east.speed&&result.west.speed<=result.east.speed*1.25);
  assert.ok(result.west.spawnBase<result.east.spawnBase&&result.west.spawnBase>=.4);assert.ok(result.west.minSpawn>=.15);
});

test("later attacks cause more casualties and more severe wounds",()=>{
  const result=scenario(`game=baseGame(["A"],"fermier",3);({light:attackOutcomeRisk(3,0),heavy:attackOutcomeRisk(8,0),late:attackOutcomeRisk(8,1)})`);
  assert.ok(result.heavy.affected>result.light.affected);assert.ok(result.heavy.lethalChance>result.light.lethalChance);assert.ok(result.late.lethalChance>result.heavy.lethalChance);assert.ok(result.late.damageBonus>result.heavy.damageBonus);
  assert.ok(result.late.lethalChance-result.heavy.lethalChance<=.04);assert.ok(result.late.damageBonus-result.heavy.damageBonus<=4);
});

test("daily incident rates match the individual specification",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);Object.fromEntries(["attack","theft","encounter","trade","fever","dysentery","contagious"].map(id=>[id,incidentProbability(id,{distance:30,weather:WEATHER[0],route:ROUTE_SEGMENTS[0]})]))`);
  assert.equal(result.attack,.005);assert.equal(result.theft,.007);assert.equal(result.encounter,.014);assert.equal(result.trade,.014);
  assert.equal(result.fever,.006);assert.equal(result.dysentery,.004);assert.equal(result.contagious,.005);
});

test("snakebite risk is per eligible traveler and follows temperature",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);const chance=weather=>incidentProbability("snakebite",{weather,route:ROUTE_SEGMENTS[0]});const mild=chance(WEATHER[0]),rain=chance(WEATHER[2]),hot=chance(WEATHER[1]),veryHot=chance({name:"Chaud",temp:35}),cold=chance(WEATHER[3]),snow=chance(WEATHER[4]);game.party[0].woundDays=2;const four=chance(WEATHER[0]);({mild,rain,hot,veryHot,cold,snow,four})`);
  const expected=multiplier=>1-Math.pow(1-.00025*multiplier,5);
  assert.ok(Math.abs(result.mild-expected(1))<1e-12);assert.equal(result.rain,result.mild);
  assert.ok(Math.abs(result.hot-expected(1.5))<1e-12);assert.ok(Math.abs(result.veryHot-expected(2))<1e-12);
  assert.equal(result.cold,0);assert.equal(result.snow,0);assert.ok(Math.abs(result.four-(1-Math.pow(1-.00025,4)))<1e-12);
});

test("snakebites can occur at rest but never at a fort or in cold weather",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);const mild=restEventPool().some(event=>event.eventId==="snakebite");game.weather=WEATHER[3];const cold=restEventPool().some(event=>event.eventId==="snakebite");let rolls=0;dailyIncidentOccurs=()=>{rolls++;return true};game.cart.vivres=100;performRest(2,true);({mild,cold,fortRolls:rolls})`);
  assert.equal(result.mild,true);assert.equal(result.cold,false);assert.equal(result.fortRolls,0);
});

test("snakebite lasts eight days and medicine strongly limits its effects",()=>{
  const result=scenario(`const run=treated=>{game=baseGame(["Lou"],"fermier",3);game.cart.medicaments=treated?1:0;Math.random=()=>.5;let actions,art;eventModal=(title,text,details,value,image)=>{actions=value;art=image};const patient=game.party[0];snakebiteEvent(patient);const initialDays=patient.woundDays;(treated?actions[0]:actions[1]).action();advanceDate(8);return {health:patient.health,state:patient.state,days:patient.woundDays,needs:patient.needsRemedy,medicine:game.cart.medicaments,art}};({treated:run(true),untreated:run(false)})`);
  assert.equal(result.treated.art,"incident-snakebite.webp");assert.equal(result.treated.days,0);assert.equal(result.untreated.days,0);
  assert.equal(result.treated.medicine,0);assert.equal(result.treated.needs,false);assert.ok(result.treated.health>result.untreated.health+30);
});

test("rest does not shorten the snakebite's eight calendar days",()=>{
  const result=scenario(`game=baseGame(["Lou"],"fermier",3);game.cart.medicaments=1;game.cart.vivres=100;Math.random=()=>.5;let actions;eventModal=(title,text,details,value)=>actions=value;snakebiteEvent(game.party[0]);actions[0].action();dailyIncidentOccurs=()=>false;performRest(2,true);({days:game.party[0].woundDays,health:game.party[0].health})`);
  assert.equal(result.days,6);assert.ok(result.health>0);
});

test("an untreated snakebite records the venom as a possible cause of death",()=>{
  const result=scenario(`game=baseGame(["Lou"],"fermier",3);game.cart.medicaments=0;game.party[0].health=20;Math.random=()=>.5;let actions;eventModal=(title,text,details,value)=>actions=value;snakebiteEvent(game.party[0]);actions[1].action();({health:game.party[0].health,cause:game.party[0].deathCause})`);
  assert.equal(result.health,0);assert.match(result.cause.fr,/morsure de serpent/);assert.match(result.cause.en,/snakebite/);
});

test("a daily theft rate of seven per thousand gives the intended journey exposure",()=>{
  const result=scenario(`const daily=INCIDENT_RULES.theft.rate;({expected:daily*150,atLeastOne:1-Math.pow(1-daily,150)})`);
  assert.ok(Math.abs(result.expected-1.05)<1e-12);assert.ok(result.atLeastOne>.651&&result.atLeastOne<.652);
});

test("distance incident rates and pace multipliers match the specification",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);Object.fromEntries(Object.entries(INCIDENT_RULES).filter(([,rule])=>rule.basis==="distance").map(([id,rule])=>[id,{rate:rule.rate,pace:rule.pace}]))`);
  assert.equal(result.wagon.rate,.00049);assert.deepEqual({...result.wagon.pace},{prudent:.45,soutenu:1,epuisant:1.35});
  assert.equal(result.injury.rate,.00039);assert.deepEqual({...result.injury.pace},{prudent:.55,soutenu:1,epuisant:1.3});
  assert.equal(result.axle.rate,.0002);assert.deepEqual({...result.axle.pace},{prudent:.65,soutenu:1,epuisant:1.25});
  assert.equal(result["ox-injury"].rate,.00023);assert.deepEqual({...result["ox-injury"].pace},{prudent:.7,soutenu:1,epuisant:1.2});
});

test("per-kilometer risks compound over the distance actually traveled",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.pace="soutenu";Object.assign(game.cart,{vivres:0,munitions:0,vetements:5,pieces:0,medicaments:0});({none:incidentProbability("wagon",{distance:0,weather:WEATHER[0],route:ROUTE_SEGMENTS[0]}),thirty:incidentProbability("wagon",{distance:30,weather:WEATHER[0],route:ROUTE_SEGMENTS[0]})})`);
  assert.equal(result.none,0);assert.ok(Math.abs(result.thirty-(1-Math.pow(1-.00049,30)))<1e-12);
});

test("human fatigue modifiers compound by discrete levels",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.pace="soutenu";const fresh=incidentMultiplier("fever",WEATHER[0],ROUTE_SEGMENTS[0]);game.party.forEach(person=>person.health=35);const level=humanFatigueLevel(),tired=incidentMultiplier("fever",WEATHER[0],ROUTE_SEGMENTS[0]);({fresh,tired,level})`);
  assert.ok(result.level>=2);assert.ok(Math.abs(result.tired/result.fresh-Math.pow(1.15,result.level))<1e-12);
});

test("cold blanket shortages raise disease risk but spare parts do not alter it",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);Object.assign(game.cart,{pieces:3,boeufs:6,vetements:5});const prepared=incidentProbability("fever",{weather:WEATHER[3]});game.cart.pieces=0;const noParts=incidentProbability("fever",{weather:WEATHER[3]});game.cart.vetements=0;const exposed=incidentProbability("fever",{weather:WEATHER[3]});({prepared,noParts,exposed})`);
  assert.equal(result.prepared,result.noParts);assert.ok(result.exposed>result.noParts);
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

test("grueling pace raises travel accidents but not thefts or attacks",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);Object.assign(game.cart,{boeufs:6,pieces:3,vetements:5});const rate=(pace,id)=>{game.pace=pace;return incidentProbability(id,{distance:30,weather:WEATHER[0],route:ROUTE_SEGMENTS[0]})};({wagon:[rate("prudent","wagon"),rate("soutenu","wagon"),rate("epuisant","wagon")],theft:[rate("prudent","theft"),rate("soutenu","theft"),rate("epuisant","theft")],attack:[rate("prudent","attack"),rate("soutenu","attack"),rate("epuisant","attack")]})`);
  assert.ok(result.wagon[0]<result.wagon[1]&&result.wagon[1]<result.wagon[2]);assert.equal(new Set(result.theft).size,1);assert.equal(new Set(result.attack).size,1);
});

test("ox fatigue compounds ox injury risk by twelve percent per level",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.pace="soutenu";game.oxStrain=0;const fresh=incidentMultiplier("ox-injury",WEATHER[0],ROUTE_SEGMENTS[0]);game.oxStrain=7;const tired=incidentMultiplier("ox-injury",WEATHER[0],ROUTE_SEGMENTS[0]);({fresh,tired})`);
  assert.ok(Math.abs(result.tired/result.fresh-Math.pow(1.12,2))<1e-12);
});

test("individual rolls allow the same incident on consecutive days",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);const theft=eventPool().find(event=>event.eventId==="theft");eventModal=()=>{};randomEvent(theft);const first=game.lastEvent;randomEvent(theft);({first,second:game.lastEvent})`);
  assert.equal(result.first,"theft");assert.equal(result.second,"theft");
});

test("terrain, weather, and load modifiers compound only relevant accidents",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.pace="soutenu";Object.assign(game.cart,{vivres:0,munitions:0,vetements:5,pieces:0,medicaments:0});const base=incidentMultiplier("wagon",WEATHER[0],ROUTE_SEGMENTS[0]);Object.assign(game.cart,{vivres:700});const hardRain=incidentMultiplier("wagon",WEATHER[2],ROUTE_SEGMENTS[8]);({base,hardRain})`);
  assert.equal(result.base,1);assert.ok(Math.abs(result.hardRain-1.5*1.35*1.15)<1e-12);
});

test("medical incidents always retain a non-medicine alternative",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.medicaments=0;eventModal=(title,text,details,actions)=>{game.actions=actions};feverEvent(game.party[0]);({label:game.actions[0].label,medicineDisabled:game.actions[0].disabled,alternativeDisabled:!!game.actions[1].disabled})`);
  assert.equal(result.label,"Aucun remède disponible");assert.equal(result.medicineDisabled,true);assert.equal(result.alternativeDisabled,false);
});

test("trade selection prefers an offer the player can accept",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.money=0;for(const key of Object.keys(game.cart))game.cart[key]=0;game.cart.pieces=1;eventModal=(title,text,details,actions)=>{game.actions=actions};tradeEvent();({acceptDisabled:game.actions[0].disabled,before:game.cart.pieces})`);
  assert.equal(result.acceptDisabled,false);assert.equal(result.before,1);
});

test("declining a trade records the exact rejected offer",()=>{
  const result=scenario(`const run=(moneyValue,stock)=>{game=baseGame(["A"],"fermier",3);game.money=moneyValue;for(const key of Object.keys(game.cart))game.cart[key]=0;Object.assign(game.cart,stock);let actions;eventModal=(title,text,details,value)=>actions=value;Math.random=()=>0;tradeEvent();actions[1].action();return game.journal[0].text};({buy:run(1000,{}),sell:run(0,{pieces:1})})`);
  assert.match(result.buy.fr,/refusé d’acheter 50 kg de vivres pour 34 \$/);assert.match(result.buy.en,/declined to buy 50 kg of food for \$34/);
  assert.match(result.sell.fr,/refusé de vendre 1 pièce de rechange contre 20 \$/);assert.match(result.sell.en,/declined to sell 1 spare part for \$20/);
});

test("trail ammunition offers follow the rebalanced ammunition economy",()=>{
  const result=scenario(`const offerFor=(money,ammo,random)=>{game=baseGame(["A","B","C","D","E"],"fermier",3);game.money=money;game.cart.munitions=ammo;Math.random=()=>random;let text,actions;eventModal=(title,value,details,choices)=>{text=value;actions=choices};tradeEvent();return {text,accept:actions[0]}};const buying=offerFor(1000,0,.2);const selling=offerFor(0,100,.5);buying.accept.action();selling.accept.action();({buy:buying.text,sell:selling.text})`);
  assert.match(result.buy.fr,/40 balles pour 8 \$/);assert.match(result.buy.en,/40 bullets for \$8/);
  assert.match(result.sell.fr,/5 \$ pour 30 balles/);assert.match(result.sell.en,/\$5 for 30 bullets/);
});

test("one resolution kills at most one traveler",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.party.forEach(p=>{p.health=0;p.state="Fièvre";p.sickDays=3;p.deathCause=bilingual("de la fièvre","from fever")});const deceased=updateDeaths();({dead:game.party.filter(p=>!p.alive).length,critical:game.party.filter(p=>p.alive&&p.health===1).length,pending:game.pendingDeath.name,deceased:deceased.name,survivors:game.party.filter(p=>p.alive).map(p=>({state:p.state,cause:p.deathCause}))})`);
  assert.equal(result.dead,1);assert.equal(result.critical,4);assert.equal(result.pending,result.deceased);
  assert.ok(result.survivors.every(traveler=>traveler.state==="Fièvre"&&traveler.cause===null));
});

test("a death opens a specific illustrated event",()=>{
  const result=scenario(`game=baseGame(["Lou","B","C","D","E"],"fermier",3);game.party[0].health=0;eventModal=(title,text,details,actions,art)=>{game.deathEvent={title,text,details,actions,art}};updateDeaths();const shown=showPendingDeathEvent();({shown,art:game.deathEvent.art,title:game.deathEvent.title.fr,text:game.deathEvent.text.en,open:game.deathEventOpen})`);
  assert.equal(result.shown,true);assert.equal(result.art,"incident-death-4.webp");assert.equal(result.title,"Un compagnon est mort");assert.equal(result.text,"Lou died from exhaustion on the trail.");assert.equal(result.open,true);
});

test("death notices preserve a specific cause",()=>{
  const result=scenario(`game=baseGame(["Lou","B"],"fermier",3);const lou=game.party[0];Object.assign(lou,{health:0,state:"Dysenterie",sickDays:8});updateDeaths();const illness=deathNotice(lou);const other=game.party[1];Object.assign(other,{health:0,deathCause:bilingual("pendant l’attaque","during the attack")});const attackNotice=deathNotice(other);({illness,attack:attackNotice})`);
  assert.match(result.illness.fr,/Lou est mort de la dysenterie/);assert.match(result.illness.en,/Lou died from dysentery/);
  assert.match(result.attack.fr,/pendant l’attaque/);assert.match(result.attack.en,/during the attack/);
});

test("a lethal final illness day retains the illness as its cause",()=>{
  const result=scenario(`game=baseGame(["Lou"],"fermier",3);const lou=game.party[0];Object.assign(lou,{health:2,state:"Dysenterie",sickDays:1,treated:false});advanceDate(1);updateDeaths();({state:lou.state,cause:lou.deathCause,notice:deathNotice(lou)})`);
  assert.equal(result.state,"Décédé");assert.equal(result.cause.fr,"de la dysenterie");assert.match(result.notice.en,/from dysentery/);
});

test("death artwork reflects every possible survivor count",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);const assets=[];for(let remaining=0;remaining<=4;remaining++){game.party.forEach((traveler,index)=>traveler.alive=index<remaining);assets.push(deathEventAsset())}assets`);
  assert.deepEqual([...result],["incident-death-last.webp","incident-death-1.webp","incident-death-2.webp","incident-death-3.webp","incident-death-4.webp"]);
});

test("the last companion's death uses an unburied final-traveler report",()=>{
  const result=scenario(`game=baseGame(["Lou"],"fermier",3);game.party[0].health=0;eventModal=(title,text,details,actions,art)=>{game.deathEvent={details,action:actions[0],art}};updateDeaths();showPendingDeathEvent();({art:game.deathEvent.art,details:game.deathEvent.details.fr,label:game.deathEvent.action.label.fr})`);
  assert.equal(result.art,"incident-death-last.webp");assert.match(result.details,/personne pour l’ensevelir/);assert.doesNotMatch(result.details,/tombe|sépulture/);assert.equal(result.label,"Voir le bilan du convoi");
});

test("the last death entry is not overwritten by the final journey entry",()=>{
  const result=scenario(`game=baseGame(["Lou"],"fermier",3);game.km=2920;const lou=game.party[0];Object.assign(lou,{health:0,state:"Fièvre",sickDays:5});renderFinish=()=>{};eventModal=(title,text,details,actions)=>{const entry=addJournal(bilingualJoin(title," — ",text));entry.captureOutcomes=true;entry.outcomeFragments=[];journalMergeTarget=entry;actions[0].action();journalMergeTarget=null};updateDeaths();showPendingDeathEvent();game.journal.map(entry=>entry.text)`);
  assert.equal(result.length,2);assert.match(result[0].fr,/convoi a disparu au kilomètre 2920/);assert.match(result[1].fr,/Lou est mort de la fièvre/);
});

test("clicking hunt starts the mini-game before a day elapses",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);Object.assign(game.cart,{munitions:20,vivres:100});document.querySelector=()=>({style:{},textContent:"",showModal(){},focus(){}});startHunt();({days:game.days,food:game.cart.vivres,running:hunt.running})`);
  assert.equal(result.days,0);assert.equal(result.food,100);assert.equal(result.running,true);
});

test("hunted meat is loaded before the hunting day consumes food",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.vivres=0;weatherForSeason=()=>WEATHER[0];const outcome=resolveHuntDay(25);({days:game.days,loaded:outcome.loaded,consumed:outcome.food.consumed,missing:outcome.food.missing,food:game.cart.vivres,health:game.party[0].health})`);
  assert.equal(result.days,1);assert.equal(result.loaded,25);assert.equal(result.consumed,10);assert.equal(result.missing,0);assert.equal(result.food,15);assert.equal(result.health,100);
});

test("a hunting-day death is queued only after the meat has been added",()=>{
  const result=scenario(`game=baseGame(["Lou","B","C","D","E"],"fermier",3);game.cart.vivres=0;const patient=game.party[0];patient.health=2;patient.state="Dysenterie";patient.sickDays=2;weatherForSeason=()=>WEATHER[0];const outcome=resolveHuntDay(20);({loaded:outcome.loaded,food:game.cart.vivres,pending:game.pendingDeath?.name,alive:patient.alive})`);
  assert.equal(result.loaded,20);assert.equal(result.food,10);assert.equal(result.pending,"Lou");assert.equal(result.alive,false);
});

test("an ox can feed an empty wagon only when another ox remains",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.boeufs=2;game.cart.vivres=0;Math.random=()=>0;eventModal=()=>{};const offered=offerOxForFood();const loaded=slaughterOxForFood();const after={oxen:game.cart.boeufs,food:game.cart.vivres,text:game.journal[0].text.fr};game.cart.vivres=0;const refused=slaughterOxForFood();({offered,loaded,after,refused})`);
  assert.equal(result.offered,true);assert.ok(result.loaded>=42);assert.equal(result.after.oxen,1);assert.match(result.after.text,/Il ne reste qu’un bœuf/);assert.equal(result.refused,0);
});

test("an ox can complete insufficient food stores before resting",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.boeufs=2;game.cart.vivres=5;dailyIncidentOccurs=()=>false;updateUI=()=>{};returnToTrailTop=()=>{};let actions;eventModal=(title,text,details,value)=>actions=value;rest();const choice=actions[0];choice.action();choice.afterClose();({days:game.days,oxen:game.cart.boeufs,food:game.cart.vivres,journal:game.journal.map(entry=>entry.text.fr)})`);
  assert.equal(result.days,2);assert.equal(result.oxen,1);assert.ok(result.food>0);assert.ok(result.journal.some(text=>/vivres ne suffisaient plus/.test(text)));
});

test("a fort offers ox meat when provisions are insufficient for rest",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.boeufs=3;game.cart.vivres=5;dailyIncidentOccurs=()=>false;refreshFortArrivalArt=()=>{};const dialogs=[];eventModal=(title,text,details,actions)=>dialogs.push({title,actions});const mark=LANDMARKS.find(item=>item.name==="Fort Boise");fortEvent(mark);const restAction=dialogs[0].actions.find(action=>String(languageText(action.label,"fr")).includes("reposer"));const initiallyDisabled=actionDisabled(restAction);restAction.action();const oxChoice=dialogs[1].actions[0];oxChoice.action();oxChoice.afterClose();({initiallyDisabled,days:game.days,oxen:game.cart.boeufs,dialogs:dialogs.length})`);
  assert.equal(result.initiallyDisabled,false);assert.equal(result.days,2);assert.equal(result.oxen,2);assert.equal(result.dialogs,3);
});

test("the starvation choice uses its dedicated illustration",()=>{
  const result=scenario(`game=baseGame(["A"],"fermier",3);game.cart.boeufs=2;game.cart.vivres=0;let art;eventModal=(title,text,details,actions,value)=>art=value;const offered=offerOxForFood();({offered,art})`);
  assert.equal(result.offered,true);assert.equal(result.art,"incident-ox-slaughter.webp");
});

test("trying to travel hungry offers an ox before starvation",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.boeufs=2;game.cart.vivres=0;let title;eventModal=value=>title=value;updateUI=()=>{};travel();({days:game.days,title:title.fr})`);
  assert.equal(result.days,0);assert.equal(result.title,"Les vivres sont épuisés");
});

test("partial food shortage offers an ox before a travel day can kill",()=>{
  const result=scenario(`game=baseGame(["Lou","B","C","D","E"],"fermier",3);Object.assign(game.cart,{boeufs:3,vivres:2});game.party[0].health=2;let offered=0,required=0;offerOxForFood=(after,value)=>{offered++;required=value;return true};updateUI=()=>{};travel();({offered,required,days:game.days,alive:game.party[0].alive})`);
  assert.equal(result.offered,1);assert.ok(result.required>2);assert.equal(result.days,0);assert.equal(result.alive,true);
});

test("an empty wagon is offered an ox after a fruitless hunt",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.boeufs=2;game.cart.vivres=0;let offered=0;offerOxForFood=()=>{offered++;return true};showPendingDeathEvent=()=>false;checkJourneyFailure=()=>false;continueAfterHuntReport();offered`);
  assert.equal(result,1);
});

test("a meager hunt postpones hunger damage until the ox choice",()=>{
  const result=scenario(`game=baseGame(["Lou","B","C","D","E"],"fermier",3);Object.assign(game.cart,{boeufs:3,vivres:0});game.party[0].health=2;const outcome=resolveHuntDay(3);({pending:outcome.pending,days:game.days,food:game.cart.vivres,alive:game.party[0].alive,required:game.pendingHuntDay.requiredFood})`);
  assert.equal(result.pending,true);assert.equal(result.days,0);assert.equal(result.food,3);assert.equal(result.alive,true);assert.equal(result.required,10);
});

test("each death applies an explicit final score penalty",()=>{
  const result=scenario(`renderFinish=()=>{};const scoreFor=dead=>{game=baseGame(["A","B","C","D","E"],"charpentier",3);game.km=KM_TOTAL;game.money=200;for(const key of Object.keys(game.cart))game.cart[key]=0;if(dead)game.party[4].alive=false;finish(true);return {score:game.score,rank:endingRank(game.score),penalty:game.finishState.deathPenalty}};({intact:scoreFor(false),loss:scoreFor(true)})`);
  assert.equal(result.intact.penalty,0);assert.equal(result.loss.penalty,525);assert.equal(result.intact.score-result.loss.score,525);
  assert.notEqual(result.loss.rank,result.intact.rank);
});

test("all ending ranks have a distinct situating comment",()=>{
  const result=scenario(`({ranks:ENDING_RANKS.length,comments:ENDING_COMMENTS,uniqueFr:new Set(ENDING_COMMENTS.map(comment=>comment.fr)).size,cattle:ENDING_COMMENTS[ENDING_RANKS.indexOf("Convoyeur de bétail")]})`);
  assert.equal(result.ranks,20);assert.equal(result.comments.length,20);assert.equal(result.uniqueFr,20);
  for(const comment of result.comments){assert.ok(comment.fr.length>15);assert.ok(comment.en.length>15)}
  assert.match(result.cattle.fr,/bien/);
});

test("the victory narrative names survivors and remembers the dead",()=>{
  const result=scenario(`game=baseGame(["Alice","Benoît","Clara","Diego","Emma"],"fermier",3);game.days=161;game.party[3].alive=false;game.party[4].alive=false;const withLosses=finishNarrative(true);game.party.forEach(traveler=>traveler.alive=true);const intact=finishNarrative(true);({withLosses,intact})`);
  assert.match(result.withLosses.fr,/Alice, Benoît et Clara contemplent/);assert.match(result.withLosses.fr,/dernière pensée pour Diego et Emma/);assert.doesNotMatch(result.withLosses.fr,/3 voyageurs/);
  assert.doesNotMatch(result.intact.fr,/dernière pensée/);assert.match(result.intact.en,/Alice, Benoît, Clara, Diego and Emma finally look/);
});

test("finishing adds a final journal entry with people and place",()=>{
  const result=scenario(`renderFinish=()=>{};game=baseGame(["Alice","Benoît","Clara"],"fermier",3);game.km=KM_TOTAL;game.party[2].alive=false;finish(true);const success=game.journal[0].text;game=baseGame(["Diego","Emma"],"fermier",3);game.km=2675;game.party.forEach(traveler=>traveler.alive=false);finish(false);const failure=game.journal[0].text;({success,failure})`);
  assert.match(result.success.fr,/Alice et Benoît atteignent la vallée de Willamette/);assert.match(result.success.en,/Alice and Benoît reach the Willamette Valley/);
  assert.match(result.failure.fr,/kilomètre 2675/);assert.match(result.failure.fr,/Blue Mountains/);assert.match(result.failure.en,/wagon party vanished/);
});

test("the visible score keeps death penalties internal",()=>{
  const result=scenario(`game=baseGame(["A","B","C"],"fermier",3);game.km=2100;currentLanguage="fr";const fr=finishScoreText(false,1234);currentLanguage="en";const en=finishScoreText(true,1234);({fr,en})`);
  assert.match(result.fr,/Score/);assert.match(result.fr,/Distance/);assert.doesNotMatch(result.fr,/Pertes humaines/);
  assert.doesNotMatch(result.en,/Human losses/);
});

test("profession level strongly scales the final score",()=>{
  const result=scenario(`renderFinish=()=>{};const scoreFor=profession=>{game=baseGame(["A","B","C","D","E"],profession,3);game.km=KM_TOTAL;game.money=0;for(const key of Object.keys(game.cart))game.cart[key]=0;finish(true);return game.score};({farmer:scoreFor("fermier"),carpenter:scoreFor("charpentier"),banker:scoreFor("banquier")})`);
  assert.ok(result.farmer>result.carpenter*1.4,JSON.stringify(result));assert.ok(result.carpenter>result.banker*1.7,JSON.stringify(result));
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
  assert.equal(result.km,128);assert.equal(result.text,"128 km parcourus en 5 jours : 60 km par temps modéré, 19 km par temps de neige, 25 km par temps très chaud et 24 km par temps pluvieux. Allure : normale. Terrain : Prairies du Kansas ; terrain ondulé ; piste bien marquée ; climat continental humide.");
});

test("river depth stays physical across seasonal and weather variation",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);const mark=LANDMARKS.find(m=>m.kind==="river");let min=10,max=0;for(const month of [0,3,7,10])for(const weather of WEATHER){game.month=month;game.weather=weather;for(let i=0;i<50;i++){const depth=riverDepth(mark);min=Math.min(min,depth);max=Math.max(max,depth)}}({min,max})`);
  assert.ok(result.min>=.3);assert.ok(result.max<=3.4);assert.ok(result.max>result.min);
});

test("waiting produces visibly varied river levels",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);const mark=LANDMARKS.find(m=>m.name==="The Dalles");game.weather=WEATHER.find(weather=>weather.name==="Doux");game.weatherHistory=["Doux","Doux","Doux"];let seed=71;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};const levels=Array.from({length:300},()=>riverDepth(mark,2));({minimum:Math.min(...levels),maximum:Math.max(...levels),rounded:new Set(levels.map(level=>level.toFixed(1))).size})`);
  assert.ok(result.maximum-result.minimum>1.7,JSON.stringify(result));assert.ok(result.minimum<1.5&&result.maximum>3,JSON.stringify(result));assert.ok(result.rounded>=15,JSON.stringify(result));
});

test("season and recent weather strongly influence a level measured after waiting",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);const mark=LANDMARKS.find(m=>m.kind==="river");Math.random=()=>.5;game.month=3;game.day=15;game.weather=WEATHER.find(weather=>weather.name==="Pluvieux");game.weatherHistory=["Doux","Pluvieux","Pluvieux"];const springRain=riverDepth(mark,1.2);game.month=7;game.day=15;game.weather=WEATHER.find(weather=>weather.name==="Chaud");game.weatherHistory=["Doux","Chaud","Chaud"];const summerHeat=riverDepth(mark,1.2);({springRain,summerHeat})`);
  assert.ok(result.springRain>result.summerHeat+.55,JSON.stringify(result));
});

test("floating cargo-loss probability rises exponentially with water depth",()=>{
  const result=scenario(`const low=floatCargoLossChance(.6),middle=floatCargoLossChance(1.2),high=floatCargoLossChance(1.8),extreme=floatCargoLossChance(2.5);({low,middle,high,extreme,first:middle-low,second:high-middle})`);
  assert.ok(result.low<result.middle&&result.middle<result.high&&result.high<result.extreme);
  assert.ok(result.second>result.first*2);assert.equal(result.extreme,.97);
});

test("traveler fatigue materially raises river-crossing failure risk",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);Object.assign(game.cart,{boeufs:6,pieces:2});const rested=travelerFatigueRisk(),restedRisk=floatCrossingFailureChance(1.8);game.party.forEach(p=>{p.health=38;p.state="Malade";p.sickDays=5});game.oxStrain=8;const exhausted=travelerFatigueRisk(),exhaustedRisk=floatCrossingFailureChance(1.8);({rested,exhausted,restedRisk,exhaustedRisk})`);
  assert.equal(result.rested,0);assert.ok(result.exhausted>.7);assert.ok(result.exhaustedRisk>result.restedRisk+.2);
});

test("deep water can truly fail while shallow water remains relatively safe",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);Object.assign(game.cart,{boeufs:6,pieces:2});({shallow:floatCrossingFailureChance(.8,0),middle:floatCrossingFailureChance(1.8,0),deep:floatCrossingFailureChance(2.5,0)})`);
  assert.ok(result.shallow<.03);assert.ok(result.middle>.38&&result.middle<.48);assert.ok(result.deep>.8);
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

test("fort arrival is journaled before rest and departure",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);Object.assign(game.cart,{boeufs:6,vivres:500});dailyIncidentOccurs=()=>false;refreshFortArrivalArt=()=>{};let actions;eventModal=(title,text,details,value)=>actions=value;const mark=LANDMARKS.find(item=>item.name==="Fort Boise");fortEvent(mark);actions.find(action=>String(languageText(action.label,"fr")).includes("reposer")).action();actions.find(action=>languageText(action.label,"fr")==="Repartir").action();game.journal.map(entry=>({day:entry.day,text:entry.text.fr}))`);
  assert.match(result[0].text,/Départ de Fort Boise/);assert.match(result[1].text,/2 jours de repos/);assert.match(result[2].text,/Arrivée à Fort Boise/);
  assert.ok(result[2].day<result[1].day);assert.equal(result[1].day,result[0].day);
});

test("food loading never exceeds capacity",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.vivres=795;const loaded=loadFood(25);({loaded,left:game.cart.vivres})`);
  assert.equal(result.loaded,5);assert.equal(result.left,800);
});

test("prepared complete journeys preserve pace difficulty under individual incident risks",()=>{
  const result=scenario(`let seed=1848;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};finish=win=>{game.finished=true;game.testWin=win};updateUI=()=>{};setTrailScene=()=>{};showLandmarkArt=()=>{};toast=()=>{};returnToTrailTop=()=>{};refreshFortArrivalArt=()=>{};queueRiverOutcome=()=>{};startAttack=()=>{};eventModal=(title,text,details,actions)=>{let action=actions.find(candidate=>!actionDisabled(candidate));if(String(languageText(title)).includes("Fort"))action=actions.find(candidate=>languageText(candidate.label)==="Repartir")||action;if(!action)throw new Error("No playable event action");action.action();updateDeaths();checkJourneyFailure()};const runs={prudent:[],soutenu:[],epuisant:[]};for(const pace of Object.keys(runs))for(let attempt=0;attempt<40;attempt++){game=baseGame(["A","B","C","D","E"],"fermier",3);Object.assign(game.cart,{boeufs:8,vivres:700,munitions:300,vetements:8,pieces:5,medicaments:8});game.money=300;game.pace=pace;game.weather=weatherForPosition(game.month,game.day,game.year,0,[]);game.weatherHistory=[game.weather.name];let turns=0;while(!game.finished&&turns++<500){if(game.cart.vivres<100&&game.cart.munitions>=5){game.cart.munitions-=5;loadFood(55)}const average=alive().reduce((sum,traveler)=>sum+traveler.health,0)/alive().length;if(average<48&&game.cart.vivres>=alive().length*4)rest();else travel()}if(game.testWin)runs[pace].push(game.days)}for(const values of Object.values(runs))values.sort((a,b)=>a-b);const percentile=(values,p)=>values[Math.floor((values.length-1)*p)];({wins:Object.fromEntries(Object.entries(runs).map(([pace,values])=>[pace,values.length])),prudent:{p10:percentile(runs.prudent,.1),p75:percentile(runs.prudent,.75)},soutenu:{p10:percentile(runs.soutenu,.1),p75:percentile(runs.soutenu,.75)}})`);
  assert.ok(result.wins.prudent>=35,JSON.stringify(result));assert.ok(result.wins.soutenu>=20&&result.wins.soutenu<result.wins.prudent,JSON.stringify(result));
  assert.ok(result.wins.epuisant<=30&&result.wins.epuisant<result.wins.soutenu,JSON.stringify(result));
  assert.ok(result.prudent.p10>=120&&result.prudent.p75<=210,JSON.stringify(result));assert.ok(result.soutenu.p10>=120&&result.soutenu.p75<=260,JSON.stringify(result));
});

test("fort rest cost follows the current party size",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.cart.vivres=18;eventModal=(title,text,details,actions)=>{game.actions=actions};fortEvent(LANDMARKS.find(m=>m.kind==="fort"));const restAction=game.actions.find(action=>String(action.label).includes("reposer"));const before=actionDisabled(restAction);game.party[4].alive=false;const after=actionDisabled(restAction);({before,after})`);
  assert.equal(result.before,true);assert.equal(result.after,false);
});

test("fort purchases confirm the item and updated stock",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.money=1000;eventModal=(title,text,details,actions)=>{game.actions=actions};fortEvent(LANDMARKS.find(m=>m.kind==="fort"));const medicine=game.actions.find(action=>languageText(action.label,"fr").includes("remède"));const before=game.cart.medicaments;medicine.action();const confirmation=medicine.feedback();({before,after:game.cart.medicaments,money:game.money,fr:confirmation.fr,en:confirmation.en,journal:game.journal[0].text})`);
  assert.equal(result.after,result.before+1);
  assert.match(result.fr,/Achat effectué : 1 remède/);assert.match(result.fr,new RegExp(`Nouveau stock : ${result.after} dose`));assert.match(result.fr,new RegExp(`reste ${result.money} \\$.`));
  assert.match(result.en,/Purchase complete: 1 dose of medicine/);assert.match(result.en,new RegExp(`New stock: ${result.after} dose of medicine`));
  assert.match(result.journal.fr,/Achat à Fort/);assert.match(result.journal.fr,/Argent restant/);
});

test("every fort always sells medicine",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.money=1000;let actions;eventModal=(title,text,details,value)=>actions=value;LANDMARKS.filter(mark=>mark.kind==="fort").map(mark=>{fortEvent(mark);return {name:mark.name,medicine:actions.filter(action=>languageText(action.label,"fr").includes("remède")).length}})`);
  assert.equal(result.length,3);for(const fort of result)assert.equal(fort.medicine,1,fort.name);
});

test("forts sell standard units and individual oxen",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"banquier",3);game.money=2000;shuffled=items=>items;let actions;eventModal=(title,text,details,value)=>actions=value;fortEvent(LANDMARKS.find(mark=>mark.kind==="fort"));const before={...game.cart};for(const fragment of ["10 kg de vivres","20 balles","1 remède","1 bœuf","1 couverture"]){const action=actions.find(candidate=>languageText(candidate.label,"fr").includes(fragment));if(!action)throw new Error(fragment);action.action()}({vivres:game.cart.vivres-before.vivres,munitions:game.cart.munitions-before.munitions,medicaments:game.cart.medicaments-before.medicaments,boeufs:game.cart.boeufs-before.boeufs,vetements:game.cart.vetements-before.vetements})`);
  assert.equal(result.vivres,10);assert.equal(result.munitions,20);assert.equal(result.medicaments,1);assert.equal(result.boeufs,1);assert.equal(result.vetements,1);
});

test("a fort keeps the same equipment assortment when reopened",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.money=1000;let flip=false;shuffled=items=>{flip=!flip;return flip?[...items]:[...items].reverse()};let actions;eventModal=(title,text,details,value)=>actions=value;const mark=LANDMARKS.find(item=>item.name==="Fort Boise"),equipment=()=>actions.map(action=>languageText(action.label,"fr")).filter(label=>/bœuf|couverture|pièce de rechange/.test(label));fortEvent(mark);const first=equipment();reopenFort(mark);const second=equipment();({first,second,stored:game.fortAssortments[mark.visual]})`);
  assert.deepEqual([...result.first],[...result.second]);assert.equal(result.stored.length,2);
});

test("each repeat purchase raises only that fort's item price by twenty percent",()=>{
  const result=scenario(`game=baseGame(["A","B","C","D","E"],"fermier",3);game.money=1000;game.km=2580;let actions;eventModal=(title,text,details,value)=>actions=value;const boise=LANDMARKS.find(mark=>mark.name==="Fort Boise"),kearny=LANDMARKS.find(mark=>mark.name==="Fort Kearny");fortEvent(boise);const food=actions.find(action=>languageText(action.label,"fr").includes("10 kg de vivres"));const first=languageText(food.label,"fr");food.action();const second=languageText(food.label,"fr");food.action();const third=languageText(food.label,"fr");({first,second,third,money:game.money,stock:game.cart.vivres,journal:game.journal[0].text.fr,otherFort:fortPurchasePrice(kearny,"vivres",8),counts:game.fortPurchases})`);
  assert.match(result.first,/8 \$/);assert.match(result.second,/10 \$/);assert.match(result.third,/12 \$/);
  assert.equal(result.money,982);assert.equal(result.stock,20);assert.match(result.journal,/10 \$/);assert.match(result.journal,/Nouveau stock : 20 kg de vivres/);assert.match(result.journal,/Argent restant : 982 \$/);
  assert.equal(result.otherFort,8);assert.equal(Object.values(result.counts).reduce((sum,count)=>sum+count,0),2);
});

let passed=0;
for(const {name,run} of tests){try{run();passed++}catch(error){console.error(`FAIL: ${name}`);throw error}}
console.log(`Passed ${passed} logic tests.`);
