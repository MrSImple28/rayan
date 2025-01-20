document.getElementById('kml-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const fileInput = document.getElementById('kml-file');
    const distance = parseInt(document.getElementById('distance').value);

    if (fileInput.files.length === 0) {
        alert('Please upload a KML file!');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const kmlContent = event.target.result;

        // Parse KML using DOMParser
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(kmlContent, "application/xml");

        // Process KML LineString
        const lineStrings = xmlDoc.getElementsByTagName('LineString');
        if (lineStrings.length === 0) {
            alert('No LineString found in the KML file!');
            return;
        }

        // Extract coordinates
        const coordinates = lineStrings[0].getElementsByTagName('coordinates')[0].textContent.trim();
        const points = coordinates.split(" ").map(coord => coord.split(",").map(Number));

        // Generate points with specified distance
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

        // Output the result
        const outputDiv = document.getElementById('output');
        outputDiv.innerHTML = `<pre>${JSON.stringify(generatedPoints, null, 2)}</pre>`;
    };

    reader.readAsText(file);
});
