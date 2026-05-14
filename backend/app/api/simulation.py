from fastapi import APIRouter
from app.schemas.schemas import SimulationRequestSchema

router = APIRouter()

@router.post("/medicine-effects")
async def simulate_medicine_effects(request: SimulationRequestSchema):
    """Simulate medicine effects on anatomy over time"""
    return {
        "patient_id": request.patient_id,
        "medicines": request.medicines,
        "timeframe": request.timeframe,
        "simulation_result": {
            "affected_organs": ["liver", "kidney"],
            "toxicity_level": 0.35,
            "timeline": {
                "1_month": {"organs": ["liver"], "damage": 0.1},
                "6_months": {"organs": ["liver", "kidney"], "damage": 0.25},
            }
        }
    }

@router.post("/organ-damage")
async def simulate_organ_damage(request: dict):
    """Simulate organ damage progression"""
    return {
        "medicine_id": request.get("medicine"),
        "duration": request.get("duration"),
        "organ_damage": {
            "organ": request.get("organ", "liver"),
            "damage_progression": [0.1, 0.15, 0.25, 0.4]
        }
    }
