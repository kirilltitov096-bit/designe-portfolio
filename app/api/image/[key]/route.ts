import { env } from '../../../data';
export async function GET(request:Request,{params}:{params:Promise<{key:string}>}) {
 const {key}=await params;
 if(!/^[a-f0-9-]+\.png$/.test(key) || !env.BUCKET) return new Response('Not found',{status:404});
 const image=await env.BUCKET.get(key); if(!image) return new Response('Not found',{status:404});
 return new Response(image.body as BodyInit,{headers:{'Content-Type':'image/png','Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'}});
}
