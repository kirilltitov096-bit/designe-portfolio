import type { Metadata } from 'next';
import './globals.css';
import './experience.css';
import './formation.css';
import { GlassOptics } from './motion';
export const metadata: Metadata = { title: 'Кирилл Титов — графический дизайнер', description: 'Плакаты, графика событий и визуальные серии. Избранные работы Кирилла Титова. Обсудим ваш проект.' };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="ru"><body>{children}<GlassOptics/></body></html>; }
