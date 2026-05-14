# Development Guide

## Quick Start

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- PostgreSQL 14+ (optional, for database)
- Git

### 1. Frontend Setup

```bash
cd frontend
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Start development server
npm run dev
```

Frontend will be available at: **http://localhost:3000**

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp ../.env.example .env
# Edit .env with your settings

# Run development server
python -m app.main
```

Backend will be available at: **http://localhost:8000**

API documentation: **http://localhost:8000/docs** (Swagger UI)

---

## Project Structure Overview

### Frontend Structure

```
frontend/src/
├── app/                  # Next.js app directory
│   ├── layout.tsx       # Root layout with providers
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
│
├── components/          # Reusable React components
│   ├── 3d/             # Three.js 3D components
│   │   ├── AnatomyViewer.tsx
│   │   ├── Scene.tsx
│   │   ├── Organs.tsx
│   │   └── OrganHighlight.tsx
│   └── ui/             # UI components
│       ├── MedicineSearch.tsx
│       ├── SideEffectPanel.tsx
│       └── OrganSelector.tsx
│
├── hooks/              # Custom React hooks
│   ├── useMedicineSearch.ts
│   ├── useSimulation.ts
│   └── useOrganData.ts
│
├── lib/               # Utility libraries
│   ├── api.ts        # API client (axios)
│   └── db.ts         # Local storage utilities
│
├── store/            # Zustand state stores
│   ├── anatomy.ts    # Anatomy/organs state
│   ├── medicine.ts   # Medicine selection state
│   └── ui.ts         # UI state
│
├── types/            # TypeScript interfaces
│   └── index.ts      # All type definitions
│
└── utils/            # Helper functions
    ├── helpers.ts
    ├── animations.ts
    └── calculations.ts
```

### Backend Structure

```
backend/app/
├── main.py              # FastAPI application entry point
│
├── api/                 # API routes
│   ├── medicines.py    # Medicine endpoints
│   ├── patients.py     # Patient endpoints
│   ├── simulation.py   # Simulation endpoints
│   └── health.py       # Health check endpoints
│
├── models/             # SQLAlchemy ORM models
│   ├── models.py       # Database models
│   └── relationships.py # Model relationships
│
├── schemas/            # Pydantic request/response models
│   └── schemas.py      # Data validation schemas
│
├── services/           # Business logic
│   ├── medicine_service.py
│   ├── simulation_service.py
│   └── ai_service.py
│
├── db/                 # Database utilities
│   ├── database.py     # Database connection
│   ├── crud.py         # CRUD operations
│   └── init_db.py      # Database initialization
│
└── core/               # Core configuration
    ├── config.py       # Settings
    ├── security.py     # Auth utilities
    └── constants.py    # Constants
```

---

## Common Development Tasks

### Adding a New API Endpoint

1. **Define Pydantic schema** in `backend/app/schemas/schemas.py`:
```python
class NewEndpointRequest(BaseModel):
    field1: str
    field2: int

class NewEndpointResponse(BaseModel):
    result: str
    status: str
```

2. **Create API route** in `backend/app/api/new_router.py`:
```python
from fastapi import APIRouter
from app.schemas.schemas import NewEndpointRequest, NewEndpointResponse

router = APIRouter()

@router.post("/endpoint")
async def new_endpoint(request: NewEndpointRequest) -> NewEndpointResponse:
    """Endpoint description"""
    result = process_data(request.field1)
    return NewEndpointResponse(result=result, status="success")
```

3. **Register router** in `backend/app/main.py`:
```python
from app.api import new_router

app.include_router(new_router.router, prefix="/api/new", tags=["new"])
```

### Adding a New Component

1. **Create component** in `frontend/src/components/`:
```typescript
'use client'

import { FC } from 'react'

interface MyComponentProps {
  title: string
  onAction?: () => void
}

const MyComponent: FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <div className="p-4 bg-white rounded-lg">
      <h2>{title}</h2>
      {onAction && <button onClick={onAction}>Action</button>}
    </div>
  )
}

export default MyComponent
```

2. **Export from index** (optional):
```typescript
// src/components/index.ts
export { default as MyComponent } from './MyComponent'
```

3. **Use in page/component**:
```typescript
import MyComponent from '@components/MyComponent'

export default function Page() {
  return <MyComponent title="Hello" onAction={() => alert('clicked')} />
}
```

### Using the Zustand Store

**Define store** in `frontend/src/store/anatomy.ts`:
```typescript
import { create } from 'zustand'

interface AnatomyState {
  organs: string[]
  addOrgan: (organ: string) => void
}

