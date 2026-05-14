from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class DiseaseSchema(BaseModel):
    id: str
    name: str
    description: str
    category: str  # e.g., "cardiovascular", "endocrine", "respiratory"
    affectedOrgans: List[str]
    symptoms: List[str]
    recommendedMedicines: List[str]  # Medicine names
    severity: str  # "mild", "moderate", "severe"

# Comprehensive disease database
diseases_db = {
    "hypertension": {
        "id": "hypertension",
        "name": "Hypertension (High Blood Pressure)",
        "description": "Elevated blood pressure that damages blood vessels and organs over time",
        "category": "cardiovascular",
        "affectedOrgans": ["vessels", "heart", "kidneys", "brain"],
        "symptoms": ["headache", "chest pain", "shortness of breath", "vision changes"],
        "recommendedMedicines": ["Lisinopril", "Amlodipine", "Atorvastatin"],
        "severity": "moderate",
    },
    "diabetes": {
        "id": "diabetes",
        "name": "Type 2 Diabetes",
        "description": "Chronic condition affecting blood glucose regulation",
        "category": "endocrine",
        "affectedOrgans": ["pancreas", "kidneys", "liver", "vessels", "eyes"],
        "symptoms": ["increased thirst", "frequent urination", "fatigue", "blurred vision"],
        "recommendedMedicines": ["Metformin", "Insulin glargine"],
        "severity": "moderate",
    },
    "asthma": {
        "id": "asthma",
        "name": "Asthma",
        "description": "Chronic inflammatory disorder of the airways",
        "category": "respiratory",
        "affectedOrgans": ["lungs", "respiratory"],
        "symptoms": ["wheezing", "shortness of breath", "chest tightness", "cough"],
        "recommendedMedicines": ["Albuterol", "Prednisone"],
        "severity": "moderate",
    },
    "gerd": {
        "id": "gerd",
        "name": "GERD (Acid Reflux)",
        "description": "Gastroesophageal reflux disease causing acid backup into esophagus",
        "category": "digestive",
        "affectedOrgans": ["stomach", "intestine"],
        "symptoms": ["heartburn", "regurgitation", "chest pain", "difficulty swallowing"],
        "recommendedMedicines": ["Omeprazole", "Ibuprofen"],
        "severity": "mild",
    },
    "high_cholesterol": {
        "id": "high_cholesterol",
        "name": "High Cholesterol (Hyperlipidemia)",
        "description": "Elevated cholesterol levels increasing cardiovascular disease risk",
        "category": "cardiovascular",
        "affectedOrgans": ["vessels", "heart", "liver"],
        "symptoms": ["none typically", "chest pain", "shortness of breath"],
        "recommendedMedicines": ["Atorvastatin", "Lisinopril"],
        "severity": "moderate",
    },
    "arthritis": {
        "id": "arthritis",
        "name": "Rheumatoid Arthritis",
        "description": "Autoimmune inflammatory disease affecting joints",
        "category": "autoimmune",
        "affectedOrgans": ["skeleton", "vessels"],
        "symptoms": ["joint pain", "swelling", "stiffness", "fatigue"],
        "recommendedMedicines": ["Ibuprofen", "Prednisone"],
        "severity": "moderate",
    },
    "migraine": {
        "id": "migraine",
        "name": "Migraines",
        "description": "Severe headaches often accompanied by nausea and sensitivity",
        "category": "neurological",
        "affectedOrgans": ["brain", "vessels"],
        "symptoms": ["severe headache", "nausea", "light sensitivity", "vision changes"],
        "recommendedMedicines": ["Ibuprofen", "Prednisone"],
        "severity": "moderate",
    },
    "kidney_disease": {
        "id": "kidney_disease",
        "name": "Chronic Kidney Disease",
        "description": "Progressive loss of kidney function",
        "category": "renal",
        "affectedOrgans": ["kidneys", "vessels", "heart"],
        "symptoms": ["fatigue", "swelling", "high blood pressure", "nausea"],
        "recommendedMedicines": ["Lisinopril", "Amlodipine"],
        "severity": "severe",
    },
    "fatty_liver": {
        "id": "fatty_liver",
        "name": "Fatty Liver Disease",
        "description": "Excess fat accumulation in liver cells",
        "category": "hepatic",
        "affectedOrgans": ["liver", "vessels"],
        "symptoms": ["fatigue", "abdominal pain", "swelling"],
        "recommendedMedicines": ["Atorvastatin"],
        "severity": "mild",
    },
    "pneumonia": {
        "id": "pneumonia",
        "name": "Pneumonia",
        "description": "Infection causing lung inflammation and fluid accumulation",
        "category": "respiratory",
        "affectedOrgans": ["lungs", "respiratory", "heart"],
        "symptoms": ["cough", "fever", "shortness of breath", "chest pain"],
        "recommendedMedicines": ["Amoxicillin", "Albuterol"],
        "severity": "severe",
    },
    "depression": {
        "id": "depression",
        "name": "Depression",
        "description": "Mental health disorder affecting mood and daily functioning",
        "category": "neuropsychiatric",
        "affectedOrgans": ["brain"],
        "symptoms": ["persistent sadness", "fatigue", "loss of interest", "sleep changes"],
        "recommendedMedicines": ["Prednisone"],
        "severity": "moderate",
    },
}

@router.get("/diseases", response_model=List[DiseaseSchema])
async def get_all_diseases():
    """Get all available diseases"""
    return list(diseases_db.values())

@router.get("/diseases/{disease_id}", response_model=DiseaseSchema)
async def get_disease(disease_id: str):
    """Get a specific disease by ID"""
    if disease_id not in diseases_db:
        raise HTTPException(status_code=404, detail="Disease not found")
    return diseases_db[disease_id]

@router.get("/diseases/search/")
async def search_diseases(q: str):
    """Search diseases by name or category"""
    results = []
    q_lower = q.lower()
    for disease in diseases_db.values():
        if q_lower in disease["name"].lower() or q_lower in disease["category"].lower():
            results.append(disease)
    return results

@router.get("/diseases/organs/{organ}")
async def get_diseases_by_organ(organ: str):
    """Get all diseases affecting a specific organ"""
    results = []
    organ_lower = organ.lower()
    for disease in diseases_db.values():
        if any(o.lower() == organ_lower for o in disease["affectedOrgans"]):
            results.append(disease)
    return results
