from flask import Flask, render_template, request, send_file
import os
import simplekml
import xml.etree.ElementTree as ET
from geopy.distance import geodesic

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "output"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def parse_kml(file_path):
    """Mengambil koordinat dari LineString di dalam file KML"""
    tree = ET.parse(file_path)
    root = tree.getroot()
    
    # Namespace Google Earth
    namespace = {'kml': 'http://www.opengis.net/kml/2.2'}
    
    # Mencari LineString dalam file KML
    coordinates = root.find(".//kml:LineString/kml:coordinates", namespace)
    if coordinates is None:
        return []

    # Parsing koordinat
    points = []
    for coord in coordinates.text.strip().split():
        lon, lat, *_ = map(float, coord.split(','))
        points.append((lat, lon))

    return points

def generate_placemarks(path_coords, distance_interval):
    """Membuat Placemark berdasarkan jarak yang ditentukan dari Path"""
    kml = simplekml.Kml()
    
    total_distance = 0
    for i in range(len(path_coords) - 1):
        start = path_coords[i]
        end = path_coords[i + 1]
        segment_distance = geodesic(start, end).meters
        
        while total_distance < segment_distance:
            ratio = total_distance / segment_distance
            lat = start[0] + ratio * (end[0] - start[0])
            lon = start[1] + ratio * (end[1] - start[1])
            
            kml.newpoint(name=f"Point {i}", coords=[(lon, lat)])
            total_distance += distance_interval
        
        total_distance -= segment_distance

    return kml

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        file = request.files["file"]
        distance = float(request.form["distance"])
        
        if file:
            file_path = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(file_path)

            # Proses KML
            path_coords = parse_kml(file_path)
            if not path_coords:
                return "Error: File KML tidak valid atau tidak mengandung LineString.", 400
            
            kml = generate_placemarks(path_coords, distance)
            
            output_file = os.path.join(OUTPUT_FOLDER, "output.kml")
            kml.save(output_file)

            return send_file(output_file, as_attachment=True)
    
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
