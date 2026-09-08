import assert from 'node:assert/strict';
import test from 'node:test';
import { subtractRectangle, unionSurfaces } from '../app/components/home/surface-union.mjs';
import { chapterOpacity, networkCell, shouldAnimate } from '../app/components/home/timeline.mjs';
test('description transitions have a real blank interval and never overlap',()=>{
  for(let p=0;p<=6;p+=.001) assert.ok(Array.from({length:7},(_,i)=>chapterOpacity(p/6,i)).filter(x=>x>0).length<=1);
  assert.equal(chapterOpacity(.5/6,0),0); assert.equal(chapterOpacity(.5/6,1),0);
});
test('network cubes form a unique uniform lattice, not clipped terrain fragments',()=>{
  const positions=Array.from({length:1080},(_,i)=>networkCell(i));
  assert.equal(new Set(positions.map(p=>p.join(','))).size,1080);
  assert.deepEqual(networkCell(1).map((x,i)=>Math.round((x-networkCell(0)[i])*100)),[0,0,50]);
});
test('visible data scenes keep animating while resting world scenes may sleep',()=>{
  assert.equal(shouldAnimate({network:1,split:0}),true); assert.equal(shouldAnimate({network:0,split:1}),true);
  assert.equal(shouldAnimate({network:0,split:0}),false);
});
test('covered, shared and duplicate faces have a single owner',()=>{
  const cube={x:0,y:0,z:0,sx:1,sy:1,sz:1,material:'stone'};
  assert.equal(unionSurfaces([cube,cube]).length,6);
  assert.equal(unionSurfaces([cube,{...cube,x:1}]).length,10);
  assert.equal(unionSurfaces([cube,{...cube,x:.2,y:.2,z:.2,sx:.2,sy:.2,sz:.2}]).length,6);
  const pieces=subtractRectangle([0,0,1,1],[.25,.25,.75,.75]);
  assert.equal(pieces.reduce((a,r)=>a+(r[2]-r[0])*(r[3]-r[1]),0),.75);
});
