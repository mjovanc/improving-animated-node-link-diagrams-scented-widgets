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
    data = []

    # Process each line in the text data
    for line in text_data.split('\n'):
        parts = line.split()
        if len(parts) == 3:  # Ensure each line contains three parts: node_origin, node_destiny, timestamp
            node_origin, node_destiny, timestamp = parts

            # populate data list
            data.append([int(node_origin), int(node_destiny), int(timestamp)])

            nodes.append({'id': node_origin, 'time': int(timestamp)})
            nodes.append({'id': node_destiny, 'time': int(timestamp)})
            links.append({'source': node_origin, 'target': node_destiny, 'time': int(timestamp)})
            times.add(int(timestamp))  # Convert timestamp to integer and add to times set

    converted_data = convert_data(data)
    #print(convert_data)
    communities_list = create_communities(converted_data)
    print(communities_list)

    communities_list = ""#[list(comm) for comm in communities]

    return {'nodes': nodes, 'links': links, 'times': sorted(list(times)), 'communities': communities_list}


def convert_data(data):
    new_data = []

    # Find unique time values from the original data
    unique_times = set(sublist[2] for sublist in data)

    # Iterate over unique time values
    for time in unique_times:
        # Initialize a dictionary for the current time
        time_dict = {'time': time, 'nodes': []}
        # Initialize a sublist for the nodes
        current_sublist = []
        # Iterate through original data to collect nodes for the current time
        for sublist in data:
            if sublist[2] == time:
                current_sublist.extend(sublist[:2])  # Append the first two elements of sublist
                # If the sublist has reached two nodes, append it to the 'nodes' list and reset
                if len(current_sublist) == 2:
                    time_dict['nodes'].append(current_sublist)
                    current_sublist = []
        # If there's any remaining node in the current_sublist, append it
        if current_sublist:
            time_dict['nodes'].append(current_sublist)
        # Append the time dictionary to the new data list
        new_data.append(time_dict)
    
    return new_data


def create_communities(data):
    com_data = []

    for time_data in data:
        time = time_data['time']
        nodes = time_data['nodes']
        
        # Instantiate a graph for the current time period
        G = nx.Graph()
        
        # Add nodes and edges to the graph based on the current time period data
        for node_pair in nodes:
            G.add_nodes_from(node_pair)
            G.add_edge(*node_pair)
        
        # Generate communities for the graph
        communities = nx.community.louvain_communities(G, seed=123)
        
        # Store the communities and time in the desired structure
        com_data.append({"time": time, "communities": [set(community) for community in communities]})
    
    return com_data


@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    if file.filename.endswith('.dat'):
        # Process the uploaded text file
        text_data = file.read().decode('utf-8')
        # Convert to JSON format
        json_data = convert_to_json(text_data)
        # print(json_data)
        return jsonify(json_data)
    else:
        return jsonify({'error': 'Uploaded file must be in DAT format.'})


if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=8000)
