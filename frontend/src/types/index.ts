// Type definitions for the application

export interface Medicine {
  id: string
  name: string
  activeIngredient: string
  sideEffects: SideEffect[]
  interactions: DrugInteraction[]
  dosage: string
  manufacturer: string
}

export interface MedicineSearchResponse {
  results: Medicine[]
}

export interface SideEffect {
  id: string
  name: string
  severity: 'low' | 'medium' | 'high'
  affectedOrgans: string[]
  description: string
  animation: string
}

export interface DrugInteraction {
  medicineId: string
  medicineName: string
  type: 'contraindicated' | 'warning' | 'interaction'
  description: string
}

export interface Organ {
  id: string
  name: string
  position: [number, number, number]
  color: string
  affectedBy: string[]
  system: 'neurological' | 'cardiovascular' | 'respiratory' | 'digestive' | 'renal'
}

export interface Patient {
  id: string
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  height: number
  weight: number
  bmi: number
  medicalHistory: string[]
  currentMedications: Medicine[]
}

export interface AnatomyLayer {
  id: string
  name: string
  type: 'skeletal' | 'muscular' | 'nervous' | 'circulatory' | 'digestive' | 'respiratory' | 'reproductive'
  visible: boolean
  opacity: number
}
