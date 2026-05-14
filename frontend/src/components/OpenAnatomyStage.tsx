'use client'

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { ContactShadows, Html, Line, OrbitControls, useProgress } from '@react-three/drei'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { Suspense, useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

type HumanSignals = {
  bmi: number
  bodyMass: number
  stress: number
  smoking: number
  diseaseLoad: number
  organLoad: number
  fatigue: number
  vitality: number
}

type HumanProfile = {
  age: number
  gender: string
  height: number
  weight: number
  bodyType: string
  diseases: string[]
  organConditions: string[]
}

type OrganGroup =
  | 'skin'
  | 'brain'
  | 'heart'
  | 'respiratory'
  | 'lungs'
  | 'liver'
  | 'gallbladder'
  | 'stomach'
  | 'pancreas'
  | 'spleen'
  | 'kidneys'
  | 'intestine'
  | 'largeIntestine'
  | 'appendix'
  | 'bladder'
  | 'vessels'
  | 'skeleton'
  | 'spinalCord'
  | 'diaphragm'
  | 'eyes'
  | 'tongue'
  | 'adrenal'
  | 'prostate'
  | 'reproductive'

type AnatomyAsset = {
  group: OrganGroup
  name: string
  file: string
  opacity?: number
}

type MedicineProfile = {
  color: string
  route: 'oral' | 'inhaled' | 'injection'
  target: OrganGroup[]
  path: [number, number, number][]
  copy: string
}

type OpenAnatomyStageProps = {
  profile: HumanProfile
  signals: HumanSignals
  step: string
  medicine: string
  timeLabel: string
  isPlaying?: boolean
  speed?: number
  highlightedOrgans?: string[]
  focusMode?: 'overview' | 'pathway' | 'sideEffects'
}

const ANATOMY_CENTER: [number, number, number] = [-1.15, -100.6, 781.7]
const ANATOMY_SCALE = 0.00122
const ANATOMY_OFFSET: [number, number, number] = [-ANATOMY_CENTER[0], -ANATOMY_CENTER[1], -ANATOMY_CENTER[2]]

const asset = (group: OrganGroup, name: string, file: string, opacity?: number): AnatomyAsset => ({ group, name, file, opacity })

const realAnatomyAssets: AnatomyAsset[] = [
  asset('skin', 'Full body skin surface', '/models/bodyparts3d/skin/FJ2810.obj', 0.045),
  asset('brain', 'Cerebellum', '/models/bodyparts3d/brain/FJ1781.obj'),
  asset('brain', 'Medulla oblongata', '/models/bodyparts3d/brain/FJ1769.obj'),
  asset('brain', 'Pons', '/models/bodyparts3d/brain/FJ1775.obj'),
  asset('heart', 'Wall of right atrium', '/models/bodyparts3d/heart/FJ2439.obj'),
  asset('heart', 'Wall of left atrium', '/models/bodyparts3d/heart/FJ2438.obj'),
  asset('respiratory', 'Trachea', '/models/bodyparts3d/respiratory/FJ2541.obj'),
  asset('respiratory', 'Left main bronchus', '/models/bodyparts3d/respiratory/FJ2450.obj'),
  asset('respiratory', 'Right main bronchus', '/models/bodyparts3d/respiratory/FJ2539.obj'),
  asset('lungs', 'Left bronchial tree', '/models/bodyparts3d/lungs/FJ2479.obj'),
  asset('lungs', 'Right bronchial tree', '/models/bodyparts3d/lungs/FJ2481.obj'),
  asset('liver', 'Liver segment II', '/models/bodyparts3d/liver/FJ2818.obj'),
  asset('liver', 'Liver segment III', '/models/bodyparts3d/liver/FJ2819.obj'),
  asset('liver', 'Liver segment IV', '/models/bodyparts3d/liver/FJ2820.obj'),
  asset('liver', 'Liver segment V', '/models/bodyparts3d/liver/FJ2821.obj'),
  asset('liver', 'Liver segment VI', '/models/bodyparts3d/liver/FJ2822.obj'),
  asset('gallbladder', 'Gallbladder', '/models/bodyparts3d/gallbladder/FJ2817.obj'),
  asset('stomach', 'Stomach', '/models/bodyparts3d/stomach/FJ2564.obj'),
  asset('pancreas', 'Pancreas', '/models/bodyparts3d/pancreas/FJ1895.obj'),
  asset('pancreas', 'Pancreatic duct tree', '/models/bodyparts3d/pancreas/FJ2630.obj'),
  asset('spleen', 'Spleen', '/models/bodyparts3d/spleen/FJ2561.obj'),
  asset('kidneys', 'Left kidney', '/models/bodyparts3d/kidneys/FJ3145.obj'),
  asset('kidneys', 'Right kidney', '/models/bodyparts3d/kidneys/FJ3147.obj'),
  asset('intestine', 'Duodenum', '/models/bodyparts3d/small-intestine/FJ2573.obj'),
  asset('intestine', 'Jejunum section', '/models/bodyparts3d/small-intestine/FJ2606.obj'),
  asset('intestine', 'Ileum section', '/models/bodyparts3d/small-intestine/FJ2589.obj'),
  asset('intestine', 'Small intestine mesentery', '/models/bodyparts3d/intestine/FJ3396.obj', 0.5),
  asset('largeIntestine', 'Ascending colon', '/models/bodyparts3d/large-intestine/FJ2566.obj'),
  asset('largeIntestine', 'Descending colon', '/models/bodyparts3d/large-intestine/FJ2567.obj'),
  asset('largeIntestine', 'Transverse colon', '/models/bodyparts3d/large-intestine/FJ2572.obj'),
  asset('largeIntestine', 'Rectum', '/models/bodyparts3d/large-intestine/FJ2571.obj'),
  asset('appendix', 'Appendix', '/models/bodyparts3d/large-intestine/FJ2565.obj'),
  asset('bladder', 'Urinary bladder', '/models/bodyparts3d/bladder/FJ3149.obj'),
  asset('vessels', 'Abdominal aorta', '/models/bodyparts3d/vessels/FJ1932.obj'),
  asset('vessels', 'Descending thoracic aorta', '/models/bodyparts3d/vessels/FJ1931.obj'),
  asset('vessels', 'Descending aorta', '/models/bodyparts3d/vessels/FJ3427.obj'),
  asset('vessels', 'Pulmonary trunk', '/models/bodyparts3d/vessels/FJ2966.obj'),
  asset('vessels', 'Left pulmonary artery', '/models/bodyparts3d/vessels/FJ2924.obj'),
  asset('vessels', 'Right pulmonary artery', '/models/bodyparts3d/vessels/FJ3019.obj'),
  asset('skeleton', 'Sternum', '/models/bodyparts3d/skeleton/FJ3178.obj', 0.55),
  asset('skeleton', 'Atlas', '/models/bodyparts3d/skeleton/FJ3176.obj', 0.48),
  asset('skeleton', 'Axis', '/models/bodyparts3d/skeleton/FJ3177.obj', 0.48),
  asset('skeleton', 'Cervical vertebra', '/models/bodyparts3d/skeleton/FJ3167.obj', 0.48),
  asset('skeleton', 'Thoracic vertebra', '/models/bodyparts3d/skeleton/FJ3166.obj', 0.48),
  asset('skeleton', 'Lumbar vertebra', '/models/bodyparts3d/skeleton/FJ3162.obj', 0.48),
  asset('spinalCord', 'Central canal of spinal cord', '/models/bodyparts3d/spinal-cord/FJ1737.obj'),
  asset('diaphragm', 'Diaphragm', '/models/bodyparts3d/diaphragm/FJ3131.obj', 0.52),
  asset('adrenal', 'Left adrenal gland', '/models/bodyparts3d/adrenal/FJ3129.obj'),
  asset('adrenal', 'Right adrenal gland', '/models/bodyparts3d/adrenal/FJ3130.obj'),
  asset('eyes', 'Left sclera', '/models/bodyparts3d/eyes/FJ1317.obj'),
  asset('eyes', 'Right choroid', '/models/bodyparts3d/eyes/FJ1336.obj'),
  asset('tongue', 'Tongue', '/models/bodyparts3d/tongue/FJ2761.obj'),
  asset('prostate', 'Prostate', '/models/bodyparts3d/prostate/FJ3139.obj'),
  asset('reproductive', 'Left testis', '/models/bodyparts3d/reproductive/FJ3138.obj'),
  asset('reproductive', 'Right testis', '/models/bodyparts3d/reproductive/FJ3142.obj'),
]

const timelineEffect: Record<string, number> = {
  '1 day': 0.12,
  '1 week': 0.24,
  '1 month': 0.38,
  '6 months': 0.56,
  '1 year': 0.72,
  '5 years': 1,
}

const groupStyle: Record<OrganGroup, { color: string; opacity: number }> = {
  skin: { color: '#d8a48e', opacity: 0.12 },
  brain: { color: '#df66ae', opacity: 0.98 },
  heart: { color: '#df2638', opacity: 0.98 },
  respiratory: { color: '#4aa3ff', opacity: 0.93 },
  lungs: { color: '#7bc8ff', opacity: 0.86 },
  liver: { color: '#a23d2f', opacity: 0.98 },
  gallbladder: { color: '#60bf70', opacity: 0.96 },
  stomach: { color: '#f18f36', opacity: 0.95 },
  pancreas: { color: '#f2c36f', opacity: 0.94 },
  spleen: { color: '#954091', opacity: 0.95 },
  kidneys: { color: '#b455a3', opacity: 0.95 },
  intestine: { color: '#f2a15b', opacity: 0.82 },
  largeIntestine: { color: '#de7f45', opacity: 0.9 },
  appendix: { color: '#ef8b5c', opacity: 0.9 },
  bladder: { color: '#efd769', opacity: 0.92 },
  vessels: { color: '#cf1d31', opacity: 0.9 },
  skeleton: { color: '#efe6d5', opacity: 0.44 },
  spinalCord: { color: '#ffe6a7', opacity: 0.96 },
  diaphragm: { color: '#bc91df', opacity: 0.62 },
  eyes: { color: '#9ed2ff', opacity: 0.88 },
  tongue: { color: '#d95f7d', opacity: 0.94 },
  adrenal: { color: '#f6bf5a', opacity: 0.94 },
  prostate: { color: '#9486ff', opacity: 0.86 },
  reproductive: { color: '#9ad7cb', opacity: 0.82 },
}

const organPosition: Record<Exclude<OrganGroup, 'skin'>, [number, number, number]> = {
  brain: [0, -42, 1514],
  heart: [-12, -128, 1230],
  respiratory: [0, -94, 1340],
  lungs: [0, -110, 1268],
  liver: [54, -124, 1110],
  gallbladder: [70, -130, 1060],
  stomach: [-42, -140, 1095],
  pancreas: [20, -126, 1035],
  spleen: [-116, -124, 1040],
  kidneys: [0, -86, 1028],
  intestine: [0, -145, 915],
  largeIntestine: [8, -138, 810],
  appendix: [-48, -138, 760],
  bladder: [0, -160, 650],
  vessels: [0, -118, 1135],
  skeleton: [0, -122, 1130],
  spinalCord: [0, -150, 1180],
  diaphragm: [0, -122, 1070],
  eyes: [0, -148, 1510],
  tongue: [0, -150, 1435],
  adrenal: [0, -90, 1058],
  prostate: [0, -156, 690],
  reproductive: [0, -160, 600],
}

const labelPoints: Array<{ group: Exclude<OrganGroup, 'skin'>; label: string; position: [number, number, number] }> = [
  { group: 'brain', label: 'Brain', position: [86, -46, 1530] },
  { group: 'heart', label: 'Heart', position: [94, -126, 1228] },
  { group: 'respiratory', label: 'Trachea', position: [68, -94, 1365] },
  { group: 'lungs', label: 'Bronchi', position: [118, -110, 1275] },
  { group: 'liver', label: 'Liver', position: [165, -122, 1110] },
  { group: 'stomach', label: 'Stomach', position: [-142, -140, 1084] },
  { group: 'pancreas', label: 'Pancreas', position: [110, -126, 1030] },
  { group: 'kidneys', label: 'Kidneys', position: [134, -86, 1016] },
  { group: 'intestine', label: 'Small intestine', position: [-150, -145, 895] },
  { group: 'largeIntestine', label: 'Colon', position: [142, -138, 805] },
  { group: 'bladder', label: 'Bladder', position: [76, -160, 650] },
  { group: 'skeleton', label: 'Spine', position: [-148, -122, 1160] },
]

const medicineProfiles: Record<string, MedicineProfile> = {
  Ibuprofen: {
    color: '#ff8f70',
    route: 'oral',
    target: ['stomach', 'intestine', 'largeIntestine', 'liver', 'kidneys', 'vessels'],
    path: [[0, -180, 1460], [0, -148, 1250], [-42, -140, 1095], [0, -145, 915], [54, -124, 1110], [0, -86, 1028], [0, -160, 650]],
    copy: 'oral absorption, stomach irritation risk, liver processing, kidney clearance',
  },
  Metformin: {
    color: '#53c7ff',
    route: 'oral',
    target: ['stomach', 'intestine', 'largeIntestine', 'liver', 'pancreas', 'kidneys', 'vessels'],
    path: [[0, -180, 1460], [0, -148, 1250], [-42, -140, 1095], [0, -145, 915], [8, -138, 810], [54, -124, 1110], [20, -126, 1035], [0, -118, 1135]],
    copy: 'gut absorption, liver glucose response, kidney dosing sensitivity',
  },
  Atorvastatin: {
    color: '#b89cff',
    route: 'oral',
    target: ['stomach', 'intestine', 'liver', 'heart', 'vessels', 'kidneys'],
    path: [[0, -180, 1460], [0, -148, 1250], [-42, -140, 1095], [0, -145, 915], [54, -124, 1110], [-12, -128, 1230], [0, -118, 1135]],
    copy: 'intestinal uptake, liver enzyme work, vessel protection over time',
  },
  Albuterol: {
    color: '#5ff4cd',
    route: 'inhaled',
    target: ['respiratory', 'lungs', 'heart', 'vessels'],
    path: [[0, -180, 1500], [0, -108, 1390], [0, -94, 1340], [0, -110, 1268], [-12, -128, 1230], [0, -118, 1135]],
    copy: 'inhaled airway delivery, bronchodilation, heart-rate sensitivity',
  },
  Lisinopril: {
    color: '#7dd3fc',
    route: 'oral',
    target: ['vessels', 'heart', 'kidneys', 'brain'],
    path: [[0, -180, 1460], [0, -148, 1250], [-42, -140, 1095], [0, -118, 1135], [-12, -128, 1230], [0, -86, 1028]],
    copy: 'blood pressure pathway, vessel relaxation, kidney monitoring',
  },
  Amlodipine: {
    color: '#f59e0b',
    route: 'oral',
    target: ['vessels', 'heart', 'liver'],
    path: [[0, -180, 1460], [0, -148, 1250], [-42, -140, 1095], [0, -118, 1135], [-12, -128, 1230], [54, -124, 1110]],
    copy: 'calcium-channel effect, arterial relaxation, ankle swelling risk',
  },
  Amoxicillin: {
    color: '#34d399',
    route: 'oral',
    target: ['stomach', 'intestine', 'liver', 'kidneys', 'skin', 'vessels'],
    path: [[0, -180, 1460], [0, -148, 1250], [-42, -140, 1095], [0, -145, 915], [54, -124, 1110], [0, -86, 1028], [0, -118, 1135]],
    copy: 'gut absorption, bloodstream distribution, allergy and rash monitoring',
  },
  Omeprazole: {
    color: '#f97316',
    route: 'oral',
    target: ['stomach', 'liver', 'kidneys', 'intestine'],
    path: [[0, -180, 1460], [0, -148, 1250], [-42, -140, 1095], [54, -124, 1110], [0, -145, 915], [0, -86, 1028]],
    copy: 'acid suppression, stomach lining relief, long-term mineral monitoring',
  },
  Prednisone: {
    color: '#fb7185',
    route: 'oral',
    target: ['lungs', 'respiratory', 'vessels', 'brain', 'stomach', 'liver', 'adrenal'],
    path: [[0, -180, 1460], [0, -148, 1250], [-42, -140, 1095], [0, -118, 1135], [0, -42, 1514], [54, -124, 1110], [0, -90, 1058]],
    copy: 'systemic anti-inflammatory effect, mood, glucose, stomach and adrenal monitoring',
  },
  'Insulin glargine': {
    color: '#a7f3d0',
    route: 'injection',
    target: ['vessels', 'liver', 'pancreas', 'brain', 'kidneys'],
    path: [[-250, -155, 920], [-90, -120, 980], [0, -118, 1135], [54, -124, 1110], [20, -126, 1035], [0, -42, 1514], [0, -86, 1028]],
    copy: 'subcutaneous absorption, glucose lowering, hypoglycemia awareness',
  },
}

function normalizeOrgan(value: string): OrganGroup | null {
  const clean = value.toLowerCase()
  if (clean.includes('skin') || clean.includes('rash') || clean.includes('allergy')) return 'skin'
  if (clean.includes('brain') || clean.includes('headache') || clean.includes('mood')) return 'brain'
  if (clean.includes('heart') || clean.includes('cardiac')) return 'heart'
  if (clean.includes('airway')) return 'respiratory'
  if (clean.includes('lung') || clean.includes('asthma') || clean.includes('breath')) return 'lungs'
  if (clean.includes('liver') || clean.includes('cholesterol')) return 'liver'
  if (clean.includes('stomach') || clean.includes('reflux') || clean.includes('acid') || clean.includes('ulcer')) return 'stomach'
  if (clean.includes('pancreas') || clean.includes('diabetes') || clean.includes('glucose')) return 'pancreas'
  if (clean.includes('kidney') || clean.includes('renal')) return 'kidneys'
  if (clean.includes('intestin') || clean.includes('gut') || clean.includes('bowel')) return 'intestine'
  if (clean.includes('bladder')) return 'bladder'
  if (clean.includes('blood') || clean.includes('pressure') || clean.includes('hypertension') || clean.includes('vessel')) return 'vessels'
  if (clean.includes('adrenal')) return 'adrenal'
  return null
}

function RealAnatomyMesh({
  asset,
  targeted,
  dimmed,
  medicineColor,
  intensity,
  skinOpacity,
  isPlaying,
}: {
  asset: AnatomyAsset
  targeted: boolean
  dimmed: boolean
  medicineColor: string
  intensity: number
  skinOpacity: number
  isPlaying: boolean
}) {
  const object = useLoader(OBJLoader, asset.file)
  const groupRef = useRef<THREE.Group>(null)
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([])
  const stateRef = useRef({ targeted, dimmed, medicineColor, intensity, skinOpacity, isPlaying })

  // Update state ref without triggering re-renders
  useEffect(() => {
    stateRef.current = { targeted, dimmed, medicineColor, intensity, skinOpacity, isPlaying }
  }, [targeted, dimmed, medicineColor, intensity, skinOpacity, isPlaying])

  const prepared = useMemo(() => {
    const clone = object.clone()
    const style = groupStyle[asset.group]
    const materials: THREE.MeshStandardMaterial[] = []

    clone.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (!mesh.isMesh) return

      mesh.geometry.computeVertexNormals()
      mesh.geometry.normalizeNormals()
      mesh.castShadow = asset.group !== 'skin'
      mesh.receiveShadow = true
      mesh.frustumCulled = false

      const isSkin = asset.group === 'skin'
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(style.color),
        transparent: true,
        opacity: asset.opacity ?? style.opacity, // Use default style opacity
        emissive: new THREE.Color(style.color),
        emissiveIntensity: isSkin ? 0.02 : 0.07,
        roughness: isSkin ? 0.56 : 0.42,
        metalness: 0.02,
        side: THREE.DoubleSide,
        depthWrite: !isSkin,
      })

      mesh.material = material
      materials.push(material)
    })

    materialsRef.current = materials
    return clone
  }, [object, asset.group])

  useFrame(({ clock }) => {
    if (!groupRef.current || !materialsRef.current.length) return

    const state = stateRef.current
    const phase = clock.getElapsedTime()
    const style = groupStyle[asset.group]
    const isSkin = asset.group === 'skin'

    // Animation motions
    const respiratoryMotion = asset.group === 'lungs' || asset.group === 'respiratory' ? Math.sin(phase * 1.5) * 0.014 : 0
    const heartMotion = asset.group === 'heart' || asset.group === 'vessels' ? Math.sin(phase * 5.6) * 0.012 : 0
    const targetPulse = state.targeted && state.isPlaying ? Math.max(0, Math.sin(phase * 3.2)) * 0.018 * (1 + state.intensity) : 0

    groupRef.current.scale.setScalar(1 + respiratoryMotion + heartMotion + targetPulse)

    // Update each material
    materialsRef.current.forEach((material) => {
      // Calculate and set opacity
      let opacity: number
      if (isSkin) {
        opacity = state.skinOpacity
      } else if (state.dimmed) {
        opacity = 0.16
      } else {
        opacity = asset.opacity ?? style.opacity
      }
      material.opacity = opacity

      // Calculate and set color
      const color = state.targeted ? state.medicineColor : style.color
      material.color.setStyle(color)
      material.emissive.setStyle(color)

      // Calculate and set emissive intensity
      let emissiveIntensity: number
      if (state.targeted) {
        emissiveIntensity = 0.22 + Math.max(0, Math.sin(phase * 3.2)) * 0.28 + state.intensity * 0.14
      } else {
        emissiveIntensity = isSkin ? 0.02 : 0.07
      }
      material.emissiveIntensity = emissiveIntensity
    })
  })

  return (
    <group ref={groupRef}>
      <primitive object={prepared} />
    </group>
  )
}

