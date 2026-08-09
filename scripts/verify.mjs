import {readFile, access} from "node:fs/promises";
import {constants as fsConstants} from "node:fs";
import {Script} from "node:vm";

const read = path => readFile(path,"utf8");
const exists = path => access(path,fsConstants.R_OK).then(()=>true,()=>false);
const [html,css,game,i18n] = await Promise.all([read("index.html"),read("styles.css"),read("game.js"),read("i18n.js")]);

new Script(game,{filename:"game.js"});
new Script(i18n,{filename:"i18n.js"});

const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
const duplicateIds=ids.filter((id,index)=>ids.indexOf(id)!==index);
if(duplicateIds.length)throw new Error(`Duplicate HTML ids: ${[...new Set(duplicateIds)].join(", ")}`);

const localFiles=[...html.matchAll(/(?:src|href)="([^"#]+)"/g)]
  .map(match=>match[1].split("?")[0])
  .filter(path=>!path.includes(":")&&!path.startsWith("#"));

const stages=["kansas","fort-kearny","chimney-rock","fort-laramie","independence-rock","south-pass","snake","fort-boise","dalles","willamette"];
const climates=["mild","cold","hot","rain"];
const incidents=["attack","axle","bites","blankets","contagious","dysentery","encounter","fever","frostbite","injury","ox-injury","rain","theft","trade","wagon"];
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
  ...rivers.flatMap(river=>riverOutcomes.map(outcome=>`river-${river}-${outcome}.webp`)),
  ...rivers.flatMap(river=>weatherRiverOutcomes.map(outcome=>`river-weather-${river}-${outcome}.webp`))
].map(name=>`assets/${name}`);

const literalAssets=[...`${html}\n${css}\n${game}`.matchAll(/assets\/([a-z0-9][a-z0-9.-]+\.(?:webp|jpg|svg))/gi)]
  .map(match=>`assets/${match[1]}`);
const required=[...new Set(["robots.txt","sitemap.xml",...localFiles,...requiredAssets,...literalAssets])];
const missing=[];
for(const path of required)if(!await exists(path))missing.push(path);
if(missing.length)throw new Error(`Missing local files:\n${missing.join("\n")}`);

if(/\.png\b/i.test(`${html}\n${css}\n${game}`))throw new Error("Runtime source still references an unoptimized PNG asset.");
if(/localStorage|sessionStorage/.test(game))throw new Error("Game progression must not be persisted in browser storage.");
if(/points? de santé|health points?|% de santé|% health/i.test(`${html}\n${game}\n${i18n}`))throw new Error("Internal health values leaked into player-facing copy.");

console.log(`Verified ${required.length} local files, ${ids.length} unique HTML ids, and both JavaScript bundles.`);
