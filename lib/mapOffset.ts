const OFFSET_RANGE = 0.003

function hashSeed(value: string): number {
  let hash = 0

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }

  return hash
}

function unitOffset(seed: string, salt: string): number {
  const hash = hashSeed(`${seed}:${salt}`)
  return (hash % 10_000) / 10_000
}

export function offsetCoordinates(lat: number, lng: number, seed: string) {
  const latOffset = (unitOffset(seed, 'lat') - 0.5) * OFFSET_RANGE
  const lngOffset = (unitOffset(seed, 'lng') - 0.5) * OFFSET_RANGE

  return {
    lat: lat + latOffset,
    lng: lng + lngOffset,
  }
}
