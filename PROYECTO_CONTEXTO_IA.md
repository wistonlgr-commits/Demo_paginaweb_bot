# Contexto Completo del Proyecto - PsicobienestarP

> **Documento de Contexto y Especificación Técnica para Agentes de IA y Desarrolladores.**  
> Este documento contiene toda la arquitectura, decisiones de diseño, lógica de negocio clínica, flujo de datos, estructura de archivos y procedimientos de despliegue de **PsicobienestarP**.

---

## 1. Resumen Ejecutivo y Propósito

**PsicobienestarP** es una plataforma web médica y sistema de agendamiento clínico virtual para la psicóloga clínica **Lic. Adriannis Rodríguez** (FPV: 16.643).

### Objetivos Clave:
1. **Posicionamiento y Marca Médica**: Presentar los servicios de psicoterapia individual, de pareja y asesoría clínica con estética premium, humana, empática y basada en evidencia.
2. **Agendamiento Automatizado sin Fricción**: Permitir a los pacientes seleccionar fecha y hora en tiempo real, validando disponibilidad y enviando la solicitud formalizada vía WhatsApp oficial.
3. **Panel Administrativo Clínico Autónomo**: Proveer a la especialista un dashboard privado para gestionar citas, estados, ingresos, fechas bloqueadas y horarios de consulta sin depender de bases de datos pesadas (SQL) ni servicios externos de pago.
4. **Infraestructura Ágil en SiteGround**: Arquitectura híbrida basada en frontend React estático optimizado con backend API PHP 8 flat-file JSON sobre hosting compartido.

---

## 2. Identidad y Datos del Cliente

- **Profesional**: Lic. Adriannis Rodríguez (Psicóloga Clínica).
- **Federación de Psicólogos de Venezuela**: FPV N° 16.643.
- **Enfoque Terapéutico**: Terapia Cognitivo-Conductual (TCC), Terapia Humanista / Aceptación y Compromiso, Psicoterapia de Pareja, Manejo de Ansiedad, Duelo y Crecimiento Personal.
- **Canales de Contacto**:
  - WhatsApp Oficial: `+58 412 898 2593` / `+58 412 433 5625`
  - Instagram: `@psicobienestarp`
- **Dominios en Producción**:
  - Web Principal: `https://psicobienestarp.com`
  - Ruta directa de Agenda: `https://psicobienestarp.com/agenda`
  - Subdominio Administrativo: `https://admin.psicobienestarp.com`
  - Endpoint API Central: `https://psicobienestarp.com/api/appointments.php`

---

## 3. Stack Tecnológico

| Capa | Tecnología | Propósito |
|---|---|---|
| **Frontend Framework** | **React 19** + **Vite 8** | Renderizado reactivo ultrarrápido y Multi-Page Application (MPA). |
| **Estilos** | **Vanilla CSS** (Design Tokens) | Control total de diseño, glassmorphism, modo oscuro/claro clínico, variables CSS puras. |
| **Iconografía** | **Lucide React** (`lucide-react`) | Iconos vectoriales limpios y coherentes. |
| **Efectos Visuales** | **HTML5 Canvas interactivo** | Lluvia de estrellas sutiles de fondo (`StarRainCanvas`, `WhiteStarsFallingCanvas`). |
| **Celebraciones** | **canvas-confetti** | Micro-interacciones al confirmar citas agendadas con éxito. |
| **Backend API** | **PHP 8 (Flat-file JSON)** | Endpoints REST sin dependencias externas, almacenamiento JSON protegido. |
| **Almacenamiento** | **Dual Sync**: `localStorage` + `JSON` Server | Latencia cero en UI local + persistencia centralizada en SiteGround. |
| **Servidor / Hosting** | **Apache (SiteGround)** | Reglas `.htaccess`, compresión GZIP/Brotli, caché y reescritura de URLs limpias. |

---

## 4. Arquitectura del Sistema

