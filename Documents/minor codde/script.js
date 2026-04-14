function scrollToSection(id){

document.getElementById(id).scrollIntoView({
behavior:"smooth"
})

}


function openLogin(){

document.getElementById("loginModal").style.display="flex"

}


function closeLogin(){

document.getElementById("loginModal").style.display="none"

}


function login(){

alert("Login Successful")

closeLogin()

}


function signup(){

alert("Account Created Successfully")

closeLogin()

}

function goToExplore(){
window.location.href = "explore.html"
}

function goToActivities(){
window.location.href = "activities.html"
}

document.getElementById("reportForm").addEventListener("submit",function(e){

e.preventDefault()

alert("Issue Report Submitted Successfully!")

})

// 🔒 Delhi NCR bounds
const bounds = {
  minLat: 28.0,
  maxLat: 29.0,
  minLng: 76.5,
  maxLng: 77.8
};

// 🗺️ Create map
const map = L.map('map', {
  center: [28.6139, 77.2090],
  zoom: 10,
  maxBounds: [
    [bounds.minLat, bounds.minLng],
    [bounds.maxLat, bounds.maxLng]
  ],
  maxBoundsViscosity: 1.0
});

// 🌍 Tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

let marker;

// 🖱️ CLICK MAP → ADDRESS
map.on('click', async function(e) {
  const { lat, lng } = e.latlng;

  if (
    lat < bounds.minLat || lat > bounds.maxLat ||
    lng < bounds.minLng || lng > bounds.maxLng
  ) {
    alert("Select location within Delhi NCR");
    return;
  }

  if (marker) map.removeLayer(marker);
  marker = L.marker([lat, lng]).addTo(map);

  map.flyTo([lat, lng], 14);

  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
  );
  const data = await res.json();

  document.getElementById("locationInput").value =
    data.display_name || "Address not found";
});


// ⌨️ TYPE LOCATION → MOVE MAP
const locationInput = document.getElementById("locationInput");

locationInput.addEventListener("keydown", async function(e) {
  if (e.key === "Enter") {
    e.preventDefault();

    const query = this.value;
    if (!query) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
    );
    const data = await res.json();

    if (data.length === 0) {
      alert("Location not found");
      return;
    }

    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);

    if (
      lat < bounds.minLat || lat > bounds.maxLat ||
      lng < bounds.minLng || lng > bounds.maxLng
    ) {
      alert("Location must be within Delhi NCR");
      return;
    }

    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng]).addTo(map);

    map.flyTo([lat, lng], 14);
  }
});


// 📍 USE DEVICE LOCATION
function getUserLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    if (
      lat < bounds.minLat || lat > bounds.maxLat ||
      lng < bounds.minLng || lng > bounds.maxLng
    ) {
      alert("You are outside Delhi NCR");
      return;
    }

    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng]).addTo(map);

    map.flyTo([lat, lng], 14);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await res.json();

    document.getElementById("locationInput").value =
      data.display_name || "Address not found";

  }, () => {
    alert("Location permission denied");
  });
}