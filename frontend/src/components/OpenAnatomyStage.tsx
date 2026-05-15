'use client'

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Html, OrbitControls, useProgress } from '@react-three/drei'
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

const effectCalloutOffset: Partial<Record<Exclude<OrganGroup, 'skin'>, [number, number, number]>> = {
  brain: [235, -18, 92],
  heart: [205, -42, 34],
  respiratory: [190, -34, 86],
  lungs: [205, -58, 54],
  esophagus: [-198, -32, 78],
  liver: [205, -26, 48],
  stomach: [-215, -26, 36],
  pancreas: [190, -58, 24],
  kidneys: [196, 28, 12],
  intestine: [-205, -14, -26],
  largeIntestine: [178, 0, -32],
  bladder: [-182, 6, -36],
  vessels: [202, 6, 76],
  adrenal: [-190, 32, 20],
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
  if (clean.includes('bladder')) return 'bladder'
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
  const mucosalOrgan = group === 'stomach' || group === 'intestine' || group === 'largeIntestine' || group === 'esophagus'
  const sensitivity = clearanceOrgan ? 0.16 : group === 'heart' || group === 'brain' ? 0.12 : 0.08
  const ageRisk = profile.age >= 65 ? 0.12 : profile.age < 13 ? 0.08 : 0
  const risk = 0.18 + intensity * 0.54 + signals.organLoad * 0.18 + signals.diseaseLoad * 0.12 + sensitivity + ageRisk + (mucosalOrgan ? 0.08 : 0) + (conditionMatch ? 0.14 : 0)

  return Math.min(1, risk)
}

