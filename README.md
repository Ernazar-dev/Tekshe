# TEKSHE — Shet eldegi studentler

Qaraqalpaqstan jasları ushın grantlar, mentorlar hám shet elde oqıw boyınsha platforma.

```
tekshe/
├── frontend/   React 18 + Vite + TypeScript + Tailwind CSS + React Query
└── backend/    Node.js + Express + TypeScript + Zod (JSON-fayl bazası)
```

## Iske túsiriw (lokal)

Eki terminal kerek. Node.js ≥ 20.12.

```bash
# 1-terminal — API (http://localhost:4000/api)
cd backend
npm install
npm run dev

# 2-terminal — sayt (http://localhost:5173)
cd frontend
npm install
npm run dev
```

Vite `/api` sorawların avtomat túrde backend'ke jiberedi, `.env` fayllar májbúriy emes.

## Buyrıqlar

| Papka      | Buyrıq            | Ne isleydi                              |
| ---------- | ----------------- | --------------------------------------- |
| `backend`  | `npm run dev`     | API (ózgeriste avtomat qayta júklenedi) |
| `backend`  | `npm test`        | API testleri (Vitest + Supertest)       |
| `backend`  | `npm run build`   | `dist/` ga kompilyaciya                 |
| `backend`  | `npm start`       | Production server (`dist/server.js`)    |
| `frontend` | `npm run dev`     | Dev server                              |
| `frontend` | `npm run build`   | Tip tekseriw + production build         |
| `frontend` | `npm run preview` | Build'ti kóriw                          |

## Rollar hám kabinet

| Rol        | Dizimnen ótiw       | Imkaniyatlar                                                                  |
| ---------- | ------------------- | ----------------------------------------------------------------------------- |
| `student`  | erkin               | profil, tayarlıq dizimi (serverde saqlanadı), mas mentorlar usınısı, sorawlar |
| `mentor`   | admin tastıyıqlaydı | profil, kelgen sorawlarǵa juwap                                               |
| `employer` | admin tastıyıqlaydı | kárxana, vakansiyalar (hár biri moderatordan ótedi), kelgen arzalar           |
| `admin`    | tek seed arqalı     | paydalanıwshılar, moderaciya, studentler dizimi, jurnal (audit)               |

Frontend: `/kirish`, `/dizimnen-otiw`, `/kabinet/*` (rolge qaray menyu), `/studentler` (ashıq statistika).

Sırlar kodta saqlanbaydı — barlıǵı `backend/.env` de (git ke túspeydi; úlgi: `backend/.env.example`):
`JWT_SECRET` (shárt, keminde 16 belgi) hám hár rol ushın bir akkaunt: `ADMIN_*`, `MENTOR_*`, `STUDENT_*`, `EMPLOYER_*`
(`*_LOGIN` + `*_PASSWORD`; login: 3–32 belgi — háripler, sanlar, `.` `_` `-`, parol keminde 8 belgi). Server iske túskende akkauntlar bazaǵa jaratıladı, `.env` degi parol ózgerse — jańalanadı.
Berilmegen rol jaratılmaydı; production'da tek `ADMIN_*` shárt.

## API

Avtorizaciya: `Authorization: Bearer <JWT>`. Parollar scrypt penen xeshlenedi, kiriw urınısları sheklengen.

**Ashıq:** GET `/api/health`, `/stats`, `/community`, `/grants` (`level`), `/mentors` (`country`), `/vacancies` (`field`), `/guides`, `/support-topics`;
POST `/api/auth/register`, `/api/auth/login`.

**Kiriw talap etiledi**

| Marshrut                                                                                                   | Rol              |
| ---------------------------------------------------------------------------------------------------------- | ---------------- |
| GET/PATCH `/api/auth/me`, POST `/api/auth/password`                                                        | barlıǵı          |
| POST `/api/requests`, GET `/api/me/requests`                                                               | barlıǵı          |
| GET/PUT `/api/me/student`, PUT `/api/me/checklist`                                                         | student          |
| GET/PUT `/api/me/mentor`                                                                                   | mentor           |
| GET/PATCH `/api/me/inbox[/:id]`                                                                            | mentor, employer |
| GET/PUT `/api/me/company`, CRUD `/api/me/vacancies[/:id]`                                                  | employer         |
| `/api/admin/users`, `/vacancies`, `/students` (+ `export.csv`, `/:id/reveal`), `/overview`, `/audit`, `/staff` | admin            |

Studentler dizimi ashıq emes — tek admin kóredi. Kontaktti ashıw (`reveal`), CSV júklew hám barlıq admin háreketleri jurnalǵa jazıladı.
Barlıq kiriwler Zod penen tekseriledi; POST sorawları bir IP ushın 15 minutta 20 menen sheklengen.

## Maǵlıwmatlar

