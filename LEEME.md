# GayoFitness — Arranque local (ordenador)

## Requisitos
- Node.js instalado
- MongoDB corriendo en local

## 1. Arranca MongoDB
```bash
# Mac/Linux
mongod --dbpath ~/data/db

# Windows
net start MongoDB
```

## 2. Arranca el backend
```bash
cd backend
npm install
node server.js
# → Servidor en http://localhost:3000
# → MongoDB conectado ✅
```

## 3. Arranca la app
```bash
cd mobile-app
npm install
npx expo start
# Pulsa W para abrir en el navegador
```

## Endpoints disponibles
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Registro |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/profile | Sí | Ver perfil |
| PUT | /api/auth/profile | Sí | Actualizar perfil |
| GET | /api/stats/today | Sí | Stats de hoy |
| GET | /api/stats/weekly | Sí | Stats 7 días |
| POST | /api/stats/today | Sí | Guardar progreso |
| GET | /api/recommendations | Sí | Recomendaciones |
