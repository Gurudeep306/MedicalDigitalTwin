/**
 * Imported Animation Patterns
 * Based on: simonreisinger/Interactive-3D-Human-Heart-Visualization
 *           MKLab-ITI/MyoWebToolkit
 *           Z-Anatomy/Models-of-human-anatomy
 * 
 * All patterns extracted from open-source medical visualization projects
 */

/**
 * CARDIAC CYCLE ANIMATION
 * Source: Interactive-3D-Human-Heart-Visualization
 * Default: 72 BPM (0.86s per cycle)
 */
export const cardiacCyclePatterns = {
  // Standard resting heart rate (72 BPM)
  normal: {
    systole: { duration: 0.3, scale: 0.94, rotation: 0.02 }, // Contraction
    diastole: { duration: 0.56, scale: 1.0, rotation: 0 }, // Relaxation
    totalCycle: 0.86,
    bpm: 72,
  },
  // Elevated heart rate (90 BPM)
  elevated: {
    systole: { duration: 0.24, scale: 0.93, rotation: 0.025 },
    diastole: { duration: 0.43, scale: 1.0, rotation: 0 },
    totalCycle: 0.67,
    bpm: 90,
  },
  // Stressed state (110 BPM)
  stressed: {
    systole: { duration: 0.2, scale: 0.92, rotation: 0.03 },
    diastole: { duration: 0.35, scale: 1.0, rotation: 0 },
    totalCycle: 0.545,
    bpm: 110,
  },
  // Calm/resting (60 BPM)
  calm: {
    systole: { duration: 0.35, scale: 0.95, rotation: 0.015 },
    diastole: { duration: 0.65, scale: 1.0, rotation: 0 },
    totalCycle: 1.0,
    bpm: 60,
  },
}

/**
 * RESPIRATORY ANIMATION
 * Source: Interactive-3D-Human-Heart-Visualization
 * Standard: 14-16 cycles per minute
 */
export const respiratoryPatterns = {
  // Normal breathing (14 cycles/min)
  normal: {
    inhale: { duration: 2.4, scaleX: 1.15, scaleY: 1.2, scaleZ: 1.15 },
    exhale: { duration: 1.8, scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0 },
    totalCycle: 4.2,
    ratePerMin: 14,
  },
  // Deep breathing (12 cycles/min)
  deep: {
    inhale: { duration: 3.0, scaleX: 1.25, scaleY: 1.3, scaleZ: 1.25 },
    exhale: { duration: 2.0, scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0 },
    totalCycle: 5.0,
    ratePerMin: 12,
  },
  // Rapid breathing (20 cycles/min)
  rapid: {
    inhale: { duration: 1.5, scaleX: 1.1, scaleY: 1.12, scaleZ: 1.1 },
    exhale: { duration: 1.5, scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0 },
    totalCycle: 3.0,
    ratePerMin: 20,
  },
}

/**
 * DIGESTIVE SYSTEM ANIMATION
 * Source: MyoWebToolkit
 * Pattern: Peristalsis wave through stomach & intestines
 */
export const digestivePatterns = {
  normal: {
    stomachChurn: { duration: 1.4, rotation: 0.15, amplitude: 2 },
    peristalsis: { duration: 2.0, wave: 8, speed: 1 },
    totalCycle: 5.4,
  },
  active: {
    stomachChurn: { duration: 1.0, rotation: 0.2, amplitude: 3 },
    peristalsis: { duration: 1.5, wave: 8, speed: 1.3 },
    totalCycle: 4.0,
  },
  postMeal: {
    stomachChurn: { duration: 2.0, rotation: 0.25, amplitude: 4 },
    peristalsis: { duration: 3.0, wave: 8, speed: 1.5 },
    totalCycle: 8.0,
  },
}

/**
 * VASCULAR FLOW ANIMATION
 * Source: MyoWebToolkit
 * Pattern: Blood vessel pulsing synchronized with heartbeat
 */
export const vascularPatterns = {
  normal: {
    systolic: { duration: 0.3, scaleX: 1.12, scaleZ: 1.12 },
    diastolic: { duration: 0.56, scaleX: 1.0, scaleZ: 1.0 },
    opacity: { min: 0.85, max: 0.96 },
    totalCycle: 0.86,
  },
  elevated: {
    systolic: { duration: 0.24, scaleX: 1.15, scaleZ: 1.15 },
    diastolic: { duration: 0.43, scaleX: 1.0, scaleZ: 1.0 },
    opacity: { min: 0.8, max: 1.0 },
    totalCycle: 0.67,
  },
}

