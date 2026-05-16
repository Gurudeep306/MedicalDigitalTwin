'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeInfo,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  Gauge,
  Globe2,
  HeartPulse,
  Layers,
  LoaderCircle,
  LogIn,
  Microscope,
  Pause,
  Pill,
  Play,
  RotateCcw,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  UserPlus,
  Wind,
  Zap,
} from 'lucide-react'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import OpenAnatomyStage from '@/components/OpenAnatomyStage'

type Profile = {
  age: number
  gender: string
  height: number
  weight: number
  bodyType: string
  lifestyle: string
  stress: number
  allergies: string
  kidneyHistory: string
  liverHistory: string
  pregnancy: string
  diseases: string[]
  organConditions: string[]
}

type Account = {
  name: string
  email: string
  mode: 'login' | 'register'
}

type AppStep = 'auth' | 'profile' | 'condition' | 'medicine' | 'education' | 'simulation'
type FocusMode = 'overview' | 'pathway' | 'sideEffects'

type Condition = {
  id: string
  name: string
  category: string
  description: string
  organs: string[]
  symptoms: string[]
  recommended: string[]
  icon: typeof HeartPulse
}

type Medicine = {
  name: string
  conditionIds: string[]
  route: 'Oral tablet' | 'Inhaled dose' | 'Injection'
  purpose: string
  onset: string
  duration: string
  affectedOrgans: string[]
  benefits: string[]
  sideEffects: string[]
  seriousSignals: string[]
  longTerm: Record<string, string>
  safety: string
}

type LookupStatus = 'idle' | 'loading' | 'success' | 'error'

type OpenFdaLabel = {
  openfda?: {
    brand_name?: string[]
    generic_name?: string[]
    route?: string[]
  }
  adverse_reactions?: string[]
  boxed_warning?: string[]
  contraindications?: string[]
  description?: string[]
  dosage_and_administration?: string[]
  indications_and_usage?: string[]
  patient_medication_information?: string[]
  precautions?: string[]
  warnings?: string[]
  warnings_and_cautions?: string[]
}

type OpenFdaResponse = {
  results?: OpenFdaLabel[]
}

type RxNavApproximateResponse = {
  approximateGroup?: {
    candidate?: Array<{ name?: string }>
  }
}

type SearchSuggestion = {
  id: string
  title: string
  subtitle: string
  source: string
}

const timeline = ['1 day', '1 week', '1 month', '6 months', '1 year', '5 years', '10 years']

const initialProfile: Profile = {
  age: 34,
  gender: 'Prefer not to say',
  height: 172,
  weight: 72,
  bodyType: 'Average',
  lifestyle: 'Moderately active',
  stress: 5,
  allergies: 'None known',
  kidneyHistory: 'No known kidney disease',
  liverHistory: 'No known liver disease',
  pregnancy: 'Not applicable',
  diseases: [],
  organConditions: [],
}

const conditionCatalog: Condition[] = [
  {
    id: 'diabetes',
    name: 'Type 2 diabetes',
    category: 'Metabolic',
    description: 'Glucose control, insulin sensitivity, liver glucose output, and kidney monitoring.',
    organs: ['Pancreas', 'Liver', 'Kidneys', 'Vessels', 'Brain'],
    symptoms: ['High glucose', 'Fatigue', 'Frequent urination'],
    recommended: ['Metformin', 'Insulin glargine'],
    icon: Activity,
  },
  {
    id: 'asthma',
    name: 'Asthma or wheezing',
    category: 'Respiratory',
    description: 'Airway narrowing, lung delivery, rescue inhaler effect, and heart-rate sensitivity.',
    organs: ['Lungs', 'Airway', 'Heart', 'Vessels'],
    symptoms: ['Wheezing', 'Chest tightness', 'Shortness of breath'],
    recommended: ['Albuterol', 'Prednisone'],
    icon: Wind,
  },
  {
    id: 'hypertension',
    name: 'High blood pressure',
    category: 'Cardiovascular',
    description: 'Vessel tone, heart workload, kidney filtration, and long-term stroke risk.',
    organs: ['Heart', 'Vessels', 'Kidneys', 'Brain'],
    symptoms: ['Elevated BP', 'Headache', 'Dizziness'],
    recommended: ['Lisinopril', 'Amlodipine'],
    icon: HeartPulse,
  },
  {
    id: 'pain',
    name: 'Pain or inflammation',
    category: 'Inflammatory',
    description: 'Pain signaling, stomach lining, liver metabolism, and kidney clearance.',
    organs: ['Stomach', 'Intestine', 'Liver', 'Kidneys', 'Vessels'],
    symptoms: ['Pain', 'Swelling', 'Fever'],
    recommended: ['Ibuprofen', 'Prednisone'],
    icon: Sparkles,
  },
  {
    id: 'cholesterol',
    name: 'High cholesterol',
    category: 'Preventive',
    description: 'Liver cholesterol synthesis, vessel plaque risk, and heart protection over time.',
    organs: ['Liver', 'Heart', 'Vessels', 'Kidneys'],
    symptoms: ['High LDL', 'Family history', 'Heart-risk profile'],
    recommended: ['Atorvastatin'],
    icon: Gauge,
  },
  {
    id: 'infection',
    name: 'Bacterial infection',
    category: 'Infectious',
    description: 'Antibiotic absorption, bloodstream distribution, gut effects, and allergy monitoring.',
    organs: ['Stomach', 'Intestine', 'Liver', 'Kidneys', 'Skin', 'Vessels'],
    symptoms: ['Fever', 'Sore throat', 'Sinus or ear symptoms'],
    recommended: ['Amoxicillin'],
    icon: ShieldCheck,
  },
  {
    id: 'reflux',
    name: 'Acid reflux or gastritis',
    category: 'Digestive',
    description: 'Stomach acid control, upper gut relief, and mineral monitoring with long use.',
    organs: ['Stomach', 'Intestine', 'Liver', 'Kidneys'],
    symptoms: ['Heartburn', 'Acid taste', 'Upper abdominal pain'],
    recommended: ['Omeprazole'],
    icon: Stethoscope,
  },
]

