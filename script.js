document.getElementById('kml-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const fileInput = document.getElementById('kml-file');
    const distance = parseInt(document.getElementById('distance').value);

    if (!fileInput.files.length) {
        alert('Silakan unggah file KML!');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const kmlContent = event.target.result;

        // Parse KML file
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(kmlContent, "application/xml");

        // Find LineString coordinates
        const lineStrings = xmlDoc.getElementsByTagName('LineString');
        if (!lineStrings.length) {
            alert('Tidak ada LineString di dalam file KML!');
            return;
        }

        const coordinates = lineStrings[0].getElementsByTagName('coordinates')[0].textContent.trim();
        const points = coordinates.split(" ").map(coord => coord.split(",").map(Number));

        // Generate points with the specified distance
        const generatedPoints = [];
        let currentDistance = 0;

        for (let i = 1; i < points.length; i++) {
            const [x1, y1] = points[i - 1];
            const [x2, y2] = points[i];

            const segmentDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            currentDistance += segmentDistance;

            if (currentDistance >= distance) {
                generatedPoints.push(points[i]);
                currentDistance = 0;
            }
        }

        // Create new KML content with points and lines
        const kmlResult = `
            <?xml version="1.0" encoding="UTF-8"?>
            <kml xmlns="http://www.opengis.net/kml/2.2">
                <Document>
                    <name>Generated Points and Lines</name>
                    ${generatedPoints.map(point => `
                        <Placemark>
                            <Point>
                                <coordinates>${point.join(",")}</coordinates>
                            </Point>
                        </Placemark>
                    `).join("\n")}
                    <Placemark>
                        <LineString>
                            <coordinates>
                                ${generatedPoints.map(point => point.join(",")).join(" ")}
                            </coordinates>
                        </LineString>
                    </Placemark>
                </Document>
            </kml>
        `;

        // Download KML file
        const blob = new Blob([kmlResult], { type: 'application/vnd.google-earth.kml+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated_points_lines.kml';
        a.click();
        URL.revokeObjectURL(url);

        alert('File berhasil dibuat!');
    };

    reader.readAsText(file);
});
