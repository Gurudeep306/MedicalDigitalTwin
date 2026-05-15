/**
 * Animation Control Window
 * Professional UI for animation controls and visualization
 */

import React, { useState, useCallback } from 'react'
import styles from './AnimationControlWindow.module.css'

interface AnimationControlProps {
  isPlaying: boolean
  onPlayPause: (playing: boolean) => void
  scenarioMode: string
  onScenarioChange: (scenario: string) => void
  animationSpeed: number
  onSpeedChange: (speed: number) => void
  heartRate: number
  breathingRate: number
  showParticles: boolean
  onToggleParticles: (show: boolean) => void
  showSkin: boolean
  onToggleSkin: (show: boolean) => void
  showSkeleton: boolean
  onToggleSkeleton: (show: boolean) => void
  currentMedicine?: string
  sideEffectIntensity: number
  onSideEffectChange: (intensity: number) => void
}

export const AnimationControlWindow: React.FC<AnimationControlProps> = ({
  isPlaying,
  onPlayPause,
  scenarioMode,
  onScenarioChange,
  animationSpeed,
  onSpeedChange,
  heartRate,
  breathingRate,
  showParticles,
  onToggleParticles,
  showSkin,
  onToggleSkin,
  showSkeleton,
  onToggleSkeleton,
  currentMedicine,
  sideEffectIntensity,
  onSideEffectChange,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('playback')

  const toggleSection = useCallback((section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }, [expandedSection])

  return (
    <div className={styles.controlWindow}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>🫀 Animation Control Center</h2>
        <button
          className={styles.minimizeBtn}
          onClick={() => setExpandedSection(null)}
          title="Minimize"
        >
          −
        </button>
      </div>

      {/* Playback Controls */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('playback')}
        >
          <span className={styles.icon}>▶</span>
          <span>Playback</span>
          <span className={styles.arrow}>{expandedSection === 'playback' ? '▼' : '▶'}</span>
        </button>

        {expandedSection === 'playback' && (
          <div className={styles.sectionContent}>
            <button
              className={`${styles.playButton} ${isPlaying ? styles.playing : ''}`}
              onClick={() => onPlayPause(!isPlaying)}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>

            <div className={styles.controlGroup}>
              <label>Speed</label>
              <div className={styles.sliderContainer}>
                <input
                  type="range"
                  min="0.2"
                  max="2"
                  step="0.1"
                  value={animationSpeed}
                  onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                  className={styles.slider}
                />
                <span className={styles.value}>{animationSpeed.toFixed(1)}x</span>
              </div>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.stat}>
                <div className={styles.statLabel}>❤ Heart Rate</div>
                <div className={styles.statValue}>{heartRate} BPM</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statLabel}>💨 Breathing</div>
                <div className={styles.statValue}>{breathingRate} cycles/min</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scenario Selection */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('scenario')}
        >
          <span className={styles.icon}>🎭</span>
          <span>Scenario</span>
          <span className={styles.arrow}>{expandedSection === 'scenario' ? '▼' : '▶'}</span>
        </button>

        {expandedSection === 'scenario' && (
          <div className={styles.sectionContent}>
            <select
              value={scenarioMode}
              onChange={(e) => onScenarioChange(e.target.value)}
              className={styles.select}
            >
              <option value="restingState">😴 Resting State</option>
              <option value="activeState">🏃 Active State</option>
              <option value="stressedState">😰 Stressed State</option>
              <option value="postMealState">🍽️ Post-Meal State</option>
            </select>

            <div className={styles.scenarioDescription}>
              {scenarioMode === 'restingState' && (
                <p>Normal resting heart rate and breathing. Calm digestive activity.</p>
              )}
              {scenarioMode === 'activeState' && (
                <p>Elevated heart rate and rapid breathing. Active metabolism.</p>
              )}
              {scenarioMode === 'stressedState' && (
                <p>Stressed state with elevated vitals and neural activity.</p>
              )}
              {scenarioMode === 'postMealState' && (
                <p>Post-meal digestion with active pancreatic insulin secretion.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Effects & Particles */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('effects')}
        >
          <span className={styles.icon}>✨</span>
          <span>Effects</span>
          <span className={styles.arrow}>{expandedSection === 'effects' ? '▼' : '▶'}</span>
        </button>

        {expandedSection === 'effects' && (
          <div className={styles.sectionContent}>
            <div className={styles.toggleGroup}>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={showParticles}
                  onChange={(e) => onToggleParticles(e.target.checked)}
                />
                <span>Particle Effects</span>
              </label>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={showSkin}
                  onChange={(e) => onToggleSkin(e.target.checked)}
                />
                <span>Outer skin envelope</span>
              </label>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={showSkeleton}
                  onChange={(e) => onToggleSkeleton(e.target.checked)}
                />
                <span>Skeletal reference</span>
              </label>
            </div>

            <div className={styles.controlGroup}>
              <label>Side Effect Intensity</label>
              <div className={styles.sliderContainer}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={sideEffectIntensity}
                  onChange={(e) => onSideEffectChange(parseFloat(e.target.value))}
                  className={styles.slider}
                />
                <span className={styles.value}>{Math.round(sideEffectIntensity * 100)}%</span>
              </div>
            </div>

            {sideEffectIntensity > 0 && (
              <div className={styles.sideEffectIndicator}>
                <div
                  className={`${styles.indicator} ${
                    sideEffectIntensity > 0.6 ? styles.severe : sideEffectIntensity > 0.3 ? styles.moderate : styles.mild
                  }`}
                >
                  {sideEffectIntensity > 0.6 ? '⚠️ Severe' : sideEffectIntensity > 0.3 ? '⚠️ Moderate' : '⚠️ Mild'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Medicine Information */}
      {currentMedicine && (
        <div className={styles.section}>
          <button
            className={styles.sectionHeader}
            onClick={() => toggleSection('medicine')}
          >
            <span className={styles.icon}>💊</span>
            <span>Medicine</span>
            <span className={styles.arrow}>{expandedSection === 'medicine' ? '▼' : '▶'}</span>
          </button>

          {expandedSection === 'medicine' && (
            <div className={styles.sectionContent}>
              <div className={styles.medicineInfo}>
                <div className={styles.medicineName}>{currentMedicine}</div>
                <div className={styles.medicineStatus}>
                  Traveling through body system
                  <span className={styles.animatedDot}>●</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.footerText}>Animation System v2.0</div>
        <div className={styles.indicator} style={{ background: isPlaying ? '#4ade80' : '#gray' }}>
          {isPlaying ? '🔴 Recording' : '⊙ Ready'}
        </div>
      </div>
    </div>
  )
}

export default AnimationControlWindow