export const useAnatomyStore = create<AnatomyState>((set) => ({
  organs: [],
  addOrgan: (organ) => set((state) => ({
    organs: [...state.organs, organ]
  }))
}))
```

**Use in component**:
```typescript
import { useAnatomyStore } from '@store/anatomy'

export default function OrganList() {
  const { organs, addOrgan } = useAnatomyStore()
  
  return (
    <div>
      {organs.map((organ) => (
        <div key={organ}>{organ}</div>
      ))}
      <button onClick={() => addOrgan('heart')}>Add Heart</button>
    </div>
  )
}
```

### API Integration

**Using the API client**:
```typescript
import { medicineAPI } from '@lib/api'

export const useMedicineSearch = (query: string) => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const search = async () => {
    setLoading(true)
    try {
      const data = await medicineAPI.search(query)
      setResults(data.results)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return { results, loading, search }
}
```

---

## Database Setup

### PostgreSQL Installation

**macOS**:
```bash
brew install postgresql
brew services start postgresql

# Create database
createdb medical_twin
```

**Ubuntu/Debian**:
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb medical_twin
```

**Windows**:
- Download from https://www.postgresql.org/download/windows/
- Run installer and follow prompts

### Initialize Database

```bash
cd backend
python -c "from app.db.init_db import init_db; init_db()"
```

### Database Migrations (using Alembic)

```bash
# Install alembic
pip install alembic

# Create migration
alembic revision --autogenerate -m "add new table"

# Apply migration
alembic upgrade head
```

---

## Testing

### Frontend Tests

```bash
cd frontend

# Install testing dependencies
npm install --save-dev @testing-library/react jest

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Backend Tests

```bash
cd backend

# Install pytest
pip install pytest pytest-cov

# Run tests
pytest

# Run with coverage
pytest --cov=app
```

---

## Environment Variables

### Frontend (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Optional: Analytics
NEXT_PUBLIC_GA_ID=
```

### Backend (.env)

```env
# Server
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/medical_twin

# Security
SECRET_KEY=your-secret-key-here

# External APIs
OPENAI_API_KEY=
DRUGBANK_API_KEY=
OPENFDA_API_KEY=

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

---

## Debugging

### Frontend Debugging

1. **Use browser DevTools**:
   - Open DevTools: F12 or Cmd+Option+I
   - Check Network tab for API calls
   - Check Console for errors

2. **VS Code Debugging**:
   - Install "Debugger for Chrome" extension
   - Add launch configuration in `.vscode/launch.json`

3. **React DevTools**:
   - Install React DevTools browser extension
   - Inspect components and state

### Backend Debugging

```bash
# Run with debugger
python -m pdb -m app.main

# Or use VS Code with Python extension
# Add breakpoints and press F5 to debug
```

---

## Building for Production

### Frontend Build

```bash
cd frontend
npm run build
npm run start
```

### Backend Build

```bash
cd backend
gunicorn -w 4 -b 0.0.0.0:8000 app.main:app
```

### Docker Build

```bash
# Build frontend image
docker build -t medical-twin-frontend ./frontend

# Build backend image
docker build -t medical-twin-backend ./backend

# Run containers
docker run -p 3000:3000 medical-twin-frontend
docker run -p 8000:8000 medical-twin-backend
```

---

## Code Style & Linting

### Frontend

```bash
cd frontend

# Format code
npm run format

# Lint
npm run lint

# Type checking
npm run type-check
```

### Backend

```bash
cd backend

# Format with black
black app/

# Lint with pylint
pylint app/

# Type checking with mypy
mypy app/
```

---

## Troubleshooting

### Port Already in Use

```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9  # Kill port 3000
lsof -ti:8000 | xargs kill -9  # Kill port 8000

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Module Not Found

```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && pip install -r requirements.txt
```

### Database Connection Error

```bash
# Check PostgreSQL is running
psql -U postgres -d medical_twin -c "SELECT 1"

# Check DATABASE_URL in .env
# Format: postgresql://username:password@localhost:5432/medical_twin
```

### CORS Error

- Check `CORS_ORIGINS` in backend `.env`
- Ensure frontend URL is in the list
- Browser console will show exact origin

---

## Useful Commands

```bash
# Frontend
npm install          # Install dependencies
npm run dev         # Start dev server
npm run build       # Build for production
npm run lint        # Run linter
npm test            # Run tests

# Backend
pip install -r requirements.txt  # Install dependencies
python -m app.main               # Start server
python -m pytest                 # Run tests
python manage.py migrate         # Database migrations
```

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Three.js Documentation](https://threejs.org/docs/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)

---

**Next Step**: Run `npm install` in frontend and `pip install -r requirements.txt` in backend to start development!
