/**
 * BodyParts3D anatomy catalog — CC BY-SA 2.1 JP
 * Meshes live under /public/models/bodyparts3d (full) and bodyparts3d-lite (decimated).
 */

export type OrganGroup =
  | 'skin'
  | 'brain'
  | 'heart'
  | 'respiratory'
  | 'lungs'
  | 'esophagus'
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

export type AnatomyLayer = 'outer' | 'skeletal' | 'organ' | 'vascular' | 'detail'

export type AnatomyAsset = {
  group: OrganGroup
  name: string
  file: string
  opacity?: number
  maleOnly?: boolean
  adultOnly?: boolean
  layer?: AnatomyLayer
  /** Skip in low-power mode (very heavy meshes) */
  highQualityOnly?: boolean
}

const FULL = '/models/bodyparts3d'
const LITE = '/models/bodyparts3d-lite'

const asset = (
  group: OrganGroup,
  name: string,
  file: string,
  opacity?: number,
  options: Pick<AnatomyAsset, 'maleOnly' | 'adultOnly' | 'layer' | 'highQualityOnly'> = {},
): AnatomyAsset => ({ group, name, file, opacity, ...options })

const f = (folder: string, id: string) => `${FULL}/${folder}/${id}.obj`
const lite = (folder: string, id: string) => `${LITE}/${folder}/${id}.obj`

/** Visual defaults per organ system */
export const groupStyle: Record<OrganGroup, { color: string; opacity: number }> = {
  skin: { color: '#e8b896', opacity: 0.48 },
  brain: { color: '#df66ae', opacity: 0.96 },
  heart: { color: '#df2638', opacity: 0.97 },
  respiratory: { color: '#ff8b54', opacity: 0.9 },
  lungs: { color: '#ff9d6e', opacity: 0.72 },
  esophagus: { color: '#e58b6f', opacity: 0.9 },
  liver: { color: '#a23d2f', opacity: 0.96 },
  gallbladder: { color: '#60bf70', opacity: 0.94 },
  stomach: { color: '#f18f36', opacity: 0.94 },
  pancreas: { color: '#f2c36f', opacity: 0.93 },
  spleen: { color: '#954091', opacity: 0.94 },
  kidneys: { color: '#b455a3', opacity: 0.94 },
  intestine: { color: '#f2a15b', opacity: 0.8 },
  largeIntestine: { color: '#de7f45', opacity: 0.88 },
  appendix: { color: '#ef8b5c', opacity: 0.9 },
  bladder: { color: '#efd769', opacity: 0.91 },
  vessels: { color: '#cf1d31', opacity: 0.88 },
  skeleton: { color: '#efe6d5', opacity: 0.38 },
  spinalCord: { color: '#ffe6a7', opacity: 0.94 },
  diaphragm: { color: '#bc91df', opacity: 0.58 },
  eyes: { color: '#e8b896', opacity: 0.9 },
  tongue: { color: '#d95f7d', opacity: 0.93 },
  adrenal: { color: '#f6bf5a', opacity: 0.93 },
  prostate: { color: '#9486ff', opacity: 0.85 },
  reproductive: { color: '#9ad7cb', opacity: 0.82 },
}

export const ANATOMY_CENTER: [number, number, number] = [-1.15, -100.6, 781.7]
export const ANATOMY_SCALE = 0.00122
export const ANATOMY_OFFSET: [number, number, number] = [
  -ANATOMY_CENTER[0],
  -ANATOMY_CENTER[1],
  -ANATOMY_CENTER[2],
]

/**
 * Complete imported mesh catalog (BodyParts3D OBJ).
 * Heavy envelopes use lite decimated meshes for stable WebGL performance.
 */
