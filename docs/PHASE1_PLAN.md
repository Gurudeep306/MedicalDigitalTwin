# Phase 1 - MVP Implementation Plan

## Current Status: ✅ Project Structure Created

### What's Been Set Up

#### Frontend (Next.js + React + TypeScript)
- ✅ Project scaffolding with Next.js 14
- ✅ TypeScript configuration
- ✅ Tailwind CSS styling setup
- ✅ Project structure with organized folders
  - `src/app/` - Next.js pages
  - `src/components/` - React components (3D and UI)
  - `src/store/` - Zustand state management
  - `src/lib/` - API client utilities
  - `src/types/` - TypeScript interfaces
  - `src/utils/` - Helper functions
- ✅ Home page placeholder
- ✅ Type definitions for Medicine, Patient, Organ, SideEffect

#### Backend (FastAPI)
- ✅ FastAPI application structure
- ✅ SQLAlchemy models setup
- ✅ Pydantic schemas for validation
- ✅ API routes framework:
  - `/api/medicines/` - Medicine search and details
  - `/api/patients/` - Patient management
  - `/api/simulation/` - Simulation endpoints
- ✅ CORS middleware configuration
- ✅ Environment configuration system

#### Project Configuration
- ✅ README.md with project overview
- ✅ .env.example template
- ✅ .gitignore for both frontend and backend
- ✅ Directory structure documentation

---

## Next Steps to Complete MVP

