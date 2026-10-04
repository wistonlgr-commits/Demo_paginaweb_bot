# PsicobienestarP - Plataforma Web y Sistema de Gestión Clínica

Plataforma oficial de la psicóloga clínica **Lic. Adriannis Rodríguez** (FPV: 16.643).

Incluye landing page de alta conversión, página dedicada para agendamiento directo (`/agenda`), panel administrativo autónomo para la especialista (`admin.psicobienestarp.com`) y API centralizada en PHP 8 con almacenamiento seguro sin bases de datos pesadas.

---

## 📖 Documentación Completa para Desarrolladores e IA

Para consultar toda la arquitectura, decisiones de diseño, algoritmos clínicos (buffers, escasez), endpoints y mapeo de archivos, revisa el archivo:

👉 **[`PROYECTO_CONTEXTO_IA.md`](./PROYECTO_CONTEXTO_IA.md)**

---

## 🚀 Comandos Rápidos

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor local de desarrollo
npm run dev

# 3. Compilar para producción (genera dist/ y estructura multi-página)
npm run build

# 4. Generar paquetes ZIP listos para subir a SiteGround
npm run zip

# 5. Empaquetar todo el código fuente del proyecto para compartir
node scripts/package_source.js
```

---

## 🌐 URLs de Producción

- **Web Principal**: [https://psicobienestarp.com](https://psicobienestarp.com)
- **Agenda Directa**: [https://psicobienestarp.com/agenda](https://psicobienestarp.com/agenda)
- **Panel Administrativo**: [https://admin.psicobienestarp.com](https://admin.psicobienestarp.com)
