Journal de Voyage - Backend

Backend pour l’application Journal de Voyage interactif (React Native).
Ce backend permet la gestion des utilisateurs, de l’authentification et des photos (avec upload d’images).

Fonctionnalités

Authentification avec JWT (register / login)

Ajout et récupération des photos avec gestion de l’upload (Multer)

Chaque photo est reliée à un utilisateur

Un utilisateur ne peut voir que ses propres photos

Endpoints pour récupérer les infos de profil + toutes ses photos + sa dernière photo

Structure du projet
backend/
│── server.js             # Point d’entrée
│── .env                  # Variables d’environnement
│── uploads/              # Dossier des fichiers uploadés
│── src/
│   ├── models/           # Schémas Mongoose (User, Photo)
│   ├── routes/           # Routes Express (auth, users, photos)
│   └── middleware/       # Middleware (authMiddleware.js)

Installation
1. Cloner le projet
git clone <repo-url>
cd backend

2. Installer les dépendances
npm install

3. Configurer les variables d’environnement

Créer un fichier .env à la racine avec :

PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/journal_voyage
JWT_SECRET=tonSuperSecret123

4. Créer le dossier pour les uploads
mkdir uploads

5. Lancer le serveur
npm run dev


Par défaut le backend tourne sur :
http://localhost:5000

Routes disponibles
Auth

POST /api/auth/register → inscription utilisateur

{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "monmotdepasse"
}


POST /api/auth/login → connexion (renvoie un JWT)

{
  "email": "alice@example.com",
  "password": "monmotdepasse"
}

Utilisateur

GET /api/users/me → infos utilisateur connecté + ses photos + dernière photo
Headers :

Authorization: Bearer <token>

Photos

POST /api/photos → ajouter une photo (protégé)
Type : form-data
| KEY | TYPE | VALUE |
|----------|------|-------|
| photo | File | image.jpg |
| location | Text | {"latitude":48.85,"longitude":2.35} |
| date | Text | 2025-09-05T10:30:00Z |

Headers :

Authorization: Bearer <token>


GET /api/photos → récupérer les photos de l’utilisateur connecté

Technologies utilisées

Node.js + Express

MongoDB + Mongoose

JWT (authentification)

Multer (upload d’images)

Dotenv (variables d’environnement)

Cors (API accessible par le frontend)
