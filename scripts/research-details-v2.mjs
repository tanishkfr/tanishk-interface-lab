import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,channel:'chrome'});const results=[];
for(const [name,url] of [['repeat','https://www.fffuel.co/rrrepeat/'],['css-clicker','https://lyra.horse/css-clicker/'],['shadcn-install','https://ui.shadcn.com/docs/installation'],['patatap','https://patatap.com/'],['bruno','https://bruno-simon.com/']]){
 const p=await browser.newPage({viewport:{width:1440,height:1000}});
 try{await p.goto(url,{waitUntil:'domcontentloaded',timeout:25000});await p.waitForTimeout(2500);await p.screenshot({path:`output/lab-v2/research/detail-${name}.png`});let action='Observed rendered layout and scrolled';
 if(await p.locator('input[type=range]').count()){await p.locator('input[type=range]').first().focus();await p.keyboard.press('ArrowRight');action='Changed the first range with keyboard input';}else if(name==='patatap'){await p.keyboard.press('a');action='Pressed A to trigger an audiovisual event';}else if(name==='bruno'){await p.keyboard.press('ArrowUp');action='Pressed ArrowUp on the rendered page; no driving claim without observing the scene';}else await p.mouse.wheel(0,650);
 await p.waitForTimeout(1000);await p.screenshot({path:`output/lab-v2/research/detail-${name}-after.png`});results.push({url,name,title:await p.title(),action,body:(await p.locator('body').innerText()).slice(0,1500)});console.log(name,action);
 }catch(e){results.push({url,name,error:e.message});console.log(name,e.message.slice(0,120))}finally{await p.close()}
}
await browser.close();await writeFile('output/lab-v2/research/details.json',JSON.stringify(results,null,2));
