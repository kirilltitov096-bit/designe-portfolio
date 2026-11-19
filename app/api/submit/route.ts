import { database,variables } from '../../data';
import { z } from 'zod';
export async function POST(request:Request) {
 if(request.headers.get('origin')!==new URL(request.url).origin) return Response.json({error:'Недопустимый запрос'},{status:403});
 if(Number(request.headers.get('content-length')||0)>16000) return Response.json({error:'Слишком длинное сообщение'},{status:413});
 try {
 const body: any=await request.json(); if(body.website) return Response.json({ok:true});
 const base=z.object({name:z.string().trim().min(2).max(100),message:z.string().trim().min(10).max(3000)}).parse(body);
 const db=database(); const now=new Date().toISOString(); const id=crypto.randomUUID();
 if(body.type==='review') { await db.prepare('INSERT INTO reviews (id,name,text,created) VALUES (?,?,?,?)').bind(id,base.name,base.message,now).run(); return Response.json({ok:true,message:'Спасибо! Отзыв появится после одобрения.'}); }
 const contact=z.string().trim().min(3).max(200).parse(body.contact); const budget=z.string().max(100).parse(body.budget||'Обсудим');
 await db.prepare('INSERT INTO leads (id,name,contact,message,budget,created) VALUES (?,?,?,?,?,?)').bind(id,base.name,contact,base.message,budget,now).run();
 let notified=false; const v=variables();
 if(v.TELEGRAM_BOT_TOKEN && v.TELEGRAM_CHAT_ID) {
 try { const response=await fetch('https://api.telegram.org/bot'+v.TELEGRAM_BOT_TOKEN+'/sendMessage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:v.TELEGRAM_CHAT_ID,text:`Новая заявка с портфолио\n\n${base.name}\n${contact}\nБюджет: ${budget}\n\n${base.message}`}),signal:AbortSignal.timeout(8000)}); const result=await response.json() as {ok?:boolean}; notified=!!result.ok; } catch {}
 }
 if(notified) await db.prepare('UPDATE leads SET notified=1 WHERE id=?').bind(id).run();
 return Response.json({ok:true,message:'Заявка сохранена. Спасибо! Я свяжусь с вами по указанному контакту.'});
 } catch {return Response.json({error:'Проверьте поля. Имя: от 2 символов, сообщение: от 10.'},{status:400});}
}