```
                      ┌────────────────────────────────────────┐
                      │          USUARIO / PACIENTE            │
                      └──────────────────┬─────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
   https://psicobienestarp.com                     https://psicobienestarp.com/agenda
        [Landing Page]                                  [Página Limpia de Citas]
      (index.html / App.jsx)                           (agenda.html / AgendaPage.jsx)
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         │
                                         ▼
                             [BookingCalendar.jsx]
                      (Valida turnos, buffers y escasez)
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
                 ▼                                               ▼
         [WhatsApp Directo]                        [Dual Sync: appointmentService.js]
        Notificación inmediata                           ┌───────┴───────┐
         al teléfono médico                              ▼               ▼
                                                   localStorage    REST fetchApi (POST)
                                                                         │
                                                                         ▼
                      ┌────────────────────────────────────────────────────────┐
                      │    https://psicobienestarp.com/api/appointments.php    │
                      │                 (Backend Central PHP 8)                │
                      │                                                        │
                      │  - CORS Headers para subdominio admin                  │
                      │  - Rate Limit (60 req/h, cooldown 1s)                  │
                      │  - Honeypot Anti-Spam                                  │
                      │  - appointments.json (Protegido por .htaccess)         │
                      │  - settings.json                                       │
                      └──────────────────────────▲─────────────────────────────┘
                                                 │
                                                 │ Sincronización REST bidireccional
                                                 │ (CORS seguro, Simple Requests)
                                                 │
                      ┌──────────────────────────┴─────────────────────────────┐
                      │           https://admin.psicobienestarp.com            │
                      │                 [Dashboard Psicóloga]                  │
                      │               (admin.html / admin.jsx)                 │
                      │                                                        │
                      │  - Login con Hash SHA-256                              │
                      │  - Gestión de citas (Confirmar, Cancelar, Eliminar)    │
                      │  - Agendamiento manual sin restricciones               │
                      │  - Control de horarios, días activos y vacaciones      │
                      │  - Ajuste de percepción de escasez (0% - 100%)         │
                      └────────────────────────────────────────────────────────┘
```

---

## 5. Reglas de Negocio y Lógica Clínica

### 5.1. Duración y Horarios de Consulta
- **Duración Estándar**: 60 minutos por sesión (virtual vía Google Meet / WhatsApp Video).
- **Horarios Hábiles**: Lunes a Sábado de 8:00 AM a 8:00 PM (13 cupos potenciales diarios: `08:00`, `09:00`, `10:00`, `11:00`, `12:00`, `13:00`, `14:00`, `15:00`, `16:00`, `17:00`, `18:00`, `19:00`, `20:00`).

### 5.2. Regla de Buffers Clínicos Automáticos
Para salvaguardar la salud mental de la especialista y evitar agotamiento:
1. **Buffer Previo (`buffer_before`)**: Se bloquean automáticamente **60 minutos antes** de cualquier cita confirmada o pendiente.
2. **Buffer Posterior (`buffer_after`)**: Se bloquean automáticamente **120 minutos después** (2 horas de descanso clínico y redacción de notas terapéuticas).
- *Excepción*: En el Dashboard de la especialista (`forAdmin = true`), la psicóloga puede forzar citas en cualquier horario sin restricciones de buffer.

### 5.3. Algoritmo de Percepción de Escasez (Scarcity Simulation)
- En el panel administrativo existe un control deslizante de percepción de disponibilidad (por defecto al **20%**).
- El frontend calcula un hash determinista mediante semilla por fecha y hora (`${dateString}-${hour}-psi`).
- Si el puntaje resultante cae dentro del porcentaje de escasez, el turno se muestra al público como *"No disponible"* para reflejar alta demanda y urgencia de reserva, **sin alterar ni crear registros falsos en la base de datos real**.

### 5.4. Seguridad, Autenticación y Anti-Spam
- **Contraseña Maestra del Dashboard**:
  - Hash SHA-256 criptográfico: `f9290b8ec13dbd54c61043ba2e10c3593fdd9eaee8c94a557d59d190a28c9741`.
  - La clave en texto plano **nunca** reside en el código ni en el bundle final.
- **Protección Anti-Bot (Honeypot)**:
  - Formulario de reserva incluye campo oculto `website_hp`. Si un bot automatizado lo completa, el backend simula respuesta exitosa sin guardar la entrada basura.
- **Rate Limiting por IP**:
  - Máximo 8 citas por hora por dirección IP.
  - Cooldown obligatorio de 1 segundo entre peticiones.
  - Bloqueo de consultas abusivas (429 Too Many Requests).

---

## 6. Mapeo Exhaustivo de Archivos del Proyecto

### 6.1. Raíz del Proyecto
- `index.html`: Punto de entrada de la web principal (`https://psicobienestarp.com`). Incluye metadatos SEO completos, Open Graph, Twitter Cards, Schema.org (MedicalBusiness / Physician), preconnect a Google Fonts y favicon SVG.
- `agenda.html`: Punto de entrada directo e independiente para agendar citas (`/agenda`).
- `admin.html`: Punto de entrada autónomo para el dashboard (`admin.psicobienestarp.com`).
- `vite.config.js`: Configuración Rollup multi-input que compila `main`, `admin` y `agenda`.
- `package.json`: Definición de scripts (`dev`, `build`, `zip`, `lint`) y dependencias mínimas requeridas.
- `.oxlintrc.json`: Configuración del linter estático ultrarrápido Oxlint.
- `.gitignore`: Ignora `node_modules/`, `dist/`, `.env`, archivos comprimidos `.zip` y temporales.

