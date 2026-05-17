async function fetchRoute(name, startLat, startLng, endLat, endLng) {
  const url = `http://router.project-osrm.org/route/v1/walking/${startLng},${startLat};${endLng},${endLat}?geometries=geojson`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const coords = data.routes[0].geometry.coordinates;
    const mapped = coords.map(c => ({ latitude: c[1], longitude: c[0] }));
    console.log(`const ${name} = ${JSON.stringify(mapped, null, 2)};\n`);
  } catch (e) {
    console.error(e);
  }
}

async function main() {
  // BGC High Street: 5th ave to 11th ave
  await fetchRoute('bgcCoordinates', 14.5511, 121.0465, 14.5501, 121.0538);
  
  // Ayala Triangle
  await fetchRoute('ayalaCoordinates', 14.5575, 121.0210, 14.5552, 121.0229);
  
  // UP Oval (half of it to make a loop, OSRM might just route back. We can just pick a start and end across the oval)
  await fetchRoute('upOvalCoordinates', 14.6546, 121.0620, 14.6540, 121.0705);
}

main();
