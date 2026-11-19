import { env,isAdmin } from '../../data';
export async function POST(request:Request) {
 if(request.headers.get('origin')!==new URL(request.url).origin || !await isAdmin()) return Response.json({error:'Нет доступа'},{status:403});
 if(Number(request.headers.get('content-length')||0)>31*1024*1024) return Response.json({error:'Максимум 30 МБ на файл'},{status:413});
 const form=await request.formData(); const file=form.get('file');
 if(!(file instanceof File) || file.size>30*1024*1024) return Response.json({error:'Выберите PNG до 30 МБ'},{status:400});
 const bytes=new Uint8Array(await file.arrayBuffer()); const sig=[137,80,78,71,13,10,26,10];
 if(!sig.every((v,i)=>bytes[i]===v)) return Response.json({error:'Файл должен быть изображением PNG'},{status:400});
 if(!env.BUCKET) return Response.json({error:'Хранилище изображений недоступно'},{status:503});
 const key=crypto.randomUUID()+'.png'; await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:'image/png'}});
 return Response.json({url:'/api/image/'+key});
}
