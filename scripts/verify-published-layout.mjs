// DOM-only future published-state layout fixture. Registry data stays unchanged.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const [origin,moduleRoot,outputDirectory,executablePath]=process.argv.slice(2);
assert.ok(origin.startsWith('http://127.0.0.1:'));
const {chromium}=createRequire(path.join(moduleRoot,'package.json'))('playwright');
const browser=await chromium.launch({headless:true,executablePath});
const checks=[];
try{
  const page=await browser.newPage({reducedMotion:'reduce'});
  for(const width of [280,653,1024,1366])for(const language of ['ko','en']){
    await page.setViewportSize({width,height:900});
    await page.goto(origin+'/join',{waitUntil:'networkidle'});
    if(language==='en')await page.locator('header button[aria-label="Switch to English"]').click();
    const result=await page.evaluate(()=>{
      const sheetText=[...document.styleSheets].map(sheet=>[...sheet.cssRules].map(rule=>rule.cssText).join('\n')).join('\n');
      const cls=name=>sheetText.match(new RegExp('\\.(policy_'+name+'__[\\w-]+)'))[1];
      const panel=document.querySelector('[class*="policy_serverPanel__"]');
      const wrapper=document.createElement('div');wrapper.className=cls('connectionValues');
      const value=document.createElement('div');value.className=cls('copyValue');
      value.innerHTML='<span>TEST ONLY — Server address</span><code>long-published-layout-fixture.example.test</code><button type="button">Copy server address</button><div role="status"><label>TEST ONLY — Manual copy fallback<input readonly aria-label="Manual copy fixture" value="long-published-layout-fixture.example.test" /></label></div>';
      wrapper.append(value);panel.append(wrapper);
      const css=getComputedStyle(panel),button=value.querySelector('button'),input=value.querySelector('input');
      const inner=panel.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight);
      input.focus();input.select();
      return {panelInnerWidth:inner,wrapperWidth:wrapper.getBoundingClientRect().width,buttonHeight:button.getBoundingClientRect().height,buttonRadius:getComputedStyle(button).borderRadius,buttonBackground:getComputedStyle(button).backgroundColor,inputFont:parseFloat(getComputedStyle(input).fontSize),selected:input.selectionEnd===input.value.length,overflow:document.documentElement.scrollWidth>innerWidth+1};
    });
    assert.ok(Math.abs(result.panelInnerWidth-result.wrapperWidth)<2,'Published controls span the full panel');
    assert.ok(result.buttonHeight>=44&&result.buttonRadius==='8px'&&result.buttonBackground==='rgb(17, 17, 17)');
    assert.ok(result.inputFont>=16&&result.selected&&!result.overflow);
    checks.push({width,language,...result});
  }
  await page.setViewportSize({width:280,height:900});
  await page.goto(origin+'/__test-only-markdown',{waitUntil:'networkidle'});
  for(const selector of ['#report-content pre','#report-content table']){
    const region=page.locator(selector);await region.focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(selector=>document.querySelector(selector).scrollLeft>0,selector);
    checks.push({case:'Keyboard scroll',selector,passed:true});
  }
  console.log(`Passed ${checks.length} future connection layout and keyboard scroll checks.`);
}finally{writeFileSync(path.join(outputDirectory,'published-layout-checks.json'),JSON.stringify({fixture:'DOM-only test markup using the real CSS; no registry or backend mutation.',checks},null,2));await browser.close();}
