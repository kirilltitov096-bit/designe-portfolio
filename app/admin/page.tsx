import { requireChatGPTUser } from '../chatgpt-auth';
import { isAdmin } from '../data';
import Admin from './panel';
export const dynamic='force-dynamic';
export default async function AdminPage(){await requireChatGPTUser('/admin');if(!await isAdmin())return <main className="access-page"><a className="wordmark" href="/">kirchatov ✳</a><h1>Кабинет владельца</h1><p>Редактирование доступно только владельцу портфолио.</p><p>Для первого подключения нужно указать email вашего аккаунта ChatGPT в серверной настройке ADMIN_EMAIL.</p><a className="primary" href="/">Вернуться на сайт</a></main>;return <Admin/>;}
