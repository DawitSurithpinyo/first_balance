import os

from dotenv import load_dotenv

load_dotenv()
CLIENT_SECRETS_FILE = os.getenv('CLIENT_SECRETS_FILE', 'no file')
SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly', 
          'https://www.googleapis.com/auth/cloud-platform.read-only',
          'email', 'profile']
REDIRECT_URI = 'http://localhost:8081/dashboard'