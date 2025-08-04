const radarList = [
  { type: "fixe", lat: 48.861, lon: 2.295 },
  { type: "mobile", lat: 48.857, lon: 2.291 },
  { type: "feu rouge", lat: 48.859, lon: 2.300 }
];

const map = L.map('map').setView([48.8584, 2.2945], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

radarList.forEach(r => {
  L.marker([r.lat, r.lon]).addTo(map).bindPopup(`Radar ${r.type}`);
});

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
            Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
            Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function simulateSpeed() {
  const speed = Math.floor(60 + Math.random() * 40);
  document.getElementById("speed").textContent = speed;
}

function speakAlert() {
  const text = document.getElementById("alertZone").textContent;
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

function addRadar() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      L.marker([lat, lon]).addTo(map).bindPopup("🚨 Radar signalé");
      radarList.push({ type: "utilisateur", lat, lon });
    });
  }
}

function checkRadarProximity(pos) {
  const userLat = pos.coords.latitude;
  const userLon = pos.coords.longitude;
  L.marker([userLat, userLon], {title: "Vous"}).addTo(map).bindPopup("Votre position");
  map.setView([userLat, userLon], 15);

  let found = false;
  for (let r of radarList) {
    const d = distanceKm(userLat, userLon, r.lat, r.lon);
    if (d < 1) {
      document.getElementById("alertZone").textContent = `⚠️ Radar ${r.type} à ${(d*1000).toFixed(0)} m`;
      found = true;
      break;
    }
  }
  if (!found) document.getElementById("alertZone").textContent = "Aucun radar proche.";
}

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(checkRadarProximity);
} else {
  document.getElementById("alertZone").textContent = "GPS non disponible.";
}

setInterval(simulateSpeed, 3000);