### Step 1: Install Dependencies & Run Servers (15 mins)

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.main
```

### Step 2: Implement Three.js 3D Anatomy Viewer (2-3 hours)

**Location**: `frontend/src/components/3d/AnatomyViewer.tsx`

**Requirements**:
- Basic 3D scene with Three.js
- Load a simple human mesh (can use a basic model or procedural generation)
- Add interactive camera controls
- Implement layer visibility toggle (skeletal, organs, muscles)
- Add mouse interactions for rotation/zoom

**Components to create**:
```
src/components/3d/
├── AnatomyViewer.tsx          # Main 3D viewer component
├── Scene.tsx                  # Three.js scene setup
├── Organs.tsx                 # Organ geometry and rendering
├── LayerToggle.tsx            # Visibility controls
└── OrganHighlight.tsx         # Selection highlighting
```

### Step 3: Connect Medicine Search (1-2 hours)

**Location**: `frontend/src/components/ui/MedicineSearch.tsx`

**Requirements**:
- Search input field with debouncing
- Connect to backend `/api/medicines/search` endpoint
- Display search results
- Select medicine to view details

**Implementation**:
- Use `useQuery` from react-query for data fetching
- Create hook: `useMedicineSearch(query: string)`
- Add loading and error states
- Display medicine info (name, dosage, manufacturer)

### Step 4: Build Organ Highlighting System (1-2 hours)

**Location**: `frontend/src/components/3d/OrganHighlight.tsx`

**Requirements**:
- Click on organs in 3D model to select
- Highlight selected organs
- Show affected organs based on medicine selection
- Color coding system for side effects

**Integration**:
- Connect to Zustand store (`useAnatomyStore`)
- Update store when organs are selected
- Show side effects panel for selected combination

### Step 5: Implement Side-Effect Animations (2-3 hours)

**Location**: `frontend/src/components/3d/SideEffectAnimation.tsx`

**Requirements**:
- Animate affected organs based on medicine
- Create visual effects (color changes, swelling, inflammation)
- Timeline slider to show progression
- Multiple medicine interaction visualization

**Animations to implement**:
- Organ swelling/inflammation
- Color transitions (healthy to damaged)
- Particle effects for toxicity
- Timeline-based progression (1 month → 6 months → 1 year)

---

## File Structure at This Stage

```
project/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx          ✅ Created
│   │   │   ├── page.tsx            ✅ Created (MVP landing page)
│   │   │   └── globals.css         ✅ Created
│   │   ├── components/
│   │   │   ├── 3d/
│   │   │   │   ├── AnatomyViewer.tsx      ✅ Created (placeholder)
│   │   │   │   ├── Scene.tsx              📝 TODO
│   │   │   │   ├── Organs.tsx             📝 TODO
│   │   │   │   └── OrganHighlight.tsx     📝 TODO
│   │   │   └── ui/
│   │   │       ├── MedicineSearch.tsx     ✅ Created (placeholder)
│   │   │       └── SideEffectPanel.tsx    📝 TODO
│   │   ├── store/
│   │   │   └── anatomy.ts          ✅ Created (Zustand store)
│   │   ├── lib/
│   │   │   └── api.ts              ✅ Created (API client)
│   │   ├── types/
│   │   │   └── index.ts            ✅ Created (Type definitions)
│   │   └── utils/
│   │       └── helpers.ts          ✅ Created
│   ├── package.json                ✅ Created
│   ├── tsconfig.json               ✅ Created
│   ├── tailwind.config.js          ✅ Created
│   └── next.config.js              ✅ Created
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── medicines.py        ✅ Created (mock data)
│   │   │   ├── patients.py         ✅ Created (mock data)
│   │   │   └── simulation.py       ✅ Created (mock endpoints)
│   │   ├── models/
│   │   │   └── models.py           ✅ Created (DB schemas)
│   │   ├── schemas/
│   │   │   └── schemas.py          ✅ Created (Pydantic models)
│   │   ├── core/
│   │   │   └── config.py           ✅ Created (Settings)
│   │   └── main.py                 ✅ Created (FastAPI app)
│   └── requirements.txt            ✅ Created
│
├── docs/
│   └── PHASE1_PLAN.md             ✅ This file
│
├── README.md                       ✅ Created
├── .env.example                    ✅ Created
└── .gitignore                      ✅ Created
```

---

## Key Files to Understand

### Frontend Type System
- `src/types/index.ts` - All TypeScript interfaces for the app

### State Management
- `src/store/anatomy.ts` - Zustand store for app state
  - `visibleLayers` - Which anatomy layers to show
  - `selectedOrgans` - Currently highlighted organs
  - `selectedMedicine` - Current medicine being viewed

### API Communication
- `src/lib/api.ts` - All backend API calls
  - `medicineAPI.search()` - Search medicines
  - `medicineAPI.getSideEffects()` - Get side effects
  - `patientAPI.create()` - Create patient
  - `simulationAPI.simulateMedicineEffects()` - Run simulation

---

## Environment Setup

Copy `.env.example` to `.env.local` in frontend and `.env` in backend, then update:

**Frontend (.env.local)**:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Backend (.env)**:
```
DATABASE_URL=postgresql://user:password@localhost:5432/medical_twin
OPENAI_API_KEY=your_key_here
DRUGBANK_API_KEY=your_key_here
```

---

## MVP Checklist

- [ ] Install dependencies for both frontend and backend
- [ ] Start both servers successfully
- [ ] See home page at http://localhost:3000
- [ ] Implement Three.js 3D anatomy viewer
- [ ] Connect medicine search to backend
- [ ] Implement organ selection and highlighting
- [ ] Add side-effect animations
- [ ] Test full workflow: Search medicine → Select organs → View effects

---

## Common Issues & Solutions

### Port Already in Use
```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 8000 (backend)
lsof -ti:8000 | xargs kill -9
```

### Module Not Found
```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && pip install -r requirements.txt
```

### TypeScript Errors
```bash
# Check types
cd frontend && npm run type-check
```

---

## Resources for Implementation

### Three.js Learning
- Three.js Documentation: https://threejs.org/docs/
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber/

### 3D Models
- Free models: https://sketchfab.com/ (search for human anatomy)
- Polygon models: https://www.turbosquid.com/

### Medical Data
- DrugBank: https://www.drugbank.ca/
- OpenFDA: https://open.fda.gov/

---

**Next action**: Run `npm install` in frontend and `pip install -r requirements.txt` in backend to start development!