const medicineCatalog: Medicine[] = [
  {
    name: 'Metformin',
    conditionIds: ['diabetes'],
    route: 'Oral tablet',
    purpose: 'Improves insulin sensitivity and reduces liver glucose production.',
    onset: 'Several days',
    duration: '12-24 hours',
    affectedOrgans: ['Stomach', 'Intestine', 'Liver', 'Pancreas', 'Kidneys', 'Vessels'],
    benefits: ['Lower fasting glucose', 'Less liver glucose output', 'Weight-neutral profile'],
    sideEffects: ['Nausea', 'Loose stools', 'Metallic taste', 'B12 reduction with long-term use'],
    seriousSignals: ['Severe weakness', 'Trouble breathing', 'Severe dehydration', 'Kidney function decline'],
    safety: 'Often avoided or dose-adjusted in significant kidney impairment.',
    longTerm: {
      '1 day': 'Tablet dissolves in the gut; early stomach or bowel effects may appear.',
      '1 week': 'Glucose output from the liver begins to settle; gut adaptation usually improves.',
      '1 month': 'Average glucose trends improve; appetite and weight may stabilize.',
      '6 months': 'B12 status and kidney function become useful monitoring points.',
      '1 year': 'Long-term metabolic benefit is strongest when paired with lifestyle changes.',
      '5 years': 'Continued monitoring prevents missed kidney, B12, or intolerance issues.',
    },
  },
  {
    name: 'Insulin glargine',
    conditionIds: ['diabetes'],
    route: 'Injection',
    purpose: 'Provides a slow basal insulin signal to lower glucose across the day.',
    onset: '1-2 hours',
    duration: 'About 24 hours',
    affectedOrgans: ['Vessels', 'Liver', 'Pancreas', 'Brain', 'Kidneys'],
    benefits: ['Lower overnight glucose', 'Reduced fasting glucose', 'Stable basal insulin coverage'],
    sideEffects: ['Low glucose', 'Injection site irritation', 'Weight gain', 'Swelling'],
    seriousSignals: ['Confusion', 'Sweating with shakiness', 'Fainting', 'Seizure symptoms'],
    safety: 'Dose timing and glucose monitoring matter because hypoglycemia can become urgent.',
    longTerm: {
      '1 day': 'Insulin enters slowly from the injection site and starts lowering glucose.',
      '1 week': 'Dose patterns become clearer from morning glucose readings.',
      '1 month': 'Fasting glucose may stabilize if dose and meals are aligned.',
      '6 months': 'Weight, injection sites, and hypoglycemia history should be reviewed.',
      '1 year': 'Long-term glucose control can protect vessels, kidneys, eyes, and nerves.',
      '5 years': 'Sustained monitoring reduces silent glucose swings and vascular stress.',
    },
  },
  {
    name: 'Albuterol',
    conditionIds: ['asthma'],
    route: 'Inhaled dose',
    purpose: 'Relaxes airway smooth muscle to open narrowed breathing tubes.',
    onset: '5-15 minutes',
    duration: '4-6 hours',
    affectedOrgans: ['Airway', 'Lungs', 'Heart', 'Vessels'],
    benefits: ['Rapid airway opening', 'Less wheezing', 'Improved breathing effort'],
    sideEffects: ['Tremor', 'Fast heartbeat', 'Nervousness', 'Throat irritation'],
    seriousSignals: ['Chest pain', 'Worsening breathlessness', 'Blue lips', 'No relief after repeated doses'],
    safety: 'Frequent rescue use suggests asthma control needs reassessment.',
    longTerm: {
      '1 day': 'Airway muscles relax quickly; pulse may rise temporarily.',
      '1 week': 'Repeated need can reveal uncontrolled airway inflammation.',
      '1 month': 'Overuse can mask worsening asthma and increase tremor or palpitations.',
      '6 months': 'A controller plan may be needed if rescue use remains frequent.',
      '1 year': 'Well-controlled asthma usually means less reliance on rescue inhalers.',
      '5 years': 'Tracking attacks and triggers helps prevent long-term airway remodeling.',
    },
  },
  {
    name: 'Prednisone',
    conditionIds: ['asthma', 'pain'],
    route: 'Oral tablet',
    purpose: 'Reduces strong inflammation through systemic steroid signaling.',
    onset: 'Hours',
    duration: '18-36 hours',
    affectedOrgans: ['Lungs', 'Brain', 'Stomach', 'Liver', 'Adrenal', 'Vessels'],
    benefits: ['Reduced inflammation', 'Better breathing in flares', 'Less immune overactivity'],
    sideEffects: ['Mood changes', 'Higher glucose', 'Stomach irritation', 'Fluid retention', 'Sleep disruption'],
    seriousSignals: ['Black stools', 'Severe mood change', 'Very high glucose', 'Signs of infection'],
    safety: 'Long courses should be tapered only under clinician guidance.',
    longTerm: {
      '1 day': 'Inflammation signals start dropping; sleep and appetite may change.',
      '1 week': 'Breathing or pain may improve, while glucose and mood can shift.',
      '1 month': 'Longer exposure raises risks for weight gain, infection, and adrenal suppression.',
      '6 months': 'Bone, eye, glucose, and blood pressure monitoring become important.',
      '1 year': 'Chronic steroid use needs a prevention plan for bone and metabolic effects.',
      '5 years': 'Long-term use can reshape adrenal, bone, immune, and glucose regulation.',
    },
  },
  {
    name: 'Lisinopril',
    conditionIds: ['hypertension'],
    route: 'Oral tablet',
    purpose: 'Relaxes blood vessels and reduces pressure load on the heart.',
    onset: 'Hours',
    duration: '24 hours',
    affectedOrgans: ['Vessels', 'Heart', 'Kidneys', 'Brain'],
    benefits: ['Lower blood pressure', 'Kidney protection in some patients', 'Reduced heart workload'],
    sideEffects: ['Dry cough', 'Dizziness', 'High potassium', 'Kidney lab changes'],
    seriousSignals: ['Face or tongue swelling', 'Fainting', 'Very low urine output', 'Severe weakness'],
    safety: 'Potassium and kidney labs are commonly monitored after starting or changing dose.',
    longTerm: {
      '1 day': 'Vessels begin relaxing; lightheadedness can appear early.',
      '1 week': 'Blood pressure trend becomes easier to judge.',
      '1 month': 'Kidney and potassium labs help confirm the dose is tolerated.',
      '6 months': 'Steady pressure reduction lowers heart and vessel strain.',
      '1 year': 'Long-term control reduces stroke, kidney, and heart-failure risk.',
      '5 years': 'Sustained BP control protects vessels if labs remain stable.',
    },
  },
  {
    name: 'Amlodipine',
    conditionIds: ['hypertension'],
    route: 'Oral tablet',
    purpose: 'Blocks calcium channels to relax arteries and reduce blood pressure.',
    onset: 'Hours to days',
    duration: '24 hours',
    affectedOrgans: ['Vessels', 'Heart', 'Liver'],
    benefits: ['Lower blood pressure', 'Improved arterial relaxation', 'Angina support in some patients'],
    sideEffects: ['Ankle swelling', 'Flushing', 'Headache', 'Dizziness'],
    seriousSignals: ['Severe chest pain', 'Fainting', 'Marked swelling', 'Shortness of breath'],
    safety: 'Swelling can be dose-related and should be reported if persistent.',
    longTerm: {
      '1 day': 'Arteries begin relaxing; headache or flushing can occur.',
      '1 week': 'Blood pressure reduction becomes more visible.',
      '1 month': 'Ankle swelling is easier to detect if it is going to persist.',
      '6 months': 'Steady vessel relaxation reduces long-term heart workload.',
      '1 year': 'Controlled BP protects brain, kidney, heart, and vessel health.',
      '5 years': 'Long-term benefit depends on BP stability and side-effect tolerance.',
    },
  },
  {
    name: 'Ibuprofen',
    conditionIds: ['pain'],
    route: 'Oral tablet',
    purpose: 'Reduces prostaglandin signaling involved in pain, fever, and inflammation.',
    onset: '20-60 minutes',
    duration: '6-8 hours',
    affectedOrgans: ['Stomach', 'Intestine', 'Liver', 'Kidneys', 'Vessels'],
    benefits: ['Pain relief', 'Fever reduction', 'Inflammation reduction'],
    sideEffects: ['Stomach burning', 'Nausea', 'Higher blood pressure', 'Kidney stress with dehydration'],
    seriousSignals: ['Black stools', 'Vomiting blood', 'Chest pain', 'Very low urine output'],
    safety: 'Use caution with ulcers, kidney disease, blood thinners, and high blood pressure.',
    longTerm: {
      '1 day': 'Pain signals reduce; stomach lining can feel irritated.',
      '1 week': 'Repeated doses increase stomach and blood pressure burden.',
      '1 month': 'Kidney and stomach risk rise, especially with dehydration or ulcers.',
      '6 months': 'Long-term daily use needs clinician review for GI, kidney, and heart risk.',
      '1 year': 'Chronic use may contribute to bleeding, kidney stress, or BP changes.',
      '5 years': 'Sustained use without monitoring can create preventable organ harm.',
    },
  },
  {
    name: 'Atorvastatin',
    conditionIds: ['cholesterol'],
    route: 'Oral tablet',
    purpose: 'Reduces liver cholesterol synthesis and lowers LDL cholesterol.',
    onset: 'Days',
    duration: '24 hours',
    affectedOrgans: ['Liver', 'Heart', 'Vessels', 'Kidneys'],
    benefits: ['Lower LDL', 'Plaque stabilization', 'Reduced long-term heart risk'],
    sideEffects: ['Muscle aches', 'Liver enzyme changes', 'Digestive upset'],
    seriousSignals: ['Severe muscle pain', 'Dark urine', 'Yellow eyes or skin', 'Severe weakness'],
    safety: 'Liver history, interacting medicines, and unexplained muscle symptoms should be reviewed.',
    longTerm: {
      '1 day': 'Liver enzyme target is engaged, but cholesterol numbers will not change immediately.',
      '1 week': 'LDL production starts trending downward.',
      '1 month': 'Blood lipid improvement is usually measurable.',
      '6 months': 'Plaque risk reduction becomes the main long-term goal.',
      '1 year': 'Sustained LDL lowering reduces heart attack and stroke risk.',
      '5 years': 'Long-term benefit compounds when muscle and liver tolerance remain good.',
    },
  },
  {
    name: 'Amoxicillin',
    conditionIds: ['infection'],
    route: 'Oral tablet',
    purpose: 'Kills susceptible bacteria by disrupting bacterial cell-wall formation.',
    onset: 'Hours to days',
    duration: '8-12 hours',
    affectedOrgans: ['Stomach', 'Intestine', 'Liver', 'Kidneys', 'Skin', 'Vessels'],
    benefits: ['Bacterial infection control', 'Reduced fever', 'Lower bacterial spread'],
    sideEffects: ['Diarrhea', 'Nausea', 'Rash', 'Yeast overgrowth'],
    seriousSignals: ['Hives', 'Face swelling', 'Severe diarrhea', 'Trouble breathing'],
    safety: 'Allergy history matters, especially previous penicillin reactions.',
    longTerm: {
      '1 day': 'Gut absorption begins; symptoms may not improve immediately.',
      '1 week': 'Many infections improve if the organism is susceptible.',
      '1 month': 'Gut flora may still be recovering after a completed course.',
      '6 months': 'Repeated antibiotic exposure can affect resistance and gut balance.',
      '1 year': 'Avoid unnecessary use to preserve future antibiotic effectiveness.',
      '5 years': 'Good stewardship lowers resistance risk for the patient and community.',
    },
  },
  {
    name: 'Omeprazole',
    conditionIds: ['reflux'],
    route: 'Oral tablet',
    purpose: 'Turns down stomach acid production through proton-pump inhibition.',
    onset: '1-4 days',
    duration: '24 hours',
    affectedOrgans: ['Stomach', 'Intestine', 'Liver', 'Kidneys'],
    benefits: ['Less acid reflux', 'Ulcer healing support', 'Less stomach burning'],
    sideEffects: ['Headache', 'Nausea', 'Bloating', 'Low magnesium or B12 with long use'],
    seriousSignals: ['Trouble swallowing', 'Vomiting blood', 'Unexplained weight loss', 'Black stools'],
    safety: 'Persistent alarm symptoms should not be masked without medical evaluation.',
    longTerm: {
      '1 day': 'Acid pumps begin shutting down, but full relief may take several days.',
      '1 week': 'Heartburn often improves as stomach acid output drops.',
      '1 month': 'Healing support is stronger; ongoing need should be reviewed.',
      '6 months': 'Magnesium, B12, bone, and kidney considerations become more relevant.',
      '1 year': 'Long-term use should have a clear reason and review schedule.',
      '5 years': 'Periodic reassessment helps avoid unnecessary chronic acid suppression.',
    },
  },
]