/**
 * KIDNEY FILTRATION ANIMATION
 * Pattern: Glomerular filtration pulse
 */
export const kidneyPatterns = {
  filtering: {
    glomerularPulse: { duration: 1.8, scaleX: 1.08, opacity: 0.96 },
    tubularFlow: { duration: 1.2, position: 2 },
    totalCycle: 3.0,
  },
  active: {
    glomerularPulse: { duration: 1.0, scaleX: 1.12, opacity: 1.0 },
    tubularFlow: { duration: 0.8, position: 3 },
    totalCycle: 1.8,
  },
}

/**
 * BRAIN ACTIVITY ANIMATION
 * Pattern: Neural pulsing with glow effect
 */
export const brainPatterns = {
  idle: {
    pulse: { duration: 1.8, emissiveIntensity: 0.16, opacity: 0.8 },
    rotation: { duration: 8, angle: Math.PI * 2 },
  },
  active: {
    pulse: { duration: 0.8, emissiveIntensity: 0.28, opacity: 0.96 },
    rotation: { duration: 4, angle: Math.PI * 2 },
  },
  processing: {
    pulse: { duration: 0.5, emissiveIntensity: 0.4, opacity: 1.0 },
    rotation: { duration: 2, angle: Math.PI * 2 },
  },
}

/**
 * PANCREAS INSULIN SECRETION ANIMATION
 * Pattern: Rhythmic secretion pulses
 */
export const pancreasPatterns = {
  resting: {
    secretion: { duration: 2.0, scaleY: 0.92, opacity: 0.85 },
    glow: { duration: 2.0, emissiveIntensity: 0.08 },
  },
  active: {
    secretion: { duration: 1.2, scaleY: 0.88, opacity: 0.95 },
    glow: { duration: 1.2, emissiveIntensity: 0.18 },
  },
  stressed: {
    secretion: { duration: 0.8, scaleY: 0.85, opacity: 1.0 },
    glow: { duration: 0.8, emissiveIntensity: 0.28 },
  },
}

/**
 * CAPSULE / MEDICINE ANIMATION
 * Pattern: Pills and capsules traveling through body
 */
export const medicineCapsulePatterns = {
  traveling: {
    rotation: { x: 0, y: Math.PI * 8, z: 0, duration: 6 },
    scale: { min: 0.98, max: 1.18 },
    pulse: { duration: 0.4, intensity: 0.3 },
    trail: { count: 18, opacity: 0.34, fade: 0.018 },
  },
  releasing: {
    rotation: { x: Math.PI * 2, y: Math.PI * 4, z: Math.PI, duration: 3 },
    scale: { min: 0.85, max: 1.25 },
    pulse: { duration: 0.2, intensity: 0.8 },
    glow: { emissive: 1.0, opacity: 0.8 },
  },
  dissolving: {
    scale: { min: 1.0, max: 0.1, duration: 2 },
    opacity: { max: 1.0, min: 0.0 },
    rotation: { x: Math.PI * 16, y: Math.PI * 12, duration: 2 },
  },
}

/**
 * SIDE EFFECTS VISUALIZATION
 * Pattern: Organ damage/inflammation indicators
 */
export const sideEffectPatterns = {
  mild: {
    swelling: 0.08,
    color: '#ffe066', // Yellow
    opacity: 0.85,
    emissiveIntensity: 0.12,
    pulseFrequency: 0.3,
  },
  moderate: {
    swelling: 0.15,
    color: '#ff9f1c', // Orange
    opacity: 0.92,
    emissiveIntensity: 0.22,
    pulseFrequency: 0.5,
  },
  severe: {
    swelling: 0.25,
    color: '#ff3d2e', // Red
    opacity: 1.0,
    emissiveIntensity: 0.35,
    pulseFrequency: 0.8,
    warning: true,
  },
}

/**
 * PARTICLE SYSTEM ANIMATIONS
 * For blood flow, neural signals, etc.
 */
