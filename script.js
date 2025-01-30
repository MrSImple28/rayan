let daftarTitik = [];

function buatTitik() {
  let latitude = parseFloat(document.getElementById("latitude").value);
  let longitude = parseFloat(document.getElementById("longitude").value);
  let namaTE = document.getElementById("namaTE").value;

  let titik = {
    nama: namaTE,
    koordinat: [longitude, latitude]
  };

  daftarTitik.push(titik);

  let daftar = document.getElementById("daftarTitik");
  let item = document.createElement("li");
  item.textContent = titik.nama + " (" + titik.koordinat[0] + ", " + titik.koordinat[1] + ")";
  daftar.appendChild(item);

  // Reset input fields
  document.getElementById("latitude").value = "";
  document.getElementById("longitude").value = "";
  document.getElementById("namaTE").value = "";
}
function buatGaris() {
  let jarak = parseFloat(document.getElementById("jarak").value);
  let garis = [];

  for (let i = 0; i < daftarTitik.length - 1; i++) {
    let titik1 = daftarTitik[i];
    let titik2 = daftarTitik[i + 1];

    // Haversine formula to calculate distance
    let lat1 = titik1.koordinat[1] * Math.PI / 180;
    let lon1 = titik1.koordinat[0] * Math.PI / 180;
    let lat2 = titik2.koordinat[1] * Math.PI / 180;
    let lon2 = titik2.koordinat[0] * Math.PI / 180;

    let dLat = lat2 - lat1;
    let dLon = lon2 - lon1;
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let distance = 6371 * c * 1000; // Earth radius in meters

    if (distance <= jarak) {
      garis.push([titik1.koordinat, titik2.koordinat]);
    }
  }

  // You can use the 'garis' array to create KML linestrings
  // ...
}
function buatKML() {
  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Titik dan Garis</name>
    <description>Titik dan garis yang dibuat dari website</description>
    `;

  // Add placemarks
  for (let titik of daftarTitik) {
    kml += `
    <Placemark>
      <name>${titik.nama}</name>
      <Point>
        <coordinates>${titik.koordinat[0]},${titik.koordinat[1]},0</coordinates>
      </Point>
    </Placemark>
    `;
  }

  // Add linestrings (if garis array is available)
  if (garis && garis.length > 0) {
    for (let line of garis) {
      kml += `
      <Placemark>
        <name>Garis</name>
        <LineString>
          <extrude>1</extrude>
          <tessellate>1</tessellate>
          <coordinates>
            ${line[0][0]},${line[0][1]},0
            ${line[1][0]},${line[1][1]},0
          </coordinates>
        </LineString>
      </Placemark>
      `;
    }
  }

  kml += `
  </Document>
</kml>
  `;

  // Create a download link for the KML file
  let blob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" });
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "titik_garis.kml";
  a.click();
}
