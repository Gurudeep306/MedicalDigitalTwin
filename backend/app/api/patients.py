from fastapi import APIRouter, HTTPException
from app.schemas.schemas import PatientSchema

router = APIRouter()

# Mock data
patients_db = {}

@router.post("/")
async def create_patient(patient: PatientSchema):
    """Create a new patient"""
    patient_id = len(patients_db) + 1
    patient_data = patient.dict()
    patient_data["id"] = patient_id
    patients_db[patient_id] = patient_data
    return patient_data

@router.get("/{patient_id}")
async def get_patient(patient_id: int):
    """Get patient details by ID"""
    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patients_db[patient_id]

@router.put("/{patient_id}/medications")
async def update_medications(patient_id: int, medicines: dict):
    """Update patient medications"""
    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail="Patient not found")
    patients_db[patient_id]["medicines"] = medicines.get("medicines", [])
    return patients_db[patient_id]
