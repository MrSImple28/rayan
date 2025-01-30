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
