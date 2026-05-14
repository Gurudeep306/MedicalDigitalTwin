from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os

router = APIRouter()

class MedicineRecommendationRequest(BaseModel):
    disease_name: str
    patient_age: Optional[int] = None
    patient_weight: Optional[float] = None
    kidney_history: Optional[str] = None
    liver_history: Optional[str] = None
    allergies: Optional[str] = None

class MedicineRecommendation(BaseModel):
    medicine_name: str
    reason: str
    target_organs: List[str]
    contraindications: List[str]
    dosage_note: str

# Comprehensive medicine database with multi-disease support
comprehensive_medicines = {
    "Ibuprofen": {
        "name": "Ibuprofen",
        "type": "NSAID (Non-Steroidal Anti-Inflammatory Drug)",
        "uses": ["pain", "inflammation", "fever"],
        "targetDiseases": ["rheumatoid arthritis", "migraines", "gerd"],
        "targetOrgans": ["stomach", "intestine", "liver", "kidneys", "vessels"],
        "contraindications": ["severe kidney disease", "severe liver disease", "ulcers"],
        "sideEffects": ["stomach upset", "increased bleeding", "kidney stress"],
        "dosage": "400-600mg every 4-6 hours",
    },
    "Metformin": {
        "name": "Metformin",
        "type": "Antidiabetic",
        "uses": ["diabetes type 2", "prediabetes"],
        "targetDiseases": ["type 2 diabetes"],
        "targetOrgans": ["pancreas", "liver", "kidneys"],
        "contraindications": ["severe kidney disease", "severe liver disease", "lactic acidosis"],
        "sideEffects": ["nausea", "diarrhea", "metallic taste"],
        "dosage": "500-2000mg daily in divided doses",
    },
    "Atorvastatin": {
        "name": "Atorvastatin",
        "type": "Statin (HMG-CoA reductase inhibitor)",
        "uses": ["high cholesterol", "cardiovascular protection"],
        "targetDiseases": ["high cholesterol", "hypertension", "fatty liver disease"],
        "targetOrgans": ["liver", "vessels", "heart"],
        "contraindications": ["severe liver disease", "pregnancy", "statins allergy"],
        "sideEffects": ["muscle pain", "liver enzyme elevation", "fatigue"],
        "dosage": "10-80mg daily",
    },
    "Albuterol": {
        "name": "Albuterol (Salbutamol)",
        "type": "Beta-2 agonist bronchodilator",
        "uses": ["asthma", "copd", "breathing difficulty"],
        "targetDiseases": ["asthma", "pneumonia"],
        "targetOrgans": ["lungs", "respiratory", "heart"],
        "contraindications": ["uncontrolled hyperthyroidism", "cardiac arrhythmias"],
        "sideEffects": ["tremor", "palpitations", "headache"],
        "dosage": "90 mcg inhaled 2-4 times daily",
    },
    "Lisinopril": {
        "name": "Lisinopril",
        "type": "ACE inhibitor",
        "uses": ["hypertension", "heart failure", "post-MI"],
        "targetDiseases": ["hypertension", "high cholesterol", "chronic kidney disease"],
        "targetOrgans": ["vessels", "heart", "kidneys", "brain"],
        "contraindications": ["angioedema", "pregnancy", "severe kidney disease"],
        "sideEffects": ["dry cough", "dizziness", "hyperkalemia"],
        "dosage": "10-40mg daily",
    },
    "Amlodipine": {
        "name": "Amlodipine",
        "type": "Calcium channel blocker",
        "uses": ["hypertension", "angina"],
        "targetDiseases": ["hypertension", "high cholesterol"],
        "targetOrgans": ["vessels", "heart"],
        "contraindications": ["cardiogenic shock", "severe aortic stenosis"],
        "sideEffects": ["ankle swelling", "flushing", "headache"],
        "dosage": "2.5-10mg daily",
    },
    "Amoxicillin": {
        "name": "Amoxicillin",
        "type": "Penicillin antibiotic",
        "uses": ["bacterial infections", "respiratory infections"],
        "targetDiseases": ["pneumonia"],
        "targetOrgans": ["lungs", "respiratory", "stomach", "skin"],
        "contraindications": ["penicillin allergy", "mononucleosis"],
        "sideEffects": ["rash", "diarrhea", "nausea", "allergic reaction"],
        "dosage": "250-500mg 3 times daily",
    },
    "Omeprazole": {
        "name": "Omeprazole",
        "type": "Proton pump inhibitor",
        "uses": ["gerd", "ulcers", "acid suppression"],
        "targetDiseases": ["gerd"],
        "targetOrgans": ["stomach", "intestine"],
        "contraindications": ["clopidogrel interaction", "severe liver disease"],
        "sideEffects": ["headache", "diarrhea", "vitamin b12 deficiency"],
        "dosage": "20-40mg daily",
    },
    "Prednisone": {
        "name": "Prednisone",
        "type": "Corticosteroid",
        "uses": ["inflammation", "autoimmune", "asthma exacerbation"],
        "targetDiseases": ["rheumatoid arthritis", "asthma", "depression"],
        "targetOrgans": ["lungs", "respiratory", "brain", "stomach", "adrenal"],
        "contraindications": ["active infections", "live vaccines"],
        "sideEffects": ["mood changes", "weight gain", "insomnia", "immunosuppression"],
        "dosage": "5-60mg daily (varies by indication)",
    },
    "Insulin glargine": {
        "name": "Insulin glargine",
        "type": "Long-acting insulin",
        "uses": ["diabetes type 1", "diabetes type 2"],
        "targetDiseases": ["type 2 diabetes"],
        "targetOrgans": ["pancreas", "liver", "vessels", "kidneys"],
        "contraindications": ["hypoglycemia", "injection site infection"],
        "sideEffects": ["hypoglycemia", "weight gain", "injection site reactions"],
        "dosage": "Subcutaneous injection, individualized dosing",
    },
    # Additional medicines for broader coverage
    "Aspirin": {
        "name": "Aspirin",
        "type": "NSAID antiplatelet",
        "uses": ["pain", "cardiovascular protection"],
        "targetDiseases": ["hypertension", "high cholesterol"],
        "targetOrgans": ["vessels", "heart", "stomach"],
        "contraindications": ["bleeding disorders", "aspirin allergy"],
        "sideEffects": ["stomach upset", "bleeding", "bruising"],
        "dosage": "81-325mg daily (cardiovascular) or 500-1000mg per dose (pain)",
    },
    "Sertraline": {
        "name": "Sertraline",
        "type": "SSRI antidepressant",
        "uses": ["depression", "anxiety", "ocd"],
        "targetDiseases": ["depression"],
        "targetOrgans": ["brain"],
        "contraindications": ["maois", "linezolid", "pimozide"],
        "sideEffects": ["sexual dysfunction", "nausea", "insomnia"],
        "dosage": "50-200mg daily",
    },
    "Losartan": {
        "name": "Losartan",
        "type": "ARB (Angiotensin II receptor blocker)",
        "uses": ["hypertension", "heart failure"],
        "targetDiseases": ["hypertension"],
        "targetOrgans": ["vessels", "heart", "kidneys"],
        "contraindications": ["pregnancy", "severe kidney disease"],
        "sideEffects": ["dizziness", "hyperkalemia", "dry cough (rare)"],
        "dosage": "25-100mg daily",
    },
    "Metoprolol": {
        "name": "Metoprolol",
        "type": "Beta blocker",
        "uses": ["hypertension", "angina", "heart failure"],
        "targetDiseases": ["hypertension"],
        "targetOrgans": ["heart", "vessels", "lungs"],
        "contraindications": ["asthma", "severe bradycardia"],
        "sideEffects": ["fatigue", "sexual dysfunction", "bradycardia"],
        "dosage": "25-190mg daily in divided doses",
    },
}

