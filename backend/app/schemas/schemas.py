from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SideEffectSchema(BaseModel):
    id: str
    name: str
    severity: str
    affected_organs: List[str]
    description: str

class MedicineSchema(BaseModel):
    id: Optional[int] = None
    name: str
    active_ingredient: str
    dosage: str
    manufacturer: str
    description: Optional[str] = None
    side_effects: List[SideEffectSchema] = []
    
    class Config:
        from_attributes = True

class PatientSchema(BaseModel):
    id: Optional[int] = None
    name: str
    age: int
    gender: str
    height: float
    weight: float
    bmi: float
    medical_history: Optional[str] = None
    
    class Config:
        from_attributes = True

class SimulationRequestSchema(BaseModel):
    patient_id: int
    medicines: List[int]
    timeframe: str
    duration_months: Optional[int] = 12