function RealAnatomyMesh({
  asset,
  targeted,
  dimmed,
  overviewMode,
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
      medicineColor,
      intensity,
      sideEffectMode,
      riskLevel,
      skinOpacity,
      isPlaying,
      heartRate,
      breathingRate,
    }
  }, [targeted, dimmed, overviewMode, medicineColor, intensity, sideEffectMode, riskLevel, skinOpacity, isPlaying, heartRate, breathingRate])

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
        opacity = state.sideEffectMode ? 0.14 : state.overviewMode ? 0.26 : 0.1
      } else {
        opacity = asset.opacity ?? style.opacity
      }
      material.opacity = opacity
      material.transparent = opacity < 0.99
      material.depthWrite = opacity >= 0.9 || (isSkin && opacity >= 0.38)

      // Calculate and set color
      let color = state.targeted ? state.medicineColor : style.color
      if (state.sideEffectMode && state.targeted) {
        color = state.riskLevel > 0.78 ? '#ff5533' : state.riskLevel > 0.56 ? '#ff9f1c' : '#ffe066'
      }
      material.color.setStyle(color)
      material.emissive.setStyle(color)

      // Calculate and set emissive intensity
      let emissiveIntensity: number
      if (state.targeted) {
        const pulse = state.isPlaying ? (0.5 + Math.sin(phase * 1.9) * 0.5) : 0.45
        emissiveIntensity = state.sideEffectMode
          ? 0.28 + pulse * 0.22 + state.riskLevel * 0.22
          : 0.18 + pulse * 0.18 + state.intensity * 0.12
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

function sampleMedicinePath(path: [number, number, number][], raw: number) {
  const wrapped = ((raw % 1) + 1) % 1
  const segment = Math.min(path.length - 2, Math.floor(wrapped * (path.length - 1)))
  const segmentT = wrapped * (path.length - 1) - segment
  const easedT = smoothStep(segmentT)
  const start = new THREE.Vector3(...path[segment])
  const end = new THREE.Vector3(...path[segment + 1])
  return start.lerp(end, easedT)
}

function MedicineFlow({ profile, timeLabel, isPlaying, speed }: { profile?: MedicineProfile; timeLabel: string; isPlaying: boolean; speed: number }) {
  const markerRef = useRef<THREE.Group>(null)
  const capsuleCoreRef = useRef<THREE.Group>(null)
  const pulseRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Mesh>(null)
  const trailRefs = useRef<THREE.Mesh[]>([])
  const routeRefs = useRef<THREE.Mesh[]>([])
  const vesselRefs = useRef<THREE.Mesh[]>([])
  const waypointRefs = useRef<THREE.Mesh[]>([])
  const progressRef = useRef(0)
  const strength = timelineEffect[timeLabel] ?? 0.2
  const trailCount = 26
  const routeCount = 40

  useFrame((state, delta) => {
    if (!profile || !markerRef.current) return
    if (isPlaying) {
      const wander = Math.sin(progressRef.current * Math.PI * 6) * 0.022
      progressRef.current = (progressRef.current + delta * speed * (0.11 + strength * 0.1 + wander)) % 1
    }

    const path = profile.path
    const placeOnPath = (value: number) => sampleMedicinePath(path, value)

    const raw = progressRef.current
    /** Slight rhythmic pausefeel: bias motion toward segment midpoints */
    const wobble = Math.sin(raw * Math.PI * 14) * 0.006
    const position = placeOnPath(raw + wobble)

    const segFloat = raw * (path.length - 1)
    const segIdx = Math.min(path.length - 2, Math.floor(segFloat))
    const lookahead = THREE.MathUtils.clamp(segIdx + 2, 0, path.length - 1)
    const nextPoint = new THREE.Vector3(...path[lookahead]).lerp(position, 0.35)

    markerRef.current.position.copy(position)
    markerRef.current.lookAt(nextPoint)

    const phase = state.clock.elapsedTime
    const heartbeat = Math.sin(phase * 7.8) * 0.035
    markerRef.current.scale.setScalar(
      1 + strength * 0.16 + heartbeat + Math.sin(raw * Math.PI * 12) * 0.048,
    )
    markerRef.current.rotation.z = Math.sin(phase * 2.8) * 0.06

    if (capsuleCoreRef.current) {
      capsuleCoreRef.current.rotation.z = raw * Math.PI * 10 + phase * 0.8
      capsuleCoreRef.current.rotation.y = Math.sin(phase * 3.2 + raw * 8) * 0.14
    }
    if (pulseRef.current) {
      const pulse = 1.15 + ((raw * 4) % 1) * 1.85
      pulseRef.current.scale.set(pulse, pulse, pulse)
      const material = pulseRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.18 + 0.22 * (1 - ((raw * 4) % 1))
    }
    if (haloRef.current) {
      const hscale = 1.35 + strength * 0.45 + Math.sin(raw * Math.PI * 8) * 0.08
      haloRef.current.scale.setScalar(hscale)
      const m = haloRef.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.12 + strength * 0.08 + 0.06 * Math.sin(phase * 5)
    }

    trailRefs.current.forEach((dot, index) => {
      const age = (index + 1) / trailCount
      const stagger = Math.sin((raw + age) * Math.PI * 6) * 0.014
      dot.position.copy(placeOnPath(raw - age * 0.052 - stagger))
      const mat = dot.material as THREE.MeshBasicMaterial
      mat.color.set(profile.color)
      mat.color.lerp(new THREE.Color('#ffffff'), age * 0.55)
      mat.opacity = 0.45 - age * 0.38 + strength * 0.12
      dot.scale.setScalar(0.88 - age * 0.55 + strength * 0.16 + Math.sin(phase * 8 + age * 10) * 0.045)
    })

    routeRefs.current.forEach((dot, index) => {
      const offset = index / routeCount
      dot.position.copy(placeOnPath(offset))
      const cyclic = Math.min(Math.abs(raw - offset), Math.abs(raw - offset + 1), Math.abs(raw - offset - 1))
      const swell = THREE.MathUtils.smootherstep(1 - cyclic * 8, 0, 1) * (0.28 + strength * 0.22)
      dot.scale.setScalar(0.45 + swell + Math.sin((raw + offset) * Math.PI * 2) * 0.09)
      const rm = dot.material as THREE.MeshBasicMaterial
      rm.opacity = 0.18 + swell * 0.55 + 0.06 * strength
    })

    vesselRefs.current.forEach((dot, index) => {
      const n = Math.max(1, vesselRefs.current.length)
      const offset = index / n
      const spiral = (index / n + raw * 0.22 + Math.sin(raw * Math.PI * 2) * 0.06) % 1
      dot.position.copy(placeOnPath(spiral))
      dot.scale.setScalar(0.42 + strength * 0.16 + Math.sin((raw + offset) * Math.PI * 10) * 0.05)
      const vm = dot.material as THREE.MeshBasicMaterial
      vm.opacity = 0.2 + strength * 0.12
    })

    const wpN = waypointRefs.current.length
    waypointRefs.current.forEach((sphere, idx) => {
      if (!sphere || !wpN) return
      const pathIdx = Math.round((idx / Math.max(1, wpN - 1)) * (path.length - 1))
      const [qx, qy, qz] = path[pathIdx]
      sphere.position.set(qx, qy, qz)
      const norm = pathIdx / Math.max(1, path.length - 1)
      let dist = Math.abs(raw - norm)
      dist = Math.min(dist, Math.abs(dist - 1))
      const near = dist < 0.072
      const sc = near ? 1.35 + strength * 0.4 : 0.92 + strength * 0.2
      sphere.scale.setScalar(sc + Math.sin(phase * 4 + idx) * 0.06)
      const wm = sphere.material as THREE.MeshBasicMaterial
      wm.opacity = near ? 0.55 + strength * 0.15 : 0.18 + strength * 0.08
    })
  })

  if (!profile) return null

  const path = profile.path
  const waypointCount = Math.min(8, path.length)

  return (
    <group>
      {Array.from({ length: routeCount }).map((_, index) => (
        <mesh
          key={`route-${index}`}
          position={sampleMedicinePath(path, index / routeCount)}
          ref={(node) => {
            if (node) routeRefs.current[index] = node
          }}
        >
          <sphereGeometry args={[3.2, 10, 10]} />
          <meshBasicMaterial color={profile.color} transparent opacity={0.26} depthWrite={false} depthTest={false} />
        </mesh>
      ))}
      {Array.from({ length: waypointCount }).map((_, index) => {
        const pathIdx = Math.round((index / Math.max(1, waypointCount - 1)) * (path.length - 1))
        const [wx, wy, wz] = path[pathIdx]
        return (
        <mesh
          key={`wp-${index}`}
          position={[wx, wy, wz]}
          ref={(node) => {
            if (node) waypointRefs.current[index] = node
          }}
        >
          <sphereGeometry args={[5.5, 12, 12]} />
          <meshBasicMaterial color={profile.color} transparent opacity={0.22} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
        </mesh>
        )
      })}
      <group ref={markerRef} renderOrder={35}>
        <mesh ref={haloRef}>
          <sphereGeometry args={[32, 20, 20]} />
          <meshBasicMaterial color={profile.color} transparent opacity={0.14} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh ref={pulseRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[22, 2, 12, 48]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.28} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <group ref={capsuleCoreRef} rotation={[0, 0, Math.PI / 2]}>
          <mesh position={[-13, 0, 0]}>
            <capsuleGeometry args={[10, 24, 8, 20]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.28} roughness={0.12} transparent opacity={0.97} depthWrite={false} depthTest={false} />
          </mesh>
          <mesh position={[13, 0, 0]}>
            <capsuleGeometry args={[10, 24, 8, 20]} />
            <meshStandardMaterial color={profile.color} emissive={profile.color} emissiveIntensity={0.72 + strength * 0.2} roughness={0.16} transparent opacity={0.94} depthWrite={false} depthTest={false} />
          </mesh>
        </group>
        <Html center className="medicine-capsule-icon" distanceFactor={6} zIndexRange={[45, 0]}>
          <img src="/effects/healthicons/pill-1.svg" alt="" className="medicine-capsule-icon-img" />
        </Html>
      </group>
      {Array.from({ length: trailCount }).map((_, index) => (
        <mesh
          key={index}
          ref={(node) => {
            if (node) trailRefs.current[index] = node
          }}
        >
          <sphereGeometry args={[7, 12, 12]} />
          <meshBasicMaterial color={profile.color} transparent opacity={0.4} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      {profile.target.includes('vessels')
        ? Array.from({ length: 12 }).map((_, index) => (
            <mesh
              key={`micro-${index}`}
              ref={(node) => {
                if (node) vesselRefs.current[index] = node
              }}
            >
              <sphereGeometry args={[5, 10, 10]} />
              <meshBasicMaterial color={profile.color} transparent opacity={0.32} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
            </mesh>
          ))
        : Array.from({ length: 6 }).map((_, index) => (
            <mesh
              key={`micro-${index}`}
              ref={(node) => {
                if (node) vesselRefs.current[index] = node
              }}
            >
              <sphereGeometry args={[4, 8, 8]} />
              <meshBasicMaterial color={profile.color} transparent opacity={0.26} depthWrite={false} depthTest={false} />
            </mesh>
          ))}
    </group>
  )
}

function sideEffectCopy(group: OrganGroup, medicine?: MedicineProfile) {
  const route = medicine?.route === 'inhaled' ? 'Airway contact' : medicine?.route === 'injection' ? 'Blood route' : 'Exposure'
  const copy: Partial<Record<OrganGroup, string>> = {
    brain: 'CNS effects',
    heart: 'Cardiac load',
    respiratory: 'Airway irritation',
    lungs: 'Breathing change',
    esophagus: 'Swallow irritation',
    liver: 'Metabolism',
    stomach: 'Gut lining',
    pancreas: 'Glucose shifts',
    kidneys: 'Clearance strain',
    intestine: 'Gut motility',
    largeIntestine: 'Colon / flora',
    bladder: 'Urine clearance',
    vessels: 'BP / vessels',
    skin: 'Rash allergy',
    adrenal: 'Stress axis',
  }

  return copy[group] ?? route
}

function sideEffectIcon(group: OrganGroup, riskLevel = 0) {
  if (riskLevel > 0.88) return '/effects/healthicons/burn.svg'
  const icons: Partial<Record<OrganGroup, string>> = {
    brain: '/effects/healthicons/neurology.svg',
    heart: '/effects/healthicons/heart-organ.svg',
    respiratory: '/effects/healthicons/lungs.svg',
    lungs: '/effects/healthicons/lungs.svg',
    esophagus: '/effects/healthicons/stomach.svg',
    liver: '/effects/healthicons/liver.svg',
    stomach: '/effects/healthicons/stomach.svg',
    pancreas: '/effects/healthicons/pancreas.svg',
    kidneys: '/effects/healthicons/kidneys.svg',
    intestine: '/effects/healthicons/intestine.svg',
    largeIntestine: '/effects/healthicons/colon.svg',
    bladder: '/effects/healthicons/bladder.svg',
    vessels: '/effects/healthicons/blood-vessel.svg',
    skin: '/effects/healthicons/allergies.svg',
    adrenal: '/effects/healthicons/nerve.svg',
  }

  return icons[group] ?? '/effects/healthicons/medicines.svg'
}

function sideEffectHint(group: OrganGroup, riskLevel: number): string {
  const detail: Partial<Record<OrganGroup, string>> = {
    brain: riskLevel > 0.56 ? 'Dizziness or mood swings' : 'Watch dose & glucose.',
    heart: riskLevel > 0.56 ? 'HR / BP swings' : 'Monitor pulse & fluids.',
    respiratory: riskLevel > 0.56 ? 'Bronchospasm risk' : 'Mild airway irritation.',
    lungs: riskLevel > 0.56 ? 'Wheeze / short breath' : 'Breathing discomfort.',
    esophagus: 'Throat irritation (tablets)',
    liver: riskLevel > 0.56 ? 'Enzymes / toxin load' : 'Metabolism watchpoint.',
    stomach: riskLevel > 0.56 ? 'Nausea or bleeding alert' : 'Nausea or burning.',
    pancreas: 'Glucose can shift',
    kidneys: riskLevel > 0.56 ? 'Clearance impaired' : 'Hydration & labs.',
    intestine: riskLevel > 0.56 ? 'Diarrhea / absorption' : 'Gut distress.',
    largeIntestine: 'Bowel habit change',
    bladder: riskLevel > 0.56 ? 'Output dropping' : 'Urine signals.',
    vessels: riskLevel > 0.56 ? 'BP spikes / clot risk' : 'Pressure & swelling.',
    adrenal: riskLevel > 0.56 ? 'Axis suppression' : 'Hormone watch.',
  }

  return detail[group] ?? 'Monitor exposure if symptoms worsen.'
}

function severityMeta(riskLevel: number): { slug: string; label: string } {
  if (riskLevel > 0.78) return { slug: 'severity-high', label: 'High' }
  if (riskLevel > 0.56) return { slug: 'severity-mod', label: 'Mod' }
  return { slug: 'severity-watch', label: 'Watch' }
}

function EffectCallout({ group, profile, riskLevel }: { group: Exclude<OrganGroup, 'skin'>; profile?: MedicineProfile; riskLevel: number }) {
  const arrowRef = useRef<THREE.Group>(null)
  const impactRef = useRef<THREE.Mesh>(null)
  const tracerRef = useRef<THREE.Mesh>(null)
  const target = profile?.target.includes(group)
  const base = organPosition[group]
  const side = base[0] >= 0 ? 1 : -1
  const end = useMemo<[number, number, number]>(() => {
    const offset = effectCalloutOffset[group] ?? [side * 230, -24, 70]
    return [base[0] + offset[0], base[1] + offset[1], base[2] + offset[2]]
  }, [base, group, side])
  const color = riskLevel > 0.78 ? '#ff3d2e' : riskLevel > 0.56 ? '#ff9f1c' : '#f8a866'
  const baseVector = useMemo(() => new THREE.Vector3(...base), [base])
  const endVector = useMemo(() => new THREE.Vector3(...end), [end])
  const tier = useMemo(() => severityMeta(riskLevel), [riskLevel])

  useFrame(({ clock }) => {
    if (!arrowRef.current || !target) return
    const phase = clock.getElapsedTime()
    arrowRef.current.position.y = Math.sin(phase * 1.15) * 3
    if (impactRef.current) {
      impactRef.current.scale.setScalar(1 + Math.sin(phase * 2.2) * 0.08 + riskLevel * 0.22)
    }
    if (tracerRef.current) {
      const t = (phase * 0.42 + riskLevel * 0.27) % 1
      tracerRef.current.position.copy(endVector.clone().lerp(baseVector, t))
      tracerRef.current.scale.setScalar(0.8 + Math.sin(phase * 7) * 0.12)
    }
  })

  if (!profile || !target) return null

  return (
    <group ref={arrowRef}>
      {Array.from({ length: 10 }).map((_, index) => (
        <mesh key={`arrow-dot-${index}`} position={new THREE.Vector3().lerpVectors(endVector, baseVector, index / 9)}>
          <sphereGeometry args={[3.5, 10, 10]} />
          <meshBasicMaterial color={color} transparent opacity={0.22 + index * 0.05} depthWrite={false} depthTest={false} />
        </mesh>
      ))}
      <mesh ref={tracerRef}>
        <sphereGeometry args={[8, 14, 14]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.78} depthWrite={false} depthTest={false} />
      </mesh>
      <mesh ref={impactRef} position={base}>
        <octahedronGeometry args={[18 + riskLevel * 14, 0]} />
        <meshBasicMaterial color={color} transparent opacity={0.42} depthWrite={false} depthTest={false} />
      </mesh>
      <mesh position={base} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[10, 28, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.88} depthWrite={false} depthTest={false} />
      </mesh>
      <Html position={end} center distanceFactor={5.2} zIndexRange={[50, 0]} className="anatomy-effect-html-wrap">
        <div className={`anatomy-effect-chip ${riskLevel > 0.78 ? 'anatomy-effect-chip-high' : riskLevel > 0.56 ? 'anatomy-effect-chip-med' : 'anatomy-effect-chip-low'}`}>
          <img src={sideEffectIcon(group, riskLevel)} alt="" className="anatomy-effect-chip-icon" />
          <div className="anatomy-effect-chip-main">
            <div className="anatomy-effect-chip-top">
              <span className="anatomy-effect-chip-organ">{group.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span className={`anatomy-effect-chip-sev ${tier.slug}`}>{tier.label}</span>
              <span className="anatomy-effect-chip-pct">{Math.round(riskLevel * 100)}%</span>
            </div>
            <div className="anatomy-effect-chip-route">{sideEffectCopy(group, profile)}</div>
            <div className="anatomy-effect-chip-hint">{sideEffectHint(group, riskLevel)}</div>
            <div className="anatomy-effect-chip-meter" aria-hidden>
              <i style={{ width: `${Math.round(riskLevel * 100)}%`, backgroundColor: color }} />
            </div>
          </div>
        </div>
      </Html>
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
  const medicineProfile = medicineProfiles[medicine]
  const intensity = timelineEffect[timeLabel] ?? 0.2
  const sideEffectMode = focusMode === 'sideEffects'
  const overviewMode = focusMode === 'overview'
  const visibleAssets = useMemo(
    () =>
      ANATOMY_ASSETS.filter((item) => {
        if (!shouldRenderAsset(item, profile)) return false
        if (!showSkeleton && item.group === 'skeleton') return false
        if (skinOpacity <= 0 && item.group === 'skin') return false
        return true
      }),
    [profile, showSkeleton, skinOpacity],
  )

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

  const organsForSideEffectLabels = useMemo(() => {
    const order: Exclude<OrganGroup, 'skin'>[] = [
      'brain',
      'heart',
      'respiratory',
      'lungs',
      'esophagus',
      'liver',
      'stomach',
      'pancreas',
      'kidneys',
      'intestine',
      'largeIntestine',
      'bladder',
      'vessels',
      'adrenal',
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
              <RealAnatomyMesh
                key={`${asset.group}-${asset.name}`}
                asset={asset}
                targeted={targeted}
                dimmed={dimmed}
                overviewMode={overviewMode}
                medicineColor={medicineProfile?.color ?? '#ffa366'}
                intensity={intensity}
                sideEffectMode={sideEffectMode}
                riskLevel={riskLevel}
                skinOpacity={asset.group === 'skin' ? skinOpacity : asset.opacity ?? groupStyle[asset.group].opacity}
                isPlaying={isPlaying}
                heartRate={heartRate}
                breathingRate={breathingRate}
              />
            )
          })}
          <MedicineFlow profile={medicineProfile} timeLabel={timeLabel} isPlaying={isPlaying} speed={speed} />
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
  const med = medicineProfiles[medicine]
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
    if (effectiveFocusMode === 'sideEffects') return 0.44
    if (effectiveFocusMode === 'overview') return 0.78
    return 0.64
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
        <Suspense fallback={<LoadingAnatomy />}>
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
        </Suspense>
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
