import os
from flask import Flask, request, jsonify  # Importing request module
import networkx as nx
from io import StringIO
import json
import random

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

def generate_color():
    """Generate a random color in hex format."""
    return "#{:06x}".format(random.randint(0, 0xFFFFFF))

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
    communities_list = create_communities(converted_data)

    # Create a mapping from node id to its color and community id for each time
    node_to_community = {}
    for entry in communities_list:
        time = entry['time']
        for i, community_data in enumerate(entry['communities']):
            color = community_data['color']
            community = community_data['community']
            for node_id in community:
                node_to_community[node_id] = {'time': time, 'community': i, 'color': color}

    # Assign community information and colors to nodes
    for node in nodes:
        node_info = node_to_community.get(int(node['id']), {'community': -1, 'color': 'rgb(220, 220, 220)'})
        node['community'] = node_info['community']
        node['color'] = node_info['color']

    categorized_communities = categorize_communities(communities_list)

    data_to_return = {'nodes': nodes, 'links': links, 'times': sorted(list(times)), 'communities': categorized_communities,
        'communities_raw': communities_list}

    print(data_to_return)

    return data_to_return

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
    color_map = {}  # To keep track of assigned colors per community

    for time_data in data:
        time = time_data['time']
        nodes = time_data['nodes']
        
        G = nx.Graph()
        for node_pair in nodes:
            G.add_nodes_from(node_pair)
            G.add_edge(*node_pair)
        
        communities = nx.community.louvain_communities(G, seed=123)
        
        community_colors = []
        for community in communities:
            community_tuple = tuple(sorted(community))
            if community_tuple not in color_map:
                color_map[community_tuple] = generate_color()
            color = color_map[community_tuple]
            
            community_colors.append({"community": list(community), "color": color})
        
        com_data.append({"time": time, "communities": community_colors})
    
    return com_data



def categorize_communities(dataset):
    """
    Categorize communities in the dataset based on size distribution.

    Args:
        dataset (list): A dataset containing communities.

    Returns:
        list: Resulting dataset with column headers and categorized community counts.
    """
    data = []
    for entry in dataset:
        time = entry['time']
        communities = entry['communities']

        # Initialize counters for categories A, B, and C
        counts = {'A': 0, 'B': 0, 'C': 0}

        # Categorize communities based on size distribution
        for community in communities:
            size = len(community)
            if size < 3:
                counts['A'] += 1
            elif size < 6:
                counts['B'] += 1
            else:
                counts['C'] += 1

        # Calculate total number of communities
        total_communities = len(communities)

        # Append the row to data1
        data.append([time, counts['A'], counts['B'], counts['C'], total_communities])

    return data


def set_encoder(obj):
    if isinstance(obj, set):
        return list(obj)
    raise TypeError("Object of type {} is not JSON serializable".format(type(obj)))


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
