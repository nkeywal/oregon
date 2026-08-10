import {readFile, access, stat} from "node:fs/promises";
import {constants as fsConstants} from "node:fs";
import {Script} from "node:vm";

const read = path => readFile(path,"utf8");
const exists = path => access(path,fsConstants.R_OK).then(()=>true,()=>false);
const [html,css,game,i18n,historyFr,historyEn,historyCss,historyJs,historyFrMd,historyEnMd] = await Promise.all([
  read("index.html"),read("styles.css"),read("game.js"),read("i18n.js"),
  read("HISTORIQUE-DEMANDES.html"),read("REQUEST-HISTORY.html"),read("history.css"),read("history.js"),
  read("HISTORIQUE-DEMANDES.md"),read("REQUEST-HISTORY.md")
]);

new Script(game,{filename:"game.js"});
new Script(i18n,{filename:"i18n.js"});
new Script(historyJs,{filename:"history.js"});

const pages={"index.html":html,"HISTORIQUE-DEMANDES.html":historyFr,"REQUEST-HISTORY.html":historyEn};
let idCount=0;
for(const [page,markup] of Object.entries(pages)){
  const ids=[...markup.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);idCount+=ids.length;
  const duplicateIds=ids.filter((id,index)=>ids.indexOf(id)!==index);
  if(duplicateIds.length)throw new Error(`Duplicate HTML ids in ${page}: ${[...new Set(duplicateIds)].join(", ")}`);
}

const allHtml=Object.values(pages).join("\n");
const localFiles=[...allHtml.matchAll(/(?:src|href)="([^"#]+)"/g)]
  .map(match=>match[1].split("?")[0])
  .filter(path=>!path.includes(":")&&!path.startsWith("#"));

const stages=["kansas","fort-kearny","chimney-rock","fort-laramie","independence-rock","south-pass","snake","fort-boise","dalles","willamette"];
const climates=["mild","cold","hot","rain"];
const incidents=["attack","axle","bites","blankets","contagious","dysentery","encounter","fever","frostbite","injury","ox-injury","ox-slaughter","rain","snakebite","theft","trade","wagon"];
const rivers=["kansas","snake","dalles"];
const forts=["fort-kearny","fort-laramie","fort-boise"];
const riverOutcomes=["ferry","float-accident","float-success","wait"];
const weatherRiverOutcomes=["ferry","float-accident","float-success"];
const requiredAssets=[
  "favicon.svg","social.jpg","hero.webp","trail.webp","fort.webp","river.webp","victory.webp","defeat.webp","hunt.webp",
  "hunt-cold.webp","hunt-hot.webp","hunt-rain.webp","weather-cold.webp","weather-hot.webp",
  ...stages.flatMap(stage=>climates.map(climate=>`stage-${stage}-${climate}.webp`)),
  ...stages.flatMap(stage=>["far","mid"].map(distance=>`progress-${stage}-${distance}.webp`)),
  ...forts.flatMap(fort=>climates.map(climate=>`arrival-${fort}-${climate}.webp`)),
  ...incidents.map(name=>`incident-${name}.webp`),
  ...Array.from({length:5},(_,remaining)=>`incident-death-${remaining}.webp`),
  ...rivers.flatMap(river=>riverOutcomes.map(outcome=>`river-${river}-${outcome}.webp`)),
  ...rivers.flatMap(river=>weatherRiverOutcomes.map(outcome=>`river-weather-${river}-${outcome}.webp`))
].map(name=>`assets/${name}`);

const runtimeSource=`${allHtml}\n${css}\n${historyCss}\n${game}\n${historyJs}`;
const literalAssets=[...runtimeSource.matchAll(/assets\/([a-z0-9][a-z0-9.-]+\.(?:webp|jpg|svg))/gi)]
  .map(match=>`assets/${match[1]}`);
const required=[...new Set(["robots.txt","sitemap.xml",...localFiles,...requiredAssets,...literalAssets])];
const missing=[];
for(const path of required)if(!await exists(path))missing.push(path);
if(missing.length)throw new Error(`Missing local files:\n${missing.join("\n")}`);

const oversized=[];
for(const path of required.filter(path=>path.startsWith("assets/"))){
  const info=await stat(path);if(info.size>600_000)oversized.push(`${path} (${Math.round(info.size/1024)} KiB)`);
}
if(oversized.length)throw new Error(`Oversized runtime assets:\n${oversized.join("\n")}`);

if(/\.png\b/i.test(runtimeSource))throw new Error("Runtime source still references an unoptimized PNG asset.");
if(/\.weather\.(?:rain|snow)\s*\{[^}]*background[^;}]*?(?:gradient|url\()/i.test(css))throw new Error("CSS weather particles must not cover dedicated rain or cold artwork.");
if(/localStorage|sessionStorage/.test(game))throw new Error("Game progression must not be persisted in browser storage.");
if(/points? de santé|health points?|% de santé|% health/i.test(`${html}\n${game}\n${i18n}`))throw new Error("Internal health values leaked into player-facing copy.");
if(!/environ 200 exigences/.test(historyFrMd)||!/approximately 200 additional requirements/.test(historyEnMd))throw new Error("Bilingual request totals are not up to date.");
if(!/600 \$ pour le fermier/.test(historyFrMd)||!/\$600 for the farmer/.test(historyEnMd))throw new Error("Bilingual project histories do not contain the current starting funds.");
if(!historyFr.includes('data-source="HISTORIQUE-DEMANDES.md"')||!historyEn.includes('data-source="REQUEST-HISTORY.md"'))throw new Error("History pages are not linked to their respective source documents.");

console.log(`Verified ${required.length} local files, ${idCount} unique HTML ids across ${Object.keys(pages).length} pages, and all JavaScript bundles.`);