function MedicineFlow({ profile, timeLabel, isPlaying, speed }: { profile?: MedicineProfile; timeLabel: string; isPlaying: boolean; speed: number }) {
  const dotRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Mesh>(null)
  const progressRef = useRef(0)
  const strength = timelineEffect[timeLabel] ?? 0.2

  useFrame((_, delta) => {
    if (!profile || !dotRef.current || !haloRef.current) return
    if (isPlaying) progressRef.current = (progressRef.current + delta * speed * (0.14 + strength * 0.08)) % 1

    const path = profile.path
    const raw = progressRef.current
    const segment = Math.min(path.length - 2, Math.floor(raw * (path.length - 1)))
    const segmentT = raw * (path.length - 1) - segment
    const start = new THREE.Vector3(...path[segment])
    const end = new THREE.Vector3(...path[segment + 1])
    const position = start.lerp(end, segmentT)
    dotRef.current.position.copy(position)
    haloRef.current.position.copy(position)
    dotRef.current.scale.setScalar(1 + Math.sin(raw * Math.PI * 18) * 0.14)
    haloRef.current.scale.setScalar(1.2 + strength * 0.8)
  })

  if (!profile) return null

  return (
    <group>
      <Line points={profile.path.map((point) => new THREE.Vector3(...point))} color={profile.color} lineWidth={4} transparent opacity={0.78} />
      <mesh ref={haloRef}>
        <sphereGeometry args={[42, 28, 28]} />
        <meshBasicMaterial color={profile.color} transparent opacity={0.14 + strength * 0.08} />
      </mesh>
      <mesh ref={dotRef}>
        <sphereGeometry args={[24, 28, 28]} />
        <meshBasicMaterial color={profile.color} transparent opacity={0.96} />
      </mesh>
    </group>
  )
}

