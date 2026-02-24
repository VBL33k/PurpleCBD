# Purple CBD

Site vitrine luxe pour Purple CBD — RP Server.

## Stack

- **Frontend** : React + Vite + CSS Modules
- **Backend** : Node.js + Express
- **Hébergement** : Render (frontend Static Site + backend Web Service)

## Structure

```
PurpleCBD/
├── frontend/        # React app (Vite)
├── backend/         # Express API
└── render.yaml      # Render deployment config
```

## Développement local

### Frontend
```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

### Backend
```bash
cd backend
npm install
npm run dev       # http://localhost:3001
```

## Déploiement Render

Le fichier `render.yaml` configure automatiquement les deux services.

1. Connecte le repo GitHub sur [render.com](https://render.com)
2. Render détecte le `render.yaml` et crée les deux services
3. Le frontend reçoit automatiquement l'URL de l'API via `VITE_API_URL`

## Variables d'environnement

### Backend
Copie `backend/.env.example` → `backend/.env` et remplis les valeurs.