function bodySignals(profile: Profile) {
  const heightMeters = profile.height / 100
  const bmi = profile.weight / (heightMeters * heightMeters)
  const diseaseLoad = Math.min(1, profile.diseases.length * 0.16)
  const organLoad = Math.min(1, profile.organConditions.length * 0.13)
  const stress = profile.stress / 10
  const fatigue = Math.min(1, stress * 0.34 + diseaseLoad * 0.28 + (profile.lifestyle === 'Mostly sedentary' ? 0.08 : 0))

  return {
    bmi: Number(bmi.toFixed(1)),
    bodyMass: Math.min(1, Math.max(0, (bmi - 18) / 18)),
    stress,
    smoking: 0,
    diseaseLoad,
    organLoad,
    fatigue,
    vitality: Math.max(0, Math.min(1, 0.9 - fatigue * 0.34 - diseaseLoad * 0.12 + (profile.lifestyle === 'Physically demanding' ? 0.08 : 0))),
  }
}

function metric(value: number) {
  return `${Math.round(value * 100)}%`
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items))
}

const organKeywordMap: Array<[string[], string]> = [
  [['brain', 'seizure', 'confusion', 'dizzy', 'headache', 'mood', 'vision'], 'Brain'],
  [['heart', 'cardiac', 'chest pain', 'palpitation', 'qt ', 'arrhythmia'], 'Heart'],
  [['lung', 'breath', 'bronch', 'respiratory', 'cough', 'wheez'], 'Lungs'],
  [['liver', 'hepatic', 'jaundice', 'yellow skin', 'transaminase'], 'Liver'],
  [['kidney', 'renal', 'urine', 'creatinine'], 'Kidneys'],
  [['stomach', 'gastric', 'nausea', 'vomiting', 'abdominal', 'ulcer'], 'Stomach'],
  [['intestin', 'diarrhea', 'constipation', 'bowel', 'colitis'], 'Intestine'],
  [['pancreas', 'pancreatitis', 'glucose', 'diabetes', 'hypoglycemia'], 'Pancreas'],
  [['skin', 'rash', 'hives', 'itch', 'angioedema', 'allergic'], 'Skin'],
  [['blood', 'pressure', 'bleeding', 'clot', 'vascular', 'vessel'], 'Vessels'],
  [['eye', 'ocular', 'retina'], 'Eyes'],
  [['bladder', 'urinary'], 'Bladder'],
]

function splitMedicalText(sections: Array<string | undefined>, fallback: string, maxItems = 4) {
  const text = sections.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
  if (!text) return [fallback]

  return unique(
    text
      .split(/(?<=[.!?])\s+|;\s+|\n+/)
      .map((item) => item.replace(/^[-•*\d.)\s]+/, '').trim())
      .filter((item) => item.length > 12 && item.length < 180)
      .slice(0, maxItems),
  )
}

function inferOrgansFromLabel(label: OpenFdaLabel, condition?: Condition) {
  const source = [
    ...(label.adverse_reactions ?? []),
    ...(label.warnings ?? []),
    ...(label.warnings_and_cautions ?? []),
    ...(label.precautions ?? []),
    ...(label.indications_and_usage ?? []),
    ...(label.patient_medication_information ?? []),
  ].join(' ').toLowerCase()

  const organs = organKeywordMap.flatMap(([keywords, organ]) => (keywords.some((keyword) => source.includes(keyword)) ? [organ] : []))
  return unique([...(condition?.organs ?? []), ...organs, 'Liver', 'Kidneys', 'Vessels']).slice(0, 9)
}

