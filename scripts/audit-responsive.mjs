// Read-only localhost device/readability audit. Public and synthetic content only.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
const [origin, moduleRoot, outputDirectory, executablePath] = process.argv.slice(2);
assert.ok(origin.startsWith('http://127.0.0.1:'));
const quick = process.argv.includes('--quick');
const edge = process.argv.includes('--edge');
const capture = process.argv.includes('--capture');
const accessibilityOnly = process.argv.includes('--accessibility');
const touch = process.argv.includes('--touch');
const noAxe = process.argv.includes('--no-axe');
const resume = process.argv.includes('--resume');
const portals = process.argv.includes('--portals');
mkdirSync(outputDirectory, { recursive: true });
const { chromium } = createRequire(path.join(moduleRoot, 'package.json'))('playwright');
const browser = await chromium.launch({ headless: true, executablePath });
const routes = portals ? ['/support','/taskboard'] : ['/', '/servers', '/servers/the-great-war', '/servers/survival', '/join', '/rules', '/recovery-guidelines', '/news', '/News', '/__test-only-markdown', '/updates', '/history', '/server-mechanism', '/support', '/taskboard', '/auth/callback', '/__nonexistent-responsive-page'];
const devices = [
  [280,653,'narrow-fold-cover'], [320,740,'small-phone'], [360,800,'phone'], [390,844,'phone-tall'], [430,932,'large-phone'],
  [480,800,'wide-phone'], [540,720,'compact-tablet'], [600,960,'tablet'], [653,720,'fold-open'], [720,720,'fold-square'],
  [768,1024,'tablet-portrait'], [820,1180,'large-tablet'], [912,1368,'tablet-tall'], [1024,768,'tablet-landscape'],
  [1280,720,'compact-laptop'], [1366,768,'laptop'], [1440,900,'desktop'], [1920,1080,'desktop-wide'],
  [2560,1440,'desktop-large'], [740,360,'phone-landscape'], [844,390,'large-phone-landscape'], [1024,600,'short-laptop'],
];
const selected = portals ? devices.filter(([width])=>[280,320,653,768,1366].includes(width)) : touch ? devices.filter(([width])=>[280,390,653,768,1024].includes(width)) : accessibilityOnly ? devices.filter(([width])=>[320,1024].includes(width)) : quick ? devices.filter(([width]) => [280,360,653,768,1024,1366].includes(width)) : edge ? devices.filter(([width]) => [280,390,653,768,1024,1366,1920].includes(width)) : devices;
const filename = portals ? 'portal' : touch ? 'touch' : accessibilityOnly ? 'accessibility' : quick ? 'baseline' : edge ? 'edge' : 'comprehensive';
const resultPath=path.join(outputDirectory,`${filename}-checks.json`);
const previous=resume&&existsSync(resultPath)?JSON.parse(readFileSync(resultPath,'utf8')):null;
// Only Hero/home-action heights changed since the interrupted run. Retain
// successful unaffected cases; recheck both changed routes at every ratio.
const retained=previous?previous.checks.filter(c=>!['/','/__nonexistent-responsive-page'].includes(c.route)&&c.status===c.expected&&c.scrollWidth<=c.width+1&&c.bodyWidth<=c.width+1&&!c.bounds.length&&!c.clipped.length&&!c.small.length&&!c.targets.length).map(c=>({...c,retained:true})):[];
const key=c=>`${c.width}x${c.height}:${c.language}:${c.route}`;
const completed=new Set(retained.map(key));
const checks = [...retained], errors = [], accessibility = [], languageTimingRetries=[];
const axePath = path.resolve('node_modules/axe-core/axe.min.js');
const inspect = () => {
  const label = node => (node.getAttribute('aria-label') || node.textContent || node.id || node.tagName).trim().replace(/\s+/g,' ').slice(0,100);
  const visible = node => { const box = node.getBoundingClientRect(); return box.width > 0 && box.height > 0 && node.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true }); };
  const nodes = [...document.querySelectorAll('header a,header button,main a,main button,main input,main select,main textarea,main summary,footer a,footer summary')].filter(visible);
  const containedScroll = node => { for (let parent=node.parentElement; parent && parent !== document.body; parent=parent.parentElement) { const css=getComputedStyle(parent); if (['auto','scroll'].includes(css.overflowX) && parent.scrollWidth>parent.clientWidth) return true; } return false; };
  const bounds = nodes.filter(node => { const box=node.getBoundingClientRect(); return (box.left < -1 || box.right > innerWidth + 1) && !containedScroll(node); }).map(node => ({label:label(node),tag:node.tagName,rect:node.getBoundingClientRect().toJSON()}));
  const clipped = [...document.querySelectorAll('main h1,main h2,main h3,main h4,main p,main label,main button,main summary,header button,main figcaption')].filter(visible).filter(node => node.clientWidth && node.scrollWidth > node.clientWidth + 2 && !containedScroll(node)).map(node => ({label:label(node),tag:node.tagName,width:node.clientWidth,scrollWidth:node.scrollWidth}));
  const small = [...document.querySelectorAll('header span,main h1,main h2,main h3,main p,main a,main button,main label,main time,main figcaption,main span,footer p')].filter(visible).filter(node => [...node.childNodes].some(child=>child.nodeType===Node.TEXT_NODE && child.textContent.trim())).map(node=>({label:label(node),tag:node.tagName,font:Number.parseFloat(getComputedStyle(node).fontSize)})).filter(item=>item.font>0 && item.font<12);
  const targets = nodes.filter(node => !node.closest('article[id="report-content"]') && (['BUTTON','SUMMARY'].includes(node.tagName) || (node.tagName==='A' && ['block','flex','inline-flex','grid','inline-grid'].includes(getComputedStyle(node).display))) && !node.matches(':disabled')).map(node=>({label:label(node),tag:node.tagName,width:node.getBoundingClientRect().width,height:node.getBoundingClientRect().height,font:Number.parseFloat(getComputedStyle(node).fontSize),radius:getComputedStyle(node).borderRadius})).filter(item=>(innerWidth<1024 || matchMedia('(pointer:coarse)').matches) && (item.width<43.5 || item.height<43.5));
  return {scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,bounds,clipped,small,targets};
};
try {
  const workers=2;
  await Promise.all(Array.from({length:workers},async(_,worker)=>{
    const context = await browser.newContext({ reducedMotion:'reduce',hasTouch:touch });
    const page = await context.newPage();
    page.on('pageerror',error=>errors.push({worker,message:error.message}));
    page.on('console',message=>{if(message.type()==='error' && /hydration|hydrated|didn't match/i.test(message.text()))errors.push({worker,message:message.text()});});
    for(const [width,height,name] of selected.filter((_,index)=>index%workers===worker)) {
      await page.setViewportSize({width,height});
      for(const language of ['ko','en']) for(const route of routes) {
        if(completed.has(key({width,height,language,route})))continue;
        const response = await page.goto(origin+route,{waitUntil:'networkidle'});
        await page.evaluate(()=>document.fonts.ready);
        if(language==='en') {
          await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
          await page.locator('header button[aria-label="Switch to English"]').click();
          try{await page.waitForFunction(()=>document.documentElement?.lang==='en',null,{timeout:3000});}
          catch{
            const diagnostic=await page.evaluate(()=>({url:location.href,language:document.documentElement?.lang,label:document.querySelector('header button[aria-label]')?.getAttribute('aria-label')}));
            languageTimingRetries.push({route,width,height,...diagnostic});
            const retry=page.locator('header button[aria-label="Switch to English"]');
            if(await retry.isVisible())await retry.click();
            await page.waitForFunction(()=>document.documentElement?.lang==='en',null,{timeout:10000});
          }
        }
        const result = await page.evaluate(inspect);
        const expected = route.startsWith('/__nonexistent') ? 404 : 200;
        checks.push({route,language,width,height,name,status:response.status(),expected,...result});
        if(!quick && !edge && !noAxe && [320,1024].includes(width)) {
          await page.addScriptTag({path:axePath});
          const violations = await page.evaluate(async()=> (await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(item=>({id:item.id,impact:item.impact,help:item.help,nodes:item.nodes.map(node=>({target:node.target,summary:node.failureSummary}))})));
          accessibility.push({route,language,width,violations});
        }
        if(capture && language==='en' && [280,653,1366].includes(width) && ['/', '/servers','/join','/rules','/news','/server-mechanism','/support'].includes(route)) {
          await page.screenshot({path:path.join(outputDirectory,`${name}-${route==='/'?'home':route.slice(1)}-en.jpg`),type:'jpeg',quality:78,fullPage:true});
        }
      }
      console.log(`Audited ${name} ${width}×${height}, both languages, ${routes.length} routes.`);
    }
    await context.close();
  }));
} finally {
  const failures=checks.filter(check=>check.status!==check.expected || check.scrollWidth>check.width+1 || check.bodyWidth>check.width+1 || check.bounds.length || check.clipped.length || check.small.length || check.targets.length);
  writeFileSync(resultPath,JSON.stringify({checks,failures,errors,accessibility,retainedChecks:retained.length,newChecks:checks.length-retained.length,languageTimingRetries},null,2));
  console.log(JSON.stringify({checks:checks.length,failures:failures.length,errors:errors.length,smallText:checks.reduce((sum,item)=>sum+item.small.length,0),undersizedTargets:checks.reduce((sum,item)=>sum+item.targets.length,0),axeChecks:accessibility.length,axeViolations:accessibility.reduce((sum,item)=>sum+item.violations.length,0)}));
  console.log(JSON.stringify(failures.slice(0,10).map(({route,width,language,bounds,clipped,scrollWidth})=>({route,width,language,bounds,clipped,scrollWidth}))));
  await browser.close();
  if(failures.length || errors.length || accessibility.some(check=>check.violations.length)) process.exitCode=1;
}
