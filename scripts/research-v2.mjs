import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const out = 'output/lab-v2/research';
await mkdir(out, {recursive:true});
const browser = await chromium.launch({headless:true, channel:'chrome'});
const urls = ['https://pudding.cool/','https://neal.fun/','https://tympanus.net/codrops/hub/','https://www.hoverstat.es/','https://rauno.me/craft','https://studionamma.com/','https://akaru.fr/','https://lyra.horse/','https://maggieappleton.com/garden','https://www.fffuel.co/','https://ui.shadcn.com/','https://reactbits.dev/','http://localhost:3100'];
const results=[];
for(let i=0;i<urls.length;i+=3) await Promise.all(urls.slice(i,i+3).map(async(url,j)=>{
 const p=await browser.newPage({viewport:{width:1440,height:1000}});
 const id=String(i+j).padStart(2,'0');
 try {await p.goto(url,{waitUntil:'domcontentloaded',timeout:25000});await p.waitForTimeout(2200);await p.screenshot({path:`${out}/${id}-desktop.png`});
 const links=await p.locator('a').evaluateAll(nodes=>nodes.slice(0,20).map(n=>({text:n.textContent?.trim().slice(0,65),href:n.href})));
 await p.mouse.move(900,400);await p.mouse.wheel(0,650);await p.waitForTimeout(1000);await p.screenshot({path:`${out}/${id}-scrolled.png`});
 await p.setViewportSize({width:390,height:844});await p.goto(url,{waitUntil:'domcontentloaded',timeout:20000});await p.waitForTimeout(1000);await p.screenshot({path:`${out}/${id}-mobile.png`});
 results.push({url,id,title:await p.title(),links,status:'rendered'});console.log(id,url,'rendered');
 }catch(e){results.push({url,id,status:'inaccessible',error:e.message});console.log(id,url,e.message.slice(0,100));}finally{await p.close();}
}));
await writeFile(`${out}/sources.json`,JSON.stringify(results,null,2));await browser.close();