function OrganHalo({ group, profile, timeLabel }: { group: Exclude<OrganGroup, 'skin'>; profile?: MedicineProfile; timeLabel: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const target = profile?.target.includes(group)
  const strength = timelineEffect[timeLabel] ?? 0.2

  useFrame(({ clock }) => {
    if (!meshRef.current || !target) return
    meshRef.current.scale.setScalar(0.8 + strength * 0.75 + Math.max(0, Math.sin(clock.getElapsedTime() * 2.7)) * 0.15)
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.28
  })

  if (!profile || !target) return null

  return (
    <mesh ref={meshRef} position={organPosition[group]}>
      <sphereGeometry args={[125, 32, 22]} />
      <meshBasicMaterial color={profile.color} transparent opacity={0.12 + strength * 0.07} wireframe />
    </mesh>
  )
}

function AnatomyLabels({ visibleGroups }: { visibleGroups: Set<OrganGroup> }) {
  return (
    <group>
      {labelPoints
        .filter((item) => visibleGroups.has(item.group))
        .map((item) => (
          <Html key={item.group} position={item.position} center className="anatomy-organ-label" distanceFactor={760}>
            {item.label}
          </Html>
        ))}
    </group>
  )
}

function LoadingAnatomy() {
  return (
    <Html center className="model-loading">
      Loading real anatomy meshes...
    </Html>
  )
}

function AnatomyProgress() {
  const { active, progress } = useProgress()
  const [hasCompleted, setHasCompleted] = useState(false)

  useEffect(() => {
    if (!active && progress >= 100) {
      setHasCompleted(true)
    }
  }, [active, progress])

  if (hasCompleted || !active) return null

  return (
    <div className="anatomy-loading-overlay">
      <span>Loading BodyParts3D meshes</span>
      <strong>{Math.round(progress)}%</strong>
    </div>
  )
}

function AnatomyRoot({
  profile,
  signals,
  medicine,
  timeLabel,
  isPlaying,
  speed,
  highlightedOrgans,
  focusMode,
  showLabels,
  skinOpacity,
}: OpenAnatomyStageProps & {
  isPlaying: boolean
  speed: number
  focusMode: 'overview' | 'pathway' | 'sideEffects'
  showLabels: boolean
  skinOpacity: number
}) {
  const rootRef = useRef<THREE.Group>(null)
  const medicineProfile = medicineProfiles[medicine]
  const intensity = timelineEffect[timeLabel] ?? 0.2

  const highlightedGroups = useMemo(() => {
    const groups = new Set<OrganGroup>(medicineProfile?.target ?? [])
    highlightedOrgans?.forEach((organ) => {
      const group = normalizeOrgan(organ)
      if (group) groups.add(group)
    })
    profile.diseases.forEach((disease) => {
      const group = normalizeOrgan(disease)
      if (group) groups.add(group)
    })
    profile.organConditions.forEach((organ) => {
      const group = normalizeOrgan(organ)
      if (group) groups.add(group)
    })
    return groups
  }, [highlightedOrgans, medicineProfile, profile.diseases, profile.organConditions])

  const labelGroups = useMemo(() => {
    if (focusMode === 'overview' && highlightedGroups.size === 0) return new Set<OrganGroup>(['brain', 'heart', 'respiratory', 'liver', 'stomach', 'kidneys', 'intestine'])
    return highlightedGroups
  }, [focusMode, highlightedGroups])

  useFrame(({ clock }) => {
    if (!rootRef.current) return
    const childScale = profile.age < 18 ? 0.76 : 1
    const sexScaleX = profile.gender === 'Female' ? 0.94 : profile.gender === 'Male' ? 1.04 : 1
    const bodyTypeScale = profile.bodyType === 'Athletic' ? 1.04 : profile.bodyType === 'Lean' ? 0.95 : profile.bodyType === 'Heavy' ? 1.13 : profile.bodyType === 'Soft' ? 1.07 : 1
    const fatigueLean = 1 - signals.fatigue * 0.035

    rootRef.current.scale.set(sexScaleX * bodyTypeScale * childScale, fatigueLean * childScale, bodyTypeScale * childScale)
    rootRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.4) * 0.012 + signals.fatigue * 0.01
  })

  return (
    <group ref={rootRef} position={[0, -0.03, 0]}>
      <group rotation={[-Math.PI / 2, 0, 0]} scale={ANATOMY_SCALE} position={[0, 0.02, 0]}>
        <group position={ANATOMY_OFFSET}>
          {realAnatomyAssets.map((asset) => {
            const targeted = highlightedGroups.has(asset.group)
            const dimmed = focusMode !== 'overview' && !targeted && asset.group !== 'skin' && asset.group !== 'skeleton'

            return (
              <RealAnatomyMesh
                key={`${asset.group}-${asset.name}`}
                asset={asset}
                targeted={targeted}
                dimmed={dimmed}
                medicineColor={medicineProfile?.color ?? '#38bdf8'}
                intensity={intensity}
                skinOpacity={asset.group === 'skin' ? skinOpacity : asset.opacity ?? groupStyle[asset.group].opacity}
                isPlaying={isPlaying}
              />
            )
          })}
          <MedicineFlow profile={medicineProfile} timeLabel={timeLabel} isPlaying={isPlaying} speed={speed} />
          {(
            [
              'brain',
              'heart',
              'respiratory',
              'lungs',
              'liver',
              'gallbladder',
              'stomach',
              'pancreas',
              'spleen',
              'kidneys',
              'intestine',
              'largeIntestine',
              'appendix',
              'bladder',
              'vessels',
              'skeleton',
              'spinalCord',
              'diaphragm',
              'adrenal',
            ] as const
          ).map((group) => (
            <OrganHalo key={group} group={group} profile={medicineProfile} timeLabel={timeLabel} />
          ))}
          {showLabels && <AnatomyLabels visibleGroups={labelGroups} />}
        </group>
      </group>
    </group>
  )
}

