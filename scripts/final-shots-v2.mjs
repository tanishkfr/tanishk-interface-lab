import {chromium} from 'playwright';
const b=await chromium.launch({headless:true,channel:'chrome'});const p=await b.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
await p.goto('http://127.0.0.1:3300',{waitUntil:'networkidle'});await p.screenshot({path:'output/lab-v2/screenshots/home-hero-1440.png'});
await p.getByRole('button',{name:'Index',exact:true}).click();await p.locator('#collection').scrollIntoViewIfNeeded();await p.screenshot({path:'output/lab-v2/screenshots/index-1440.png'});
await p.setViewportSize({width:390,height:844});await p.goto('http://127.0.0.1:3300/play/type-has-mass',{waitUntil:'networkidle'});await p.screenshot({path:'output/lab-v2/screenshots/type-has-mass-390.png',fullPage:true});
await b.close();
