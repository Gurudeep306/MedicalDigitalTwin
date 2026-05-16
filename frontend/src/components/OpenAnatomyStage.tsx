'use client'

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { MeshDistortMaterial, OrbitControls, Sparkles, useProgress } from '@react-three/drei'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { Suspense, useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import AnimationControlWindow from './AnimationControlWindow'
import {
  ANATOMY_ASSETS,
  ANATOMY_OFFSET,
  ANATOMY_SCALE,
  groupStyle,
  organPosition,
  renderOrderForAsset,
  shouldRenderAsset,
  type AnatomyAsset,
  type OrganGroup,
} from '@/lib/anatomy-catalog'
import { createOrganMaterial, polishGeometry, type OrganMaterial } from '@/lib/anatomy-materials'
import { animationScenarios } from '@/lib/imported-animations'

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

const timelineEffect: Record<string, number> = {
  '1 day': 0.12,
  '1 week': 0.24,
  '1 month': 0.38,
  '6 months': 0.56,
  '1 year': 0.72,
  '5 years': 1,
  '10 years': 1.18,
}

const medicineProfiles: Record<string, MedicineProfile> = {
  Ibuprofen: {
    color: '#ff8f70',
    route: 'oral',
    target: ['esophagus', 'stomach', 'intestine', 'largeIntestine', 'liver', 'kidneys', 'vessels'],
    path: [[0, -180, 1460], [0, -148, 1305], [0, -142, 1240], [-42, -140, 1095], [0, -145, 915], [54, -124, 1110], [0, -86, 1028], [0, -160, 650]],
    copy: 'oral absorption, stomach irritation risk, liver processing, kidney clearance',
  },
  Metformin: {
    color: '#ffa366',
    route: 'oral',
    target: ['esophagus', 'stomach', 'intestine', 'largeIntestine', 'liver', 'pancreas', 'kidneys', 'vessels'],
    path: [[0, -180, 1460], [0, -148, 1305], [0, -142, 1240], [-42, -140, 1095], [0, -145, 915], [8, -138, 810], [54, -124, 1110], [20, -126, 1035], [0, -118, 1135]],
    copy: 'gut absorption, liver glucose response, kidney dosing sensitivity',
  },
  Atorvastatin: {
    color: '#b89cff',
    route: 'oral',
    target: ['esophagus', 'stomach', 'intestine', 'liver', 'heart', 'vessels', 'kidneys'],
    path: [[0, -180, 1460], [0, -148, 1305], [0, -142, 1240], [-42, -140, 1095], [0, -145, 915], [54, -124, 1110], [-12, -128, 1230], [0, -118, 1135]],
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
    color: '#ffb380',
    route: 'oral',
    target: ['vessels', 'heart', 'kidneys', 'brain'],
    path: [[0, -180, 1460], [0, -148, 1305], [0, -142, 1240], [-42, -140, 1095], [0, -118, 1135], [-12, -128, 1230], [0, -86, 1028]],
    copy: 'blood pressure pathway, vessel relaxation, kidney monitoring',
  },
  Amlodipine: {
    color: '#f59e0b',
    route: 'oral',
    target: ['vessels', 'heart', 'liver'],
    path: [[0, -180, 1460], [0, -148, 1305], [0, -142, 1240], [-42, -140, 1095], [0, -118, 1135], [-12, -128, 1230], [54, -124, 1110]],
    copy: 'calcium-channel effect, arterial relaxation, ankle swelling risk',
  },
  Amoxicillin: {
    color: '#34d399',
    route: 'oral',
    target: ['esophagus', 'stomach', 'intestine', 'liver', 'kidneys', 'skin', 'vessels'],
    path: [[0, -180, 1460], [0, -148, 1305], [0, -142, 1240], [-42, -140, 1095], [0, -145, 915], [54, -124, 1110], [0, -86, 1028], [0, -118, 1135]],
    copy: 'gut absorption, bloodstream distribution, allergy and rash monitoring',
  },
  Omeprazole: {
    color: '#f97316',
    route: 'oral',
    target: ['esophagus', 'stomach', 'liver', 'kidneys', 'intestine'],
    path: [[0, -180, 1460], [0, -148, 1305], [0, -142, 1240], [-42, -140, 1095], [54, -124, 1110], [0, -145, 915], [0, -86, 1028]],
    copy: 'acid suppression, stomach lining relief, long-term mineral monitoring',
  },
  Prednisone: {
    color: '#fb7185',
    route: 'oral',
    target: ['lungs', 'respiratory', 'vessels', 'brain', 'esophagus', 'stomach', 'liver', 'adrenal'],
    path: [[0, -180, 1460], [0, -148, 1305], [0, -142, 1240], [-42, -140, 1095], [0, -118, 1135], [0, -42, 1514], [54, -124, 1110], [0, -90, 1058]],
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

function universalMedicineProfile(medicine: string, highlightedOrgans: string[] = []): MedicineProfile | undefined {
  if (!medicine) return undefined

  const targets = Array.from(
    new Set(
      highlightedOrgans
        .map((organ) => normalizeOrgan(organ))
        .filter((organ): organ is OrganGroup => Boolean(organ) && organ !== 'skin' && organ !== 'skeleton'),
    ),
  )
  const fallbackTargets: OrganGroup[] = ['stomach', 'liver', 'kidneys', 'vessels']
  const target = targets.length ? targets.slice(0, 8) : fallbackTargets
  const seed = medicine.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const palette = ['#5eead4', '#a7f3d0', '#fbbf24', '#fb7185', '#93c5fd', '#c4b5fd']
  const path: [number, number, number][] = [
    [0, -180, 1460],
    [0, -148, 1305],
    [0, -142, 1240],
    ...target.map((group) => organPosition[group as Exclude<OrganGroup, 'skin'>]),
  ].filter(Boolean) as [number, number, number][]

  return {
    color: palette[seed % palette.length],
    route: 'oral',
    target,
    path,
    copy: `universal pathway for ${medicine}: ${target.join(', ')} monitoring`,
  }
}

function normalizeOrgan(value: string): OrganGroup | null {
  const clean = value.toLowerCase()
  if (clean.includes('skin') || clean.includes('rash') || clean.includes('allergy')) return 'skin'
  if (clean.includes('brain') || clean.includes('headache') || clean.includes('mood')) return 'brain'
  if (clean.includes('heart') || clean.includes('cardiac')) return 'heart'
  if (clean.includes('airway')) return 'respiratory'
  if (clean.includes('lung') || clean.includes('asthma') || clean.includes('breath')) return 'lungs'
  if (clean.includes('esophagus') || clean.includes('oesophagus') || clean.includes('swallow')) return 'esophagus'
  if (clean.includes('liver') || clean.includes('cholesterol')) return 'liver'
  if (clean.includes('stomach') || clean.includes('reflux') || clean.includes('acid') || clean.includes('ulcer')) return 'stomach'
  if (clean.includes('pancreas') || clean.includes('diabetes') || clean.includes('glucose')) return 'pancreas'
  if (clean.includes('kidney') || clean.includes('renal')) return 'kidneys'
  if (clean.includes('intestin') || clean.includes('gut') || clean.includes('bowel')) return 'intestine'
  if (clean.includes('colon')) return 'largeIntestine'
  if (clean.includes('appendix')) return 'appendix'
  if (clean.includes('bladder')) return 'bladder'
  if (clean.includes('gall')) return 'gallbladder'
  if (clean.includes('spleen')) return 'spleen'
  if (clean.includes('spine') || clean.includes('spinal')) return 'spinalCord'
  if (clean.includes('diaphragm')) return 'diaphragm'
  if (clean.includes('eye') || clean.includes('vision')) return 'eyes'
  if (clean.includes('tongue') || clean.includes('mouth')) return 'tongue'
  if (clean.includes('prostate')) return 'prostate'
  if (clean.includes('blood') || clean.includes('pressure') || clean.includes('hypertension') || clean.includes('vessel')) return 'vessels'
  if (clean.includes('adrenal')) return 'adrenal'
  return null
}

function bodyCategory(profile: HumanProfile) {
  if (profile.age < 13) return 'child anatomy'
  if (profile.age < 18) return 'adolescent anatomy'
  if (profile.age >= 65) return 'senior anatomy'
  if (profile.gender === 'Female') return 'adult female anatomy'
  if (profile.gender === 'Male') return 'adult male anatomy'
  return 'adult anatomy'
}

function categoryScale(profile: HumanProfile, signals: HumanSignals): [number, number, number] {
  const childScale = profile.age < 13 ? 0.66 : profile.age < 18 ? 0.8 : 1
  const sexScaleX = profile.gender === 'Female' ? 0.91 : profile.gender === 'Male' ? 1.04 : 0.98
  const bodyTypeScale = profile.bodyType === 'Athletic' ? 1.035 : profile.bodyType === 'Lean' ? 0.94 : profile.bodyType === 'Heavy' ? 1.13 : profile.bodyType === 'Soft' ? 1.07 : 1
  const seniorPosture = profile.age >= 65 ? 0.985 : 1
  const fatigueLean = 1 - signals.fatigue * 0.035

  return [sexScaleX * bodyTypeScale * childScale, fatigueLean * childScale * seniorPosture, bodyTypeScale * childScale]
}

function sideEffectRisk(group: OrganGroup, intensity: number, profile: HumanProfile, signals: HumanSignals, medicineProfile?: MedicineProfile) {
  if (!medicineProfile?.target.includes(group)) return 0

  const conditionMatch = [...profile.organConditions, ...profile.diseases].some((item) => normalizeOrgan(item) === group)
  const clearanceOrgan = group === 'liver' || group === 'kidneys' || group === 'vessels'
  const mucosalOrgan = group === 'stomach' || group === 'intestine' || group === 'largeIntestine' || group === 'esophagus' || group === 'appendix' || group === 'tongue'
  const sentinelOrgan = group === 'gallbladder' || group === 'spleen' || group === 'spinalCord' || group === 'diaphragm' || group === 'eyes' || group === 'prostate' || group === 'reproductive'
  const sensitivity = clearanceOrgan ? 0.16 : group === 'heart' || group === 'brain' ? 0.12 : 0.08
  const ageRisk = profile.age >= 65 ? 0.12 : profile.age < 13 ? 0.08 : 0
  const risk = 0.18 + intensity * 0.54 + signals.organLoad * 0.18 + signals.diseaseLoad * 0.12 + sensitivity + ageRisk + (mucosalOrgan ? 0.08 : 0) + (sentinelOrgan ? 0.04 : 0) + (conditionMatch ? 0.14 : 0)

  return Math.min(1, risk)
}

function RealAnatomyMesh({
  asset,
  targeted,
  dimmed,
  overviewMode,
  pathwayMode,
  medicineColor,
  intensity,
  sideEffectMode,
  riskLevel,
  skinOpacity,
  isPlaying,
  heartRate,
  breathingRate,
}: {
  asset: AnatomyAsset
  targeted: boolean
  dimmed: boolean
  overviewMode: boolean
  pathwayMode: boolean
  medicineColor: string
  intensity: number
  sideEffectMode: boolean
  riskLevel: number
  skinOpacity: number
  isPlaying: boolean
  heartRate: number
  breathingRate: number
}) {
  const object = useLoader(OBJLoader, asset.file)
  const groupRef = useRef<THREE.Group>(null)
  const materialsRef = useRef<OrganMaterial[]>([])
  const stateRef = useRef({
    targeted,
    dimmed,
    overviewMode,
    pathwayMode,
    medicineColor,
    intensity,
    sideEffectMode,
    riskLevel,
    skinOpacity,
    isPlaying,
    heartRate,
    breathingRate,
  })

  useEffect(() => {
    stateRef.current = {
      targeted,
      dimmed,
      overviewMode,
      pathwayMode,
      medicineColor,
      intensity,
      sideEffectMode,
      riskLevel,
      skinOpacity,
      isPlaying,
      heartRate,
      breathingRate,
    }
  }, [targeted, dimmed, overviewMode, pathwayMode, medicineColor, intensity, sideEffectMode, riskLevel, skinOpacity, isPlaying, heartRate, breathingRate])

  const prepared = useMemo(() => {
    const clone = object.clone()
    const materials: OrganMaterial[] = []

    clone.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (!mesh.isMesh) return

      polishGeometry(mesh.geometry)
      mesh.castShadow = false
      mesh.receiveShadow = false
      mesh.frustumCulled = false

      const material = createOrganMaterial(asset)
      mesh.renderOrder = renderOrderForAsset(asset)
      mesh.material = material
      materials.push(material)
    })

    materialsRef.current = materials
    return clone
  }, [object, asset])

  useFrame(({ clock }) => {
    if (!groupRef.current || !materialsRef.current.length) return

    const state = stateRef.current
    const phase = clock.getElapsedTime()
    const style = groupStyle[asset.group]
    const isSkin = asset.group === 'skin'

    const heartHz = (state.heartRate || 72) / 60
    const breathHz = (state.breathingRate || 14) / 60
    const respiratoryMotion =
      asset.group === 'lungs' || asset.group === 'respiratory' || asset.group === 'diaphragm'
        ? Math.sin(phase * breathHz * Math.PI * 2) * 0.018
        : 0
    const heartMotion =
      asset.group === 'heart' || asset.group === 'vessels'
        ? Math.sin(phase * heartHz * Math.PI * 2) * 0.014
        : 0
    const targetPulse = state.targeted && state.isPlaying ? (0.5 + Math.sin(phase * 1.9) * 0.5) * 0.01 * (1 + state.intensity) : 0
    const sideEffectSwelling = state.sideEffectMode && state.targeted ? state.riskLevel * 0.035 : 0
    const baseScale = 1 + respiratoryMotion + heartMotion + targetPulse
    const shapeSag = state.sideEffectMode && state.targeted ? state.riskLevel * 0.018 : 0

    groupRef.current.scale.set(
      baseScale + sideEffectSwelling,
      baseScale - shapeSag,
      baseScale + sideEffectSwelling * 0.72,
    )

    // Update each material
    materialsRef.current.forEach((material) => {
      // Calculate and set opacity
      let opacity: number
      if (isSkin) {
        opacity = state.skinOpacity
      } else if (state.dimmed) {
        let dim = state.sideEffectMode ? 0.14 : state.overviewMode ? 0.26 : state.pathwayMode ? 0.2 : 0.1
        if (asset.group === 'liver') {
          dim = Math.min(0.58, dim + (state.sideEffectMode ? 0.26 : state.overviewMode ? 0.22 : state.pathwayMode ? 0.2 : 0.2))
        }
        opacity = dim
      } else {
        opacity = asset.opacity ?? style.opacity
      }
      material.opacity = opacity
      material.transparent = opacity < 0.99
      material.depthWrite = opacity >= 0.9 || (isSkin && opacity >= 0.38)

      // Calculate and set color
      let color = state.targeted ? state.medicineColor : style.color
      if (state.sideEffectMode && state.targeted) {
        color = sideEffectOrganColor(state.riskLevel, state.intensity)
      } else if (state.pathwayMode && state.targeted) {
        const c = new THREE.Color(state.medicineColor)
        c.lerp(new THREE.Color('#ffffff'), 0.22)
        color = `#${c.getHexString()}`
      }
      material.color.setStyle(color)
      material.emissive.setStyle(color)

      // Calculate and set emissive intensity
      let emissiveIntensity: number
      if (state.targeted) {
        const pulse = state.isPlaying ? (0.5 + Math.sin(phase * 1.9) * 0.5) : 0.45
        const pathwayBoost = state.pathwayMode ? 0.16 : 0
        emissiveIntensity = state.sideEffectMode
          ? 0.36 + pulse * 0.18 + state.riskLevel * 0.18 + Math.max(0, 0.22 - state.intensity * 0.12)
          : 0.18 + pulse * 0.18 + state.intensity * 0.12 + pathwayBoost + (state.pathwayMode ? pulse * 0.12 : 0)
      } else {
        emissiveIntensity = state.dimmed ? 0.02 : isSkin ? 0.06 + Math.min(state.skinOpacity, 1) * 0.14 : 0.07
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

function smoothStep(t: number) {
  const x = THREE.MathUtils.clamp(t, 0, 1)
  return x * x * (3 - 2 * x)
}

function sideEffectOrganColor(riskLevel: number, timelineIntensity: number) {
  const progress = THREE.MathUtils.clamp((timelineIntensity - 0.18) / 1, 0, 1)
  const eased = smoothStep(progress)
  const color = new THREE.Color('#ffffff')

  if (eased < 0.42) {
    color.lerp(new THREE.Color('#fff7d6'), eased / 0.42)
  } else if (eased < 0.72) {
    color.set('#fff7d6').lerp(new THREE.Color('#ffb347'), (eased - 0.42) / 0.3)
  } else {
    const severity = THREE.MathUtils.clamp(riskLevel, 0, 1)
    const endColor = severity > 0.74 ? '#ff3b24' : severity > 0.52 ? '#ff7a1a' : '#ffc857'
    color.set('#ffb347').lerp(new THREE.Color(endColor), (eased - 0.72) / 0.28)
  }

  return `#${color.getHexString()}`
}

function sampleMedicinePath(path: [number, number, number][], raw: number) {
  const wrapped = ((raw % 1) + 1) % 1
  const segment = Math.min(path.length - 2, Math.floor(wrapped * (path.length - 1)))
  const segmentT = wrapped * (path.length - 1) - segment
  const easedT = smoothStep(segmentT)
  const start = new THREE.Vector3(...path[segment])
  const end = new THREE.Vector3(...path[segment + 1])
  return start.lerp(end, easedT)
}

function MedicineFlow({
  profile,
  pathwayMode,
  timeLabel,
  isPlaying,
  speed,
}: {
  profile?: MedicineProfile
  pathwayMode: boolean
  timeLabel: string
  isPlaying: boolean
  speed: number
}) {
  const markerRef = useRef<THREE.Group>(null)
  const capsuleCoreRef = useRef<THREE.Group>(null)
  const pulseRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Mesh>(null)
  const trailRefs = useRef<THREE.Mesh[]>([])
  const vesselRefs = useRef<THREE.Mesh[]>([])
  const progressRef = useRef(0)
  const strength = timelineEffect[timeLabel] ?? 0.2
  const trailCount = 8

  const catmullPoints = useMemo(() => {
    if (!profile?.path?.length) return [] as THREE.Vector3[]
    return profile.path.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
  }, [profile])

  const pathVolume = useMemo(() => {
    if (!catmullPoints.length) return null
    const box = new THREE.Box3().setFromPoints(catmullPoints)
    const extent = box.getSize(new THREE.Vector3()).length()
    box.expandByScalar(Math.max(extent * 0.05, 20))
    return {
      center: box.getCenter(new THREE.Vector3()),
      size: box.getSize(new THREE.Vector3()),
    }
  }, [catmullPoints])

  useFrame((state, delta) => {
    if (!profile || !markerRef.current) return
    if (isPlaying) {
      const wander = Math.sin(progressRef.current * Math.PI * 6) * 0.018
      progressRef.current = (progressRef.current + delta * speed * (0.11 + strength * 0.1 + wander)) % 1
    }

    const path = profile.path
    const placeOnPath = (value: number) => sampleMedicinePath(path, value)

    const raw = progressRef.current
    const wobble = Math.sin(raw * Math.PI * 14) * 0.005
    const position = placeOnPath(raw + wobble)

    const segFloat = raw * (path.length - 1)
    const segIdx = Math.min(path.length - 2, Math.floor(segFloat))
    const lookahead = THREE.MathUtils.clamp(segIdx + 2, 0, path.length - 1)
    const nextPoint = new THREE.Vector3(...path[lookahead]).lerp(position, 0.35)

    markerRef.current.position.copy(position)
    markerRef.current.lookAt(nextPoint)

    const phase = state.clock.elapsedTime
    const heartbeat = Math.sin(phase * 7.8) * 0.028
    markerRef.current.scale.setScalar(
      1 + strength * 0.14 + heartbeat + Math.sin(raw * Math.PI * 12) * 0.038,
    )
    markerRef.current.rotation.z = Math.sin(phase * 2.8) * 0.05

    if (capsuleCoreRef.current) {
      capsuleCoreRef.current.rotation.z = raw * Math.PI * 10 + phase * 0.8
      capsuleCoreRef.current.rotation.y = Math.sin(phase * 3.2 + raw * 8) * 0.12
    }
    if (pulseRef.current) {
      const pulse = 1.12 + ((raw * 4) % 1) * 1.65
      pulseRef.current.scale.set(pulse, pulse, pulse)
      const material = pulseRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.14 + 0.18 * (1 - ((raw * 4) % 1))
    }
    if (haloRef.current) {
      const hscale = 1.28 + strength * 0.38 + Math.sin(raw * Math.PI * 8) * 0.06
      haloRef.current.scale.setScalar(hscale)
      const m = haloRef.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.09 + strength * 0.06 + 0.05 * Math.sin(phase * 5)
    }

    trailRefs.current.forEach((dot, index) => {
      const age = (index + 1) / trailCount
      const stagger = Math.sin((raw + age) * Math.PI * 5) * 0.011
      dot.position.copy(placeOnPath(raw - age * 0.04 - stagger))
      const mat = dot.material as THREE.MeshBasicMaterial
      mat.color.set(profile.color)
      mat.color.lerp(new THREE.Color('#ffffff'), age * 0.42)
      mat.opacity = THREE.MathUtils.clamp(0.32 - age * 0.28 + strength * 0.1, 0.05, 0.38)
      dot.scale.setScalar(1.05 - age * 0.45 + strength * 0.12 + Math.sin(phase * 6 + age * 9) * 0.035)
    })

    const vesselN = vesselRefs.current.length
    vesselRefs.current.forEach((dot, index) => {
      if (!vesselN) return
      const offset = index / vesselN
      const spiral = (offset + raw * 0.18 + Math.sin(raw * Math.PI * 2) * 0.05) % 1
      dot.position.copy(placeOnPath(spiral))
      dot.scale.setScalar(0.38 + strength * 0.12 + Math.sin((raw + offset) * Math.PI * 9) * 0.04)
      const vm = dot.material as THREE.MeshBasicMaterial
      vm.opacity = 0.08 + strength * 0.09
    })
  })

  if (!profile) return null

  const corridorSparkleScale: [number, number, number] = pathVolume
    ? [
        Math.max(pathVolume.size.x * 0.38, 110),
        Math.max(pathVolume.size.y * 0.38, 110),
        Math.max(pathVolume.size.z * 0.38, 110),
      ]
    : [160, 160, 240]

  const vesselParticleCount = profile.target.includes('vessels') ? 5 : 4

  return (
    <group>
      {pathwayMode && pathVolume ? (
        <group position={pathVolume.center}>
          <Sparkles
            count={Math.min(240, 72 + catmullPoints.length * 26)}
            scale={corridorSparkleScale}
            color={profile.color}
            size={4.5 + strength * 5}
            speed={0.1 + strength * 0.14}
            opacity={0.18 + strength * 0.12}
            noise={[0.55, 0.68, 0.92]}
          />
        </group>
      ) : null}
      <group ref={markerRef} renderOrder={36}>
        <Sparkles
          count={20}
          scale={48}
          color={profile.color}
          size={2.2 + strength * 1.6}
          speed={0.5}
          opacity={0.38}
        />
        <mesh ref={haloRef}>
          <sphereGeometry args={[34, 18, 18]} />
          <meshBasicMaterial color={profile.color} transparent opacity={0.12} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh ref={pulseRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[20, 1.6, 12, 48]} />
          <meshBasicMaterial color="#eef8ff" transparent opacity={0.22} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <group ref={capsuleCoreRef} rotation={[0, 0, Math.PI / 2]}>
          <mesh position={[-13, 0, 0]}>
            <capsuleGeometry args={[10, 24, 8, 20]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.22} roughness={0.14} transparent opacity={0.96} depthWrite={false} depthTest={false} />
          </mesh>
          <mesh position={[13, 0, 0]}>
            <capsuleGeometry args={[10, 24, 8, 20]} />
            <MeshDistortMaterial
              color={profile.color}
              emissive={profile.color}
              emissiveIntensity={0.55 + strength * 0.28}
              roughness={0.22}
              metalness={0.08}
              clearcoat={0.45}
              clearcoatRoughness={0.22}
              distort={0.32}
              speed={2.2}
              transparent
              opacity={0.96}
              depthWrite={false}
              depthTest={false}
            />
          </mesh>
        </group>
      </group>
      {Array.from({ length: trailCount }).map((_, index) => (
        <mesh
          key={`trail-${index}`}
          ref={(node) => {
            if (node) trailRefs.current[index] = node
          }}
        >
          <sphereGeometry args={[11, 14, 14]} />
          <meshBasicMaterial color={profile.color} transparent opacity={0.28} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      {Array.from({ length: vesselParticleCount }).map((_, index) => (
        <mesh
          key={`micro-${index}`}
          ref={(node) => {
            if (node) vesselRefs.current[index] = node
          }}
        >
          <sphereGeometry args={[4, 8, 8]} />
          <meshBasicMaterial color={profile.color} transparent opacity={0.18} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  )
}

function EffectCallout({ group, profile, riskLevel }: { group: Exclude<OrganGroup, 'skin'>; profile?: MedicineProfile; riskLevel: number }) {
  const gyroRef = useRef<THREE.Group>(null)
  const ringSlow = useRef<THREE.Group>(null)
  const ringFast = useRef<THREE.Group>(null)
  const target = profile?.target.includes(group)
  const base = organPosition[group]
  const colorHex = riskLevel > 0.78 ? '#ff4428' : riskLevel > 0.56 ? '#ff9f1c' : '#ffd089'

  useFrame(({ clock }) => {
    if (!target) return
    const t = clock.elapsedTime
    if (gyroRef.current) gyroRef.current.rotation.set(t * 0.33, t * 0.21, t * 0.16)
    if (ringSlow.current) ringSlow.current.rotation.x = Math.PI / 2.15 + Math.sin(t * 0.7) * 0.06
    if (ringFast.current) ringFast.current.rotation.z = t * 0.55
  })

  if (!profile || !target) return null

  const rOuter = 34 + riskLevel * 18
  const rInner = 26 + riskLevel * 12

  return (
    <group position={base}>
      <pointLight color={colorHex} intensity={1.1 + riskLevel * 2.4} distance={340} decay={2} />
      <group ref={gyroRef}>
        <group ref={ringSlow}>
          <mesh>
            <torusGeometry args={[rOuter, 0.95, 10, 52]} />
            <meshBasicMaterial color={colorHex} transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
        <group ref={ringFast} rotation={[Math.PI / 2.4, 0.1, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[rInner, 0.65, 10, 44]} />
            <meshBasicMaterial color={colorHex} transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
        <mesh>
          <icosahedronGeometry args={[12 + riskLevel * 8, 1]} />
          <meshBasicMaterial color={colorHex} transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
    </group>
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
  skinOpacity,
  showSkeleton,
  heartRate,
  breathingRate,
}: OpenAnatomyStageProps & {
  isPlaying: boolean
  speed: number
  focusMode: 'overview' | 'pathway' | 'sideEffects'
  skinOpacity: number
  showSkeleton: boolean
  heartRate: number
  breathingRate: number
}) {
  const rootRef = useRef<THREE.Group>(null)
  const medicineProfile = medicineProfiles[medicine] ?? universalMedicineProfile(medicine, highlightedOrgans)
  const intensity = timelineEffect[timeLabel] ?? 0.2
  const sideEffectMode = focusMode === 'sideEffects'
  const overviewMode = focusMode === 'overview'
  const pathwayMode = focusMode === 'pathway'
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

  const visibleAssets = useMemo(() => {
    const counts = new Map<OrganGroup, number>()
    return ANATOMY_ASSETS.filter((item) => {
      if (!shouldRenderAsset(item, profile)) return false
      if (!showSkeleton && item.group === 'skeleton') return false
      if (skinOpacity <= 0 && item.group === 'skin') return false
      if (item.highQualityOnly && !highlightedGroups.has(item.group)) return false
      if (item.layer === 'detail' && !highlightedGroups.has(item.group) && focusMode !== 'overview') return false

      const current = counts.get(item.group) ?? 0
      const targeted = highlightedGroups.has(item.group)
      const limit = targeted
        ? item.group === 'intestine' || item.group === 'largeIntestine' || item.group === 'lungs' || item.group === 'respiratory'
          ? 6
          : 3
        : item.group === 'skin'
          ? 1
          : item.group === 'skeleton'
            ? 5
            : item.layer === 'vascular'
              ? 2
              : focusMode === 'overview'
                ? 2
                : 1

      if (current >= limit) return false
      counts.set(item.group, current + 1)
      return true
    })
  }, [focusMode, highlightedGroups, profile, showSkeleton, skinOpacity])

  const organsForSideEffectLabels = useMemo(() => {
    const order: Exclude<OrganGroup, 'skin'>[] = [
      'brain',
      'eyes',
      'tongue',
      'heart',
      'respiratory',
      'lungs',
      'esophagus',
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
      'spinalCord',
      'diaphragm',
      'adrenal',
      'prostate',
      'reproductive',
    ]
    const targets = medicineProfile?.target ?? []
    return order.filter((g) => targets.includes(g))
  }, [medicineProfile])

  useFrame(({ clock }) => {
    if (!rootRef.current) return
    const [x, y, z] = categoryScale(profile, signals)
    rootRef.current.scale.set(x, y, z)
    rootRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.32) * 0.009 + signals.fatigue * 0.008 + (profile.age >= 65 ? 0.012 : 0)
  })

  return (
    <group ref={rootRef} position={[0, -0.03, 0]}>
      <group rotation={[-Math.PI / 2, 0, 0]} scale={ANATOMY_SCALE} position={[0, 0.02, 0]}>
        <group position={ANATOMY_OFFSET}>
          {visibleAssets.map((asset) => {
            const targeted = highlightedGroups.has(asset.group)
            const dimmed = !targeted && asset.group !== 'skin' && asset.group !== 'skeleton'
            const riskLevel = sideEffectRisk(asset.group, intensity, profile, signals, medicineProfile)

            return (
              <Suspense key={`${asset.group}-${asset.name}`} fallback={null}>
                <RealAnatomyMesh
                  asset={asset}
                  targeted={targeted}
                  dimmed={dimmed}
                  overviewMode={overviewMode}
                  pathwayMode={pathwayMode}
                  medicineColor={medicineProfile?.color ?? '#ffa366'}
                  intensity={intensity}
                  sideEffectMode={sideEffectMode}
                  riskLevel={riskLevel}
                  skinOpacity={asset.group === 'skin' ? skinOpacity : asset.opacity ?? groupStyle[asset.group].opacity}
                  isPlaying={isPlaying}
                  heartRate={heartRate}
                  breathingRate={breathingRate}
                />
              </Suspense>
            )
          })}
          <MedicineFlow
            profile={medicineProfile}
            pathwayMode={pathwayMode}
            timeLabel={timeLabel}
            isPlaying={isPlaying}
            speed={speed}
          />
          {sideEffectMode
            ? organsForSideEffectLabels.map((group) => (
                <EffectCallout key={group} group={group} profile={medicineProfile} riskLevel={sideEffectRisk(group, intensity, profile, signals, medicineProfile)} />
              ))
            : null}
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
  const med = medicineProfiles[medicine] ?? universalMedicineProfile(medicine, highlightedOrgans)
  const effectiveFocusMode = medicine && step === 'simulation' ? focusMode : 'overview'
  const [showSkin, setShowSkin] = useState(true)
  const [showSkeleton, setShowSkeleton] = useState(true)
  const [animationPlaying, setAnimationPlaying] = useState(isPlaying)
  const [animationSpeed, setAnimationSpeed] = useState(speed)
  const [scenarioMode, setScenarioMode] = useState<keyof typeof animationScenarios>('restingState')
  const [showParticles, setShowParticles] = useState(true)
  const [sideEffectIntensity, setSideEffectIntensity] = useState(signals.diseaseLoad ?? 0)
  const [heartRate, setHeartRate] = useState(72)
  const [breathingRate, setBreathingRate] = useState(14)

  const skinOpacity = useMemo(() => {
    if (!showSkin) return 0
    if (effectiveFocusMode === 'sideEffects') return 0.65
    if (effectiveFocusMode === 'overview') return 0.95
    return 0.85
  }, [showSkin, effectiveFocusMode])

  const visibleStructureCount = useMemo(
    () =>
      ANATOMY_ASSETS.filter((item) => {
        if (!shouldRenderAsset(item, profile)) return false
        if (!showSkeleton && item.group === 'skeleton') return false
        if (skinOpacity <= 0 && item.group === 'skin') return false
        return true
      }).length,
    [profile, showSkeleton, skinOpacity],
  )

  useEffect(() => {
    setAnimationPlaying(isPlaying)
    setAnimationSpeed(speed)
  }, [isPlaying, speed])

  useEffect(() => {
    const scenario = animationScenarios[scenarioMode]
    setHeartRate(scenario.heart.bpm || 72)
    setBreathingRate(scenario.lungs.ratePerMin || 14)
  }, [scenarioMode])

  return (
    <div className="anatomy-stage-clean">
      <Canvas
        camera={{ position: [0, 0.08, 4.55], fov: 36 }}
        dpr={[1, 1.55]}
        style={{ position: 'absolute', inset: 0, height: '100%', width: '100%' }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#0a0a0a']} />
        <ambientLight intensity={1.35} color="#f5f5f5" />
        <directionalLight position={[-2.4, 5.4, 4.2]} intensity={3.5} color="#ffffff" />
        <pointLight position={[2.5, 1.8, 2.8]} intensity={3} color="#f8e5d2" />
        <pointLight position={[-2.6, 2.5, -2.6]} intensity={1.25} color="#f8c06a" />
        <hemisphereLight intensity={0.45} color="#fff8f0" groundColor="#1a1010" />
        <AnatomyRoot
          profile={profile}
          signals={signals}
          step={step}
          medicine={medicine}
          timeLabel={timeLabel}
          isPlaying={animationPlaying}
          speed={animationSpeed}
          highlightedOrgans={highlightedOrgans}
          focusMode={effectiveFocusMode}
          skinOpacity={skinOpacity}
          showSkeleton={showSkeleton}
          heartRate={heartRate}
          breathingRate={breathingRate}
        />
        <OrbitControls enablePan={false} target={[0, 0.02, 0]} minDistance={2.8} maxDistance={6.8} enableDamping dampingFactor={0.06} />
      </Canvas>
      <AnatomyProgress />
      <div className="anatomy-minimal-hud">
        <span>{bodyCategory(profile)}</span>
        <span>{profile.age} years</span>
        <span>{profile.bodyType}</span>
        <span>BMI {signals.bmi}</span>
        <span>{timeLabel}</span>
        <span>{visibleStructureCount} structures</span>
      </div>
      {/* Animation Control Window */}
      <AnimationControlWindow
        isPlaying={animationPlaying}
        onPlayPause={setAnimationPlaying}
        scenarioMode={scenarioMode}
        onScenarioChange={(scenario) => setScenarioMode(scenario as keyof typeof animationScenarios)}
        animationSpeed={animationSpeed}
        onSpeedChange={setAnimationSpeed}
        heartRate={heartRate}
        breathingRate={breathingRate}
        showParticles={showParticles}
        onToggleParticles={setShowParticles}
        showSkin={showSkin}
        onToggleSkin={setShowSkin}
        showSkeleton={showSkeleton}
        onToggleSkeleton={setShowSkeleton}
        currentMedicine={medicine}
        sideEffectIntensity={sideEffectIntensity}
        onSideEffectChange={setSideEffectIntensity}
      />

      {medicine && (
        <div className="anatomy-medicine-overlay">
          <span>{focusMode === 'sideEffects' ? 'Side-effect burden' : med?.route ?? 'Medicine pathway'}</span>
          <strong>{medicine}: {med?.copy ?? 'condition-based educational simulation'}</strong>
        </div>
      )}
    </div>
  )
}
