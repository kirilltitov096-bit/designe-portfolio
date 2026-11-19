import { starterProjects } from './collection';
// Only called from authenticated owner mutations. Seeds are application data, not migrations.
export async function initializeCollection(db:D1Database) {
 const marker=await db.prepare("SELECT value FROM settings WHERE key='collection_initialized'").first();
 if(marker)return;
 await db.batch([
  ...starterProjects.map(p=>db.prepare('INSERT OR IGNORE INTO projects (id,title,category,description,images,position,published) VALUES (?,?,?,?,?,?,?)').bind(p.id,p.title,p.category,p.description,p.images,p.position,p.published)),
  db.prepare("INSERT OR IGNORE INTO settings (key,value) VALUES ('collection_initialized','1')")
 ]);
}
