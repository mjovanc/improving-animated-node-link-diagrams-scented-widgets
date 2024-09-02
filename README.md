# Improving Animated Node-Link Diagrams with Scented Widgets

## Installation guidelines

### Create, activate, and download dependencies with a virtual environment using venv

```bash
# Create a virtual environment named 'venv'
python -m venv venv

# Activate the virtual environment on Windows
venv\Scripts\activate

# Activate the virtual environment on macOS and Linux
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

## Run server 
```bash
python app.py
```

Now it should be running on `http://localhost:8000`. 

## Datasets

To be able to use this tool, you need to use datasets in the format of `X Y Z` following new line. X represents a node, Y represents a node and Z represents the time. X and Y therefor forms a relationship at that specific time. Data is represented with non-negative integers. 

### Donwload sample datasets

- Primary School Dataset - https://gist.github.com/mjovanc/a035bcab2ee12dad6cd359aa0d2023a5
- High School Dataset - https://gist.github.com/mjovanc/47a195246f5dfdc18df47286d282b6d2