export const particlePatterns = {
  bloodFlow: {
    speed: 1.5,
    quantity: 50,
    size: 0.5,
    color: '#ff4444',
    opacity: 0.6,
    direction: 'forward',
  },
  neuralSignals: {
    speed: 2.5,
    quantity: 30,
    size: 0.3,
    color: '#00ff88',
    opacity: 0.8,
    direction: 'branching',
  },
  hormoneRelease: {
    speed: 1.0,
    quantity: 20,
    size: 0.4,
    color: '#ffaa00',
    opacity: 0.7,
    direction: 'dispersing',
  },
  lymphFlow: {
    speed: 0.8,
    quantity: 15,
    size: 0.35,
    color: '#cccccc',
    opacity: 0.5,
    direction: 'forward',
  },
}

/**
 * POST-PROCESSING EFFECTS
 * Bloom, color adjustments, etc.
 */
export const effectPatterns = {
  cardiacBloom: {
    strength: 1.5,
    radius: 0.9,
    threshold: 0.1,
    emissiveColor: '#ff6666',
  },
  healthyGlow: {
    strength: 1.0,
    radius: 0.7,
    threshold: 0.2,
    emissiveColor: '#88ff88',
  },
  inflamed: {
    strength: 2.0,
    radius: 1.2,
    threshold: 0.05,
    emissiveColor: '#ff3333',
  },
  stressed: {
    strength: 1.3,
    radius: 0.8,
    threshold: 0.15,
    emissiveColor: '#ffff00',
  },
}

/**
 * COMBINED ANIMATION SCENARIOS
 * Predefined animation combinations for common states
 */
export const animationScenarios = {
  restingState: {
    heart: cardiacCyclePatterns.calm,
    lungs: respiratoryPatterns.normal,
    vessels: vascularPatterns.normal,
    digestion: digestivePatterns.normal,
    kidneys: kidneyPatterns.filtering,
    brain: brainPatterns.idle,
    pancreas: pancreasPatterns.resting,
  },
  activeState: {
    heart: cardiacCyclePatterns.elevated,
    lungs: respiratoryPatterns.rapid,
    vessels: vascularPatterns.elevated,
    digestion: digestivePatterns.active,
    kidneys: kidneyPatterns.active,
    brain: brainPatterns.active,
    pancreas: pancreasPatterns.active,
  },
  stressedState: {
    heart: cardiacCyclePatterns.stressed,
    lungs: respiratoryPatterns.rapid,
    vessels: vascularPatterns.elevated,
    digestion: digestivePatterns.normal, // Digestion slows under stress
    kidneys: kidneyPatterns.active,
    brain: brainPatterns.processing,
    pancreas: pancreasPatterns.stressed,
  },
  postMealState: {
    heart: cardiacCyclePatterns.normal,
    lungs: respiratoryPatterns.normal,
    vessels: vascularPatterns.normal,
    digestion: digestivePatterns.postMeal,
    kidneys: kidneyPatterns.filtering,
    brain: brainPatterns.idle,
    pancreas: pancreasPatterns.active,
  },
}

/**
 * ANIMATION SPEED MULTIPLIERS
 * For age-based and state-based adjustments
 */
export const speedMultipliers = {
  ageGroups: {
    child: 0.8,
    adolescent: 0.9,
    adult: 1.0,
    senior: 1.3,
  },
  healthStates: {
    excellent: 1.0,
    good: 1.0,
    fair: 1.1,
    poor: 1.3,
  },
  activities: {
    resting: 0.8,
    normal: 1.0,
    exercising: 1.5,
    sleeping: 0.6,
  },
}

/**
 * EASING FUNCTIONS (extracted from GSAP patterns)
 * For smooth animation transitions
 */
export const easingFunctions = {
  heartbeat: 'power1.inOut',
  breathing: 'sine.inOut',
  muscleMotion: 'back.out',
  organic: 'sine.inOut',
  sharp: 'power2.inOut',
}

/**
 * Helper function to get combined animation config
 */
export function getAnimationConfig(
  scenario: keyof typeof animationScenarios,
  ageGroup: keyof typeof speedMultipliers.ageGroups,
) {
  const scenarioConfig = animationScenarios[scenario]
  const speedMult = speedMultipliers.ageGroups[ageGroup]

  return {
    config: scenarioConfig,
    speedMultiplier: speedMult,
  }
}

export default {
  cardiacCyclePatterns,
  respiratoryPatterns,
  digestivePatterns,
  vascularPatterns,
  kidneyPatterns,
  brainPatterns,
  pancreasPatterns,
  medicineCapsulePatterns,
  sideEffectPatterns,
  particlePatterns,
  effectPatterns,
  animationScenarios,
  speedMultipliers,
  easingFunctions,
  getAnimationConfig,
}
