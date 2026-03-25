"""
Load the constants defined in .env file
"""

import os

from dotenv import load_dotenv

_ = load_dotenv()

GEMINI_KEY = os.getenv('GEMINI_KEY')
CDB_URL = os.getenv('CDC_URL')
QDRANT_HOST = os.getenv('QDRANT_HOST')
