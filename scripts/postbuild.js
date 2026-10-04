import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const adminHtml = path.join(distDir, 'admin.html');
const adminDir = path.join(distDir, 'admin');

if (fs.existsSync(adminHtml)) {
  if (!fs.existsSync(adminDir)) {
    fs.mkdirSync(adminDir, { recursive: true });
  }
  // 1. Copiar admin.html como index.html para el subdominio
  fs.copyFileSync(adminHtml, path.join(adminDir, 'index.html'));

  // 2. Copiar carpeta assets para que el subdominio sea 100% autónomo
  const srcAssets = path.join(distDir, 'assets');
  const destAssets = path.join(adminDir, 'assets');
  if (fs.existsSync(srcAssets)) {
    fs.cpSync(srcAssets, destAssets, { recursive: true });
  }

  // 3. Copiar logo y favicon al subdominio
  const staticFiles = ['logo.png', 'favicon.svg', 'cerebro.png'];
  for (const file of staticFiles) {
    const srcFile = path.join(distDir, file);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, path.join(adminDir, file));
    }
  }

  console.log('✓ Carpeta autónoma dist/admin/ lista para subir a SiteGround.');
}

// 4. Copiar agenda.html como dist/agenda/index.html para soporte directo de URLs limpias
const agendaHtml = path.join(distDir, 'agenda.html');
const agendaDir = path.join(distDir, 'agenda');
if (fs.existsSync(agendaHtml)) {
  if (!fs.existsSync(agendaDir)) {
    fs.mkdirSync(agendaDir, { recursive: true });
  }
  fs.copyFileSync(agendaHtml, path.join(agendaDir, 'index.html'));
  console.log('✓ Ruta limpia dist/agenda/index.html generada para psicobienestarp.com/agenda.');
}
