# Unreal Pixel Streaming Integration

The website must not render the final human locally. It sends profile, medicine, and timeline commands to a UE5 Pixel Streaming experience.

## Browser Contract

Set the stream URL:

```env
NEXT_PUBLIC_PIXEL_STREAMING_URL=https://your-pixel-streaming-host.example
```

The page embeds that URL in an iframe and posts messages shaped like:

```ts
{
  type: 'HEALTH_TWIN_SCENE_COMMAND',
  step: 'welcome' | 'questions' | 'human' | 'medicine' | 'simulation',
  profile: { age, gender, height, weight, bodyType, lifestyle, ... },
  medicine: 'Ibuprofen',
  timeline: '1 day' | '1 week' | '1 month' | '1 year' | '5 years' | '10 years',
  signals: {
    bmi,
    bodyMass,
    stress,
    smoking,
    diseaseLoad,
    organLoad,
    fatigue,
    vitality
  }
}
```

## Unreal Responsibilities

- MetaHuman Creator identity and body preset generation.
- MetaHuman Animator facial solve and idle expression system.
- Control Rig body layer with breathing, weight shift, shoulder/neck relaxation, and finger micro-adjustments.
- Motion sources from Move AI, Rokoko, and DeepMotion blended into non-looping idle states.
- Lumen lighting, volumetric atmosphere, cinematic DOF, skin SSS, eye wetness, and dynamic facial materials.
- Niagara bloodstream, organ interaction, inflammation, toxicity, and recovery/damage progression.
- Optional Runway/Kling/Wonder Dynamics generated inserts for documentary-like biological sequences.

## Suggested UE Scene Commands

- `SET_PROFILE`
- `GENERATE_METAHUMAN`
- `SET_MEDICINE`
- `ENTER_BODY`
- `SET_TIMELINE`
- `PLAY_FUTURE_PROGRESSION`
