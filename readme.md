# HouskyTask

Planificador de tareas para organizar pendientes, fechas y prioridades desde una interfaz web. El proyecto está construido con HTML, CSS y JavaScript, y se puede publicar como sitio estático en Vercel.

## Enlaces del proyecto

- **Repositorio:** [AlexisRodB/HouskyTask](https://github.com/AlexisRodB/HouskyTask)
- **Tablero de Trello:** [https://trello.com/invite/b/6ae267d83a329b6207002523/ATTI09a1fd731ba96a2dde37db50a175d60b50A0188A/houskytask](https://trello.com/invite/b/6ae267d83a329b6207002523/ATTI09a1fd731ba96a2dde37db50a175d60b50A0188A/houskytask)
- **Wireframe en Figma:** [https://www.figma.com/design/fXuvvwbhg5YMWyWFaprpjF/HouskytTask?node-id=0-1&t=jYTo6plc5a8Ed3wu-1](https://www.figma.com/design/fXuvvwbhg5YMWyWFaprpjF/HouskytTask?node-id=0-1&t=jYTo6plc5a8Ed3wu-1)
- **Demo en Vercel:** [https://houskytask-src.vercel.app](https://houskytask-src.vercel.app)

## Funcionalidades

- **Inicio:** vista general para acceder a las secciones del planificador.
- **Agregar tarea:** permite crear tareas con título, descripción, fecha, hora, prioridad, estado y proyecto.
- **Tablero:** presenta las tareas en una vista de organización por estado.
- **Calendario:** permite consultar tareas según sus fechas.
- **Todas las tareas:** muestra y permite gestionar la lista de tareas.
- **Perfil:** presenta la información del perfil y enlaces asociados.
- **Persistencia local:** las tareas se guardan en el almacenamiento local del navegador (`localStorage`), por lo que permanecen disponibles en el mismo navegador y dispositivo.

## Tecnologías y estructura

- HTML, CSS y JavaScript con módulos ES.
- Bootstrap 5 y Bootstrap Icons para componentes e iconografía.
- Live Server para desarrollo local.
- Vercel para el despliegue del sitio estático.
- Organización del código basada en puertos y adaptadores:
  - `src/*.html`: páginas de la aplicación.
  - `src/css/`: estilos compartidos y estilos por página.
  - `src/js/core/`: modelo de tarea y casos de uso.
  - `src/js/ports/`: contratos de servicios y repositorios.
  - `src/js/adapters/inbound/`: controladores de interfaz y componentes.
  - `src/js/adapters/outbound/storage/`: repositorio de tareas con `localStorage`.
  - `src/js/adapters/outbound/api/`: adaptador para una API de tareas Spring.
  - `src/js/shared/`: utilidades y constantes compartidas.

El repositorio de `localStorage` es el adaptador de persistencia local. El adaptador de API Spring está incluido en el código, pero la aplicación desplegada como sitio estático no requiere un servidor backend para funcionar con almacenamiento local.

## Ejecutar en local

Requisitos: Node.js y npm.

1. Clona el repositorio y entra a su carpeta:

   ```bash
   git clone https://github.com/AlexisRodB/HouskyTask.git
   cd HouskyTask
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

Live Server sirve la carpeta `src`. Abre la dirección que indique la terminal (por defecto, suele ser `http://127.0.0.1:8080`).

## Despliegue en Vercel

La configuración del proyecto está en [`vercel.json`](./vercel.json). Para publicar:

1. Importa el repositorio `AlexisRodB/HouskyTask` desde el panel de Vercel y autoriza el acceso a GitHub si se solicita.
2. Conserva la configuración definida por `vercel.json`; no selecciones una configuración de GitHub Pages.
3. Despliega el proyecto y espera a que el proceso termine correctamente.
4. Copia la URL de producción asignada por Vercel y agrégala en la sección **Enlaces del proyecto** de este README.

La configuración de Vercel sirve los archivos HTML de `src` y dirige la ruta raíz a la página de inicio.
