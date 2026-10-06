'use strict';
const $=id=>document.getElementById(id);
const unitStudents=[['Gayuka Radin','Gamini National College',100],['M.H. Chathuri Sasandra','H/ Sri Lanka Sigapore Friendship College',100],['R.M.Haviru Gathsara','Ranabima Royal College',100],['Dilusha Bimsara','MR Ovitigamuwa Maha Vidyalaya',100],['Thihashi','Anamaduwa C.C',100],['Mahiru Gunawardena','Richmond College',100],['Dithma Gamage','Debaraweva Central College',100],['Savindu Randeav','Siridhamma College',100],['M.S.Sheema',"St. Joseph’s Balika Vidyalaya, Kegalle",100],['Yashika Yashadani','Visakha Vidyalaya Colombo 5',100]];
const tuteStudents=[['B.P. Maheema Methsadee','Anula Vidyalaya Nugegoda',100],['Yashen','Galnewa Center Collage',100],['A.P.Mihika Damsara','Mahinda College',100],['Tesandi Methumya',"St. Lawrence’s Convent",100],['Methuja Tareen Weerasuriya','I Gate College Thalawathugoda',100],['Tinishi Ranudya','Kularathne Central College',100],['Arkam Akiyas','St. Aloysius College, Galle',100],['K.Rehansa Sithewni','Vidura College',100],['K.P.Sandiv Dewnura','Royal College Colo 07',100],['Sarah Perera','Holy Family Wennappuwa',100]];
const toRows=list=>list.map(([name,school,marks])=>({name,school,marks:String(marks)}));
const states={unit:{grade:'08',number:'09',unit:'ස්කන්ධය',topics:'',rows:toRows(unitStudents),sample:true},tute:{grade:'06',number:'03',unit:'',topics:'01 | Time\n02 | Number line\n03 | Estimation and rounding off',rows:toRows(tuteStudents),sample:true}};
let activeView='results';
let mode='unit',ready=false,renderFrame=null;
const backgrounds={},canvas=$('poster');
const getState=()=>states[mode];
const pasteDrafts={unit:{names:'',schools:'',marks:''},tute:{names:'',schools:'',marks:''}};
const validRow=r=>r.name.trim()&&r.school.trim()&&String(r.marks).trim()!==''&&Number.isFinite(Number(r.marks))&&Number(r.marks)>=0&&Number(r.marks)<=100;
const ranked=()=>getState().rows.map((r,i)=>({...r,order:i})).filter(validRow).sort((a,b)=>Number(b.marks)-Number(a.marks)||a.order-b.order).slice(0,10);
function status(message,error=false){$('status').textContent=message;$('status').classList.toggle('error',error);}
function queueRender(){if(renderFrame)cancelAnimationFrame(renderFrame);renderFrame=requestAnimationFrame(()=>{renderFrame=null;draw();});}
function pasteLines(value){
 const lines=value.replace(/\r\n?/g,'\n').split('\n').map(line=>line.trim());
 while(lines.length&&!lines[0])lines.shift();
 while(lines.length&&!lines[lines.length-1])lines.pop();
 return lines;
}
function parsePastedResults(draft){
 const names=pasteLines(draft.names),schools=pasteLines(draft.schools),marks=pasteLines(draft.marks);
 if(!names.length||!schools.length||!marks.length)throw new Error('Paste names, schools and marks into all three boxes.');
 if(names.length!==schools.length||names.length!==marks.length)throw new Error(`Line counts must match: ${names.length} names, ${schools.length} schools, ${marks.length} marks.`);
 return names.map((name,i)=>{
  const school=schools[i],mark=marks[i].replace(/\s*%$/,'').trim();
  if(!name||!school||!mark)throw new Error(`Line ${i+1} has an empty value. Fill that line in all three boxes.`);
  if(name.includes('\t')||school.includes('\t')||mark.includes('\t'))throw new Error(`Line ${i+1} contains multiple columns. Paste one column into each box.`);
  if(name.length>140||school.length>140)throw new Error(`Line ${i+1}: keep names and schools within 140 characters.`);
  if(!/^\d+(?:\.\d+)?$/.test(mark)||Number(mark)>100)throw new Error(`Line ${i+1}: marks must be a number from 0 to 100.`);
  return {name,school,marks:String(Number(mark))};
 });
}
function updatePasteCounts(){for(const key of ['names','schools','marks']){const lines=pasteLines(pasteDrafts[mode][key]);$(`${key}-lines`).textContent=`${lines.length} ${lines.length===1?'line':'lines'}`;}}
function syncPaste(){for(const key of ['names','schools','marks'])$(`paste-${key}`).value=pasteDrafts[mode][key];updatePasteCounts();$('paste-status').textContent='';$('paste-status').classList.remove('error');}
function applyPastedResults(){
 try{const rows=parsePastedResults(pasteDrafts[mode]);getState().rows=rows;getState().sample=false;renderRows();draw();$('paste-status').classList.remove('error');$('paste-status').textContent=`${rows.length} students applied. ${Math.min(rows.length,10)} in the Top 10 preview.`;status('');}
 catch(error){$('paste-status').classList.add('error');$('paste-status').textContent=error.message;}
}
function renderRows(){
 const tbody=$('students');tbody.replaceChildren();
 getState().rows.forEach((row,index)=>{
 const tr=document.createElement('tr'),n=document.createElement('td');n.className='row-number';n.textContent=String(index+1).padStart(2,'0');tr.append(n);
 ['name','school','marks'].forEach(key=>{const td=document.createElement('td'),input=document.createElement('input');input.value=row[key];input.dataset.field=key;input.dataset.row=index;input.setAttribute('aria-label',`Student ${index+1} ${key}`);input.autocomplete='off';
 if(key==='marks'){input.type='number';input.min='0';input.max='100';input.step='0.1';input.placeholder='0';input.className='score-input';input.inputMode='decimal';}else{input.type='text';input.maxLength=140;input.placeholder=key==='name'?'Student name':'School name';}
 input.addEventListener('input',()=>{row[key]=input.value;input.classList.remove('invalid');status('');queueRender();});td.append(input);tr.append(td);});
 const td=document.createElement('td'),btn=document.createElement('button');btn.className='remove-row';btn.textContent='×';btn.setAttribute('aria-label',`Remove student ${index+1}`);btn.addEventListener('click',()=>{getState().rows.splice(index,1);renderRows();draw();});td.append(btn);tr.append(td);tbody.append(tr);
 });
 $('entry-count').textContent=getState().rows.length;$('sample-bar').hidden=!getState().sample;
}
function syncFields(){const s=getState();$('grade').value=s.grade;$('test-number').value=s.number;$('unit-name').value=s.unit;$('topics').value=s.topics;$('unit-field').hidden=mode!=='unit';$('topics-field').hidden=mode!=='tute';$('number-label').textContent=mode==='unit'?'Unit number':'Tute test number';$('template-name').textContent=mode==='unit'?'UNIT TEST TEMPLATE':'TUTE TEST TEMPLATE';$('editor').setAttribute('aria-labelledby',`tab-${mode}`);renderRows();syncPaste();}
function switchMode(next){
 if(!['post','result-template'].includes(next)&&!states[next])throw new Error('Unknown section');
 activeView=next==='post'?'post':next==='result-template'?'result-template':'results';
 $('results-workspace').hidden=activeView!=='results';$('post-workspace').hidden=activeView!=='post';$('rt-workspace').hidden=activeView!=='result-template';
 $('page-title').textContent=activeView==='post'?'Create a class announcement.':activeView==='result-template'?'Create a result template.':'Create a Top 10 result image.';
 $('format-badge').textContent=activeView==='post'?'CLASS POST · 1:1':activeView==='result-template'?'RESULT TEMPLATE · 16:9':'TOP 10 · 16:9';
 document.querySelectorAll('[role=tab]').forEach(el=>{const selected=el.dataset.mode===next;el.setAttribute('aria-selected',String(selected));el.tabIndex=selected?0:-1;});
 if(next==='post'){ClassPost.render();return;}if(next==='result-template'){ResultTemplate.render();return;}
 mode=next;syncFields();status('');draw();
}
document.querySelectorAll('[role=tab]').forEach(btn=>{btn.addEventListener('click',()=>switchMode(btn.dataset.mode));btn.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const choices=['unit','tute','post','result-template'];const index=choices.indexOf(btn.dataset.mode);const next=e.key==='Home'?choices[0]:e.key==='End'?choices.at(-1):choices[(index+(e.key==='ArrowLeft'?-1:1)+choices.length)%choices.length];switchMode(next);$(`tab-${next}`).focus();}});});
for(const [id,key] of [['grade','grade'],['test-number','number'],['unit-name','unit'],['topics','topics']])$(id).addEventListener('input',()=>{getState()[key]=$(id).value;$(id).classList.remove('invalid');status('');queueRender();});
for(const key of ['names','schools','marks'])$(`paste-${key}`).addEventListener('input',()=>{pasteDrafts[mode][key]=$(`paste-${key}`).value;updatePasteCounts();$('paste-status').textContent='';});
$('apply-paste').addEventListener('click',applyPastedResults);
$('add-row').addEventListener('click',()=>{getState().rows.push({name:'',school:'',marks:''});renderRows();draw();const inputs=$('students').querySelectorAll('[data-field=name]');inputs[inputs.length-1].focus();});
$('clear-samples').addEventListener('click',()=>{if(!confirm('Clear the student results in this tab? Test details will be kept.'))return;getState().rows=Array.from({length:10},()=>({name:'',school:'',marks:''}));getState().sample=false;renderRows();draw();$('students').querySelector('input').focus();});
$('quality').addEventListener('change',()=>{$('dimensions').textContent=$('quality').value==='2'?'3840 × 2160 px':'1920 × 1080 px';});
function text(ctx,value,x,y,size,width,color='#000',align='left',family=null){
 value=String(value);const sinhala=/[\u0D80-\u0DFF]/.test(value);if(sinhala){PosterTitles.draw(ctx,value,{x:align==='center'?x-width/2:align==='right'?x-width:x,y:y-size*.9,width,height:size*1.15,maxSize:size,maxLines:1,color,align});return;}ctx.save();ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.font=`${size}px ${family||'Bebas'}`;ctx.fillText(value,x,y,width);ctx.restore();
}
function patch(ctx,img,sx,sy,sw,sh,dx,dy,dw,dh){ctx.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh);}
function draw(target=canvas,scale=1){
 if(!ready)return;target.width=1920*scale;target.height=1080*scale;const ctx=target.getContext('2d');ctx.scale(scale,scale);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 const s=getState(),img=backgrounds[mode],isUnit=mode==='unit';ctx.drawImage(img,0,0,1920,1080);
 // Preserve the supplied artwork; replace only the editable text regions.
 if(isUnit){
 ctx.fillStyle='#fff';ctx.fillRect(130,355,1015,542);
 // Restore the light photographic background underneath the old marks.
 patch(ctx,img,1238,350,2,547,1180,350,58,547);
 // Wrap at word boundaries and size uniformly; never squash title glyphs horizontally.
 ctx.fillStyle='rgb(27,47,91)';ctx.fillRect(475,94,362,115);
 PosterTitles.draw(ctx,s.unit,{x:482,y:97,width:345,height:108,maxSize:110});
 ctx.fillStyle='rgb(27,47,91)';ctx.fillRect(839,164,132,50);text(ctx,`UNIT ${s.number}`,952,205,38,113,'#ffdf00','right');
 ctx.fillStyle='#fff';ctx.fillRect(140,906,290,82);text(ctx,`GRADE ${s.grade}`,151,965,64,290,'#1b2f5b');
 }else{
 ctx.fillStyle='#fff';ctx.fillRect(59,348,1198,523);
 ctx.fillStyle='rgb(129,14,125)';ctx.fillRect(919,92,383,111);
 const topics=s.topics.split('\n').map(t=>t.trim()).filter(Boolean).slice(0,3);
 topics.forEach((topic,i)=>{const title=topic.replace(/\s*\|\s*/,' · ');const top=96+i*35;
 ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(933,top+13,6,0,Math.PI*2);ctx.fill();
 PosterTitles.draw(ctx,title,{x:951,y:top,width:346,height:32,maxSize:23});
 });
 ctx.fillStyle='#fff';ctx.fillRect(64,898,700,126);text(ctx,`TUTE TEST ${s.number}`,82,1005,128,680,'#b6b7bb');
 // Reuse the unlettered strip of the same translucent grade panel.
 if(s.grade!=='06'){ctx.save();ctx.beginPath();ctx.roundRect(1510,942,425,103,30);ctx.clip();patch(ctx,img,1525,945,395,10,1510,942,425,103);ctx.restore();text(ctx,`GRADE ${s.grade}`,1728,1019,81,310,'#fff','center');}
 }
 const rows=ranked();rows.forEach((r,index)=>{const y=(isUnit?406:389)+index*51.75;
 text(ctx,String(index+1).padStart(2,'0'),isUnit?151:70,y,34,47);
 text(ctx,r.name.toUpperCase(),isUnit?213:180,y,33,isUnit?392:460);
 text(ctx,r.school.toUpperCase(),isUnit?623:660,y,33,isUnit?516:503);
 text(ctx,String(Number(r.marks)),isUnit?1209:1217,y,34,65,'#000','center');
 });
 if(target===canvas){$('shown-count').textContent=`${rows.length} in preview${getState().rows.filter(validRow).length>10?' · highest marks':''}`;canvas.setAttribute('aria-label',`${isUnit?'Unit':'Tute'} Test ${s.number}, Grade ${s.grade}, top ${rows.length} students: ${rows.map((r,i)=>`${i+1}. ${r.name}, ${r.school}, ${r.marks} marks`).join('; ')}`);}
}
function validate(){let invalid=null;const s=getState();
 for(const input of $('students').querySelectorAll('input')){input.classList.remove('invalid');const r=s.rows[Number(input.dataset.row)],hasAny=r.name.trim()||r.school.trim()||String(r.marks).trim();if(!hasAny)continue;const field=input.dataset.field;const good=field==='marks'?String(r.marks).trim()!==''&&Number.isFinite(Number(r.marks))&&Number(r.marks)>=0&&Number(r.marks)<=100:!!r[field].trim();if(!good){input.classList.add('invalid');invalid=invalid||input;}}
 if(invalid){status('Complete each student’s name, school and marks (0–100). Blank rows can be left empty.',true);invalid.focus();return false;}
 if(!ranked().length){status('Add at least one student with a name, school and marks.',true);$('students').querySelector('input')?.focus();return false;}
 for(const id of mode==='unit'?['test-number','unit-name']:['test-number','topics']){if(!$(id).value.trim()){$(id).classList.add('invalid');$(id).focus();status('Add the test number and unit details before downloading.',true);return false;}}
 if(mode==='tute'&&s.topics.split('\n').filter(t=>t.trim()).length>3){$('topics').focus();status('Use up to 3 units so every unit fits the template.',true);return false;}
 return true;
}
async function download(){if(activeView==='result-template')return ResultTemplate.download();if(activeView==='post')return ClassPost.download();if(!ready||!validate())return false;const buttons=document.querySelectorAll('.download');buttons.forEach(b=>b.disabled=true);status('Preparing your image…');try{await document.fonts.ready;const output=document.createElement('canvas');draw(output,Number($('quality').value));const blob=await new Promise((resolve,reject)=>output.toBlob(b=>b?resolve(b):reject(new Error('Image export failed')),'image/png'));const url=URL.createObjectURL(blob),a=document.createElement('a');const s=getState();a.href=url;a.download=`IMOS-${mode}-test-${s.number}-grade-${s.grade}-top-10.png`.replace(/[/\\:*?"<>|]/g,'-');document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);status('Your PNG is ready. Check your downloads.');return true;}catch(e){status('The image could not be downloaded. Please try again.',true);return false;}finally{buttons.forEach(b=>b.disabled=false);}}
document.querySelectorAll('.download').forEach(btn=>btn.addEventListener('click',download));
for(const id of ['result-font','post-font'])$(id).addEventListener('change',async()=>{const font=$(id).value;PosterTitles.setFont(font);$('result-font').value=$('post-font').value=font;await PosterTitles.loadFonts();draw();ClassPost.render();});
async function init(){syncFields();try{await Promise.all(['unit','tute'].map(type=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{backgrounds[type]=img;resolve();};img.onerror=()=>reject(new Error('Template unavailable'));img.src=`assets/${type}-reference.png`;})));await Promise.all([document.fonts.load('32px Bebas'),document.fonts.load('16px Manrope'),document.fonts.load('600 20px Manrope'),PosterTitles.loadFonts()]);ready=true;$('loading').hidden=true;document.querySelectorAll('.download').forEach(b=>b.disabled=false);draw();}catch(e){$('loading').textContent='Could not load the template. Please reload this page.';status('Some template files could not be loaded. Please reload and try again.',true);}}
init();
