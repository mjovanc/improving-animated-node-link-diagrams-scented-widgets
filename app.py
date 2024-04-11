import os
from flask import Flask, request, jsonify  # Importing request module
import networkx as nx
from io import StringIO

from src.controllers.controller import DataController

# Set the views folders' paths
template_dir = os.path.abspath('./src/views/templates')
static_dir = os.path.abspath('./src/views/static')
app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

#Set HTTP paths for HTML pages
@app.route('/')
def index():
    return DataController.render_bar_chart()

@app.route('/line-chart')
def line_chart():
    return DataController.render_line_chart()

@app.route('/about')
def about():
    return DataController.render_about()

@app.route('/node_link')
def node_link():
    return DataController.render_nodelink()

#Set the data fetch paths for D3
@app.route('/bar-data') 
def get_bar_data():
    return {"data": DataController.get_validated_bar_data()}

@app.route('/line-data')
def get_line_data():
    return {"data": DataController.get_validated_line_data()}

@app.route('/node_link')
def get_node_link():
    return {"data": DataController.get_validated_line_data()}


def convert_to_json(text_data):
    nodes = []
    links = []
    times = set()  # Using set to store unique timestamps

    # Process each line in the text data
    for line in text_data.split('\n'):
        parts = line.split()
        if len(parts) == 3:  # Ensure each line contains three parts: node_origin, node_destiny, timestamp
            node_origin, node_destiny, timestamp = parts
            nodes.append({'id': node_origin, 'group': 1, 'time': int(timestamp)})
            nodes.append({'id': node_destiny, 'group': 1, 'time': int(timestamp)})
            links.append({'source': node_origin, 'target': node_destiny, 'time': int(timestamp)})
            times.add(int(timestamp))  # Convert timestamp to integer and add to times set

    return {'nodes': nodes, 'links': links, 'times': sorted(list(times))}




@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    if file.filename.endswith('.dat'):
        # Process the uploaded text file
        text_data = file.read().decode('utf-8')
        # Convert to JSON format
        json_data = convert_to_json(text_data)
        print(json_data)
        return jsonify(json_data)
    else:
        return jsonify({'error': 'Uploaded file must be in DAT format.'})


if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=8000)
