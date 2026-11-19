import { database, isAdmin } from '../../data';
import { z } from 'zod';
import { initializeCollection } from '../../initialize-collection';
const project=z.object({id:z.string().uuid(),title:z.string().trim().min(1).max(160),category:z.string().max(80),description:z.string().max(10000),images:z.array(z.string().regex(/^(?:\/api\/image\/[a-f0-9-]+|\/works\/(?:faculty|shapka-contest|mbt|freshman|tms|shapka-registration|shapka-team))\.png$/)).max(30),position:z.number().int().min(-999).max(9999),published:z.boolean()});
export async function POST(request: Request) {
 if(request.headers.get('origin')!==new URL(request.url).origin) return Response.json({error:'Недопустимый запрос'},{status:403});
 if(!await isAdmin()) return Response.json({error:'Доступ только для владельца. Требуется настроить ADMIN_EMAIL.'},{status:403});
 try {
 const data: any=await request.json(); const db=database();
 if(data.action==='project'||data.action==='deleteProject') await initializeCollection(db);
 if(data.action==='project') { const p=project.parse(data.project); await db.prepare('INSERT INTO projects (id,title,category,description,images,position,published) VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,category=excluded.category,description=excluded.description,images=excluded.images,position=excluded.position,published=excluded.published').bind(p.id,p.title,p.category,p.description,JSON.stringify(p.images),p.position,p.published?1:0).run(); }
 else if(data.action==='deleteProject') { const id=z.string().uuid().parse(data.id); await db.prepare('DELETE FROM projects WHERE id=?').bind(id).run(); }
 else if(data.action==='review') { const id=z.string().uuid().parse(data.id); if(data.remove) await db.prepare('DELETE FROM reviews WHERE id=?').bind(id).run(); else await db.prepare('UPDATE reviews SET approved=? WHERE id=?').bind(data.approved?1:0,id).run(); }
 else if(data.action==='settings') { const s=z.object({name:z.string().trim().min(1).max(80),headline:z.string().trim().min(1).max(160),about:z.string().max(2000),telegram:z.string().regex(/^@?[a-zA-Z0-9_]{5,32}$/)}).parse(data.settings); await db.batch(Object.entries(s).map(([k,v])=>db.prepare('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(k,v))); }
 else return Response.json({error:'Неизвестное действие'},{status:400});
 return Response.json({ok:true});
 } catch {return Response.json({error:'Проверьте заполнение полей и повторите попытку'},{status:400});}
}
