'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock3,
  Gauge,
  HeartPulse,
  LogIn,
  Pause,
  Pill,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserPlus,
  Wind,
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

const timeline = ['1 day', '1 week', '1 month', '6 months', '1 year', '5 years']

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

function getMedicine(name: string, condition?: Condition): Medicine {
  const known = medicineCatalog.find((item) => item.name === name)
  if (known) return known

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
    ['auth', 'Account'],
    ['profile', 'Body'],
    ['condition', 'Condition'],
    ['medicine', 'Medicine'],
    ['education', 'Consent'],
    ['simulation', 'Animation'],
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
  const [medicine, setMedicine] = useState('Metformin')
  const [customMedicine, setCustomMedicine] = useState('')
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

  const selectedCondition = useMemo(() => conditionCatalog.find((item) => item.id === selectedConditionId) ?? conditionCatalog[0], [selectedConditionId])
  const recommendedMedicines = useMemo(
    () => medicineCatalog.filter((item) => item.conditionIds.includes(selectedCondition.id)),
    [selectedCondition.id],
  )
  const selectedMedicine = useMemo(() => getMedicine(customMedicine || medicine, selectedCondition), [customMedicine, medicine, selectedCondition])
  const signals = useMemo(() => bodySignals(profile), [profile])
  const highlightedOrgans = useMemo(
    () => unique([...selectedCondition.organs, ...selectedMedicine.affectedOrgans, ...profile.organConditions]),
    [profile.organConditions, selectedCondition.organs, selectedMedicine.affectedOrgans],
  )
  const timelineLabel = timeline[timeIndex]
  const longTermCopy = selectedMedicine.longTerm[timelineLabel] ?? selectedMedicine.longTerm['1 day']

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
    setMedicine('Metformin')
    setCustomMedicine('')
    setTimeIndex(0)
    setIsPlaying(true)
    setFocusMode('pathway')
  }

  const chooseCondition = (condition: Condition) => {
    setSelectedConditionId(condition.id)
    setProfile({ ...profile, diseases: [condition.name], organConditions: condition.organs })
    setMedicine(condition.recommended[0])
    setCustomMedicine('')
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
    <main className="app-shell min-h-screen text-white">
      <div className="clinical-grid" />

      <section className="relative z-10 grid min-h-screen grid-cols-1 gap-5 p-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(430px,0.78fr)] lg:p-6">
        <div className="workspace-panel anatomy-workspace">
          {stage}
        </div>

        <div className="workspace-panel control-workspace">
          <div className="app-topbar">
            <div>
              <p className="eyebrow">MediTwin Studio</p>
              <h1>Medicine anatomy simulator</h1>
            </div>
            {account && (
              <button type="button" className="icon-button" onClick={resetProject} aria-label="Reset project">
                <RotateCcw size={18} />
              </button>
            )}
          </div>

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
                  <h2>Select a disease or condition.</h2>
                  <p className="panel-copy">The selected condition determines recommended medicines, target organs, side-effect watchpoints, and animation emphasis.</p>
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
                  <h2>Choose or enter a prescribed medicine.</h2>
                  <p className="panel-copy">Recommended options are shown first. You can also type a custom medicine name and still run a condition-based educational simulation.</p>
                </div>
                <div className="medicine-list">
                  {recommendedMedicines.map((item) => (
                    <button key={item.name} type="button" onClick={() => { setMedicine(item.name); setCustomMedicine('') }} className={`medicine-card ${selectedMedicine.name === item.name ? 'medicine-card-active' : ''}`}>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.purpose}</span>
                      </div>
                      <small>{item.route} · {item.onset}</small>
                    </button>
                  ))}
                </div>
                <label className="field-label">
                  Custom medicine
                  <input value={customMedicine} onChange={(event) => setCustomMedicine(event.target.value)} placeholder="Example: cetirizine, azithromycin, aspirin" className="field-input" />
                </label>
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
              <motion.div key="simulation" className="flow-panel simulation-panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <div>
                  <p className="eyebrow">{selectedCondition.name}</p>
                  <h2>{selectedMedicine.name} pathway.</h2>
                  <p className="panel-copy">{selectedMedicine.purpose}</p>
                </div>

                <div className="playbar">
                  <button type="button" className="primary-button" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />} {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  <label>
                    Speed
                    <input type="range" min={0.5} max={2} step={0.1} value={speed} onChange={(event) => setSpeed(Number(event.target.value))} />
                    <span>{speed.toFixed(1)}x</span>
                  </label>
                </div>

                <div className="segmented-control">
                  {(['overview', 'pathway', 'sideEffects'] as FocusMode[]).map((mode) => (
                    <button key={mode} type="button" className={focusMode === mode ? 'segment-active' : ''} onClick={() => setFocusMode(mode)}>
                      {mode === 'overview' ? 'Overview' : mode === 'pathway' ? 'Pathway' : 'Side effects'}
                    </button>
                  ))}
                </div>

                <div>
                  <div className="timeline-head">
                    <span>Projected use</span>
                    <strong>{timelineLabel}</strong>
                  </div>
                  <input type="range" min={0} max={timeline.length - 1} value={timeIndex} onChange={(event) => setTimeIndex(Number(event.target.value))} className="cinematic-range" />
                  <div className="timeline-labels">
                    {timeline.map((item) => <span key={item}>{item}</span>)}
                  </div>
                </div>

                <div className="timeline-card">
                  <Clock3 size={20} />
                  <p>{longTermCopy}</p>
                </div>

                <div className="two-column">
                  <section>
                    <h3>Benefits</h3>
                    {selectedMedicine.benefits.map((item) => <p key={item}><CheckCircle2 size={15} /> {item}</p>)}
                  </section>
                  <section>
                    <h3>Side effects</h3>
                    {selectedMedicine.sideEffects.map((item) => <p key={item}><AlertTriangle size={15} /> {item}</p>)}
                  </section>
                </div>

                <div className="danger-list">
                  <strong>Urgent warning signs</strong>
                  <div>{selectedMedicine.seriousSignals.map((item) => <span key={item}>{item}</span>)}</div>
                </div>

                <div className="organ-chip-row">
                  {highlightedOrgans.map((organ) => <span key={organ}>{organ}</span>)}
                </div>

                <div className="button-row">
                  <button type="button" className="ghost-button" onClick={() => setStep('education')}>Back</button>
                  <button type="button" className="primary-button" onClick={resetProject}>
                    <RotateCcw size={18} /> New patient
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  )
}
