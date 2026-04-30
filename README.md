# SOS Campus - Application d'Urgence ENS Marrakech

Projet 13 - Module Mobile 2 - ENS Marrakech Departement Informatique

---

## Description

Application d'urgence campus permettant l'envoi rapide d'alertes SOS
avec geolocalisation et suivi d'intervention en temps reel.

---

## Acteurs

| Acteur | Interface | Role |
|--------|-----------|------|
| Etudiant | Android Mobile | Envoyer alertes SOS + Suivi |
| Agent | Web React | Traiter les alertes terrain |
| Admin | Web React | Supervision + Dashboard |

---

## Architecture Technique

- **Android** (Java) - Application mobile etudiant
- **Node.js + Express** - API REST backend port 5000
- **MySQL** - Base de donnees 4 tables max
- **React.js** - Interface web admin et agent

---

## Installation

### 1. Base de donnees
```
- Lancer XAMPP (Apache + MySQL)
- Importer le fichier SQL dans phpMyAdmin
```

### 2. Backend Node.js
```bash
cd backend
npm install
node app.js
```
Le serveur demarre sur http://localhost:5000

### 3. Frontend React
```bash
cd frontend
npm install
npm run dev
```
L'interface s'ouvre sur http://localhost:5173

### 4. Application Android
```
- Ouvrir le dossier android dans Android Studio
- Modifier l'IP dans RetrofitClient.java
- Lancer sur emulateur ou telephone reel
```

---

## Comptes de test

| Email | Mot de passe | Role |
|-------|-------------|------|
| admin@sos.ma | 123456 | ADMIN |
| etudiant@sos.ma | 123456 | USER |
| soukainaimaghri09@gmail.com | 123456 | AGENT |

---

## Structure du projet

```
PROJET-SOS/
├── backend/          # API Node.js + Express + MySQL
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── config/
│   └── app.js
├── frontend/         # Interface React.js
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── api/
│   └── package.json
└── android/          # Application Android Java
    └── app/src/main/java/
        ├── activities/
        ├── adapters/
        ├── api/
        └── models/
```

---

## Base de donnees - 4 Tables

| Table | Description |
|-------|-------------|
| users | Comptes utilisateurs avec roles |
| emergency_types | Types d'urgence (Medicale, Securite, Incendie, Autre) |
| emergency_requests | Alertes SOS envoyees |
| request_updates | Historique des changements |

---

## Statuts des alertes

| Statut | Couleur | Description |
|--------|---------|-------------|
| ENVOYEE | Rouge | Alerte envoyee, en attente |
| PRISE_EN_CHARGE | Ambre | Agent prend en charge |
| EN_INTERVENTION | Vert | Agent sur place |
| CLOTUREE | Violet | Incident resolu |

---

## Fonctionnalites Mobile Android

- Login avec authentification JWT
- Bouton SOS avec appui prolonge
- Choix type d'urgence (4 types)
- Envoi position GPS temps reel
- Message optionnel
- Suivi alerte en temps reel
- Historique mes alertes
- Mode clair / sombre

---

## Fonctionnalites Web React

- Dashboard avec statistiques
- Liste alertes en temps reel
- Carte GPS des alertes actives
- Filtrage par type / statut / date
- Affectation agent (dropdown)
- Changement statut
- Ajout mises a jour
- Cloture alertes
- Gestion types urgence (Admin)
- Gestion roles Admin / Agent

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/login | Connexion |
| GET | /api/auth/agents | Liste agents |
| POST | /api/emergencies | Creer alerte |
| GET | /api/emergencies | Toutes alertes |
| GET | /api/emergencies/mine | Mes alertes |
| GET | /api/emergencies/:id | Detail alerte |
| PATCH | /api/emergencies/:id/status | Changer statut |
| PUT | /api/emergencies/:id/assign | Affecter agent |
| POST | /api/emergencies/:id/updates | Ajouter MAJ |
| PUT | /api/emergencies/:id/close | Cloturer |
| GET | /api/emergency-types | Types urgence |

---

## Videos de demonstration


https://github.com/user-attachments/assets/549bcc17-ec9e-4b3b-9e6b-9218b69c154f



https://github.com/user-attachments/assets/acd27287-a608-4605-b2fc-31ffa32ca866


---

## Technologies utilisees

- Java (Android Studio)
- Retrofit2 (HTTP client Android)
- Node.js + Express.js
- MySQL + XAMPP
- React.js + Vite
- JWT (authentification)
- Leaflet.js (carte GPS)
- Recharts (graphiques)

---

ENS Marrakech - Departement Informatique - 2026
