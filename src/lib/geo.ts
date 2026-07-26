/** Convert geographic degrees to Three.js Y-up Cartesian coordinates. */
export function latLonToVector3(
  lat: number,
  lon: number,
  radius: number,
): [number, number, number] {
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;
  const x = radius * Math.cos(latRad) * Math.cos(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.sin(lonRad);
  return [x, y, z];
}

export function formatPopulation(population: number): string {
  return new Intl.NumberFormat("en-US").format(population);
}
