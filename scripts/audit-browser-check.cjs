// Run against `next start -p 3002`; verifies actual production rendering and controls.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.AUDIT_URL || 'http://localhost:3002';
const out = path.resolve(process.env.AUDIT_OUTPUT_DIR || '.impeccable/review/audit');
fs.mkdirSync(out, {recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
  for(const reducedMotion of ['no-preference','reduce']){
   const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion});
   const page=await context.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{
    window.auditDraws=new WeakMap();
    for(const type of [WebGLRenderingContext,WebGL2RenderingContext]) {
     for(const method of ['drawElements','drawArrays']) {
      const original=type.prototype[method];
      type.prototype[method]=function(...args){window.auditDraws.set(this.canvas,(window.auditDraws.get(this.canvas)||0)+1);return original.apply(this,args)};
     }
    }
   });
   await page.goto(base);
   await page.getByRole('button',{name:'Decline optional',exact:true}).click();
   await page.locator('.horse-engraving canvas').waitFor();
   await page.waitForTimeout(4000);
   if(reducedMotion==='no-preference') await page.getByRole('button',{name:'Pause animations',exact:true}).first().click();
   await page.waitForTimeout(500);
   const horse=page.locator('.horse-engraving canvas');
   const before=await horse.screenshot();
   await page.getByRole('button',{name:'Rotate horse right',exact:true}).press('Enter');
   await page.waitForTimeout(300);
   assert(!before.equals(await horse.screenshot()),'Keyboard horse rotation must change artwork');
   await page.getByRole('button',{name:'Reset horse',exact:true}).click();
   await page.screenshot({path:path.join(out,`hero-${reducedMotion}.png`)});
   await page.locator('#models').scrollIntoViewIfNeeded();
   await page.locator('#models canvas').waitFor();
   await page.waitForFunction(()=>!document.querySelector('#models')?.textContent.includes('Loading '),{},{timeout:45000});
   await page.waitForTimeout(1000);
   const models=page.locator('#models canvas');
   const modelBefore=await models.screenshot();
   await page.getByLabel('Model',{exact:true}).selectOption('1');
   await page.getByRole('button',{name:'Rotate selected model right'}).press('Enter');
   await page.waitForTimeout(300);
   assert(!modelBefore.equals(await models.screenshot()),'Keyboard model rotation must change artwork');
   await page.getByRole('button',{name:'Remove model',exact:true}).press('Enter');
   assert((await page.locator('#models [role="status"]').innerText()).includes('removed'));
   await page.getByRole('button',{name:'Reset models',exact:true}).press('Enter');
   await page.waitForTimeout(700);
   const count=()=>page.evaluate(()=>window.auditDraws.get(document.querySelector('#models canvas'))||0);
   const pausedCount=await count();await page.waitForTimeout(600);
   assert.equal(await count(),pausedCount,'Paused models must not continuously render');
   await page.screenshot({path:path.join(out,`models-${reducedMotion}.png`)});
   if(reducedMotion==='no-preference'){
    await page.getByRole('button',{name:'Resume animations',exact:true}).last().click();
    const runningCount=await count();await page.waitForTimeout(600);
    assert((await count())>runningCount,'Resume must restart rendering');
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await page.waitForTimeout(800);const offscreenCount=await count();await page.waitForTimeout(600);
    assert.equal(await count(),offscreenCount,'Offscreen models must stop rendering');
    await page.getByRole('button',{name:'Pause animations',exact:true}).first().click();
    assert.equal(await page.locator('.work-marquee-track').evaluate(e=>getComputedStyle(e).animationPlayState),'paused');
    await page.reload();await page.getByRole('button',{name:'Resume animations',exact:true}).first().waitFor();
   }
   await page.goto(base+'/quote');
   await page.getByRole('button',{name:'Continue',exact:true}).click();
   await page.waitForFunction(()=>document.activeElement?.id==='name');
   assert.equal(await page.locator('#name').getAttribute('aria-invalid'),'true');
   assert.equal(await page.locator('#name').getAttribute('aria-describedby'),'name-error');
   assert.equal(await page.locator('#email').getAttribute('aria-describedby'),'email-error');
   assert.equal(await page.locator('#name').getAttribute('required'),'');
   assert.equal(errors.length,0,errors.join('\n'));
   console.log('PASS',reducedMotion,'keyboard rotation, removal/reset, pause, frame gating, form errors');
   await context.close();
  }
  const page=await browser.newPage();await page.goto(base);
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:1000});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow at ${width}`);
   if(width===1440) {await page.waitForTimeout(3000);await page.screenshot({path:path.join(out,'desktop-after.png')});}
  }
  console.log('PASS responsive widths 320,390,768,1440');
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