Lokal islewde paydalanıwshılar, studentler, sorawlar hám jurnal `backend/data/db.json` faylında, production'da Neon Postgres te (`DATABASE_URL`) saqlanadı (birinshi iske túsiriwde úlgi maǵlıwmat penen jaratıladı).
Bazanı basınan baslaw ushın — bul fayldı óshiriń. Grantlar, mentorlar, vakansiyalar — `backend/src/data/content.ts`.

## Deploy: GitHub → Render + Neon (bári tegin)

Qurılıs: **Neon** (Postgres baza) ← **tekshe-api** (Render Web Service, Node) ← **tekshe-web** (Render Static Site, React).
Sazlawlar `render.yaml` Blueprint'inde tayar.

### 1. Neon (baza)
1. https://neon.tech → jańa Project (region Render menen jaqın: Frankfurt / EU).
2. **Connect** → **Pooled connection** → URL di kóshirip alıń (`postgresql://…-pooler…/neondb?sslmode=require`). Bul — `DATABASE_URL`.
3. Keste qolda jaratılmaydı: server birinshi iske túskende `app_state` kestesin ózi jaratadı.

### 2. GitHub
```bash
git add .
git commit -m "TEKSHE: dastlabki versiya"
# GitHub'ta bos repo jaratıp (README/.gitignore qospay), onıń URL in qoyıń:
git remote add origin https://github.com/<login>/tekshe.git
git push -u origin main
```
`.env` fayllar, `node_modules`, `dist`, `backend/data` hám prezentaciya (`*.pptx`) `.gitignore` arqalı repoǵa túspeydi.

### 3. Render (Blueprint)
1. https://render.com → **New → Blueprint** → GitHub repo ńızdı tańlań. Render `render.yaml` di oqıp eki xızmet jaratadı.
2. **tekshe-api** ushın paneli soraǵan sırlardı kiritiń:
   | Kalit | Mán |
   | --- | --- |
   | `DATABASE_URL` | Neon pooled URL |
   | `ADMIN_LOGIN` / `ADMIN_PASSWORD` | admin akkaunt (parol keminde 8 belgi) |
   | `CORS_ORIGIN` | dáslep waqıtsha `https://tekshe-web.onrender.com` (tómende dúzetiledi) |
   `JWT_SECRET` Render tárepinen avtomat jaratıladı.
3. **tekshe-web** ushın: `VITE_API_URL` = `https://tekshe-api.onrender.com/api` (api xızmetiniń haqıyqıy URL i + `/api`).
4. Eki xızmet te deploy bolǵannan keyin Render bergen **haqıyqıy URL lerdi** tekseriń:
   - Frontend URL i `tekshe-web.onrender.com` den ayrıqsha bolsa → api daǵı `CORS_ORIGIN` di sol URL ge ózgertiń (sońında `/` bolmasın).
   - Api URL i ayrıqsha bolsa → web daǵı `VITE_API_URL` di dúzetip, web ti **Manual Deploy** etiń (bul mán build waqtında kodqa jazıladı).
5. Tekseriw: `https://<api>/api/health` → `{"status":"ok"}`, keyin saytqa kirip `ADMIN_LOGIN` menen kiriń.

### Biliw kerek (tegin tarif)
- **Render Free** api 15 minut háreketsiz bolsa uyqıǵa ketedi; keyingi sorawda oyanıwı ~30–60 sekund aladı. Neon da bos waqıtta uyqıǵa ketedi (birinshi soraw birazǵa keshigedi).
- Render fayl sisteması waqtınsha — sonlıqtan production'da tek Postgres isletiledi (`DATABASE_URL` bolmasa server iske túspeydi).
- Baza `app_state` kestesinde bir jsonb jazıw retinde turadı. Kishi joybar ushın qolaylı; paydalanıwshılar kóbeyse, kesteler boyınsha bóliw kerek boladı.
- Birinshi iske túskende úlgi maǵlıwmat (studentler, mentorlar, vakansiyalar) qosıladı; `.env` degi `*_LOGIN/*_PASSWORD` akkauntları jaratıladı. Production'da tek `ADMIN_*` beriń, basqa rollardı haqıyqıy paydalanıwshılar dizimnen ótip aladı.
- Baza URL i yamasa paroller ózgerse: Render → Environment → ózgertiń (parol `ADMIN_PASSWORD` ózgerse keyingi iske túsiwde avtomat jańalanadı).
- Ózińizdiń domen: Render → Settings → Custom Domains; keyin `CORS_ORIGIN` hám `VITE_API_URL` di jańalań.

### Lokal islew (JSON fayl menen, Neon kerek emes)
`DATABASE_URL` di bos qaldırıń — baza `backend/data/db.json` faylında saqlanadı. Neon menen lokal sınap kóriw ushın `backend/.env` ge `DATABASE_URL` qosıń.
