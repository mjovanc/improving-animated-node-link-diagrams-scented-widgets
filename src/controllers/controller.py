from flask import render_template
from .. models.data import DataModel

class DataController:
    @staticmethod
    def render_bar_chart():        
        return render_template('bar-chart.html', data=[])
    
    @staticmethod
    def render_line_chart():        
        return render_template('line-chart.html', data=[])
    
    @staticmethod
    def render_about():
        return render_template('about.html', data=[])
    
    @staticmethod
    def render_nodelink():
        return render_template('node_link.html', data=[])

    @staticmethod
    def get_validated_bar_data():
        data = DataModel.get_bar_data()
        # Simple validation: Ensure data is not empty
        if not data:
            raise ValueError("Data is empty")

        return data
    
    @staticmethod
    def get_validated_line_data():
        data = DataModel.get_line_data()
        # Simple validation: Ensure data is not empty
        if not data:
            raise ValueError("Data is empty")

        return data
