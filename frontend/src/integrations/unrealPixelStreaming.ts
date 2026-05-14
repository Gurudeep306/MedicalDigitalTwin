export const UNREAL_SCENE_COMMAND = 'HEALTH_TWIN_SCENE_COMMAND'

export const unrealPipelineCapabilities = {
  human: ['MetaHuman Creator identity', 'MetaHuman Animator facial solve', 'Control Rig body layer', 'Subsurface skin material'],
  mocap: ['Move AI body performance', 'Rokoko cleanup pass', 'DeepMotion fallback solve', 'procedural breathing blend'],
  rendering: ['Lumen GI', 'volumetric key light', 'cinematic shadows', 'depth of field', 'eye wetness material'],
  biology: ['Niagara bloodstream', 'organ interaction volumes', 'toxicity buildup', 'healing and damage progression'],
  cinematicAI: ['Runway inserts', 'Kling biological transitions', 'Wonder Dynamics performance enhancement'],
}

export type UnrealSceneCommandName =
  | 'SET_PROFILE'
  | 'GENERATE_METAHUMAN'
  | 'SET_MEDICINE'
  | 'ENTER_BODY'
  | 'SET_TIMELINE'
  | 'PLAY_FUTURE_PROGRESSION'