function inferRouteFromLabel(label: OpenFdaLabel): Medicine['route'] {
  const routeText = [...(label.openfda?.route ?? []), ...(label.dosage_and_administration ?? [])].join(' ').toLowerCase()
  if (routeText.includes('inhal')) return 'Inhaled dose'
  if (routeText.includes('injection') || routeText.includes('intravenous') || routeText.includes('subcutaneous') || routeText.includes('intramuscular')) return 'Injection'
  return 'Oral tablet'
}

function buildUniversalCondition(rawName: string): Condition {
  const name = rawName.trim() || 'Any condition'
  const lower = name.toLowerCase()
  const organs = unique(
    organKeywordMap.flatMap(([keywords, organ]) => (keywords.some((keyword) => lower.includes(keyword)) ? [organ] : [])),
  )

  return {
    id: 'custom',
    name,
    category: 'Universal',
    description: `Custom disease/condition profile for ${name}.`,
    organs: organs.length ? organs : ['Brain', 'Heart', 'Liver', 'Kidneys', 'Lungs', 'Stomach', 'Vessels'],
    symptoms: ['Patient-specific symptoms'],
    recommended: [],
    icon: Globe2,
  }
}

function buildFallbackMedicine(name: string, condition?: Condition): Medicine {
  return {
    name: name || 'Custom medicine',
    conditionIds: condition ? [condition.id] : [],
    route: 'Oral tablet',
    purpose: 'Custom medicine entered by the user. Review exact mechanism with a licensed clinician or pharmacist.',
    onset: 'Varies',
    duration: 'Varies',
    affectedOrgans: condition?.organs ?? ['Liver', 'Kidneys', 'Vessels'],
    benefits: ['Condition-specific therapeutic effect', 'Requires verified prescribing information'],
    sideEffects: ['Side effects vary by medicine', 'Dose and patient history matter'],
    seriousSignals: ['Allergic reaction', 'Severe dizziness', 'Breathing trouble'],
    safety: 'This custom entry is educational only and should be checked against official prescribing information.',
    longTerm: Object.fromEntries(timeline.map((item) => [item, 'Long-term effects depend on dose, duration, organ function, and the exact medicine.'])),
  }
}

async function getRxNormSearchTerms(name: string) {
  try {
    const response = await fetch(`https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(name.trim())}&maxEntries=3`)
    if (!response.ok) return [name]
    const json = (await response.json()) as RxNavApproximateResponse
    const candidates = json.approximateGroup?.candidate?.map((item) => item.name).filter((item): item is string => Boolean(item)) ?? []
    return unique([name, ...candidates])
  } catch {
    return [name]
  }
}

async function searchDiseaseSuggestions(query: string, signal?: AbortSignal): Promise<SearchSuggestion[]> {
  const clean = query.trim()
  if (clean.length < 2) return []

  const local = conditionCatalog
    .filter((item) => `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(clean.toLowerCase()))
    .map((item) => ({
      id: `local-condition-${item.id}`,
      title: item.name,
      subtitle: item.description,
      source: 'Curated',
    }))

  try {
    const response = await fetch(`https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?terms=${encodeURIComponent(clean)}&maxList=8`, { signal })
    if (!response.ok) return local.slice(0, 8)
    const json = await response.json() as unknown[]
    const rows = Array.isArray(json[3]) ? json[3] as unknown[] : []
    const remote = rows
      .map((row, index) => {
        const values = Array.isArray(row) ? row : [row]
        const title = String(values.find((value) => typeof value === 'string' && value.trim()) ?? '').trim()
        if (!title) return null
        return {
          id: `clinical-condition-${index}-${title}`,
          title,
          subtitle: 'Condition suggestion from medical terminology search',
          source: 'ClinicalTables',
        }
      })
      .filter((item): item is SearchSuggestion => Boolean(item))

    return unique([...local, ...remote].map((item) => item.title)).map((title) => [...local, ...remote].find((item) => item.title === title)!).slice(0, 8)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return []
    return local.slice(0, 8)
  }
}

async function searchMedicineSuggestions(query: string, signal?: AbortSignal): Promise<SearchSuggestion[]> {
  const clean = query.trim()
  if (clean.length < 2) return []

  const local = medicineCatalog
    .filter((item) => `${item.name} ${item.purpose}`.toLowerCase().includes(clean.toLowerCase()))
    .map((item) => ({
      id: `local-medicine-${item.name}`,
      title: item.name,
      subtitle: `${item.route} · ${item.purpose}`,
      source: 'Curated',
    }))

  try {
    const response = await fetch(`https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(clean)}&maxEntries=10`, { signal })
    if (!response.ok) return local.slice(0, 8)
    const json = await response.json() as RxNavApproximateResponse
    const remote = (json.approximateGroup?.candidate ?? [])
      .map((item, index) => item.name ? {
        id: `rxnav-medicine-${index}-${item.name}`,
        title: item.name,
        subtitle: 'Medicine suggestion from RxNorm/RxNav',
        source: 'RxNav',
      } : null)
      .filter((item): item is SearchSuggestion => Boolean(item))

    return unique([...local, ...remote].map((item) => item.title)).map((title) => [...local, ...remote].find((item) => item.title === title)!).slice(0, 8)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return []
    return local.slice(0, 8)
  }
}

async function fetchOpenFdaLabel(name: string) {
  const clean = name.trim()
  const fields = ['openfda.brand_name', 'openfda.generic_name', 'openfda.substance_name']
  const searchTerms = await getRxNormSearchTerms(clean)

  for (const term of searchTerms) {
    for (const field of fields) {
      const url = `https://api.fda.gov/drug/label.json?search=${field}:%22${encodeURIComponent(term)}%22&limit=1`
      const response = await fetch(url)
      if (!response.ok) continue
      const json = (await response.json()) as OpenFdaResponse
      const label = json.results?.[0]
      if (label) return label
    }
  }

  return null
}

async function lookupMedicineFromWeb(name: string, condition?: Condition): Promise<Medicine> {
  const label = await fetchOpenFdaLabel(name)
  if (!label) throw new Error('No public label found for that medicine name.')

  const displayName = label.openfda?.brand_name?.[0] ?? label.openfda?.generic_name?.[0] ?? name
  const indication = splitMedicalText(label.indications_and_usage ?? [], `Used for ${condition?.name ?? 'the selected condition'}.`, 2)[0]
  const sideEffects = splitMedicalText(
    [...(label.adverse_reactions ?? []), ...(label.patient_medication_information ?? [])],
    'Side effects are listed in the public drug label and depend on dose and patient history.',
    5,
  )
  const seriousSignals = splitMedicalText(
    [...(label.boxed_warning ?? []), ...(label.warnings_and_cautions ?? []), ...(label.warnings ?? []), ...(label.contraindications ?? [])],
    'Severe allergic reaction, breathing trouble, fainting, or rapidly worsening symptoms.',
    4,
  )
  const affectedOrgans = inferOrgansFromLabel(label, condition)

  return {
    name: displayName,
    conditionIds: condition ? [condition.id] : [],
    route: inferRouteFromLabel(label),
    purpose: indication,
    onset: 'Label dependent',
    duration: 'Label dependent',
    affectedOrgans,
    benefits: splitMedicalText(label.indications_and_usage ?? [], indication, 3),
    sideEffects,
    seriousSignals,
    safety: splitMedicalText(
      [...(label.warnings_and_cautions ?? []), ...(label.warnings ?? []), ...(label.precautions ?? [])],
      'Use only as prescribed and verify warnings, interactions, pregnancy status, kidney/liver history, and allergies with a clinician.',
      1,
    )[0],
    longTerm: {
      '1 day': `${displayName} enters the body by its labeled route; early tolerance and allergy signals matter first.`,
      '1 week': `The animation emphasizes ${affectedOrgans.slice(0, 3).join(', ')} while short-term benefit and side effects are watched.`,
      '1 month': `Ongoing use shifts attention toward recurring adverse reactions and condition response.`,
      '6 months': `Repeated exposure makes organ monitoring more important, especially ${affectedOrgans.slice(-3).join(', ')}.`,
      '1 year': `Long-term use should be reviewed against benefit, dose, interactions, and patient-specific risk.`,
      '5 years': `Multi-year exposure can change monitoring priorities as health history and other medicines evolve.`,
      '10 years': `A decade view emphasizes cumulative benefit-risk review, organ surveillance, and whether the medicine is still needed.`,
    },
  }
}