export default function OpenAnatomyStage({
  profile,
  signals,
  step,
  medicine,
  timeLabel,
  isPlaying = true,
  speed = 1,
  highlightedOrgans = [],
  focusMode = 'overview',
}: OpenAnatomyStageProps) {
  const [showLabels, setShowLabels] = useState(false)
  const [skinOpacity, setSkinOpacity] = useState(0.045)
  const med = medicineProfiles[medicine]
  const effectiveFocusMode = medicine && step === 'simulation' ? focusMode : 'overview'

  return (
    <div className="open-anatomy-stage">
      <Canvas
        camera={{ position: [0, 0.08, 4.55], fov: 36 }}
        dpr={[1, 1.55]}
        shadows
        style={{ position: 'absolute', inset: 0, height: '100%', width: '100%' }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#07111c']} />
        <fog attach="fog" args={['#0b1725', 5.4, 9.2]} />
        <ambientLight intensity={1.08} color="#dcecff" />
        <directionalLight castShadow position={[-2.4, 5.4, 4.2]} intensity={3.3} color="#fff4de" />
        <pointLight position={[2.5, 1.8, 2.8]} intensity={2.7} color="#8cf8e4" />
        <pointLight position={[-2.6, 2.5, -2.6]} intensity={2.2} color="#f8c06a" />
        <Suspense fallback={<LoadingAnatomy />}>
          <AnatomyRoot
            profile={profile}
            signals={signals}
            step={step}
            medicine={medicine}
            timeLabel={timeLabel}
            isPlaying={isPlaying}
            speed={speed}
            highlightedOrgans={highlightedOrgans}
            focusMode={effectiveFocusMode}
            showLabels={showLabels}
            skinOpacity={skinOpacity}
          />
          <ContactShadows position={[0, -1.66, 0]} opacity={0.42} scale={5.2} blur={2.8} far={3.2} />
        </Suspense>
        <OrbitControls enablePan={false} target={[0, 0.02, 0]} minDistance={2.8} maxDistance={6.8} enableDamping dampingFactor={0.06} />
      </Canvas>
      <AnatomyProgress />
    </div>
  )
}
