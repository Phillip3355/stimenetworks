// Local read-only checks: short drawers, fold resizing and enlarged prose.
import assert from 'node:assert/strict';
import { mkdirSync,writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const [origin,moduleRoot,outputDirectory,executablePath] = process.argv.slice(2);
assert.ok(origin.startsWith('http://127.0.0.1:'));
mkdirSync(outputDirectory,{recursive:true});
const { chromium }=createRequire(path.join(moduleRoot,'package.json'))('playwright');
const browser=await chromium.launch({headless:true,executablePath});
const checks=[],failures=[],errors=[],writes=[];
const context=await browser.newContext({reducedMotion:'reduce'});
const page=await context.newPage();
page.on('pageerror',error=>errors.push(error.message));
await page.route(origin+'/api/**',async route=>{
  if(route.request().method()!=='GET'){writes.push(route.request().url());return route.abort();}
  return route.continue();
});
const inspect=()=>{
  const visible=node=>node.checkVisibility({checkVisibilityCSS:true,checkOpacity:true})&&node.getBoundingClientRect().width>0;
  const label=node=>(node.id||node.textContent).trim().slice(0,90);
  const scrollParent=node=>{for(let p=node.parentElement;p&&p!==document.body;p=p.parentElement){if(['auto','scroll'].includes(getComputedStyle(p).overflowX)&&p.scrollWidth>p.clientWidth)return true;}return false;};
  return {
    overflow:document.documentElement.scrollWidth>innerWidth+1,
    bounds:[...document.querySelectorAll('main button,main input,main select,main textarea,dialog button,dialog input,dialog textarea,dialog select,[role="dialog"] button')].filter(visible).filter(node=>{const r=node.getBoundingClientRect();return (r.left< -1||r.right>innerWidth+1)&&!scrollParent(node);}).map(label),
    clipped:[...document.querySelectorAll('main h1,main h2,main h3,main h4,main p,main label,main button,main span,main figcaption,main li')].filter(visible).filter(node=>node.clientWidth&&node.scrollWidth>node.clientWidth+2&&!scrollParent(node)).map(label),
  };
};
const record=async data=>{const result=await page.evaluate(inspect);const check={...data,...result};checks.push(check);if(result.overflow||result.bounds.length||result.clipped.length)failures.push(check);};
const navigate=async(route,language)=>{await page.goto(origin+route,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);if(language==='en')await page.locator('header button[aria-label="Switch to English"]').click();};
try{
  for(const [width,height] of [[280,653],[320,740],[390,330],[653,360],[740,360],[844,390]])for(const language of ['ko','en']){
    await page.setViewportSize({width,height});
    await navigate('/support',language);
    const trigger=page.getByRole('button',{name:/^(비회원 문의하기|Guest Inquiry)$/});
    await trigger.click();
    const dialog=page.locator('dialog[open]');
    await dialog.waitFor();
    const checkDialog=async state=>{
      const r=await dialog.boundingBox();
      assert.ok(r.x>=-1&&r.y>=-1&&r.x+r.width<=width+1&&r.y+r.height<=height+1,'Dialog fits short viewport');
      const inputs=await dialog.locator('input,textarea,select').evaluateAll(nodes=>nodes.map(node=>parseFloat(getComputedStyle(node).fontSize)));
      assert.ok(inputs.every(size=>size>=16),'Inputs remain legible without automatic mobile zoom');
      await record({case:'guest drawer',width,height,language,state});
    };
    await checkDialog('choice');
    await dialog.getByRole('button',{name:/문의 시작하기|Start an inquiry/}).click();
    await dialog.locator('#guest-inquiry-nickname').waitFor();
    const submit=dialog.getByRole('button',{name:/문의 전송하기|Send inquiry/});
    await submit.scrollIntoViewIfNeeded();
    const submitBox=await submit.boundingBox();
    assert.ok(submitBox.y>=0&&submitBox.y+submitBox.height<=height+1,'Last action is reachable without submission');
    await checkDialog('create form');
    await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
    assert.ok(await trigger.evaluate(node=>node===document.activeElement),'Focus returns from dialog');
    await trigger.click();
    await dialog.getByRole('button',{name:/문의 조회하기|Find an inquiry/}).click();
    await dialog.locator('#guest-inquiry-lookup-code').waitFor();
    await checkDialog('lookup form');
    await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
    await page.getByRole('button',{name:/메뉴 열기|Open menu/}).click();
    const menu=page.getByRole('dialog',{name:/전체 메뉴|Site menu/});await menu.waitFor();
    await record({case:'menu',width,height,language});
    await page.keyboard.press('Shift+Tab');
    assert.ok(await menu.evaluate(node=>node.contains(document.activeElement)),'Menu traps keyboard focus');
    await page.keyboard.press('Escape');await menu.waitFor({state:'hidden'});
    console.log(`Checked short drawers/menu ${width}×${height} ${language}.`);
  }
  await navigate('/','en');
  for(const width of [280,653,280]){
    await page.setViewportSize({width,height:720});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    if(!await page.getByRole('dialog',{name:'Site menu'}).isVisible())await page.getByRole('button',{name:'Open menu',exact:true}).click();
    await record({case:'fold resize with menu open',width});
  }
  await page.keyboard.press('Escape');
  const routes=['/','/servers','/servers/the-great-war','/servers/survival','/join','/rules','/recovery-guidelines','/news','/News','/__test-only-markdown','/updates','/history','/server-mechanism','/support','/taskboard','/auth/callback','/__nonexistent-responsive-page'];
  for(const width of [390,1366])for(const language of ['ko','en'])for(const route of routes){
    await page.setViewportSize({width,height:900});await navigate(route,language);
    await page.evaluate(()=>{
      const textNodes=[...document.querySelectorAll('main *')].filter(node=>[...node.childNodes].some(child=>child.nodeType===Node.TEXT_NODE&&child.textContent.trim()));
      const sizes=textNodes.map(node=>[node,parseFloat(getComputedStyle(node).fontSize)]);
      for(const [node,size]of sizes)node.style.fontSize=`${size*2}px`;
    });
    await record({case:'200 percent prose and controls',width,language,route});
  }
  assert.deepEqual(writes,[]);
}finally{
  writeFileSync(path.join(outputDirectory,'responsive-interactions.json'),JSON.stringify({checks,failures,errors,writes},null,2));
  console.log(JSON.stringify({checks:checks.length,failures:failures.length,errors,writes}));
  await browser.close();
  if(failures.length||errors.length)process.exitCode=1;
}
