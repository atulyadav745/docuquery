#!/bin/bash
set -o errexit

# Install system dependencies
apt-get update
apt-get install -y python3-dev

# Upgrade pip
pip install --upgrade pip

# Install numpy and scipy first
pip install numpy==1.24.3
pip install scipy==1.11.3

# Install the rest of the requirements
pip install -r backend/requirements.txt

# Make the start script executable
chmod +x start.sh 