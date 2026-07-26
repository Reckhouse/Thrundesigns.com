/** Geographic degrees → Three.js Y-up Cartesian (lon 0 / lat 0 faces +Z). */
export function latLonToVector3(
  lat: number,
  lon: number,
  radius: number,
): [number, number, number] {
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;
  const cosLat = Math.cos(latRad);
  const x = radius * cosLat * Math.sin(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * cosLat * Math.cos(lonRad);
  return [x, y, z];
}

export function formatPopulation(population: number): string {
  return new Intl.NumberFormat("en-US").format(population);
}