function getMedicine(name: string, condition?: Condition): Medicine {
  const known = medicineCatalog.find((item) => item.name === name)
  if (known) return known

  return buildFallbackMedicine(name, condition)
}

function IconStat({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return (
    <div className="metric-tile">
      <Icon size={17} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function StepRail({ step }: { step: AppStep }) {
  const steps: Array<[AppStep, string]> = [
    ['auth', 'Access'],
    ['profile', 'Body'],
    ['condition', 'Focus'],
    ['medicine', 'Dose'],
    ['education', 'Review'],
    ['simulation', 'Live'],
  ]
  const activeIndex = steps.findIndex(([key]) => key === step)

  return (
    <div className="step-rail">
      {steps.map(([key, label], index) => (
        <div key={key} className={`step-dot ${index <= activeIndex ? 'step-dot-active' : ''}`}>
          <span>{index + 1}</span>
          <strong>{label}</strong>
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const [step, setStep] = useState<AppStep>('auth')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [account, setAccount] = useState<Account | null>(null)
  const [name, setName] = useState('Demo Patient')
  const [email, setEmail] = useState('patient@example.com')
  const [password, setPassword] = useState('password')
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [selectedConditionId, setSelectedConditionId] = useState('diabetes')
  const [customCondition, setCustomCondition] = useState('')
  const [conditionSuggestions, setConditionSuggestions] = useState<SearchSuggestion[]>([])
  const [conditionSearchLoading, setConditionSearchLoading] = useState(false)
  const [conditionSearchOpen, setConditionSearchOpen] = useState(false)
  const [medicine, setMedicine] = useState('Metformin')
  const [customMedicine, setCustomMedicine] = useState('')
  const [medicineSuggestions, setMedicineSuggestions] = useState<SearchSuggestion[]>([])
  const [medicineSearchLoading, setMedicineSearchLoading] = useState(false)
  const [medicineSearchOpen, setMedicineSearchOpen] = useState(false)
  const [webMedicine, setWebMedicine] = useState<Medicine | null>(null)
  const [medicineLookupStatus, setMedicineLookupStatus] = useState<LookupStatus>('idle')
  const [medicineLookupMessage, setMedicineLookupMessage] = useState('')
  const [timeIndex, setTimeIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [focusMode, setFocusMode] = useState<FocusMode>('pathway')

  useEffect(() => {
    const saved = window.localStorage.getItem('medivis-account')
    if (!saved) return
    try {
      const parsed = JSON.parse(saved) as Account
      setAccount(parsed)
      setStep('profile')
    } catch {
      window.localStorage.removeItem('medivis-account')
    }
  }, [])

  useEffect(() => {
    const query = customCondition.trim()
    if (query.length < 2 || selectedConditionId !== 'custom') {
      setConditionSuggestions([])
      setConditionSearchLoading(false)
      return
    }

    const controller = new AbortController()
    setConditionSearchLoading(true)
    const timeout = window.setTimeout(() => {
      searchDiseaseSuggestions(query, controller.signal)
        .then((items) => {
          setConditionSuggestions(items)
          setConditionSearchOpen(items.length > 0)
        })
        .catch(() => setConditionSuggestions([]))
        .finally(() => setConditionSearchLoading(false))
    }, 260)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [customCondition, selectedConditionId])

  useEffect(() => {
    const query = customMedicine.trim()
    if (query.length < 2) {
      setMedicineSuggestions([])
      setMedicineSearchLoading(false)
      return
    }

    const controller = new AbortController()
    setMedicineSearchLoading(true)
    const timeout = window.setTimeout(() => {
      searchMedicineSuggestions(query, controller.signal)
        .then((items) => {
          setMedicineSuggestions(items)
          setMedicineSearchOpen(items.length > 0)
        })
        .catch(() => setMedicineSuggestions([]))
        .finally(() => setMedicineSearchLoading(false))
    }, 260)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [customMedicine])

  const selectedCondition = useMemo(
    () => (selectedConditionId === 'custom' ? buildUniversalCondition(customCondition) : conditionCatalog.find((item) => item.id === selectedConditionId) ?? conditionCatalog[0]),
    [customCondition, selectedConditionId],
  )
  const recommendedMedicines = useMemo(
    () => medicineCatalog.filter((item) => item.conditionIds.includes(selectedCondition.id)),
    [selectedCondition.id],
  )
  const selectedMedicine = useMemo(() => {
    const requestedName = (customMedicine || medicine).trim()
    if (webMedicine && requestedName && webMedicine.name.toLowerCase() === requestedName.toLowerCase()) return webMedicine
    return getMedicine(requestedName, selectedCondition)
  }, [customMedicine, medicine, selectedCondition, webMedicine])
  const signals = useMemo(() => bodySignals(profile), [profile])
  const highlightedOrgans = useMemo(
    () => unique([...selectedCondition.organs, ...selectedMedicine.affectedOrgans, ...profile.organConditions]),
    [profile.organConditions, selectedCondition.organs, selectedMedicine.affectedOrgans],
  )
  const timelineLabel = timeline[timeIndex]
  const longTermCopy =
    selectedMedicine.longTerm[timelineLabel]
    ?? (timelineLabel === '10 years'
      ? `A 10-year view emphasizes accumulated monitoring needs: ${selectedMedicine.longTerm['5 years'] ?? selectedMedicine.safety}`
      : selectedMedicine.longTerm['1 day'])

  const handleAuth = (event: FormEvent) => {
    event.preventDefault()
    const nextAccount = { name: name.trim() || 'Patient', email: email.trim() || 'patient@example.com', mode: authMode }
    setAccount(nextAccount)
    window.localStorage.setItem('medivis-account', JSON.stringify(nextAccount))
    setStep('profile')
  }

  const resetProject = () => {
    window.localStorage.removeItem('medivis-account')
    setAccount(null)
    setStep('auth')
    setProfile(initialProfile)
    setSelectedConditionId('diabetes')
    setCustomCondition('')
    setConditionSuggestions([])
    setConditionSearchOpen(false)
    setMedicine('Metformin')
    setCustomMedicine('')
    setMedicineSuggestions([])
    setMedicineSearchOpen(false)
    setWebMedicine(null)
    setMedicineLookupStatus('idle')
    setMedicineLookupMessage('')
    setTimeIndex(0)
    setIsPlaying(true)
    setFocusMode('pathway')
  }

  const chooseCondition = (condition: Condition) => {
    setSelectedConditionId(condition.id)
    setCustomCondition('')
    setConditionSuggestions([])
    setConditionSearchOpen(false)
    setProfile({ ...profile, diseases: [condition.name], organConditions: condition.organs })
    setMedicine(condition.recommended[0])
    setCustomMedicine('')
    setWebMedicine(null)
    setMedicineLookupStatus('idle')
    setMedicineLookupMessage('')
  }

  const chooseCustomCondition = (value: string) => {
    const nextCondition = buildUniversalCondition(value)
    setCustomCondition(value)
    setSelectedConditionId('custom')
    setConditionSearchOpen(value.trim().length >= 2)
    setProfile({ ...profile, diseases: value.trim() ? [value.trim()] : [], organConditions: nextCondition.organs })
    setMedicine('')
    setCustomMedicine('')
    setWebMedicine(null)
    setMedicineLookupStatus('idle')
    setMedicineLookupMessage('')
  }

  const selectConditionSuggestion = (suggestion: SearchSuggestion) => {
    const nextCondition = buildUniversalCondition(suggestion.title)
    setCustomCondition(suggestion.title)
    setSelectedConditionId('custom')
    setConditionSuggestions([])
    setConditionSearchOpen(false)
    setProfile({ ...profile, diseases: [suggestion.title], organConditions: nextCondition.organs })
    setMedicine('')
    setCustomMedicine('')
    setWebMedicine(null)
    setMedicineLookupStatus('idle')
    setMedicineLookupMessage('')
  }

  const selectMedicine = (name: string) => {
    setMedicine(name)
    setCustomMedicine('')
    setMedicineSuggestions([])
    setMedicineSearchOpen(false)
    setWebMedicine(null)
    setMedicineLookupStatus('idle')
    setMedicineLookupMessage('')
  }

  const handleCustomMedicineChange = (value: string) => {
    setCustomMedicine(value)
    setMedicineSearchOpen(value.trim().length >= 2)
    setWebMedicine(null)
    setMedicineLookupStatus('idle')
    setMedicineLookupMessage('')
  }

  const importMedicineByName = async (name: string) => {
    setMedicine(name)
    setCustomMedicine('')
    setMedicineSuggestions([])
    setMedicineSearchOpen(false)
    setMedicineLookupStatus('loading')
    setMedicineLookupMessage(`Importing ${name} from public drug labels...`)

    try {
      const result = await lookupMedicineFromWeb(name, selectedCondition)
      setWebMedicine(result)
      setMedicine(result.name)
      setMedicineLookupStatus('success')
      setMedicineLookupMessage(`${result.name} imported into the simulator.`)
    } catch (error) {
      setWebMedicine(null)
      setMedicineLookupStatus('error')
      setMedicineLookupMessage(error instanceof Error ? error.message : 'Could not import that medicine label.')
    }
  }

  const handleMedicineLookup = async () => {
    const requestedName = (customMedicine || medicine).trim()
    if (!requestedName) {
      setMedicineLookupStatus('error')
      setMedicineLookupMessage('Type a medicine name first.')
      return
    }

    setMedicineLookupStatus('loading')
    setMedicineLookupMessage('Searching public drug labels...')

    try {
      const result = await lookupMedicineFromWeb(requestedName, selectedCondition)
      setWebMedicine(result)
      setMedicine(result.name)
      setCustomMedicine('')
      setMedicineLookupStatus('success')
      setMedicineLookupMessage('Public label imported into the simulator.')
    } catch (error) {
      setWebMedicine(null)
      setMedicineLookupStatus('error')
      setMedicineLookupMessage(error instanceof Error ? error.message : 'Could not import that medicine label.')
    }
  }

  const stage = (
    <OpenAnatomyStage
      profile={profile}
      signals={signals}
      step={step}
      medicine={step === 'simulation' || step === 'education' ? selectedMedicine.name : ''}
      timeLabel={timelineLabel}
      isPlaying={isPlaying && step === 'simulation'}
      speed={speed}
      highlightedOrgans={highlightedOrgans}
      focusMode={focusMode}
    />
  )

  return (
    <main className="chart-app">
      <div className="chart-noise" aria-hidden />

      <div className="chart-layout">
        <aside className="chart-sidebar">
          <div className="workspace-panel control-workspace">
            <div className="chart-sidebar-scroll">
              <div className="control-deck">
            <header className="control-deck-header">
              <div className="brand-lockup">
                <span className="brand-badge">Educational simulation</span>
                <h1>MediTwin Studio</h1>
                <p className="brand-tagline">
                  Calibrate a virtual patient, pick a condition and medicine, then explore route, organ emphasis, and time-based storytelling in 3D—built for learning,
                  not diagnosis or prescribing.
                </p>
              </div>
              {account ? (
                <button type="button" className="icon-button" title="Reset session" onClick={resetProject} aria-label="Reset project">
                  <RotateCcw size={18} />
                </button>
              ) : null}
            </header>

            {account ? (
              <div className="session-strip">
                <span className="session-pill">
                  <User size={14} strokeWidth={2.25} aria-hidden /> {account.name}
                </span>
                {step !== 'auth' && step !== 'profile' ? (
                  <span className="session-pill session-pill--accent">
                    <Stethoscope size={14} strokeWidth={2.25} aria-hidden /> {selectedCondition.name}
                  </span>
                ) : null}
                {step === 'education' || step === 'simulation' ? (
                  <span className="session-pill">
                    <Pill size={14} strokeWidth={2.25} aria-hidden /> {selectedMedicine.name}
                  </span>
                ) : null}
              </div>
            ) : null}

            <StepRail step={step} />

            <AnimatePresence mode="wait">
            {step === 'auth' && (
              <motion.form key="auth" className="flow-panel" onSubmit={handleAuth} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <div className="segmented-control">
                  <button type="button" className={authMode === 'login' ? 'segment-active' : ''} onClick={() => setAuthMode('login')}>
                    <LogIn size={16} /> Login
                  </button>
                  <button type="button" className={authMode === 'register' ? 'segment-active' : ''} onClick={() => setAuthMode('register')}>
                    <UserPlus size={16} /> Register
                  </button>
                </div>
                <div>
                  <h2>{authMode === 'login' ? 'Welcome back.' : 'Create your patient workspace.'}</h2>
                  <p className="panel-copy">Use any account details for this demo. The session is stored locally on this device.</p>
                </div>
                <div className="insight-callout">
                  <ShieldCheck size={18} aria-hidden />
                  <span>This demo stores a lightweight session in your browser only. Use fictional credentials—nothing here replaces your care team or pharmacy counseling.</span>
                </div>
                <label className="field-label">
                  Name
                  <input value={name} onChange={(event) => setName(event.target.value)} className="field-input" />
                </label>
                <label className="field-label">
                  Email
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="field-input" />
                </label>
                <label className="field-label">
                  Password
                  <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="field-input" />
                </label>
                <button type="submit" className="primary-button">
                  <CheckCircle2 size={18} /> Continue to body profile
                </button>
              </motion.form>
            )}

            {step === 'profile' && (
              <motion.div key="profile" className="flow-panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <div>
                  <p className="eyebrow">Signed in as {account?.name}</p>
                  <h2>Build the body profile.</h2>
                  <p className="panel-copy">These inputs drive body scale, organ emphasis, fatigue tone, and animation risk layers.</p>
                </div>

                <div className="metric-grid">
                  <IconStat icon={Gauge} label="BMI" value={String(signals.bmi)} />
                  <IconStat icon={Activity} label="Vitality" value={metric(signals.vitality)} />
                  <IconStat icon={Brain} label="Stress" value={`${profile.stress}/10`} />
                </div>

                <div className="form-grid">
                  <label className="field-label">
                    Age
                    <input type="range" min={12} max={92} value={profile.age} onChange={(event) => setProfile({ ...profile, age: Number(event.target.value) })} className="cinematic-range" />
                    <span>{profile.age} years</span>
                  </label>
                  <label className="field-label">
                    Height
                    <input type="range" min={120} max={220} value={profile.height} onChange={(event) => setProfile({ ...profile, height: Number(event.target.value) })} className="cinematic-range" />
                    <span>{profile.height} cm</span>
                  </label>
                  <label className="field-label">
                    Weight
                    <input type="range" min={35} max={180} value={profile.weight} onChange={(event) => setProfile({ ...profile, weight: Number(event.target.value) })} className="cinematic-range" />
                    <span>{profile.weight} kg</span>
                  </label>
                  <label className="field-label">
                    Stress
                    <input type="range" min={1} max={10} value={profile.stress} onChange={(event) => setProfile({ ...profile, stress: Number(event.target.value) })} className="cinematic-range" />
                    <span>{profile.stress}/10</span>
                  </label>
                </div>

                <div className="choice-row">
                  {['Female', 'Male', 'Non-binary', 'Prefer not to say'].map((option) => (
                    <button key={option} type="button" className={`choice-pill ${profile.gender === option ? 'choice-pill-active' : ''}`} onClick={() => setProfile({ ...profile, gender: option })}>
                      {option}
                    </button>
                  ))}
                </div>
                <div className="choice-row">
                  {['Lean', 'Average', 'Athletic', 'Soft', 'Heavy'].map((option) => (
                    <button key={option} type="button" className={`choice-pill ${profile.bodyType === option ? 'choice-pill-active' : ''}`} onClick={() => setProfile({ ...profile, bodyType: option })}>
                      {option}
                    </button>
                  ))}
                </div>
                <div className="choice-row">
                  {['Mostly sedentary', 'Moderately active', 'Frequently mobile', 'Physically demanding'].map((option) => (
                    <button key={option} type="button" className={`choice-pill ${profile.lifestyle === option ? 'choice-pill-active' : ''}`} onClick={() => setProfile({ ...profile, lifestyle: option })}>
                      {option}
                    </button>
                  ))}
                </div>

                <div className="form-grid">
                  <label className="field-label">
                    Allergies
                    <input value={profile.allergies} onChange={(event) => setProfile({ ...profile, allergies: event.target.value })} className="field-input" />
                  </label>
                  <label className="field-label">
                    Kidney history
                    <input value={profile.kidneyHistory} onChange={(event) => setProfile({ ...profile, kidneyHistory: event.target.value })} className="field-input" />
                  </label>
                  <label className="field-label">
                    Liver history
                    <input value={profile.liverHistory} onChange={(event) => setProfile({ ...profile, liverHistory: event.target.value })} className="field-input" />
                  </label>
                  <label className="field-label">
                    Pregnancy status
                    <select value={profile.pregnancy} onChange={(event) => setProfile({ ...profile, pregnancy: event.target.value })} className="field-input">
                      <option>Not applicable</option>
                      <option>No</option>
                      <option>Pregnant</option>
                      <option>Planning pregnancy</option>
                      <option>Prefer not to say</option>
                    </select>
                  </label>
                </div>

                <button type="button" className="primary-button" onClick={() => setStep('condition')}>
                  <ArrowRight size={18} /> Choose condition
                </button>
              </motion.div>
            )}

            {step === 'condition' && (
              <motion.div key="condition" className="flow-panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <div>
                  <p className="eyebrow">Clinical focus</p>
                  <h2>Select or type any disease.</h2>
                  <p className="panel-copy">Use the starter cards for common cases, or type any disease/condition to build a universal organ map for the animation.</p>
                </div>
                <div className="field-label search-field">
                  <span>Universal disease / condition</span>
                  <div className="smart-search">
                    <Search size={17} aria-hidden />
                    <input
                      value={customCondition}
                      onChange={(event) => chooseCustomCondition(event.target.value)}
                      onFocus={() => setConditionSearchOpen(conditionSuggestions.length > 0)}
                      placeholder="Search any disease, symptom, or diagnosis"
                      className="field-input smart-search__input"
                      autoComplete="off"
                    />
                    {conditionSearchLoading ? <LoaderCircle size={17} className="smart-search__spinner" aria-hidden /> : null}
                  </div>
                  {conditionSearchOpen && conditionSuggestions.length > 0 ? (
                    <div className="suggestion-box">
                      {conditionSuggestions.map((suggestion) => (
                        <button key={suggestion.id} type="button" className="suggestion-item" onClick={() => selectConditionSuggestion(suggestion)}>
                          <span>
                            <strong>{suggestion.title}</strong>
                            <small>{suggestion.subtitle}</small>
                          </span>
                          <em>{suggestion.source}</em>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="condition-grid">
                  {conditionCatalog.map((condition) => {
                    const Icon = condition.icon
                    const active = selectedCondition.id === condition.id
                    return (
                      <button key={condition.id} type="button" className={`condition-card ${active ? 'condition-card-active' : ''}`} onClick={() => chooseCondition(condition)}>
                        <Icon size={20} />
                        <span>{condition.category}</span>
                        <strong>{condition.name}</strong>
                        <small>{condition.description}</small>
                      </button>
                    )
                  })}
                </div>
                <div className="organ-chip-row">
                  {selectedCondition.organs.map((organ) => <span key={organ}>{organ}</span>)}
                </div>
                <div className="button-row">
                  <button type="button" className="ghost-button" onClick={() => setStep('profile')}>Back</button>
                  <button type="button" className="primary-button" onClick={() => setStep('medicine')}>
                    <Pill size={18} /> Select medicine
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'medicine' && (
              <motion.div key="medicine" className="flow-panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <div>
                  <p className="eyebrow">{selectedCondition.name}</p>
                  <h2>Choose or import any medicine.</h2>
                  <p className="panel-copy">Recommended options stay here for speed. For universal mode, type a medicine name and import its public label to update organs, side effects, warnings, and route.</p>
                </div>
                <div className="medicine-list">
                  {recommendedMedicines.map((item) => (
                    <button key={item.name} type="button" onClick={() => selectMedicine(item.name)} className={`medicine-card ${selectedMedicine.name === item.name ? 'medicine-card-active' : ''}`}>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.purpose}</span>
                      </div>
                      <small>{item.route} · {item.onset}</small>
                    </button>
                  ))}
                </div>
                <div className="field-label search-field">
                  <span>Universal medicine lookup</span>
                  <div className="smart-search">
                    <Search size={17} aria-hidden />
                    <input
                      value={customMedicine}
                      onChange={(event) => handleCustomMedicineChange(event.target.value)}
                      onFocus={() => setMedicineSearchOpen(medicineSuggestions.length > 0)}
                      placeholder="Search any medicine, generic, or brand"
                      className="field-input smart-search__input"
                      autoComplete="off"
                    />
                    {medicineSearchLoading ? <LoaderCircle size={17} className="smart-search__spinner" aria-hidden /> : null}
                  </div>
                  {medicineSearchOpen && medicineSuggestions.length > 0 ? (
                    <div className="suggestion-box">
                      {medicineSuggestions.map((suggestion) => (
                        <button key={suggestion.id} type="button" className="suggestion-item" onClick={() => importMedicineByName(suggestion.title)}>
                          <span>
                            <strong>{suggestion.title}</strong>
                            <small>{suggestion.subtitle}</small>
                          </span>
                          <em>{suggestion.source}</em>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className={`lookup-panel lookup-panel--${medicineLookupStatus}`}>
                  <div>
                    <Globe2 size={17} aria-hidden />
                    <span>{medicineLookupMessage || 'Import public drug-label data for typed medicines.'}</span>
                  </div>
                  <button type="button" className="ghost-button" onClick={handleMedicineLookup} disabled={medicineLookupStatus === 'loading'}>
                    {medicineLookupStatus === 'loading' ? 'Importing...' : 'Import label'}
                  </button>
                </div>
                <div className="medicine-summary">
                  <div><span>Route</span><strong>{selectedMedicine.route}</strong></div>
                  <div><span>Onset</span><strong>{selectedMedicine.onset}</strong></div>
                  <div><span>Duration</span><strong>{selectedMedicine.duration}</strong></div>
                </div>
                <div className="button-row">
                  <button type="button" className="ghost-button" onClick={() => setStep('condition')}>Back</button>
                  <button type="button" className="primary-button" onClick={() => setStep('education')}>
                    <ArrowRight size={18} /> Review mechanism
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'education' && (
              <motion.div key="education" className="flow-panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <div>
                  <p className="eyebrow">{selectedMedicine.name}</p>
                  <h2>Do you want the anatomy animation?</h2>
                  <p className="panel-copy">The animation will trace the medicine route, highlight organs affected by its benefit and side effects, and visualize what changes across days, months, and years.</p>
                </div>
                <div className="explain-grid">
                  <div>
                    <Pill size={20} />
                    <strong>Mechanism</strong>
                    <span>{selectedMedicine.purpose}</span>
                  </div>
                  <div>
                    <AlertTriangle size={20} />
                    <strong>Side effects</strong>
                    <span>{selectedMedicine.sideEffects.slice(0, 3).join(', ')}</span>
                  </div>
                  <div>
                    <Clock3 size={20} />
                    <strong>Timeline</strong>
                    <span>{selectedMedicine.longTerm['1 month']}</span>
                  </div>
                </div>
                <div className="safety-panel">
                  <ShieldCheck size={20} />
                  <p>{selectedMedicine.safety}</p>
                </div>
                <div className="button-row">
                  <button type="button" className="ghost-button" onClick={() => setStep('medicine')}>Back</button>
                  <button type="button" className="primary-button" onClick={() => { setIsPlaying(true); setStep('simulation') }}>
                    <Play size={18} /> Play anatomy animation
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'simulation' && (
              <motion.div
                key="simulation"
                className="flow-panel flow-panel--sim simulation-panel"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <header>
                  <p className="eyebrow eyebrow--inline">
                    <Microscope size={14} strokeWidth={2.25} aria-hidden />
                    Live simulation deck
                  </p>
                  <h2>{selectedMedicine.name}</h2>
                  <p className="panel-copy">{selectedMedicine.purpose}</p>
                  <div className="sim-hero-meta">
                    <span className="dose-chip">
                      <BookOpen size={13} aria-hidden /> {selectedCondition.name}
                    </span>
                    <span className="dose-chip" style={{ borderColor: 'rgba(45, 212, 191, 0.35)', background: 'rgba(45, 212, 191, 0.1)', color: '#ccfbf1' }}>
                      <Pill size={13} aria-hidden /> {selectedMedicine.route}
                    </span>
                  </div>
                </header>

                <div className="insight-callout">
                  <BadgeInfo size={18} aria-hidden />
                  <span>
                    Use the lens buttons to switch visualization modes on the same mesh: overview balances anatomy, pathway emphasizes the dose corridor, and burden highlights
                    risk-weighted organs. Timeline scrubs educational copy only—always verify real dosing with a clinician.
                  </span>
                </div>

                <div className="sim-deck sim-deck--split">
                  <div className="sim-card">
                    <p className="sim-card__label">
                      <Zap size={14} aria-hidden /> Transport
                    </p>
                    <div className="playbar-premium">
                      <div className="playbar-premium__main">
                        <button type="button" className="play-toggle" data-playing={isPlaying} onClick={() => setIsPlaying(!isPlaying)}>
                          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                          {isPlaying ? 'Pause' : 'Play'}
                        </button>
                      </div>
                      <div className="play-slider-block">
                        <label htmlFor="sim-speed">
                          Rate <output>{speed.toFixed(1)}×</output>
                        </label>
                        <input
                          id="sim-speed"
                          type="range"
                          min={0.5}
                          max={2}
                          step={0.1}
                          value={speed}
                          onChange={(event) => setSpeed(Number(event.target.value))}
                          className="cinematic-range"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="sim-card sim-card--lens">
                    <p className="sim-card__label">
                      <Layers size={14} aria-hidden /> Visualization lens
                    </p>
                    <div className="focus-modes">
                      {(
                        [
                          { id: 'overview' as const, title: 'Overview', desc: 'All organs', Icon: Layers },
                          { id: 'pathway' as const, title: 'Pathway', desc: 'Dose route', Icon: Route },
                          { id: 'sideEffects' as const, title: 'Side effects', desc: 'Risk map', Icon: AlertTriangle },
                        ] as const
                      ).map(({ id, title, desc, Icon }) => (
                        <button
                          key={id}
                          type="button"
                          className={`focus-mode-btn ${focusMode === id ? 'focus-mode-btn--active' : ''}`}
                          onClick={() => setFocusMode(id)}
                        >
                          <span className="focus-mode-btn__icon">
                            <Icon size={15} strokeWidth={2.2} aria-hidden />
                          </span>
                          <span className="focus-mode-btn__copy">
                            <strong>{title}</strong>
                            <small>{desc}</small>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sim-card timeline-rail">
                  <div className="timeline-rail__head">
                    <span className="timeline-rail__phase">Longitudinal narrative</span>
                    <strong className="timeline-rail__value">{timelineLabel}</strong>
                  </div>
                  <p className="timeline-rail__hint">Scrub the arc from first dose to years of monitoring—each stop updates the companion text and animation intensity.</p>
                  <input
                    type="range"
                    min={0}
                    max={timeline.length - 1}
                    value={timeIndex}
                    onChange={(event) => setTimeIndex(Number(event.target.value))}
                    className="cinematic-range"
                  />
                  <div className="timeline-labels">
                    {timeline.map((item, index) => (
                      <button key={item} type="button" className={timeIndex === index ? 'timeline-label-active' : ''} onClick={() => setTimeIndex(index)}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="timeline-card">
                  <Clock3 size={20} aria-hidden />
                  <p>{longTermCopy}</p>
                </div>

                <div className="two-column">
                  <section>
                    <h3>Therapeutic upside</h3>
                    {selectedMedicine.benefits.map((item) => (
                      <p key={item}>
                        <CheckCircle2 size={15} aria-hidden /> {item}
                      </p>
                    ))}
                  </section>
                  <section>
                    <h3>Common effects</h3>
                    {selectedMedicine.sideEffects.map((item) => (
                      <p key={item}>
                        <AlertTriangle size={15} aria-hidden /> {item}
                      </p>
                    ))}
                  </section>
                </div>

                <div className="danger-list">
                  <strong>Stop and seek urgent care if…</strong>
                  <div>{selectedMedicine.seriousSignals.map((item) => <span key={item}>{item}</span>)}</div>
                </div>

                <div>
                  <p className="sim-card__label" style={{ marginBottom: '0.45rem' }}>
                    <Sparkles size={14} aria-hidden /> Organs in frame
                  </p>
                  <div className="organ-chip-row">{highlightedOrgans.map((organ) => <span key={organ}>{organ}</span>)}</div>
                </div>

                <div className="button-row">
                  <button type="button" className="ghost-button" onClick={() => setStep('education')}>
                    Back
                  </button>
                  <button type="button" className="primary-button" onClick={resetProject}>
                    <RotateCcw size={18} /> New patient journey
                  </button>
                </div>
              </motion.div>
            )}
            </AnimatePresence>
              </div>
            </div>
          </div>
        </aside>

        <div className="chart-stage-wrap">
          <div className="workspace-panel anatomy-workspace chart-stage-frame">
            {stage}
          </div>
          <p className="chart-stage-label">Anatomical model · BodyParts3D (research / education)</p>
        </div>
      </div>
    </main>
  )
}
