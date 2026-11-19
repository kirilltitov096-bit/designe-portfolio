import {writeFile} from 'node:fs/promises';
import {logoPath} from '../app/logo-geometry.mjs';
const stops=[[0,'#272e37'],[.13,'#f9feff'],[.235,'#8b9da9'],[.265,'#fff'],[.29,'#252c35'],[.4,'#91a5b8'],[.425,'#effbff'],[.53,'#566b80'],[.63,'#f9ffff'],[.665,'#8e9ba8'],[.69,'#131b24'],[.8,'#7d8c9e'],[.89,'#fff'],[1,'#4e6074']];
const paths=[0,1,2].map(i=>`<path d="${logoPath(i,1)}"/>`).join('');
await writeFile('public/brand/kt-monogram.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 110 410 310" role="img" aria-label="КТ — Кирилл Титов"><defs><linearGradient id="metal" x1="120" y1="120" x2="470" y2="420" gradientUnits="userSpaceOnUse">${stops.map(([offset,color])=>`<stop offset="${offset}" stop-color="${color}"/>`).join('')}</linearGradient></defs><g fill="url(#metal)" stroke="#c8d8e455" stroke-width=".8">${paths}</g></svg>`);
console.log('Exported editable KT monogram SVG.');
