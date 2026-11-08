'use strict';
(function(){
const $=id=>document.getElementById(id);
const KEY='scimentraVisualStudioContext';
const configs={
 'mind-map':'Mind Map','flashcards':'Flashcards','slide-deck':'Slide Deck',
 'infographic':'Infographic','visual-revision-sheet':'Visual Revision Sheet','educational-gif':'Educational GIF'
};
const tool=new URLSearchParams(location.search).get('tool')||'';
const label=configs[tool]||'Visual Generator';
let session=null;
try{session=JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(e){}
const valid=Boolean(configs[tool]&&session&&session.role==='teacher'&&session.createdAt&&Date.now()-session.createdAt<86400000&&session.className&&session.subject&&session.chapter);
const ctx=valid?session:{schoolName:'',teacherName:'',teacherTitle:'',className:'',board:'',subject:'',chapter:'',topic:''};
$('pageHeading').textContent=label+' Creator';$('toolHeading').textContent=label+' Creator';
$('schoolHeading').textContent=(ctx.schoolName||'Teacher AI Tools')+' · Visual Teaching Studio';
document.title=label+' | Teacher AI Tools';
[ctx.schoolName,ctx.teacherName?ctx.teacherName+' '+(ctx.teacherTitle||''):'',ctx.className,ctx.board,ctx.subject,ctx.chapter,ctx.topic?'Topic: '+ctx.topic:'Whole chapter'].filter(Boolean).forEach(s=>{const item=document.createElement('span');item.className='chip';item.textContent=s;$('contextChips').appendChild(item)});
function say(message,isError){$('status').textContent=message;$('status').className='show '+(isError?'error':'ok')}
if(!valid){say('Please open this generator from Teacher AI Tools after signing in. It needs the school, teacher and lesson details.',true);$('getCode').disabled=true;$('generate').disabled=true}
const basePrompt=[
'You are an expert school teacher, educational illustrator and accurate subject specialist.',
'CLASS AND SCHOOL CONTEXT:',
'School Name: '+(ctx.schoolName||''),
'Teacher: '+(ctx.teacherName||'')+' '+(ctx.teacherTitle||''),
'Class: '+ctx.className,
'Board: '+ctx.board,
'Subject: '+ctx.subject,
'Chapter: '+ctx.chapter,
'Topic: '+(ctx.topic||'Entire chapter'),
'Use the given school name exactly wherever the school name is needed. Never invent any school.',
'Match the specified class, board and chapter. Correct science, mathematics, notation, spellings and labels are essential.',
'Use high-quality clear classroom designs; avoid decorative clutter and childish simplistic sketches.',
'Return ONLY one valid JSON object, optionally inside a single JSON code fence, with no introduction or explanation.',
'Never include JavaScript, external images, remote URLs, iframe, foreignObject or untrusted SVG features.'
].join('\n');
const formatPrompts={
 'mind-map':[
'Return format EXACTLY: {"format":"scimentra-visual-v1","type":"mind-map","title":"Title","nodes":[{"id":"root","label":"Main topic","parent":null,"details":"..."},{"id":"one","label":"First concept","parent":"root","details":"..."}]}',
'Create ONE central root and 12–28 useful nodes. Every other node must have a valid parent ID. IDs unique.',
'Organize major categories and subordinate ideas. Labels short (3–6 words), meaningful, correct. No SVG; the app draws the tree.'
].join('\n'),
 'flashcards':[
'Return format EXACTLY: {"format":"scimentra-visual-v1","type":"flashcards","title":"Title","cards":[{"front":"A question","back":"Accurate answer","category":"Concept"}]}',
'Provide 12–24 useful cards covering definitions, principles, examples, formulas, applications and misconceptions.',
'One concise teachable idea per card, with clear answers. Verify every answer. No HTML.'
].join('\n'),
 'slide-deck':[
'Return format EXACTLY: {"format":"scimentra-visual-v1","type":"slide-deck","title":"Title","slides":[{"title":"Slide title","bullets":["Short point","Second point"],"notes":"Brief teacher explanation"}]}',
'Prepare 8–14 coherent classroom slides: title, objectives, recall, concept explanation, worked examples, practice, misconceptions and recap.',
'3–6 concise bullet points per slide. Ensure all math, science facts and spellings are correct. No images or HTML.'
].join('\n'),
 'infographic':[
'Return format EXACTLY: {"format":"scimentra-visual-v1","type":"infographic","title":"Title","svg":"<svg xmlns='+"'"+'http://www.w3.org/2000/svg'+"'"+' viewBox='+"'"+'0 0 900 1273'+"'"+'>...FULL VECTOR DESIGN...</svg>"}',
'Draw a complete A4 portrait infographic as detailed standalone SVG within the JSON string. Use SINGLE QUOTES for SVG attributes so JSON remains valid.',
'Include a clear information hierarchy, accurate meaningful textbook-like diagrams, well-spaced labels, precise formulas and a beautiful professional visual design.',
'Use only SVG paths, shapes, text, gradients and defs. Keep all content within the viewBox. Do not include external images.'
].join('\n'),
 'visual-revision-sheet':[
'Return format EXACTLY: {"format":"scimentra-visual-v1","type":"visual-revision-sheet","title":"Title","svg":"<svg xmlns='+"'"+'http://www.w3.org/2000/svg'+"'"+' viewBox='+"'"+'0 0 900 1273'+"'"+'>...FULL REVISION SHEET...</svg>"}',
'Create a completed A4 portrait print-ready REVISION SHEET, not a poster or a mind map, as SVG in the JSON string.',
'Use SINGLE QUOTES for SVG attributes. Include only high-value verified concepts, formulae, diagrams, comparison tables and learning reminders relevant to this chapter.',
'Print-ready legible text, safe margins, no overlap, correct notation, no external image links.'
].join('\n'),
 'educational-gif':[
'Return EXACTLY: {"format":"school-gif-v1","title":"Lesson title","baseSvg":"<svg xmlns='+"'"+'http://www.w3.org/2000/svg'+"'"+' viewBox='+"'"+'0 0 900 1200'+"'"+'>...FULL ARTWORK...</svg>","frames":[{"stage":"Stage name","explanation":"A short clear scientific explanation","overlay":"<g>...stage overlay SVG...</g>"}]}',
'Create 6–8 scientifically meaningful animation stages. Draw the original complete detailed accurate vector textbook-style illustration in baseSvg and stage-specific changes in overlays.',
'Place all anatomy, structures, leader lines, titles and labels in y=70..950 and RESERVE y=975..1200 for the explanation banner the app adds.',
'The SAME base SVG is used in every stage; overlays align exactly to base image features. No cartoons, emoji, stick figures, scripts, CSS animations or external files.',
'Keep each explanation under 100 characters. Use SINGLE QUOTES for SVG attributes inside JSON strings.'
].join('\n')
};
$('getCode').addEventListener('click',()=>{
 if(!valid)return;
 const prompt=basePrompt+'\n\nOUTPUT CODE REQUIREMENTS:\n'+formatPrompts[tool];
 const url='https://chatgpt.com/?q='+encodeURIComponent(prompt);
 // Keep ChatGPT in the same browser tab; Back returns to this generator.
 window.location.href=url;
});
const draftKey='scimentraStudioDraft:'+ctx.schoolName+':'+ctx.teacherName+':'+tool;
try{$('codeInput').value=sessionStorage.getItem(draftKey)||''}catch(e){}
$('codeInput').addEventListener('input',()=>{try{sessionStorage.setItem(draftKey,$('codeInput').value.slice(0,950000))}catch(e){}});
let data=null,activeSvg='',imageUrl='',mindNodes=[],collapsed=new Set(),zoom=.78;
let cardsOrder=[],cardIndex=0,cardFlip=false,slideIndex=0,gifFrames=[],gifIndex=0,gifTimer=null,gifPlaying=false;
function stopGif(){if(gifTimer)clearInterval(gifTimer);gifTimer=null;gifPlaying=false}
function reset(){stopGif();for(const id of ['svgArea','mapArea','cardArea','slideArea','gifArea','mapControls','cardControls','slideControls','gifControls'])$(id).style.display='none';$('exports').style.display='none';$('preview').style.display='none'}
$('clearCode').onclick=()=>{$('codeInput').value='';try{sessionStorage.removeItem(draftKey)}catch(e){};reset();say('Code cleared. Paste a new result from ChatGPT.',false)};
function jsonCode(){let s=$('codeInput').value.trim();if(!s)throw Error('Paste the JSON code returned by ChatGPT first.');if(s.length>950000)throw Error('The generated code exceeds the size limit. Ask ChatGPT for a more compact illustration.');
 const tick=String.fromCharCode(96);const fence=new RegExp('^'+tick+'{3}(?:json)?\\s*','i');const endFence=new RegExp('\\s*'+tick+'{3}\\s*$');s=s.replace(fence,'').replace(endFence,'');const a=s.indexOf('{'),b=s.lastIndexOf('}');if(a<0||b<a)throw Error('No JSON object found. Click Get Code and use the exact requested code format.');
 try{return JSON.parse(s.slice(a,b+1))}catch(e){throw Error('Invalid JSON. The code may be incomplete or have unescaped quotes. Ask ChatGPT to correct the JSON, then paste it again.')}}
function filename(s){return String(s||ctx.chapter||label).replace(/[^a-z0-9_\- ]/gi,'').trim().replace(/\s+/g,'_').slice(0,65)||'School_Lesson'}
const forbidden=new Set(['script','foreignobject','iframe','object','embed','image','audio','video','a','use','style','set','animate','animatetransform','animatemotion','mpath','feimage']);
const SAFE_TAGS=new Set(['svg','g','defs','title','desc','path','rect','circle','ellipse','line','polyline','polygon','text','tspan','lineargradient','radialgradient','stop','clippath','mask','pattern','filter','fegaussianblur','feoffset','feblend','fecolormatrix','femerge','femergenode','feflood','fecomposite','marker','symbol']);
function scrub(el){for(const kid of Array.from(el.children)){if(forbidden.has(kid.localName.toLowerCase())||!SAFE_TAGS.has(kid.localName.toLowerCase())){kid.remove();continue}scrub(kid)}
 for(const attr of Array.from(el.attributes)){const n=attr.name.toLowerCase(),v=attr.value;if(n.startsWith('on')||n==='style'||n==='href'||n==='xlink:href'||n==='src'||/javascript:|https?:|data:|@import|expression\s*\(/i.test(v)||(/url\s*\(/i.test(v)&&!/^\s*url\s*\(\s*#[\w.-]+\s*\)\s*$/.test(v)))el.removeAttribute(attr.name)}}
function safeSvg(raw){if(typeof raw!=='string'||raw.length>880000)throw Error('SVG is missing or too large.');const doc=new DOMParser().parseFromString(raw,'image/svg+xml');if(doc.querySelector('parsererror')||doc.documentElement.localName.toLowerCase()!=='svg')throw Error('Invalid SVG. Ask ChatGPT to correct its SVG syntax.');const root=doc.documentElement;scrub(root);root.setAttribute('xmlns','http://www.w3.org/2000/svg');if(!root.getAttribute('viewBox'))root.setAttribute('viewBox','0 0 900 1273');return new XMLSerializer().serializeToString(root)}
function urlForSvg(svg){return URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}))}
function presentSvg(raw){activeSvg=safeSvg(raw);if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=urlForSvg(activeSvg);$('svgImage').src=imageUrl;$('svgArea').style.display='block'}
function tag(parent,name,attrs,text){const e=document.createElementNS('http://www.w3.org/2000/svg',name);Object.entries(attrs||{}).forEach(([k,v])=>e.setAttribute(k,String(v)));if(text!==undefined)e.textContent=String(text);parent.appendChild(e);return e}
function splitText(s,len){const words=String(s||'').trim().split(/\s+/),lines=[];let line='';for(const word of words){if((line+' '+word).trim().length>len&&line){lines.push(line);line=word}else line=(line+' '+word).trim()}if(line)lines.push(line);return lines}
function renderMap(){
 // Measure text in pixels; character counts cannot reliably fit different fonts or words.
 const columnWidth=300, columnGap=130, rowGap=54, textPadding=20, fontSize=18, lineHeight=25;
 const measureCanvas=document.createElement('canvas');
 const measure=measureCanvas.getContext('2d');
 measure.font='700 '+fontSize+'px Arial';
 const nodes=new Map();
 for(const n of mindNodes){
   if(nodes.has(n.id))throw Error('Mind map node IDs must be unique.');
   nodes.set(n.id,{...n,kids:[],lines:[],height:78});
 }
 const roots=[];
 for(const n of nodes.values()){
   if(n.parent===null||n.parent===undefined||n.parent==='')roots.push(n);
   else if(nodes.has(n.parent))nodes.get(n.parent).kids.push(n);
   else throw Error('Mind map parent ID '+n.parent+' does not exist.');
 }
 if(roots.length!==1)throw Error('Mind map requires exactly one root node.');
 function fitLines(label,limit){
   const words=String(label||'').trim().split(/\s+/);
   const result=[];let current='';
   for(const word of words){
     const candidate=current?current+' '+word:word;
     if(measure.measureText(candidate).width<=limit){current=candidate;continue}
     if(current){result.push(current);current=''}
     // Break very long words too; never let even a single word overflow.
     let fragment='';
     for(const ch of word){
       if(fragment&&measure.measureText(fragment+ch).width>limit){result.push(fragment);fragment=ch}
       else fragment+=ch;
     }
     current=fragment;
   }
   if(current)result.push(current);
   return result.length?result:[''];
 }
 let maxHeight=78;
 for(const n of nodes.values()){
   const maxTextWidth=columnWidth-textPadding*2-(n.kids.length?21:0);
   n.lines=fitLines(n.label,maxTextWidth);
   n.height=Math.max(78,n.lines.length*lineHeight+30);
   maxHeight=Math.max(maxHeight,n.height);
 }
 const rowStep=maxHeight+rowGap, topPad=64, leftPad=58;
 let leaves=0,maxDepth=0;
 const positions=new Map(),active=new Set(),visited=new Set();
 function layout(n,depth){
   if(active.has(n.id))throw Error('Circular parent relationship in the mind map.');
   if(visited.has(n.id))throw Error('A mind map node has been linked more than once.');
   active.add(n.id);visited.add(n.id);maxDepth=Math.max(maxDepth,depth);
   const children=collapsed.has(n.id)?[]:n.kids;
   const x=leftPad+depth*(columnWidth+columnGap);
   let centerY;
   if(!children.length){
     centerY=topPad+(leaves+.5)*rowStep;
     leaves++;
   }else{
     children.forEach(child=>layout(child,depth+1));
     const first=positions.get(children[0].id);
     const last=positions.get(children[children.length-1].id);
     centerY=(first.cy+last.cy)/2;
   }
   positions.set(n.id,{x,y:centerY-n.height/2,cy:centerY});
   active.delete(n.id);
 }
 layout(roots[0],0);
 // One SVG exported for the entire mind map; no branches or labels are cropped.
 const width=leftPad*2+(maxDepth+1)*columnWidth+maxDepth*columnGap;
 const height=Math.max(540,topPad*2+leaves*rowStep);
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('xmlns','http://www.w3.org/2000/svg');
 svg.setAttribute('viewBox','0 0 '+width+' '+height);
 svg.setAttribute('width',width);svg.setAttribute('height',height);
 tag(svg,'rect',{width,height,fill:'#f9fcff'});
 const palette=['#1769a8','#16877b','#885cad','#b9673a','#3374ba','#9a5882','#4a8b5f'];
 const branchPalette=new Map();
 function draw(n,depth,color){
   const p=positions.get(n.id),children=collapsed.has(n.id)?[]:n.kids;
   const fill=depth===0?'#143e66':color;
   for(const child of children){
     const c=positions.get(child.id);
     const x0=p.x+columnWidth, x1=c.x, y0=p.cy, y1=c.cy;
     tag(svg,'path',{d:'M'+x0+' '+y0+' C'+(x0+columnGap*.45)+' '+y0+' '+(x1-columnGap*.45)+' '+y1+' '+x1+' '+y1,fill:'none',stroke:color,'stroke-width':3.5,'stroke-linecap':'round'});
   }
   tag(svg,'rect',{x:p.x,y:p.y,width:columnWidth,height:n.height,rx:14,fill});
   // Lines are individually measured to stay within the rectangle, including long technical terms.
   const textCenter=p.x+textPadding+(columnWidth-2*textPadding-(n.kids.length?21:0))/2;
   const lineBlock=n.lines.length*lineHeight;
   const startY=p.cy-lineBlock/2+fontSize/2+lineHeight*.1;
   n.lines.forEach((line,i)=>tag(svg,'text',{
     x:textCenter,y:startY+i*lineHeight,
     'text-anchor':'middle',
     'font-family':'Arial,Helvetica,sans-serif',
     'font-size':fontSize,
     'font-weight':'700',
     fill:'#ffffff'
   },line));
   if(n.kids.length){
     tag(svg,'circle',{cx:p.x+columnWidth-14,cy:p.y+14,r:12,fill:'#eff8ff',stroke:'#c0dceb','stroke-width':1});
     tag(svg,'text',{x:p.x+columnWidth-14,y:p.y+19,'text-anchor':'middle',fill:'#155882','font-family':'Arial','font-size':17,'font-weight':'bold'},collapsed.has(n.id)?'+':'−');
   }
   if(n.details)tag(svg,'title',{},n.details);
   const clickZone=tag(svg,'rect',{x:p.x,y:p.y,width:columnWidth,height:n.height,fill:'transparent'});
   if(n.kids.length)clickZone.addEventListener('click',()=>{if(collapsed.has(n.id))collapsed.delete(n.id);else collapsed.add(n.id);renderMap()});
   children.forEach((child,i)=>draw(child,depth+1,depth===0?palette[i%palette.length]:color));
 }
 draw(roots[0],0,palette[0]);
 const area=$('mapArea');
 area.replaceChildren(svg);
 svg.style.width=Math.round(width*zoom)+'px';
 svg.style.height=Math.round(height*zoom)+'px';
 activeSvg=new XMLSerializer().serializeToString(svg);
 area.style.display='block';$('mapControls').style.display='flex';
}
$('zoomIn').onclick=()=>{zoom=Math.min(2.4,zoom+.15);renderMap()};
$('zoomOut').onclick=()=>{zoom=Math.max(.35,zoom-.15);renderMap()};
$('expandAll').onclick=()=>{collapsed.clear();renderMap()};
function displayCard(){const card=data.cards[cardsOrder[cardIndex]];$('cardBox').classList.toggle('flipped',cardFlip);$('cardCategory').textContent=String(card.category||'Study Card')+(cardFlip?' · Answer':' · Question');$('cardText').textContent=cardFlip?card.back:card.front;$('cardCounter').textContent=(cardIndex+1)+' / '+cardsOrder.length}
$('cardBox').onclick=()=>{cardFlip=!cardFlip;displayCard()};
$('cardBox').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('cardBox').click()}};
$('cardPrev').onclick=()=>{cardIndex=(cardIndex+cardsOrder.length-1)%cardsOrder.length;cardFlip=false;displayCard()};
$('cardNext').onclick=()=>{cardIndex=(cardIndex+1)%cardsOrder.length;cardFlip=false;displayCard()};
$('shuffle').onclick=()=>{for(let i=cardsOrder.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cardsOrder[i],cardsOrder[j]]=[cardsOrder[j],cardsOrder[i]]}cardIndex=0;cardFlip=false;displayCard()};
function displaySlide(){const s=data.slides[slideIndex];$('slideTitle').textContent=s.title;$('slideBullets').replaceChildren();s.bullets.forEach(point=>{const li=document.createElement('li');li.textContent=String(point);$('slideBullets').appendChild(li)});$('slideSchool').textContent=ctx.schoolName;$('slideNumber').textContent=(slideIndex+1)+' / '+data.slides.length;$('slideCounter').textContent='Slide '+(slideIndex+1)+' of '+data.slides.length}
$('slidePrev').onclick=()=>{slideIndex=(slideIndex+data.slides.length-1)%data.slides.length;displaySlide()};
$('slideNext').onclick=()=>{slideIndex=(slideIndex+1)%data.slides.length;displaySlide()};
function canvasFromSVG(svg,w,h){return new Promise((resolve,reject)=>{const img=new Image(),u=urlForSvg(svg);img.onload=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;try{c.getContext('2d').drawImage(img,0,0,w,h);URL.revokeObjectURL(u);resolve(c)}catch(e){URL.revokeObjectURL(u);reject(e)}};img.onerror=()=>{URL.revokeObjectURL(u);reject(Error('The SVG could not be drawn. Ask ChatGPT for simpler, valid standalone SVG.'))};img.src=u})}
function canvasLine(ctx2,text,x,y,maxWidth,maxLines,lineHeight){const words=String(text||'').split(/\s+/);let parts=[],line='';for(const word of words){const next=(line+' '+word).trim();if(ctx2.measureText(next).width>maxWidth&&line){parts.push(line);line=word}else line=next}if(line)parts.push(line);parts.slice(0,maxLines).forEach((row,i)=>ctx2.fillText(row,x,y+i*lineHeight))}
async function buildGif(){gifFrames=[];const base=safeSvg(data.baseSvg);for(let i=0;i<data.frames.length;i++){const frame=data.frames[i];const bd=new DOMParser().parseFromString(base,'image/svg+xml'),od=new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">'+String(frame.overlay||'')+'</svg>','image/svg+xml');if(od.querySelector('parsererror'))throw Error('Frame '+(i+1)+' has invalid SVG overlay code.');scrub(od.documentElement);for(const node of Array.from(od.documentElement.childNodes))bd.documentElement.appendChild(bd.importNode(node,true));const composed=safeSvg(new XMLSerializer().serializeToString(bd.documentElement)),c=await canvasFromSVG(composed,900,1200),g=c.getContext('2d');
 g.fillStyle='#f3f9ff';g.fillRect(0,970,900,230);g.fillStyle='#1768ad';g.fillRect(0,970,900,8);g.fillStyle='#123e68';g.font='bold 26px Arial,sans-serif';canvasLine(g,frame.stage||'Stage '+(i+1),35,1027,825,1,30);g.fillStyle='#2a425b';g.font='21px Arial,sans-serif';canvasLine(g,frame.explanation||'',35,1074,825,3,30);g.fillStyle='#527592';g.font='17px Arial,sans-serif';canvasLine(g,ctx.schoolName,35,1174,825,1,24);gifFrames.push(c)}
 gifIndex=0;$('gifArea').style.display='block';$('gifControls').style.display='flex';displayGif();playGif()}
function displayGif(){if(!gifFrames.length)return;const source=gifFrames[gifIndex],c=$('gifCanvas');c.width=source.width;c.height=source.height;c.getContext('2d').drawImage(source,0,0);$('gifStage').textContent='Stage '+(gifIndex+1)+' / '+gifFrames.length+': '+data.frames[gifIndex].stage}
function playGif(){stopGif();gifPlaying=true;$('gifPlay').textContent='Pause';gifTimer=setInterval(()=>{gifIndex=(gifIndex+1)%gifFrames.length;displayGif()},Number($('gifSpeed').value))}
$('gifPlay').onclick=()=>{if(gifPlaying){stopGif();$('gifPlay').textContent='Play'}else playGif()};
$('gifPrev').onclick=()=>{gifIndex=(gifIndex+gifFrames.length-1)%gifFrames.length;displayGif()};
$('gifNext').onclick=()=>{gifIndex=(gifIndex+1)%gifFrames.length;displayGif()};
$('gifSpeed').oninput=()=>{$('gifSpeedLabel').textContent=(Number($('gifSpeed').value)/1000).toFixed(1)+' s';if(gifPlaying)playGif()};
async function generate(){
 if(!valid)return;$('generate').disabled=true;reset();
 try{
 const result=jsonCode();
 if(tool==='educational-gif'){if(result.format!=='school-gif-v1'||typeof result.baseSvg!=='string'||!Array.isArray(result.frames)||result.frames.length<2||result.frames.length>16||result.frames.some(f=>!f.stage||typeof f.overlay!=='string'))throw Error('GIF must use school-gif-v1 with baseSvg and 2–16 valid frames.');data=result;await buildGif()}
 else{
 if(result.format!=='scimentra-visual-v1'||result.type!==tool)throw Error('Code format or tool type does not match '+label+'. Get the code for this specific tool.');
 data=result;
 if(tool==='mind-map'){if(!Array.isArray(result.nodes)||result.nodes.length<2||result.nodes.length>160||result.nodes.some(n=>!n.id||!n.label))throw Error('Mind map nodes require id, label and parent fields.');mindNodes=result.nodes;collapsed=new Set();zoom=.78;renderMap()}
 else if(tool==='flashcards'){if(!Array.isArray(result.cards)||!result.cards.length||result.cards.length>100||result.cards.some(c=>!c.front||!c.back))throw Error('Flashcards require nonempty front and back text.');cardsOrder=result.cards.map((_,i)=>i);cardIndex=0;cardFlip=false;$('cardArea').style.display='block';$('cardControls').style.display='flex';displayCard()}
 else if(tool==='slide-deck'){if(!Array.isArray(result.slides)||!result.slides.length||result.slides.length>80||result.slides.some(s=>!s.title||!Array.isArray(s.bullets)))throw Error('Slide deck requires slides containing title and bullets arrays.');slideIndex=0;$('slideArea').style.display='block';$('slideControls').style.display='flex';displaySlide()}
 else if(tool==='infographic'||tool==='visual-revision-sheet')presentSvg(result.svg);
 }
 $('preview').style.display='block';$('exports').style.display='flex';const allowed={downloadPng:['mind-map','infographic','visual-revision-sheet'],downloadPdf:['mind-map','flashcards','infographic','visual-revision-sheet'],downloadPptx:['slide-deck'],downloadGif:['educational-gif'],downloadSvg:['mind-map','infographic','visual-revision-sheet']};
 Object.entries(allowed).forEach(([key,types])=>$(key).style.display=types.includes(tool)?'inline-block':'none');
 say('Generated. Review the result and use Download.',false);$('preview').scrollIntoView({behavior:'smooth',block:'start'});
 }catch(e){say(e.message||'Unable to generate. Check the code and retry.',true)}
 finally{$('generate').disabled=false}}
$('generate').onclick=generate;
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000)}
// Dependency-free PDF writer: works offline, even if a CDN or jsPDF fails.
function pdfPage(canvas,landscape,format){
 const jpg=canvas.toDataURL('image/jpeg',0.88);
 if(!jpg.startsWith('data:image/jpeg;base64,'))throw Error('Your browser could not encode the PDF image.');
 const binary=atob(jpg.substring(jpg.indexOf(',')+1));
 const bytes=new Uint8Array(binary.length);
 for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
 const A4=[595.28,841.89],A3=[841.89,1190.55];
 let [pw,ph]=format==='A3'?A3:A4;
 if(landscape)[pw,ph]=[ph,pw];
 return {jpg:bytes,width:canvas.width,height:canvas.height,pw,ph};
}
function savePdfPages(pages,name){
 if(!pages.length)throw Error('Nothing to export as PDF.');
 if(pages.length>80)throw Error('Too many PDF pages. Collapse some mind-map branches or reduce the number of items.');
 const enc=new TextEncoder(),chunks=[],offsets=[0];
 let pos=0;
 function append(buf){const bytes=typeof buf==='string'?enc.encode(buf):buf;chunks.push(bytes);pos+=bytes.length}
 function object(id,head,body,tail){
   offsets[id]=pos;append(id+' 0 obj\n'+head);
   if(body)append(body);
   if(tail)append(tail);
   append('\nendobj\n');
 }
 append('%PDF-1.4\n%Generated by SciMentra Visual Studio\n');
 const count=pages.length,total=2+count*3;
 object(1,'<< /Type /Catalog /Pages 2 0 R >>');
 object(2,'<< /Type /Pages /Count '+count+' /Kids ['+pages.map((_,i)=>(3+i*3)+' 0 R').join(' ')+'] >>');
 for(let i=0;i<count;i++){
   const p=pages[i],pid=3+i*3,iid=pid+1,cid=pid+2,margin=22;
   const scale=Math.min((p.pw-margin*2)/p.width,(p.ph-margin*2)/p.height);
   const w=p.width*scale,h=p.height*scale,x=(p.pw-w)/2,y=(p.ph-h)/2;
   object(pid,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+p.pw+' '+p.ph+'] /Resources << /XObject << /Im0 '+iid+' 0 R >> >> /Contents '+cid+' 0 R >>');
   object(iid,'<< /Type /XObject /Subtype /Image /Width '+p.width+' /Height '+p.height+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+p.jpg.length+' >>\nstream\n',p.jpg,'\nendstream');
   const command='q\n'+w.toFixed(3)+' 0 0 '+h.toFixed(3)+' '+x.toFixed(3)+' '+y.toFixed(3)+' cm\n/Im0 Do\nQ\n';
   object(cid,'<< /Length '+enc.encode(command).length+' >>\nstream\n'+command+'endstream');
 }
 const xref=pos;
 append('xref\n0 '+(total+1)+'\n0000000000 65535 f \n');
 for(let id=1;id<=total;id++)append(String(offsets[id]).padStart(10,'0')+' 00000 n \n');
 append('trailer\n<< /Size '+(total+1)+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF\n');
 download(new Blob(chunks,{type:'application/pdf'}),name);
}
async function drawingCanvas(scale){
 if(!activeSvg)throw Error('Generate a visual before exporting.');
 const doc=new DOMParser().parseFromString(activeSvg,'image/svg+xml');
 const parts=(doc.documentElement.getAttribute('viewBox')||'0 0 900 1273').trim().split(/[,\s]+/).map(Number);
 const w=parts[2]||900,h=parts[3]||1273;
 const factor=Math.min(scale,4800/w,6500/h);
 return canvasFromSVG(activeSvg,Math.max(1,Math.round(w*factor)),Math.max(1,Math.round(h*factor)));
}
function canvasBlob(c){
 return new Promise((resolve,reject)=>c.toBlob(blob=>blob?resolve(blob):reject(Error('Could not export PNG.')),'image/png'));
}
$('downloadPng').onclick=async()=>{
 try{download(await canvasBlob(await drawingCanvas(2)),filename(data.title)+'.png')}
 catch(e){say(e.message||'PNG download failed.',true)}
};
$('downloadSvg').onclick=()=>{
 try{if(!activeSvg)throw Error('Generate SVG first.');download(new Blob([activeSvg],{type:'image/svg+xml'}),filename(data.title)+'.svg')}
 catch(e){say(e.message,true)}
};
async function exportCardsPDF(){
 const pages=[];
 for(let i=0;i<data.cards.length;i++){
   const c=document.createElement('canvas');c.width=1000;c.height=1414;
   const g=c.getContext('2d');
   g.fillStyle='#f6faff';g.fillRect(0,0,c.width,c.height);
   g.fillStyle='#154c7d';g.fillRect(0,0,1000,135);
   g.fillStyle='white';g.font='bold 34px Arial';g.fillText('STUDY FLASHCARD  '+(i+1)+' / '+data.cards.length,55,85);
   g.fillStyle='#153f69';g.font='bold 27px Arial';canvasLine(g,ctx.schoolName,55,205,890,2,33);
   g.font='bold 28px Arial';g.fillText('QUESTION',55,295);
   g.font='bold 35px Arial';canvasLine(g,data.cards[i].front,55,372,880,8,48);
   g.strokeStyle='#bed4e8';g.lineWidth=3;g.beginPath();g.moveTo(55,705);g.lineTo(945,705);g.stroke();
   g.font='bold 28px Arial';g.fillText('ANSWER',55,790);
   g.font='30px Arial';canvasLine(g,data.cards[i].back,55,862,880,11,44);
   pages.push(pdfPage(c,false,'A4'));
 }
 savePdfPages(pages,filename(data.title)+'_Flashcards.pdf');
}
async function exportVisualPDF(){
 const image=await drawingCanvas(1.15);
 const map=tool==='mind-map',pages=[pdfPage(image,map,map?'A3':'A4')];
 if(map&&(image.width>1900||image.height>1300)){
   // Page one is the complete mind map. Additional tiled A3 pages keep every label legible.
   const tw=1700,th=1180,overlap=60;
   const cols=Math.ceil(Math.max(1,image.width-overlap)/(tw-overlap));
   const rows=Math.ceil(Math.max(1,image.height-overlap)/(th-overlap));
   if(cols*rows>70)throw Error('This mind map is too large for one PDF. Collapse some branches and try again.');
   for(let r=0;r<rows;r++)for(let col=0;col<cols;col++){
     const x=col*(tw-overlap),y=r*(th-overlap);
     const w=Math.min(tw,image.width-x),h=Math.min(th,image.height-y);
     const tile=document.createElement('canvas');tile.width=tw;tile.height=th;
     const g=tile.getContext('2d');g.fillStyle='white';g.fillRect(0,0,tw,th);
     g.drawImage(image,x,y,w,h,0,0,w,h);
     pages.push(pdfPage(tile,true,'A3'));
   }
 }
 savePdfPages(pages,filename(data.title)+'.pdf');
}
async function exportSlidesPDF(){
 const pages=[];
 for(const slide of data.slides){
   const c=document.createElement('canvas');c.width=1600;c.height=900;
   const g=c.getContext('2d');g.fillStyle='#f7faff';g.fillRect(0,0,1600,900);
   g.fillStyle='#176bb2';g.fillRect(0,0,1600,15);
   g.fillStyle='#153f6c';g.font='bold 49px Arial';
   canvasLine(g,slide.title,70,125,1450,2,57);
   g.fillStyle='#264967';g.font='34px Arial';
   let ypos=260;
   for(const bullet of slide.bullets.slice(0,10)){
     g.fillStyle='#176bb2';g.beginPath();g.arc(86,ypos-11,6,0,Math.PI*2);g.fill();
     g.fillStyle='#264967';canvasLine(g,bullet,113,ypos,1370,2,47);
     ypos+=78;
   }
   g.fillStyle='#527b9a';g.font='23px Arial';canvasLine(g,ctx.schoolName,70,861,1390,1,24);
   pages.push(pdfPage(c,true,'A4'));
 }
 savePdfPages(pages,filename(data.title)+'_Slides.pdf');
}
function exportGifPDF(){
 const pages=gifFrames.map(frame=>pdfPage(frame,false,'A4'));
 savePdfPages(pages,filename(data.title)+'_Animation_Stages.pdf');
}
$('downloadPdf').onclick=async()=>{
 const button=$('downloadPdf');button.disabled=true;
 try{
   say('Preparing your PDF…',false);
   if(tool==='flashcards')await exportCardsPDF();
   else if(tool==='slide-deck')await exportSlidesPDF();
   else if(tool==='educational-gif')exportGifPDF();
   else await exportVisualPDF();
   say('PDF downloaded successfully.',false);
 }catch(e){say(e.message||'PDF download failed. Please try a smaller output.',true)}
 finally{button.disabled=false}
};
$('downloadPptx').onclick=async()=>{try{if(!window.PptxGenJS)throw Error('PPTX library not loaded. Check internet and refresh this page.');const p=new window.PptxGenJS();p.layout='LAYOUT_WIDE';p.author=ctx.schoolName||'Teacher';p.title=data.title||ctx.chapter;p.subject=ctx.chapter;for(let i=0;i<data.slides.length;i++){const s=data.slides[i],slide=p.addSlide();slide.background={color:'F7FAFE'};slide.addShape(p.ShapeType.rect,{x:0,y:0,w:13.33,h:.13,line:{color:'166CAF'},fill:{color:'166CAF'}});slide.addText(String(s.title),{x:.65,y:.55,w:11.9,h:1.14,fontFace:'Aptos Display',fontSize:32,bold:true,color:'153F6E',margin:0,fit:'shrink'});const rows=s.bullets.map(b=>({text:String(b),options:{bullet:{indent:19},breakLine:true}}));slide.addText(rows,{x:.85,y:1.93,w:11.55,h:4.6,fontSize:s.bullets.length>7?19:23,fontFace:'Aptos',color:'234967',paraSpaceAfterPt:14,margin:0,fit:'shrink',valign:'top'});slide.addText(ctx.schoolName||'',{x:.68,y:7.1,w:9.6,h:.25,fontSize:10,color:'507497',margin:0});slide.addText(String(i+1)+' / '+data.slides.length,{x:11.7,y:7.1,w:.9,h:.25,fontSize:10,color:'507497',margin:0,align:'right'});if(s.notes)slide.addNotes(String(s.notes))}await p.writeFile({fileName:filename(data.title)+'.pptx'})}catch(e){say(e.message||'PPTX export failed.',true)}};
$('downloadGif').onclick=async()=>{if(!gifFrames.length)return;let worker=null;try{if(!window.GIF)throw Error('GIF encoder library did not load. Check internet connection.');$('downloadGif').disabled=true;say('Preparing animated GIF…',false);const response=await fetch('https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js');if(!response.ok)throw Error('Unable to download GIF encoder worker.');worker=URL.createObjectURL(new Blob([await response.text()],{type:'text/javascript'}));const encoder=new GIF({workers:2,quality:12,workerScript:worker,width:900,height:1200,repeat:0});gifFrames.forEach(c=>encoder.addFrame(c,{copy:true,delay:Number($('gifSpeed').value)}));encoder.on('progress',p=>say('Encoding GIF: '+Math.round(p*100)+'%',false));encoder.on('finished',blob=>{download(blob,filename(data.title)+'.gif');say('Animated GIF downloaded.',false);$('downloadGif').disabled=false;setTimeout(()=>URL.revokeObjectURL(worker),10000)});encoder.render()}catch(e){if(worker)URL.revokeObjectURL(worker);$('downloadGif').disabled=false;say(e.message||'GIF export failed.',true)}};
window.addEventListener('pagehide',stopGif);
})();