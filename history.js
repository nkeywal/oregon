"use strict";

const historyRoot=document.querySelector("#history-content");
const historyToc=document.querySelector("#history-toc");
const source=document.body.dataset.source;

document.querySelectorAll("[data-game-language]").forEach(link=>link.addEventListener("click",()=>{
  localStorage.setItem("oregon-vibe-language",link.dataset.gameLanguage);
}));

function escapeHistoryHtml(value){
  return String(value).replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[character]);
}

function historyInline(value){
  return escapeHistoryHtml(value)
    .replace(/`([^`]+)`/g,"<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>');
}

function historySlug(value){
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}

function isHistoryBlock(line){
  return !line.trim()||/^#{1,3}\s/.test(line)||/^[-*]\s/.test(line)||/^\d+\.\s/.test(line)||/^>\s?/.test(line)||/^\|/.test(line);
}

function renderHistory(markdown){
  const lines=markdown.replace(/\r/g,"").split("\n"),headings=[];
  let html="",sectionOpen=false,listType=null;
  const closeList=()=>{if(listType){html+=`</${listType}>`;listType=null}};
  const closeSection=()=>{closeList();if(sectionOpen){html+="</section>";sectionOpen=false}};

  for(let index=0;index<lines.length;index++){
    const line=lines[index],trimmed=line.trim();
    if(!trimmed){closeList();continue}
    if(/^#\s/.test(line))continue;
    const h2=line.match(/^##\s+(.+)/);
    if(h2){
      closeSection();const title=h2[1],id=historySlug(title);headings.push({title,id});
      html+=`<section class="history-section panel" aria-labelledby="${id}"><p class="eyebrow">${String(headings.length).padStart(2,"0")} · Oregon Vibe</p><h2 id="${id}">${historyInline(title)}</h2>`;sectionOpen=true;continue;
    }
    const h3=line.match(/^###\s+(.+)/);
    if(h3){closeList();html+=`<h3>${historyInline(h3[1])}</h3>`;continue}
    if(/^\|/.test(line)){
      closeList();const rows=[];
      while(index<lines.length&&/^\|/.test(lines[index].trim()))rows.push(lines[index++].trim().slice(1,-1).split("|").map(cell=>cell.trim()));
      index--;const data=rows.filter((row,rowIndex)=>rowIndex!==1||!row.every(cell=>/^:?-+:?$/.test(cell)));
      if(data.length){html+='<div class="history-table-wrap"><table><thead><tr>'+data[0].map(cell=>`<th>${historyInline(cell)}</th>`).join("")+'</tr></thead><tbody>'+data.slice(1).map(row=>`<tr>${row.map(cell=>`<td>${historyInline(cell)}</td>`).join("")}</tr>`).join("")+'</tbody></table></div>'}
      continue;
    }
    const quote=line.match(/^>\s?(.*)/);
    if(quote){closeList();const parts=[quote[1]];while(index+1<lines.length&&/^>\s?/.test(lines[index+1]))parts.push(lines[++index].replace(/^>\s?/,""));html+=`<blockquote>${historyInline(parts.join(" "))}</blockquote>`;continue}
    const bullet=line.match(/^[-*]\s+(.+)/),numbered=line.match(/^\d+\.\s+(.+)/),item=bullet??numbered;
    if(item){const wanted=numbered?"ol":"ul";if(listType!==wanted){closeList();html+=`<${wanted}>`;listType=wanted}html+=`<li>${historyInline(item[1])}</li>`;continue}
    closeList();const paragraph=[trimmed];
    while(index+1<lines.length&&!isHistoryBlock(lines[index+1]))paragraph.push(lines[++index].trim());
    html+=`<p>${historyInline(paragraph.join(" "))}</p>`;
  }
  closeSection();return {html,headings};
}

fetch(source)
  .then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.text()})
  .then(markdown=>{
    const rendered=renderHistory(markdown);historyRoot.innerHTML=rendered.html;
    historyToc.innerHTML=rendered.headings.map(({title,id},index)=>`<a href="#${id}"><span>${String(index+1).padStart(2,"0")}</span>${historyInline(title)}</a>`).join("");
  })
  .catch(()=>{historyRoot.innerHTML=`<section class="history-section panel"><h2>${document.documentElement.lang==="fr"?"Le registre est momentanément inaccessible":"The ledger is temporarily unavailable"}</h2><p>${document.documentElement.lang==="fr"?"Revenez à la piste et réessayez dans un instant.":"Return to the trail and try again shortly."}</p></section>`});
