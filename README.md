# LibroLog — Registro de Libros

Proyecto Final — Desarrollo y Técnicas de Aplicaciones Web

## Grupo

GT01

## Integrantes

| Nombre | Carné |
|---|---|
| Sergio Norberto Ramírez Juárez | RJ23001 |
| Diego Alexander Cruz Cabrera | CC23090 |
| Brayan Fernando Ramírez Salinas | RS13036 |
| Gerson Levi Martinez Avalos | MA20093 |

## Tema de Proyecto

CRUD 7 — Registro de Libros

## Tecnologías

- HTML5
- CSS3
- JavaScript (Vanilla ES6+)
- LocalStorage / SessionStorage
- Web Workers
- Fetch API
- Geolocalización (Navigator API)
- APIs externas gratuitas: [Nominatim](https://nominatim.openstreetmap.org/) · [Open-Meteo](https://open-meteo.com/)

## Funcionalidades

- CRUD completo de libros (crear, leer, actualizar, eliminar)
- Filtros por título, autor, estado, género, año y calificación
- Widget de calificación por estrellas (1–5)
- Dashboard con estadísticas calculadas en un Web Worker
- Barra de progreso de lectura
- Gráfico de libros por género
- Widget de clima en tiempo real (geolocalización → ciudad → temperatura)
- Contador de tiempo activo de sesión (SessionStorage)
- Modo oscuro / claro con persistencia
- Validaciones de formulario con mensajes de error por campo
- Notificaciones toast
- Diseño responsive con sidebar colapsable en móvil

## Estructura del proyecto

```
CRUD7_Registro-de-Libros/
├── index.html
├── css/
│   └── styles.css
└── js/
    ├── storage.js      # Capa de persistencia (LocalStorage / SessionStorage)
    ├── validations.js  # Validaciones puras de formulario
    ├── filters.js      # Lógica de filtrado y ordenamiento
    ├── api.js          # Consumo de APIs REST (clima)
    ├── crud.js         # Operaciones CRUD y renderizado de tarjetas
    ├── dashboard.js    # Dashboard y comunicación con el Web Worker
    ├── worker.js       # Web Worker — cálculo de estadísticas
    └── app.js          # Punto de entrada y orquestador principal
```

## ⚠️ Requisito importante

El proyecto **no puede abrirse directamente como archivo** (`file://`).
Debe ejecutarse desde un servidor HTTP local porque:

- Los **Web Workers** son bloqueados por la política de seguridad de origen en `file://`.
- La API de **Geolocalización** requiere un contexto seguro (`localhost` o `https://`).

## Cómo correr el proyecto

Elige cualquiera de las siguientes opciones:

---

### Opción 1 — VS Code Live Server (recomendado)

1. Instala la extensión **Live Server** de Ritwick Dey en VS Code.
2. Abre la carpeta del proyecto en VS Code.
3. Haz clic derecho sobre `index.html` → **"Open with Live Server"**.
4. El navegador abrirá automáticamente `http://127.0.0.1:5500`.

---

### Opción 2 — Python (sin instalación extra)

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
# Python 3
python3 -m http.server 8080
```

Luego abre `http://localhost:8080` en el navegador.

---

### Opción 3 — Node.js (npx, sin instalación extra)

```bash
npx serve .
```

Luego abre la URL que indique la terminal (generalmente `http://localhost:3000`).

---

### Opción 4 — Node.js http-server

```bash
# Instalar globalmente (una sola vez)
npm install -g http-server

# Ejecutar en la carpeta del proyecto
http-server . -p 8080
```

Luego abre `http://localhost:8080`.

---

## Permisos del navegador

- Al cargar el **Dashboard**, el navegador pedirá permiso para acceder a la **ubicación**.  
  Acéptalo para ver el widget de clima. Si lo rechazas, el widget mostrará un mensaje de error pero el resto de la aplicación funcionará normalmente.

## Compatibilidad

Requiere un navegador moderno con soporte para:

- `localStorage` / `sessionStorage`
- Web Workers
- `fetch` API
- `navigator.geolocation`
- `crypto.randomUUID()`

Navegadores compatibles: Chrome 92+, Firefox 90+, Edge 92+, Safari 15.4+.
