const fs=require('fs');const path=require('path');const assert=require('assert');
const root=path.join(__dirname,'../..');
const index=fs.readFileSync(path.join(root,'frontend/index.html'),'utf8');
const scripts=[...index.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(m=>m[1]);
for(const src of scripts){assert(fs.existsSync(path.join(root,'frontend',src.replace(/^\//,''))),`Missing frontend script: ${src}`);}
for(const f of ['backend/server.js','backend/app.js','backend/db/init.js','backend/routes/auth.routes.js','backend/routes/player.routes.js','backend/routes/game.routes.js','backend/routes/lessons.routes.js','backend/routes/chat.routes.js']) assert(fs.existsSync(path.join(root,f)),`Missing backend file: ${f}`);
const css=fs.readFileSync(path.join(root,'frontend/css/core/app.css'),'utf8');assert(css.length>1000,'CSS unexpectedly small');
const data=fs.readFileSync(path.join(root,'frontend/js/data.js'),'utf8');for(const token of ['const lessons','const skills','const items','const quests','const achievements']) assert(data.includes(token),`Missing data: ${token}`);
const old=fs.readFileSync(path.join(root,'backup/original/public/index.html'),'utf8');const oldFns=[...old.matchAll(/function\s+([A-Za-z0-9_$]+)\s*\(/g)].map(m=>m[1]);const newJs=[...require('child_process').execFileSync('grep',['-RhoE','function[[:space:]]+[A-Za-z0-9_$]+','frontend/js'],{cwd:root,encoding:'utf8'}).matchAll(/function\s+([A-Za-z0-9_$]+)/g)].map(m=>m[1]);for(const fn of new Set(oldFns)) assert(new Set(newJs).has(fn),`Original function missing: ${fn}`);const oldStyle=old.match(/<style>([\s\S]*?)<\/style>/)?.[1].trim();const newCss=fs.readFileSync(path.join(root,'frontend/css/core/app.css'),'utf8').trim();assert(oldStyle===newCss,'Original CSS changed during split');
console.log(`AUDIT SMOKE OK: ${scripts.length} frontend scripts, core backend files present.`);