@router.get("/medicines", response_model=List[dict])
async def get_all_medicines():
    """Get all available medicines"""
    return list(comprehensive_medicines.values())

@router.post("/medicines/recommend")
async def recommend_medicines(request: MedicineRecommendationRequest):
    """
    AI-powered medicine recommendation based on disease and patient profile
    """
    disease_lower = request.disease_name.lower()
    recommendations = []
    
    # Find medicines that treat this disease
    for med_name, med_info in comprehensive_medicines.items():
        target_diseases = [d.lower() for d in med_info.get("targetDiseases", [])]
        
        # Check if medicine treats this disease
        if any(disease_lower in d for d in target_diseases):
            # Check contraindications based on patient profile
            contraindicated = False
            contraindication_reasons = []
            
            if request.kidney_history and "kidney" in request.kidney_history.lower():
                if "kidney" in [c.lower() for c in med_info.get("contraindications", [])]:
                    contraindicated = True
                    contraindication_reasons.append("Kidney disease")
            
            if request.liver_history and "liver" in request.liver_history.lower():
                if "liver" in [c.lower() for c in med_info.get("contraindications", [])]:
                    contraindicated = True
                    contraindication_reasons.append("Liver disease")
            
            if not contraindicated:
                recommendations.append(MedicineRecommendation(
                    medicine_name=med_name,
                    reason=f"Effective treatment for {request.disease_name}",
                    target_organs=med_info.get("targetOrgans", []),
                    contraindications=med_info.get("contraindications", []),
                    dosage_note=med_info.get("dosage", ""),
                ))
    
    if not recommendations:
        raise HTTPException(
            status_code=404, 
            detail=f"No suitable medicines found for {request.disease_name} with given patient profile"
        )
    
    return recommendations

@router.get("/medicines/search/")
async def search_medicines(q: str):
    """Search medicines by name or type"""
    results = []
    q_lower = q.lower()
    for medicine in comprehensive_medicines.values():
        if q_lower in medicine["name"].lower() or q_lower in medicine["type"].lower():
            results.append(medicine)
    return results

@router.get("/medicines/{medicine_name}")
async def get_medicine(medicine_name: str):
    """Get detailed info about a specific medicine"""
    # Try exact match first
    if medicine_name in comprehensive_medicines:
        return comprehensive_medicines[medicine_name]
    
    # Try case-insensitive match
    for name, info in comprehensive_medicines.items():
        if name.lower() == medicine_name.lower():
            return info
    
    raise HTTPException(status_code=404, detail="Medicine not found")