export const ANATOMY_ASSETS: AnatomyAsset[] = [
  // —— Outer envelope ——
  asset('skin', 'Body skin envelope', lite('skin', 'FJ2810'), undefined, { layer: 'outer' }),

  // —— Brain ——
  asset('brain', 'Cerebellum', f('brain', 'FJ1781'), undefined, { layer: 'organ' }),
  asset('brain', 'Medulla oblongata', f('brain', 'FJ1769'), undefined, { layer: 'organ' }),
  asset('brain', 'Pons', f('brain', 'FJ1775'), undefined, { layer: 'organ' }),
  asset('brain', 'Fourth ventricle', f('brain', 'FJ1731'), 0.7, { layer: 'detail' }),
  asset('brain', 'Hypothalamus', f('brain', 'FJ1760'), undefined, { layer: 'detail' }),
  asset('brain', 'Midbrain', f('brain', 'FJ1770'), undefined, { layer: 'organ' }),
  asset('brain', 'Left lateral ventricle', f('brain', 'FJ1767'), 0.68, { layer: 'detail' }),
  asset('brain', 'Right lateral ventricle', f('brain', 'FJ1814'), 0.68, { layer: 'detail' }),
  asset('brain', 'Third ventricle', f('brain', 'FJ1730'), 0.68, { layer: 'detail' }),

  // —— Heart ——
  asset('heart', 'Wall of right atrium', f('heart', 'FJ2439'), undefined, { layer: 'organ' }),
  asset('heart', 'Wall of left atrium', f('heart', 'FJ2438'), undefined, { layer: 'organ' }),
  asset('heart', 'Cavity of left ventricle', f('heart', 'FJ2422'), 0.82, { layer: 'detail' }),
  asset('heart', 'Cavity of right ventricle', f('heart', 'FJ2423'), 0.82, { layer: 'detail' }),
  asset('heart', 'Cavity of right atrium', f('heart', 'FJ2424'), 0.82, { layer: 'detail' }),
  asset('heart', 'Cavity of left atrium', f('heart', 'FJ2425'), 0.82, { layer: 'detail' }),
  asset('heart', 'Papillary muscle of left ventricle', f('heart', 'FJ2429'), 0.88, { layer: 'detail' }),
  asset('heart', 'Papillary muscle of right ventricle', f('heart', 'FJ2419'), 0.88, { layer: 'detail' }),
  asset('heart', 'Anterior papillary muscle of right ventricle', f('heart', 'FJ2418'), 0.86, { layer: 'detail' }),
  asset('heart', 'Posterior papillary muscle of right ventricle', f('heart', 'FJ2430'), 0.86, { layer: 'detail' }),
  asset('heart', 'Septal papillary muscle of right ventricle', f('heart', 'FJ2437'), 0.86, { layer: 'detail' }),

  // —— Airways ——
  asset('respiratory', 'Trachea', f('respiratory', 'FJ2541'), undefined, { layer: 'organ' }),
  asset('respiratory', 'Left main bronchus', f('respiratory', 'FJ2450'), undefined, { layer: 'organ' }),
  asset('respiratory', 'Right main bronchus', f('respiratory', 'FJ2539'), undefined, { layer: 'organ' }),
  asset('respiratory', 'Left apical segmental bronchial tree', f('respiratory', 'FJ2444'), 0.88, { layer: 'detail' }),
  asset('respiratory', 'Left anterior segmental bronchial tree', f('respiratory', 'FJ2443'), 0.88, { layer: 'detail' }),
  asset('respiratory', 'Left lateral basal bronchial tree', f('respiratory', 'FJ2445'), 0.86, { layer: 'detail' }),
  asset('respiratory', 'Left posterior basal bronchial tree', f('respiratory', 'FJ2446'), 0.86, { layer: 'detail' }),
  asset('respiratory', 'Left superior segmental bronchial tree', f('respiratory', 'FJ2448'), 0.86, { layer: 'detail' }),
  asset('respiratory', 'Right apical segmental bronchial tree', f('respiratory', 'FJ2454'), 0.86, { layer: 'detail' }),
  asset('respiratory', 'Right anterior segmental bronchial tree', f('respiratory', 'FJ2453'), 0.86, { layer: 'detail' }),
  asset('respiratory', 'Right posterior basal bronchial tree', f('respiratory', 'FJ2459'), 0.86, { layer: 'detail' }),
  asset('respiratory', 'Right lateral basal bronchial tree', f('respiratory', 'FJ2455'), 0.86, { layer: 'detail' }),
  asset('respiratory', 'Right superior segmental bronchial tree', f('respiratory', 'FJ2452'), 0.86, { layer: 'detail' }),
  asset('respiratory', 'Inferior lingular bronchial tree', f('respiratory', 'FJ2441'), 0.84, { layer: 'detail' }),

  // —— Lungs ——
  asset('lungs', 'Left bronchial tree', f('lungs', 'FJ2479'), undefined, { layer: 'organ' }),
  asset('lungs', 'Right bronchial tree', f('lungs', 'FJ2481'), undefined, { layer: 'organ' }),
  asset('lungs', 'Left lung segment', f('lungs', 'FJ2456'), 0.58, { layer: 'organ' }),
  asset('lungs', 'Right lung segment', f('lungs', 'FJ2480'), 0.58, { layer: 'organ' }),
  asset('lungs', 'Upper lung branch', f('lungs', 'FJ2447'), 0.6, { layer: 'organ' }),
  asset('lungs', 'Lower lung branch', f('lungs', 'FJ2461'), 0.6, { layer: 'organ' }),
  asset('lungs', 'Left lung parenchyma', f('lungs', 'FJ2470'), 0.55, { layer: 'organ' }),
  asset('lungs', 'Right lung parenchyma', f('lungs', 'FJ2540'), 0.55, { layer: 'organ' }),
  asset('lungs', 'Left apical segment', f('lungs', 'FJ2451'), 0.56, { layer: 'organ' }),
  asset('lungs', 'Right apical segment', f('lungs', 'FJ2458'), 0.56, { layer: 'organ' }),
  asset('lungs', 'Left basal segment', f('lungs', 'FJ2460'), 0.56, { layer: 'organ' }),
  asset('lungs', 'Right basal segment', f('lungs', 'FJ2449'), 0.56, { layer: 'organ' }),
  asset('lungs', 'Lung surface detail I', f('lungs', 'FJ2041'), 0.52, { layer: 'detail' }),
  asset('lungs', 'Lung surface detail II', f('lungs', 'FJ2044'), 0.52, { layer: 'detail' }),

  // —— Digestive ——
  asset('esophagus', 'Esophagus', f('esophagus', 'FJ2563'), undefined, { layer: 'organ' }),
  asset('stomach', 'Stomach', f('stomach', 'FJ2564'), undefined, { layer: 'organ' }),
  asset('gallbladder', 'Gallbladder', f('gallbladder', 'FJ2817'), undefined, { layer: 'organ' }),
  asset('pancreas', 'Pancreas', f('pancreas', 'FJ1895'), undefined, { layer: 'organ' }),
  asset('pancreas', 'Pancreatic duct tree', f('pancreas', 'FJ2630'), 0.88, { layer: 'detail' }),
  asset('pancreas', 'Pancreatic tissue II', f('pancreas', 'FJ1896'), 0.9, { layer: 'detail' }),
  asset('pancreas', 'Pancreatic tissue III', f('pancreas', 'FJ2629'), 0.88, { layer: 'detail' }),
  asset('spleen', 'Spleen', f('spleen', 'FJ2561'), undefined, { layer: 'organ' }),
  asset('tongue', 'Tongue', f('tongue', 'FJ2761'), undefined, { layer: 'detail' }),

  // —— Liver ——
  asset('liver', 'Right lobe of liver', f('liver', 'FJ2816'), 0.96, { layer: 'organ' }),
  asset('liver', 'Liver segment II', f('liver', 'FJ2818'), undefined, { layer: 'organ' }),
  asset('liver', 'Liver segment III', f('liver', 'FJ2819'), undefined, { layer: 'organ' }),
  asset('liver', 'Liver segment IV', f('liver', 'FJ2820'), undefined, { layer: 'organ' }),
  asset('liver', 'Liver segment V', f('liver', 'FJ2821'), undefined, { layer: 'organ' }),
  asset('liver', 'Liver segment VI', f('liver', 'FJ2822'), undefined, { layer: 'organ' }),
  asset('liver', 'Portal liver structure', f('liver', 'FJ1883'), 0.88, { layer: 'vascular' }),
  asset('liver', 'Hepatic branch', f('liver', 'FJ1893'), 0.86, { layer: 'vascular' }),
  asset('liver', 'Intrahepatic branch', f('liver', 'FJ1913'), 0.84, { layer: 'vascular' }),

  // —— Kidneys & bladder ——
  asset('kidneys', 'Left kidney', f('kidneys', 'FJ3145'), undefined, { layer: 'organ' }),
  asset('kidneys', 'Right kidney', f('kidneys', 'FJ3147'), undefined, { layer: 'organ' }),
  asset('bladder', 'Urinary bladder', f('bladder', 'FJ3149'), undefined, { layer: 'organ' }),
  asset('adrenal', 'Left adrenal gland', f('adrenal', 'FJ3129'), undefined, { layer: 'organ' }),
  asset('adrenal', 'Right adrenal gland', f('adrenal', 'FJ3130'), undefined, { layer: 'organ' }),

  // —— Intestines ——
  asset('intestine', 'Duodenum', f('small-intestine', 'FJ2573'), undefined, { layer: 'organ' }),
  asset('intestine', 'Upper jejunum loop', f('small-intestine', 'FJ2578'), undefined, { layer: 'organ' }),
  asset('intestine', 'Jejunum loop A', f('small-intestine', 'FJ2584'), undefined, { layer: 'organ' }),
  asset('intestine', 'Jejunum loop B', f('small-intestine', 'FJ2585'), undefined, { layer: 'organ' }),
  asset('intestine', 'Jejunum section', f('small-intestine', 'FJ2606'), undefined, { layer: 'organ' }),
  asset('intestine', 'Ileum loop A', f('small-intestine', 'FJ2613'), undefined, { layer: 'organ' }),
  asset('intestine', 'Ileum loop B', f('small-intestine', 'FJ2614'), undefined, { layer: 'organ' }),
  asset('intestine', 'Ileum section', f('small-intestine', 'FJ2589'), undefined, { layer: 'organ' }),
  asset('intestine', 'Mid jejunum loop', f('small-intestine', 'FJ2590'), undefined, { layer: 'organ' }),
  asset('intestine', 'Distal jejunum loop', f('small-intestine', 'FJ2600'), undefined, { layer: 'organ' }),
  asset('intestine', 'Small intestine mesentery', lite('intestine', 'FJ3396'), 0.42, { layer: 'detail' }),
  asset('largeIntestine', 'Ascending colon', f('large-intestine', 'FJ2566'), undefined, { layer: 'organ' }),
  asset('largeIntestine', 'Descending colon', f('large-intestine', 'FJ2567'), undefined, { layer: 'organ' }),
  asset('largeIntestine', 'Transverse colon', f('large-intestine', 'FJ2572'), undefined, { layer: 'organ' }),
  asset('largeIntestine', 'Rectum', f('large-intestine', 'FJ2571'), undefined, { layer: 'organ' }),
  asset('largeIntestine', 'Sigmoid colon', f('large-intestine', 'FJ2568'), undefined, { layer: 'organ' }),
  asset('largeIntestine', 'Hepatic flexure', f('large-intestine', 'FJ2569'), undefined, { layer: 'organ' }),
  asset('largeIntestine', 'Splenic flexure', f('large-intestine', 'FJ2570'), undefined, { layer: 'organ' }),
  asset('appendix', 'Appendix', f('large-intestine', 'FJ2565'), undefined, { layer: 'organ' }),

  // —— Vessels ——
  asset('vessels', 'Abdominal aorta', f('vessels', 'FJ1932'), undefined, { layer: 'vascular' }),
  asset('vessels', 'Descending thoracic aorta', f('vessels', 'FJ1931'), undefined, { layer: 'vascular' }),
  asset('vessels', 'Descending aorta', f('vessels', 'FJ3427'), undefined, { layer: 'vascular' }),
  asset('vessels', 'Pulmonary trunk', f('vessels', 'FJ2966'), undefined, { layer: 'vascular' }),
  asset('vessels', 'Left pulmonary artery', f('vessels', 'FJ2924'), undefined, { layer: 'vascular' }),
  asset('vessels', 'Right pulmonary artery', f('vessels', 'FJ3019'), undefined, { layer: 'vascular' }),
  asset('vessels', 'Arch of aorta', f('vessels', 'FJ3411'), 0.76, { layer: 'vascular' }),
  asset('vessels', 'Ascending aorta', f('vessels', 'FJ3413'), 0.76, { layer: 'vascular' }),

  // —— Skeleton ——
  asset('skeleton', 'Sternum', f('skeleton', 'FJ3178'), 0.5, { layer: 'skeletal' }),
  asset('skeleton', 'Rib cage segment A', f('skeleton', 'FJ3172'), 0.32, { layer: 'skeletal' }),
  asset('skeleton', 'Rib cage segment B', f('skeleton', 'FJ3173'), 0.32, { layer: 'skeletal' }),
  asset('skeleton', 'Rib cage segment C', f('skeleton', 'FJ3174'), 0.3, { layer: 'skeletal' }),
  asset('skeleton', 'Rib cage segment D', f('skeleton', 'FJ3175'), 0.3, { layer: 'skeletal' }),
  asset('skeleton', 'Atlas', f('skeleton', 'FJ3176'), 0.44, { layer: 'skeletal' }),
  asset('skeleton', 'Axis', f('skeleton', 'FJ3177'), 0.44, { layer: 'skeletal' }),
  asset('skeleton', 'Cervical vertebra', f('skeleton', 'FJ3167'), 0.44, { layer: 'skeletal' }),
  asset('skeleton', 'Thoracic vertebra', f('skeleton', 'FJ3166'), 0.44, { layer: 'skeletal' }),
  asset('skeleton', 'Lumbar vertebra', f('skeleton', 'FJ3162'), 0.44, { layer: 'skeletal' }),
  asset('skeleton', 'Sacral vertebra', f('skeleton', 'FJ3161'), 0.4, { layer: 'skeletal' }),
  asset('spinalCord', 'Central canal of spinal cord', f('spinal-cord', 'FJ1737'), undefined, { layer: 'detail' }),
  asset('diaphragm', 'Diaphragm', f('diaphragm', 'FJ3131'), 0.5, { layer: 'organ' }),

  // —— Eyes ——
  asset('eyes', 'Left sclera', f('eyes', 'FJ1317'), undefined, { layer: 'detail' }),
  asset('eyes', 'Left cornea', f('eyes', 'FJ1289'), 0.7, { layer: 'detail' }),
  asset('eyes', 'Right sclera', f('eyes', 'FJ1320'), undefined, { layer: 'detail' }),
  asset('eyes', 'Right choroid', f('eyes', 'FJ1336'), 0.75, { layer: 'detail' }),
  asset('eyes', 'Left iris', f('eyes', 'FJ1285'), 0.82, { layer: 'detail' }),
  asset('eyes', 'Right iris', f('eyes', 'FJ1286'), 0.82, { layer: 'detail' }),

  // —— Reproductive (male adult) ——
  asset('prostate', 'Prostate', f('prostate', 'FJ3139'), undefined, { maleOnly: true, adultOnly: true, layer: 'organ' }),
  asset('reproductive', 'Left testis', f('reproductive', 'FJ3138'), undefined, { maleOnly: true, adultOnly: true, layer: 'organ' }),
  asset('reproductive', 'Right testis', f('reproductive', 'FJ3142'), undefined, { maleOnly: true, adultOnly: true, layer: 'organ' }),
]

export const organPosition: Record<Exclude<OrganGroup, 'skin'>, [number, number, number]> = {
  brain: [0, -42, 1514],
  heart: [-12, -128, 1230],
  respiratory: [0, -94, 1340],
  lungs: [0, -110, 1268],
  esophagus: [0, -142, 1240],
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

export function shouldRenderAsset(asset: AnatomyAsset, profile: { age: number; gender: string }) {
  if (asset.adultOnly && profile.age < 18) return false
  if (asset.maleOnly && profile.gender !== 'Male') return false
  return true
}

export function renderOrderForAsset(asset: AnatomyAsset): number {
  if (asset.group === 'skin') return 50
  if (asset.layer === 'skeletal') return 0
  if (asset.layer === 'vascular') return 4
  if (asset.layer === 'detail') return 3
  return 2
}
