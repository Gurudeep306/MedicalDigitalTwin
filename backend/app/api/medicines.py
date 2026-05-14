from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.schemas import MedicineSchema

router = APIRouter()

# Mock data - replace with database queries
medicines_db = {
    1: {
        "id": 1,
        "name": "Ibuprofen",
        "active_ingredient": "Ibuprofen",
        "dosage": "400mg",
        "manufacturer": "Generic",
        "side_effects": [
            {
                "id": "se-1",
                "name": "Stomach upset",
                "severity": "low",
                "affectedOrgans": ["stomach"],
                "description": "Can irritate the stomach lining, especially without food.",
                "animation": "irritation",
            },
            {
                "id": "se-2",
                "name": "Renal stress",
                "severity": "medium",
                "affectedOrgans": ["kidneys"],
                "description": "May increase kidney stress in dehydrated or high-risk patients.",
                "animation": "toxicity",
            },
        ],
    },
    2: {
        "id": 2,
        "name": "Metformin",
        "active_ingredient": "Metformin",
        "dosage": "500mg",
        "manufacturer": "Generic",
        "side_effects": [
            {
                "id": "se-3",
                "name": "Nausea",
                "severity": "low",
                "affectedOrgans": ["stomach"],
                "description": "Common early gastrointestinal effect during dose changes.",
                "animation": "irritation",
            },
            {
                "id": "se-4",
                "name": "Lactic acidosis risk",
                "severity": "high",
                "affectedOrgans": ["liver", "kidneys"],
                "description": "Rare but serious risk, higher with severe renal or hepatic impairment.",
                "animation": "toxicity",
            },
        ],
    },
    3: {
        "id": 3,
        "name": "Atorvastatin",
        "active_ingredient": "Atorvastatin",
        "dosage": "20mg",
        "manufacturer": "Generic",
        "side_effects": [
            {
                "id": "se-5",
                "name": "Liver enzyme elevation",
                "severity": "medium",
                "affectedOrgans": ["liver"],
                "description": "Can raise hepatic enzymes and may need monitoring.",
                "animation": "inflammation",
            },
        ],
    },
    4: {
        "id": 4,
        "name": "Albuterol",
        "active_ingredient": "Salbutamol",
        "dosage": "90mcg inhaler",
        "manufacturer": "Generic",
        "side_effects": [
            {
                "id": "se-6",
                "name": "Palpitations",
                "severity": "medium",
                "affectedOrgans": ["heart"],
                "description": "Beta-agonist effects may increase heart rate or tremor.",
                "animation": "pulse",
            },
            {
                "id": "se-7",
                "name": "Airway response",
                "severity": "low",
                "affectedOrgans": ["lungs"],
                "description": "Primary bronchodilation target in the respiratory system.",
                "animation": "expansion",
            },
        ],
    },
}

@router.get("/search")
async def search_medicines(q: str):
    """Search medicines by name"""
    results = [m for m in medicines_db.values() if q.lower() in m["name"].lower()]
    return {"results": results}

@router.get("/{medicine_id}")
async def get_medicine(medicine_id: int):
    """Get medicine details by ID"""
    if medicine_id not in medicines_db:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return medicines_db[medicine_id]

@router.get("/{medicine_id}/side-effects")
async def get_side_effects(medicine_id: int):
    """Get side effects for a medicine"""
    if medicine_id not in medicines_db:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return {
        "medicine_id": medicine_id,
        "side_effects": medicines_db[medicine_id].get("side_effects", [])
    }

@router.post("/interactions")
async def get_interactions(medicines: List[int]):
    """Get interactions between multiple medicines"""
    return {
        "medicines": medicines,
        "interactions": []
    }
