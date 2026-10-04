import { execSync } from 'child_process';
import path from 'path';

const rootDir = path.resolve('.');
const distDir = path.join(rootDir, 'dist');
const adminDir = path.join(distDir, 'admin');

console.log('1. Generando subdominio-admin.zip...');
execSync(`tar -a -c -f "${path.join(rootDir, 'subdominio-admin.zip')}" *`, { cwd: adminDir });

console.log('2. Generando web-principal.zip...');
execSync(`tar -a -c -f "${path.join(rootDir, 'web-principal.zip')}" --exclude="admin" --exclude="*.zip" *`, { cwd: distDir });

console.log('✓ Paquetes ZIP creados exitosamente en la raíz del proyecto.');
