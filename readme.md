# HouskyTask

HouskyTask es una aplicación web para organizar tareas, fechas de entrega, prioridades y proyectos. El frontend está hecho con HTML, CSS y JavaScript; la autenticación y los datos de las tareas se gestionan mediante una API.

## Enlaces

- **Frontend:** [Demo en Vercel](https://houskytask-src.vercel.app)
- **Repositorio del frontend:** [AlexisRodB/HouskyTask](https://github.com/AlexisRodB/HouskyTask)
- **Repositorio del backend:** [AlexisRodB/houskytask-api](https://github.com/AlexisRodB/houskytask-api)
- **Tablero:** [Trello](https://trello.com/invite/b/6ae267d83a329b6207002523/ATTI09a1fd731ba96a2dde37db50a175d60b50A0188A/houskytask)
- **Diseño:** [Wireframe en Figma](https://www.figma.com/design/fXuvvwbhg5YMWyWFaprpjF/HouskytTask?node-id=0-1&t=jYTo6plc5a8Ed3wu-1)

## Funcionalidades principales

- **Registro e inicio de sesión:** registro con verificación de correo mediante código OTP e inicio de sesión.
- **Inicio:** resumen de tareas vencidas y próximas entregas.
- **Gestión de tareas:** crear, consultar, editar, eliminar y cambiar el estado de las tareas. Cada tarea puede incluir descripción, fecha, hora, prioridad y proyecto.
- **Tablero:** organizar las tareas por estado.
- **Calendario:** consultar las tareas asociadas a fechas.
- **Perfil:** consultar y actualizar la información del perfil.

## Tecnologías

- HTML, CSS y JavaScript con módulos ES.
- Bootstrap 5 y Bootstrap Icons.
- API REST para autenticación y persistencia de tareas.
- Live Server para desarrollo local.
- Vercel para alojar el frontend estático.

## Estructura del proyecto

- `src/*.html`: páginas de la aplicación.
- `src/css/`: estilos generales y específicos de cada página.
- `src/js/core/`: modelos y casos de uso.
- `src/js/ports/`: contratos de servicios y repositorios.
- `src/js/adapters/inbound/`: controladores de interfaz.
- `src/js/adapters/outbound/`: integración con la API y almacenamiento de sesión.
- `src/js/shared/`: constantes y utilidades compartidas.

La URL base de la API se define en `src/js/shared/constants.js`. La sesión autenticada se guarda en `localStorage`; las tareas se consultan y guardan en el backend, no en el almacenamiento local del navegador.

## Ejecutar localmente

Requisitos: Node.js y npm.

```bash
git clone https://github.com/AlexisRodB/HouskyTask.git
cd HouskyTask
npm install
npm run dev
```

Live Server sirve la carpeta `src`. Abre la dirección que muestre la terminal (por defecto, normalmente `http://127.0.0.1:8080`).

El frontend local se conecta a la API configurada en `constants.js`. Para que el navegador permita esa conexión, el backend debe aceptar el origen local usado por Live Server en su configuración CORS. Si aparece un error CORS, la API debe autorizar ese origen; no se corrige únicamente desde el frontend.

## Despliegue

El frontend se publica como sitio estático en Vercel. La configuración de rutas está en [`vercel.json`](./vercel.json). Al desplegar desde GitHub, comprueba que la URL de producción esté autorizada por CORS en el backend y que `API_BASE_URL` apunte a la API correspondiente.
