# Medical Digital Twin Platform

A comprehensive AI-powered medical visualization platform combining personalized human anatomy, medicine simulations, and interactive 3D rendering.

## Project Structure

```
project/
├── frontend/          # Next.js React TypeScript web application
│   ├── src/
│   │   ├── app/      # Next.js app directory
│   │   ├── components/
│   │   │   ├── 3d/   # Three.js 3D components
│   │   │   └── ui/   # UI components
│   │   ├── hooks/    # Custom React hooks
│   │   ├── lib/      # Utility libraries and API clients
│   │   ├── store/    # Zustand state management
│   │   ├── types/    # TypeScript type definitions
│   │   └── utils/    # Helper functions
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
│
├── backend/          # FastAPI Python backend
│   ├── app/
│   │   ├── api/      # API route handlers
│   │   ├── core/     # Configuration and settings
│   │   ├── models/   # SQLAlchemy database models
│   │   ├── schemas/  # Pydantic request/response schemas
│   │   ├── services/ # Business logic services
│   │   ├── db/       # Database utilities
│   │   └── main.py   # FastAPI application entry point
│   └── requirements.txt
│
└── docs/            # Documentation

## MVP Features (Phase 1)

- ✅ 3D Anatomy Viewer
- ✅ Medicine Search
- ✅ Organ Highlighting
- ✅ Side-effect Animations (ready for implementation)

## Tech Stack

### Frontend
- **Framework**: Next.js 14 + React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **3D Graphics**: Three.js + React Three Fiber
- **State Management**: Zustand
- **HTTP Client**: Axios

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Database**: PostgreSQL (optional)
- **ORM**: SQLAlchemy

## Quick Start

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python -m app.main
```

Backend runs at [http://localhost:8000](http://localhost:8000)

## API Endpoints

### Medicines
- `GET /api/medicines/search?q=query` - Search medicines
- `GET /api/medicines/{id}` - Get medicine details
- `GET /api/medicines/{id}/side-effects` - Get side effects

### Patients
- `POST /api/patients` - Create patient
- `GET /api/patients/{id}` - Get patient details
- `PUT /api/patients/{id}/medications` - Update medications

### Simulation
- `POST /api/simulation/medicine-effects` - Simulate medicine effects
- `POST /api/simulation/organ-damage` - Simulate organ damage

## Development Roadmap

### Phase 1 - MVP (Current)
- 3D anatomy viewer
- Medicine search
- Organ highlighting
- Side-effect animations

### Phase 2 - Personalization
- Personalized body generation
- Disease-aware visualization
- Medical record integration

### Phase 3 - Advanced Simulation
- Long-term toxicity simulation
- Organ degeneration engine
- Timeline progression

### Phase 4 - Digital Twin
- Full physiological simulations
- Predictive AI systems
- Real-time body state modeling

### Phase 5 - Enterprise Scale
- Hospital integrations
- VR/XR support
- Clinical research systems

## Next Steps

1. Install frontend and backend dependencies
2. Set up PostgreSQL database
3. Implement Three.js 3D anatomy viewer
4. Connect to medical databases (DrugBank, OpenFDA)
5. Build medicine interaction simulation engine

## License

Proprietary - Medical Digital Twin Platform
