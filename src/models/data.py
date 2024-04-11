import json


class DataModel:
    @staticmethod
    def get_bar_data():
        # Simulating data retrieval from a database or external source
        return [10, 20, 30, 40, 50]
    
    @staticmethod
    def get_line_data():
        # Simulating data retrieval from a database or external source
        return [10, 20, 30, 40, 50, 60, 30, 10]

    # Read data from text file
    def read_data_from_txt(filename):
        nodes = []
        links = []
        times = []

        with open(filename, 'r') as file:
            lines = file.readlines()

            for line in lines:
                source, target, time = map(int, line.strip().split())
                links.append({"source": source, "target": target, "time": time})

                if {"id": source} not in nodes:
                    nodes.append({"id": source})
                if {"id": target} not in nodes:
                    nodes.append({"id": target})

            return {"nodes": nodes, "links": links, "times": times}

