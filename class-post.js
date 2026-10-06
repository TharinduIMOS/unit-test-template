'use strict';
const ClassPost=(()=>{
 const el=id=>document.getElementById(id),canvas=el('post-canvas');
 const state={grade:'06',day:'today',medium:'si',unit:'දත්ත රැස්කිරීම හා නිරූපණය',time:'15:30',quality:1};
 const defaults={grade:{x:198,y:737,width:370,height:67,size:62,align:'center'},unit:{x:198,y:815,width:370,height:91,size:48,align:'center'},day:{x:198,y:924,width:370,height:40,size:49,align:'center'},time:{x:198,y:975,width:370,height:39,size:45,align:'center'}};
 const layout=JSON.parse(JSON.stringify(defaults));
 let selected='unit';
 const bounds={x:[0,960],y:[0,1050],width:[120,1000],height:[30,240],size:[14,140]};
 function syncLayout(){const block=layout[selected];for(const key of Object.keys(bounds)){const max=key==='x'?1080-block.width:key==='y'?1080-block.height:bounds[key][1];for(const suffix of ['','-number']){const input=el(`layout-${key}${suffix}`);input.min=key==='height'&&selected==='unit'?54:bounds[key][0];input.max=max;input.value=block[key];}}el('layout-align').value=block.align;}
 function changeLayout(key,value){const n=Number(value);if(value===''||!Number.isFinite(n)){syncLayout();return;}const block=layout[selected];block[key]=Math.round(Math.max(key==='height'&&selected==='unit'?54:bounds[key][0],Math.min(bounds[key][1],n)));block.x=Math.min(block.x,1080-block.width);block.y=Math.min(block.y,1080-block.height);syncLayout();say('');render();}
 function drawBlock(ctx,text,block,{boxed=false,grade=false}={}){let {x,y,width,height,size,align}=block;
  if(boxed){ctx.fillStyle='#fff';ctx.beginPath();ctx.roundRect(x,y,width,height,Math.min(26,height/3));ctx.fill();x+=16;y+=12;width-=32;height-=24;}
  if(grade){ctx.save();ctx.textBaseline='alphabetic';ctx.textAlign='left';ctx.fillStyle='#fff';let m;do{ctx.font=`800 ${size}px Manrope`;m=ctx.measureText(text);if(m.width<=width&&m.actualBoundingBoxAscent+m.actualBoundingBoxDescent<=height)break;size--;}while(size>1);const inkWidth=m.actualBoundingBoxLeft+m.actualBoundingBoxRight;const offset=align==='center'?(width-inkWidth)/2:align==='right'?width-inkWidth:0;ctx.fillText(text,x+offset+m.actualBoundingBoxLeft,y+(height-m.actualBoundingBoxAscent-m.actualBoundingBoxDescent)/2+m.actualBoundingBoxAscent);ctx.restore();return;}
  PosterTitles.draw(ctx,text,{x,y,width,height,maxSize:size,align,maxLines:boxed?2:1,color:boxed?'#303638':'#fff'});
 }
 let ready=false,reference=null,background=null,logo=null,qualifications=null,sourceKind='template',uploadVersion=0;
 function say(message,error=false){el('post-status').textContent=message;el('post-status').classList.toggle('error',error);}
 function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Could not load this image.'));im.src=src;});}
 function extractWhite(x,y,w,h){const out=document.createElement('canvas');out.width=w;out.height=h;const c=out.getContext('2d');c.drawImage(reference,x,y,w,h,0,0,w,h);const data=c.getImageData(0,0,w,h);for(let i=0;i<data.data.length;i+=4){const value=Math.min(data.data[i],data.data[i+1],data.data[i+2]);data.data[i]=data.data[i+1]=data.data[i+2]=255;data.data[i+3]=Math.max(0,Math.min(255,(value-155)*2.55));}c.putImageData(data,0,0);return out;}
 function cover(ctx,img){const scale=Math.max(1080/img.width,1080/img.height),w=img.width*scale,h=img.height*scale;ctx.drawImage(img,(1080-w)/2,(1080-h)/2,w,h);}
 function timeLabel(value,medium=state.medium){if(!/^\d{2}:\d{2}$/.test(value))return '';const [h,m]=value.split(':').map(Number);if(h>23||m>59)return '';const digits=`${h%12||12}:${String(m).padStart(2,'0')}`;if(medium==='en')return `${digits} ${h<12?'AM':'PM'}`;const period=h<12?'උදෑසන':h<15?'දහවල්':h<18?'සවස':'රාත්‍රී';return `${period} ${digits.replace(':','.')}ට`;}
 function render(target=canvas,scale=1){if(!ready)return;target.width=1080*scale;target.height=1080*scale;const ctx=target.getContext('2d');ctx.scale(scale,scale);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';cover(ctx,background||reference);
 const shade=ctx.createLinearGradient(0,505,0,735);shade.addColorStop(0,'rgba(17,17,17,0)');shade.addColorStop(1,'#111');ctx.fillStyle=shade;ctx.fillRect(0,505,1080,230);ctx.fillStyle='#111';ctx.fillRect(0,735,1080,345);
 if(sourceKind!=='template')ctx.drawImage(logo,890,87,145,76);
 // Copy only the two coloured nameplates; exclude the photo/shadow around them.
 ctx.drawImage(reference,594,802,346,88,594,802,346,88);
 ctx.drawImage(reference,693,773,150,44,693,773,150,44);
 ctx.drawImage(qualifications,593,903,352,39);
 drawBlock(ctx,`GRADE ${state.grade}`,layout.grade,{grade:true});
 drawBlock(ctx,state.unit,layout.unit,{boxed:true});
 const day=state.medium==='en'?(state.day==='today'?'TODAY':'TOMORROW'):(state.day==='today'?'අද':'හෙට');
 drawBlock(ctx,day,layout.day);
 drawBlock(ctx,timeLabel(state.time),layout.time);
 if(target===canvas){el('post-image-caption').textContent=sourceKind==='uploaded'?'Your uploaded image':'Template image';canvas.setAttribute('aria-label',`Grade ${state.grade}, ${state.unit}, ${day}, ${timeLabel(state.time)}`);}
 }
 async function download(){if(!ready)return false;if(!state.unit.trim()||!timeLabel(state.time)){say('Enter a unit name and valid class time.',true);return false;}const button=el('download-post');button.disabled=true;try{await document.fonts.ready;const out=document.createElement('canvas');render(out,state.quality);const blob=await new Promise((resolve,reject)=>out.toBlob(b=>b?resolve(b):reject(new Error('Export failed')),'image/png'));const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`IMOS-Grade-${state.grade}-${state.medium}-${state.day}-${state.time.replace(':','')}-Class-Post.png`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);say('Your class post is ready. Check your downloads.');return true;}catch(e){say('Could not download the post. Please try again.',true);return false;}finally{button.disabled=false;}}
 for(const [id,key] of [['post-grade','grade'],['post-day','day'],['post-medium','medium'],['post-unit','unit'],['post-time','time'],['post-quality','quality']])el(id).addEventListener('input',()=>{state[key]=key==='quality'?Number(el(id).value):el(id).value;el('post-dimensions').textContent=state.quality===2?'2160 × 2160 px':'1080 × 1080 px';say('');render();});
 el('layout-target').addEventListener('change',()=>{selected=el('layout-target').value;syncLayout();});
 el('layout-align').addEventListener('change',()=>{layout[selected].align=el('layout-align').value;render();});
 for(const key of Object.keys(bounds)){el(`layout-${key}`).addEventListener('input',()=>changeLayout(key,el(`layout-${key}`).value));el(`layout-${key}-number`).addEventListener('change',()=>changeLayout(key,el(`layout-${key}-number`).value));}
 el('layout-reset').addEventListener('click',()=>{layout[selected]={...defaults[selected]};syncLayout();render();say('Selected text block reset.');});
 el('layout-reset-all').addEventListener('click',()=>{for(const key of Object.keys(defaults))layout[key]={...defaults[key]};syncLayout();render();say('All text positions reset.');});
 syncLayout();
 el('download-post').addEventListener('click',download);
 el('post-reset-image').addEventListener('click',()=>{uploadVersion++;background=reference;sourceKind='template';el('post-image-upload').value='';render();say('Template image restored.');});
 el('post-image-upload').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;const version=++uploadVersion;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>15*1024*1024){say('Choose a PNG, JPEG or WebP smaller than 15 MB.',true);return;}const url=URL.createObjectURL(file);try{const image=await loadImage(url);if(version!==uploadVersion)return;background=image;sourceKind='uploaded';render();say('Your image is now in the post.');}catch(e){say(e.message,true);}finally{URL.revokeObjectURL(url);}});
 async function init(){try{const loaded=await Promise.all([loadImage('assets/class-post-reference.png'),document.fonts.load('800 70px Manrope'),PosterTitles.loadFonts(),document.fonts.load('400 50px Bebas')]);reference=loaded[0];background=reference;logo=extractWhite(890,87,145,76);qualifications=extractWhite(593,903,352,39);ready=true;el('post-loading').hidden=true;el('download-post').disabled=false;render();}catch(e){el('post-loading').textContent='Could not load the template. Reload to try again.';say('The class post template could not be loaded.',true);}}
 init();return {render,download,timeLabel};
})();
