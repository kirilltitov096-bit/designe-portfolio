import { database, isAdmin } from '../../data';
import { starterProjects } from '../../collection';
export async function GET(request: Request) {
 const admin = new URL(request.url).searchParams.has('admin') && await isAdmin(); const db=database();
 const [projects,reviews,settings] = await Promise.all([
 db.prepare(`SELECT * FROM projects ${admin?'':'WHERE published = 1'} ORDER BY position, rowid DESC`).all(),
 db.prepare(`SELECT * FROM reviews ${admin?'':'WHERE approved = 1'} ORDER BY created DESC LIMIT 100`).all(),
 db.prepare('SELECT * FROM settings').all()]);
 const leads=admin ? (await db.prepare('SELECT * FROM leads ORDER BY created DESC LIMIT 200').all()).results : [];
 const configured=settings.results.some((r:any)=>r.key==='collection_initialized');
 const collection=configured?projects.results: [...starterProjects.filter(p=>!projects.results.some((row:any)=>row.id===p.id)),...projects.results].sort((a:any,b:any)=>a.position-b.position);
 return Response.json({projects:collection,reviews:reviews.results,settings:Object.fromEntries(settings.results.filter((r:any)=>r.key!=='collection_initialized').map((r:any)=>[r.key,r.value])),leads,admin},{headers:{'Cache-Control':'no-store'}});
}