### 6.2. Código Fuente (`src/`)
- `src/main.jsx`: Monta la aplicación principal en `index.html`.
- `src/agenda.jsx`: Monta `AgendaPage` en `agenda.html`.
- `src/admin.jsx`: Monta `PsychologistDashboard` en `admin.html`.
- `src/App.jsx`: Componente maestro de la landing page. Ensambla todas las secciones clínicas con navegación suave.
- `src/index.css`: Sistema de diseño global (variables `:root`, paleta HSL, tipografía, glassmorphism, responsive utilities).

### 6.3. Componentes (`src/components/`)
- `Header.jsx` & `Header.css`: Barra superior fija con logotipo SVG/PNG, navegación interactiva, botón CTA de agendamiento y menú responsive móvil con drawer animado.
- `Hero.jsx` & `Hero.css`: Sección principal con fotografía profesional de la psicóloga, micro-badges de confianza, selector de frases inspiradoras y CTA directo. Incluye soporte vertical para tablets (Samsung S10 Lite) y móviles sin solapamientos.
- `AboutSection.jsx` & `AboutSection.css`: Biografía clínica, credenciales FPV N° 16.643, flor Sakura SVG nítida animada en fondo y logotipo cerebro 3D oficial posicionado a la altura superior.
- `ServicesSection.jsx` & `ServicesSection.css`: Tarjetas de servicios (Terapia Individual, Pareja, Manejo de Ansiedad, Autoestima y Crecimiento).
- `ProcessSection.jsx` & `ProcessSection.css`: Los 4 pasos del proceso terapéutico (1. Reserva, 2. Evaluación inicial, 3. Plan de acción, 4. Sesiones y evolución).
- `BenefitsSection.jsx` & `BenefitsSection.css`: Ventajas de la terapia online con la Lic. Adriannis Rodríguez.
- `BookingCalendar.jsx` & `BookingCalendar.css`: Calendario dinámico e interactivo. Permite elegir mes, día, hora disponible (filtrada por buffers y escasez), formulario de paciente y confirmación con WhatsApp y confetti.
- `PsychologistDashboard.jsx` & `PsychologistDashboard.css`: Panel administrativo privado. Métricas clínicas, lista de pacientes, cambio de estado de citas, agendador manual, control de vacaciones y configuración de horarios.
- `TestimonialsSection.jsx` & `TestimonialsSection.css`: Reseñas clínicas de pacientes con estrellas y testimonios respetando confidencialidad.
- `StatsSection.jsx` & `StatsSection.css`: Estadísticas de impacto clínico (horas de sesión, pacientes atendidos, satisfacción).
- `FaqSection.jsx` & `FaqSection.css`: Preguntas frecuentes clínicas con acordeón interactivo.
- `Footer.jsx` & `Footer.css`: Pie de página profesional con enlaces legales, copyright, redes sociales e información de emergencia médica.
- `FloatingWhatsApp.jsx` & `FloatingWhatsApp.css`: Botón flotante de WhatsApp animado con tooltip de bienvenida.
- `LegalModals.jsx` & `LegalModals.css`: Modales emergentes con Términos de Servicio, Política de Privacidad Médica y Consentimiento Informado.
- `StarRainCanvas.jsx` & `WhiteStarsFallingCanvas.jsx`: Efectos sutiles de fondo con estrellas cayendo mediante Canvas 2D de alto rendimiento.

### 6.4. Páginas (`src/pages/`)
- `AgendaPage.jsx` & `AgendaPage.css`: Página dedicada exclusivamente a la agenda clínica, con header simplificado, banner de confianza y el componente `BookingCalendar`.

### 6.5. Servicios (`src/services/`)
- `appointmentService.js`: Módulo neurálgico del sistema:
  - Constantes de horarios (`ALL_HOURS`).
  - Lógica de cálculo de minutos y formato 12h/24h.
  - Algoritmo de conflicto de horarios (`checkSlotConflict`) con buffers de 1h antes y 2h después.
  - Algoritmo determinista de escasez pseudoaleatoria (`getAvailableSlotsForDate`).
  - Sincronización dual `localStorage` + `fetchApi` hacia `https://psicobienestarp.com/api/appointments.php`.
  - Eventos personalizados (`CustomEvent`) para reactividad instantánea en cualquier ventana abierta.

