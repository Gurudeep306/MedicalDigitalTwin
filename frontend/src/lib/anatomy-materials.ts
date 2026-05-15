import * as THREE from 'three'
import type { AnatomyAsset } from './anatomy-catalog'
import { groupStyle } from './anatomy-catalog'

export type OrganMaterial = THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial

export function createOrganMaterial(asset: AnatomyAsset): OrganMaterial {
  const style = groupStyle[asset.group]
  const baseOpacity = asset.opacity ?? style.opacity
  const isSkin = asset.group === 'skin'

  if (isSkin) {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(style.color),
      transparent: true,
      opacity: baseOpacity,
      roughness: 0.52,
      metalness: 0.03,
      transmission: 0.05,
      thickness: 0.55,
      clearcoat: 0.09,
      clearcoatRoughness: 0.38,
      emissive: new THREE.Color('#f4d4bf'),
      emissiveIntensity: 0.08,
      side: THREE.FrontSide,
      depthWrite: false,
    })
  }

  const isVessel = asset.group === 'vessels' || asset.layer === 'vascular'
  const isLung = asset.group === 'lungs' || asset.group === 'respiratory'
  const isSkeleton = asset.group === 'skeleton'

  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(style.color),
    transparent: baseOpacity < 0.99,
    opacity: baseOpacity,
    emissive: new THREE.Color(style.color),
    emissiveIntensity: isSkeleton ? 0.03 : isVessel ? 0.1 : 0.07,
    roughness: isLung ? 0.68 : isVessel ? 0.28 : isSkeleton ? 0.72 : 0.4,
    metalness: isVessel ? 0.12 : 0.02,
    side: THREE.DoubleSide,
    depthWrite: baseOpacity >= 0.88,
  })
}

export function polishGeometry(geometry: THREE.BufferGeometry) {
  geometry.computeVertexNormals()
  geometry.normalizeNormals()
  if (!geometry.getAttribute('normal')) {
    geometry.computeVertexNormals()
  }
}
