import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = path.resolve('.');
const targetZip = path.join(rootDir, 'psicobienestarp-proyecto-completo.zip');
const tempDir = path.join(rootDir, '.temp_package_export');

console.log('===> Empaquetando código fuente completo para compartir...');

// Limpiar exportación temporal previa si existía
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });

// Directorios a incluir
const dirsToCopy = ['src', 'public', 'scripts'];
for (const dir of dirsToCopy) {
  const src = path.join(rootDir, dir);
  const dest = path.join(tempDir, dir);
  if (fs.existsSync(src)) {
    console.log(`- Copiando carpeta: ${dir}/`);
    fs.cpSync(src, dest, { recursive: true });
  }
}

// Archivos individuales a incluir
const filesToCopy = [
  'index.html',
  'agenda.html',
  'admin.html',
  'package.json',
  'package-lock.json',
  'vite.config.js',
  '.oxlintrc.json',
  '.gitignore',
  'README.md',
  'PROYECTO_CONTEXTO_IA.md'
];

for (const file of filesToCopy) {
  const src = path.join(rootDir, file);
  const dest = path.join(tempDir, file);
  if (fs.existsSync(src)) {
    console.log(`- Copiando archivo: ${file}`);
    fs.copyFileSync(src, dest);
  }
}

// Si ya existe el zip anterior, eliminarlo
if (fs.existsSync(targetZip)) {
  fs.unlinkSync(targetZip);
}

// Generar ZIP con tar nativo de Windows / Unix
console.log('===> Comprimiendo archivos en ZIP...');
execSync(`tar -a -c -f "${targetZip}" *`, { cwd: tempDir });

// Limpiar carpeta temporal
fs.rmSync(tempDir, { recursive: true, force: true });

const stats = fs.statSync(targetZip);
const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

console.log(`\n✓ Paquete completo creado exitosamente:`);
console.log(`  Archivo: psicobienestarp-proyecto-completo.zip`);
console.log(`  Tamaño:  ${sizeMb} MB (${stats.size} bytes)`);