### 6.6. Archivos Públicos y Backend (`public/`)
- `public/api/appointments.php`: API REST central en PHP 8. Maneja acciones: `list`, `create`, `update_status`, `delete`, `get_settings`, `save_settings`.
- `public/api/.htaccess`: Configuración Apache para permitir CORS total (`Access-Control-Allow-Origin: *`, `Access-Control-Allow-Headers: *`) y deshabilitar caché de servidor.
- `public/api/data/`: Directorio donde residen `appointments.json`, `settings.json` y `rate_limit.json` (protegido con `Deny from all`).
- `public/.htaccess`: Reglas de enrutamiento limpio para SiteGround (permite que `/agenda` cargue `/agenda/index.html` sin mostrar extensión).
- `public/sitemap.xml`: Mapa del sitio XML para indexación en Google, Bing y motores de IA.
- `public/robots.txt`: Directivas de rastreo con exclusión de áreas privadas y enlace al sitemap.
- `public/favicon.svg` & `public/icons.svg`: Favicon e iconografía vectorial.
- `public/logo.png`, `public/cerebro.png`, `public/adriannis.png`: Recursos gráficos y fotografías optimizadas en web.

### 6.7. Scripts de Automatización (`scripts/`)
- `scripts/postbuild.js`: Ejecutado automáticamente tras `vite build`:
  - Clona `dist/admin.html` hacia `dist/admin/index.html` con todos sus assets para que el subdominio `admin.psicobienestarp.com` sea 100% autónomo.
  - Genera `dist/agenda/index.html` para soporte nativo de URLs limpias en Apache.
- `scripts/make_zips.js`: Ejecutado con `npm run zip`:
  - Genera automáticamente `web-principal.zip` (para la raíz `public_html/`).
  - Genera automáticamente `subdominio-admin.zip` (para `public_html/admin/`).
- `scripts/crop.ps1`: Script PowerShell de utilidad para recortar y optimizar imágenes con PowerShell Graphics.

---

## 7. Guía de Ejecución Local y Desarrollo

### 7.1. Instalación de Dependencias
```bash
npm install
```

### 7.2. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
- Web principal: `http://localhost:5173/`
- Página de agenda: `http://localhost:5173/agenda.html`
- Dashboard administrativo: `http://localhost:5173/admin.html`

### 7.3. Compilación de Producción
```bash
npm run build
```
Genera la carpeta `dist/` con la estructura multi-página lista para distribución.

### 7.4. Generación de Paquetes ZIP para SiteGround
```bash
npm run zip
```
Crea `web-principal.zip` y `subdominio-admin.zip` en la raíz del proyecto.

---

## 8. Procedimiento de Despliegue en SiteGround

1. **Web Principal (`psicobienestarp.com`)**:
   - Ingresar a SiteGround > **Site Tools** > **Gestor de Archivos**.
   - Ir a la carpeta `public_html/`.
   - Subir el archivo `web-principal.zip` y extraer su contenido directamente en `public_html/`.
   - Verificar que los permisos de `public_html/api/data/` sean de lectura/escritura (`775` o `777`).

2. **Subdominio Admin (`admin.psicobienestarp.com`)**:
   - En SiteGround > **Dominio** > **Subdominios**, crear el subdominio `admin.psicobienestarp.com` (apuntando a `public_html/admin/`).
   - Ir a la carpeta del subdominio en el Gestor de Archivos.
   - Subir el archivo `subdominio-admin.zip` y extraer su contenido allí.

3. **Verificación**:
   - Visitar `https://psicobienestarp.com` -> Landing page operativa.
   - Visitar `https://psicobienestarp.com/agenda` -> Agendador directo funcional.
   - Visitar `https://admin.psicobienestarp.com` -> Dashboard administrativo protegido con clave.
   - Probar una cita de prueba: se registrará en `public_html/api/data/appointments.json` y se verá sincronizada de inmediato en el panel administrativo.

---

## 9. Instrucciones para Agentes de IA Futuros

1. **Conservar la Estructura Sin Dependencias Pesadas**: No introducir bases de datos externas o librerías de backend que rompan la autonomía de SiteGround. El sistema actual es autosuficiente, seguro y no genera costos mensuales de base de datos.
2. **Respetar la Lógica de Buffers**: Cualquier cambio en la reserva de citas debe mantener las funciones `timeToMinutes`, `checkSlotConflict` y la sincronización con `appointmentService.js`.
3. **No Exponer Contraseñas**: Toda autenticación del dashboard debe realizarse contrastando el hash SHA-256 (`MASTER_PIN_HASH`), nunca guardando contraseñas en texto plano.
4. **Preservar el Design System**: Utilizar las clases CSS declaradas en `src/index.css` y en los archivos `.css` modulares de cada componente. No inyectar frameworks intrusivos de utilidades a menos que se solicite expresamente.
