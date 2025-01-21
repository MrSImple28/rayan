document.getElementById('kml-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const fileInput = document.getElementById('kml-file');
    const distance = parseFloat(document.getElementById('distance').value);

    if (!fileInput.files.length) {
        alert('Silakan unggah file KML!');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const kmlContent = event.target.result;

        // Parse KML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(kmlContent, "application/xml");

        // Extract coordinates from LineString
        const lineString = xmlDoc.querySelector('LineString coordinates');
        if (!lineString) {
            alert('Tidak ada LineString di dalam file KML!');
            return;
        }

        const coordsText = lineString.textContent.trim();
        const coordinates = coordsText.split(/\s+/).map(coord => {
            const [lng, lat, alt] = coord.split(',').map(Number);
            return { lng, lat, alt };
        });

        const placemarks = [];
        let accumulatedDistance = 0;

        // Generate placemarks based on distance
        for (let i = 1; i < coordinates.length; i++) {
            const prev = coordinates[i - 1];
            const curr = coordinates[i];

            const segmentDistance = haversineDistance(prev, curr);
            accumulatedDistance += segmentDistance;

            if (accumulatedDistance >= distance) {
                placemarks.push(curr);
                accumulatedDistance = 0;
            }
        }

        // Create KML content with placemarks
        const newKml = `
            <?xml version="1.0" encoding="UTF-8"?>
            <kml xmlns="http://www.opengis.net/kml/2.2">
                <Document>
                    <name>Generated Placemarks</name>
                    ${placemarks.map(point => `
                        <Placemark>
                            <Point>
                                <coordinates>${point.lng},${point.lat},${point.alt || 0}</coordinates>
                            </Point>
                        </Placemark>
                    `).join('\n')}
                </Document>
            </kml>
        `;

        // Download generated KML file
        const blob = new Blob([newKml], { type: 'application/vnd.google-earth.kml+xml' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'generated_placemarks.kml';
        link.click();

        URL.revokeObjectURL(url);
        alert('File KML berhasil dibuat!');
    };

    reader.readAsText(file);
});

// Calculate distance between two coordinates
function haversineDistance(coord1, coord2) {
    const R = 6371000; // Radius of the Earth in meters
    const toRad = angle => (angle * Math.PI) / 180;

    const dLat = toRad(coord2.lat - coord1.lat);
    const dLng = toRad(coord2.lng - coord1.lng);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
