import {build} from 'vite';
import react from '@vitejs/plugin-react';
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd();
const output=path.resolve(root,'../../outputs/kirill-portfolio-share.html');
const response=await fetch('http://127.0.0.1:5173/api/content');
assert.ok(response.ok,'Local portfolio must be available');
const publicData=await response.json();
const settings=Object.fromEntries(['name','headline','about','telegram'].filter(k=>typeof publicData.settings[k]==='string').map(k=>[k,publicData.settings[k]]));
const cache=new Map();
async function inlineImage(url){
 if(cache.has(url))return cache.get(url);
 let bytes,type;
 if(/^\/works\/[a-z-]+\.png$/.test(url)){bytes=await readFile(path.join(root,'public',url.replace('.png','-preview.webp')));type='image/webp';}
 else if(/^\/api\/image\/[a-f0-9-]+\.png$/.test(url)){const r=await fetch('http://127.0.0.1:5173'+url);assert.ok(r.ok);bytes=Buffer.from(await r.arrayBuffer());type='image/png';}
 else throw new Error('Unsupported image in public collection: '+url);
 const result='data:'+type+';base64,'+bytes.toString('base64');cache.set(url,result);return result;
}
const projects=[];
for(const project of publicData.projects){const images=await Promise.all(JSON.parse(project.images).map(inlineImage));projects.push({...project,images:JSON.stringify(images)});}
const snapshot={projects,reviews:publicData.reviews.map(({id,name,text})=>({id,name,text})),settings,leads:[],admin:false};
const safeData=JSON.stringify(snapshot).replace(/</g,'\\u003c');
await mkdir('.sites-runtime',{recursive:true});
const entry=path.join(root,'.sites-runtime/share-entry.tsx');
await writeFile(entry,"import React from 'react';import {createRoot} from 'react-dom/client';import Portfolio from '../app/portfolio';import {GlassOptics} from '../app/motion';createRoot(document.getElementById('root')!).render(<><Portfolio/><GlassOptics/></>);");
const result=await build({configFile:false,root,publicDir:false,plugins:[{
 name:'offline-preview',enforce:'pre',async load(id){
  if(!/[\\/]app[\\/]portfolio\.tsx$/.test(id))return;
  let source=await readFile(id,'utf8');
  const api=/export async function api\(url:string,body\?:any\)[^\r\n]+/;
  assert.ok(api.test(source),'Expected API entry point');
  source=source.replace(api,()=>`export async function api(url:string,body?:any){if(url==='/api/content'&&!body)return ${safeData};throw new Error('Это демоверсия для просмотра. Заявки и отзывы не отправляются. Напишите в Telegram @kirchatov.');}`);
  source=source.replaceAll('href="/"','href="#top"').replace('<header className="navigation">','<header id="top" className="navigation">');
  source=source.replace('<a href="/admin">Кабинет</a>','<span>Демоверсия для просмотра</span>');
  source=source.replaceAll('<a href={url} target="_blank" rel="noreferrer">','<a href={url} download="portfolio-work.webp">').replace('Открыть оригинал PNG','Скачать изображение');
  source=source.replace('\n <label>Как вас зовут','\n <p className="share-form-note">Демоверсия: отправка заявок и отзывов отключена. Можно написать в Telegram.</p>\n <label>Как вас зовут');
  return source;
 }
},react()],define:{'process.env.NODE_ENV':'"production"'},build:{write:false,minify:true,emptyOutDir:false,lib:{entry,formats:['iife'],name:'PortfolioPreview'},rollupOptions:{output:{inlineDynamicImports:true}}}});
const bundle=Array.isArray(result)?result[0]:result;
const javascript=bundle.output.find(item=>item.type==='chunk').code.replace(/<\/script/gi,'<\\/script');
const cssDir=path.join(root,'dist/client/_next/static/css');
const cssFiles=(await readdir(cssDir)).filter(file=>file.endsWith('.css'));
assert.ok(cssFiles.length>0);
const css=(await Promise.all(cssFiles.map(file=>readFile(path.join(cssDir,file),'utf8')))).join('\n');
const html=`<!doctype html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Кирилл Титов — портфолио, демоверсия</title><meta name="description" content="Демоверсия портфолио для просмотра"><style>${css}\n.share-notice{padding:12px 5vw;background:#24282b;color:#dce5eb;font:14px/1.5 Arial,sans-serif;border-bottom:1px solid #ffffff25}.share-notice a{color:#b7cbd8;text-decoration:underline}.share-form-note{font-size:14px;line-height:1.5;color:#b7cbd8;border-left:2px solid #b7cbd8;padding-left:12px}</style></head><body><aside class="share-notice">Демоверсия для просмотра · Заявки и кабинет пока недоступны · <a href="https://t.me/kirchatov" target="_blank" rel="noreferrer">Написать в Telegram</a></aside><div id="root"></div><script>${javascript}</script></body></html>`;
await mkdir(path.dirname(output),{recursive:true});await writeFile(output,html);
assert.ok(!html.includes('ADMIN_EMAIL'));
assert.ok(!html.includes('TELEGRAM_BOT_TOKEN'));
assert.equal(cache.size,7,'All seven images must be embedded');
assert.ok(!/<(?:script|link)[^>]+(?:src|href)=["']https?:/i.test(html),'No remote scripts or styles');
await writeFile(path.join(path.dirname(output),'КАК ОТКРЫТЬ ПОРТФОЛИО.txt'),'Отправьте другу файл kirill-portfolio-share.html.\nСохраните его на устройство и откройте в обычном браузере.\nУстановка программ и запуск сервера не нужны.\nВнутри — 7 работ, галерея, фильтры и анимация логотипа.\nЭто демоверсия: формы не отправляют заявки и отзывы, кабинета управления в ней нет.\nКнопки Telegram работают при наличии интернета.\n');
console.log(JSON.stringify({file:output,bytes:Buffer.byteLength(html),images:cache.size,projects:projects.length,remoteAssets:0,serverRequired:false}));
