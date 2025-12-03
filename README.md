Twitter Clone – Frontend (React + Vite)

Interfaz web construida con React, diseñada para funcionar junto al backend desarrollado en Spring Boot, reproduciendo las funcionalidades esenciales de una red social tipo Twitter:

Registro y login con JWT

Timeline de publicaciones

Crear, editar y eliminar publicaciones

Likes y comentarios

Perfiles con seguidores/seguidos

Rutas protegidas según autenticación

La app gestiona sesión persistente con:

✔ accessToken + refreshToken
✔ Guardado en localStorage
✔ Renovación automática del accessToken

🚀 Tecnologías utilizadas
Tecnología	Uso
React 18	UI y gestión del estado con hooks
Vite	Bundler rápido y entorno de desarrollo
React Router	Navegación entre vistas
Axios	Cliente HTTP para comunicación con el backend
Context API	Gestión global de autenticación
LocalStorage	Persistencia de tokens y sesión
CSS Modules / Styles propios	Estilo de componentes
📂 Estructura del proyecto
clientetfa/
├── public/
├── src/
│   ├── api/
│   │   ├── axiosConfig.js
│   │   └── authService.js
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── PostCard.jsx
│   │   ├── PrivateRoute.jsx
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── usePosts.js
│   │   └── usePagination.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Timeline.jsx
│   │   ├── Profile.jsx
│   │   ├── CreatePost.jsx
│   │   └── FollowersList.jsx
│   ├── router/
│   │   └── AppRouter.jsx
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── .env
├── package.json
└── vite.config.js

🔐 Autenticación y Seguridad

Sistema de login basado en JWT:

Token	Dónde se guarda	Cuándo se usa
accessToken	memoria + localStorage	Autorización diaria (peticiones)
refreshToken	localStorage	Renovar sesión al expirar accessToken

📌 Mecanismo general:

Usuario hace login → backend responde con tokens

Tokens se guardan en localStorage

AuthContext mantiene el accessToken activo

Si expira → se envía petición automática:

POST /api/v1/auth/refresh


Se actualiza token sin perder sesión

Esto lo gestiona:

📌 AuthContext.jsx
📌 axiosConfig.js → interceptores que añaden el token en headers

Authorization: Bearer <access_token>

🧠 Estado global – AuthContext

Controla:

Usuario autenticado

accessToken y refreshToken

Login/logout

Carga del usuario desde localStorage al iniciar

Fragmento clave:

useEffect(() => {
  const savedToken = localStorage.getItem("accessToken");
  if (savedToken) {
    setAccessToken(savedToken);
    setIsAuthenticated(true);
  }
}, []);


Componentes protegidos mediante:

<PrivateRoute>
   <Timeline />
</PrivateRoute>

🔄 Comunicación con la API

📌 Configuración en src/api/axiosConfig.js

Incluye:

baseURL hacia backend

Interceptor para añadir token a cada request

Interceptor de respuestas para refrescar token automáticamente

Servicios divididos por dominio:

Archivo	Funciones
authService.js	login, register, refreshToken
publicationService.js	CRUD publicaciones, timeline
followService.js	seguir / dejar de seguir usuarios
commentService.js	añadir y consultar comentarios
likeService.js	likes

Ejemplo:

export const login = (credentials) =>
  axios.post("/api/v1/auth/login", credentials);

🗺️ Rutas (SPA)

📌 Definidas en router/AppRouter.jsx usando React Router v6

Ruta	Página	Privado
/login	Login	❌
/register	Registro	❌
/timeline	Timeline	✅
/profile/:userId	Perfil del usuario	✅
/posts/create	Crear publicación	✅
/followers/:userId	Seguidores	✅
/following/:userId	Seguidos	✅

Si el usuario no está logueado, se redirige a:

/login

📝 Principales Páginas
Página	Contiene
Login / Register	Formularios con validaciones
Timeline	publicaciones de usuarios que sigues (paginado)
Perfil usuario	publicaciones propias + seguidores/seguidos
Crear publicación	envío de texto y refresco del timeline
Detalle publicación	comentarios + likes
✨ Componentes Destacados
Componente	Rol
Navbar	Menú superior, logout, acceso al perfil
PostCard	Publicación con usuario, fecha, likes, comentarios
PrivateRoute	Autorización por JWT
Pagination	Navegación cómoda entre páginas
📦 Scripts disponibles
Comando	Función
npm install	Instala dependencias
npm run dev	Arranca la app en modo desarrollo
npm run build	Genera build para producción
npm run preview	Previsualiza build
⚙️ Variables de entorno

Archivo .env (ejemplo):

VITE_API_URL=http://localhost:8080


Asegúrate de reiniciar Vite si modificas este archivo.

▶️ Cómo ejecutar el proyecto

1️⃣ Instalar dependencias

npm install


2️⃣ Configurar .env con tu backend ↓

VITE_API_URL=http://localhost:8080


3️⃣ Iniciar frontend

npm run dev


4️⃣ Abrir en navegador
👉 http://localhost:5173

Requiere backend levantado: http://localhost:8080

🧩 Posibles mejoras futuras

Soporte para subida de imágenes en publicaciones

Mejor sistema de refresco de token (rollover)

Skeleton loading y animaciones de UI

Chat en tiempo real (WebSockets)

Notificaciones automáticas (Push API)

Tests con Cypress / Jest

🔐 Seguridad aplicada

✔ Tokens renovados automáticamente
✔ Rutas privadas protegidas
✔ Password nunca almacenada en cliente
✔ Backend valida siempre la autorización

📌 Conclusión

Este frontend está organizado de forma moderna, escalable y profesional:

Separación clara de responsabilidades

Autenticación JWT robusta

Comunicación optimizada con interceptores Axios

Navegación SPA con rutas privadas

Estructura lista para crecer