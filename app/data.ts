import { env } from 'cloudflare:workers';
import { getChatGPTUser } from './chatgpt-auth';
export async function isAdmin() {
 const user = await getChatGPTUser(); const email = variables().ADMIN_EMAIL;
 return !!(user && email && user.email.toLowerCase() === email.toLowerCase());
}
export function database() { if (!env.DB) throw new Error('Хранилище временно недоступно'); return env.DB; }
export function variables() { return env as unknown as Record<string,string>; }
export { env };
