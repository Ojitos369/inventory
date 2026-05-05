import os
from pathlib import Path
import setproctitle
from ojitos369.errors import CatchErrors as CE

setproctitle.setproctitle('invhome-py')

# ----------------------   BASE   ----------------------
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MEDIA_DIR = os.path.join(BASE_DIR, 'media')
UPLOADS_DIR = os.path.join(MEDIA_DIR, 'uploads')
prod_mode = True if str(os.environ.get('RUN_PROD_MODE', True)).title() == 'True' else False
dev_mode = True if str(os.environ.get('RUN_DEV_MODE', False)).title() == 'True' else False

# ----------------------   CORS   ----------------------
origins = [
    "http://localhost:8373",
    "http://localhost:8374",
    "http://localhost:5173",
    "http://localhost:5174",
]
allow_origin_regex = r"https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|172\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+).*(:[0-9]+)?"
allow_origins = origins
allow_credentials = True
allow_methods = ["*"]
allow_headers = ["*"]

# ----------------------   EMAIL   ----------------------
port = os.environ.get('EMAIL_PORT', None)
email_settings = {
    'smtp_server': os.environ.get('EMAIL_HOST', None),
    'port': int(port) if port else None,
    'sender': os.environ.get('EMAIL_HOST_USER', None),
    'receiver': 'ojitos369@gmail.com',
    'user': os.environ.get('EMAIL_HOST_USER', None),
    'password': os.environ.get('EMAIL_HOST_PASSWORD', None),
}

# ----------------------   DB   ----------------------
db_data = {
    "host": os.environ.get('DB_HOST', 'localhost'),
    "user": os.environ.get('DB_USER', 'invhome'),
    "password": os.environ.get('DB_PASSWORD', 'invhome'),
    "dbname": os.environ.get('DB_NAME', 'invhome'),
    "port": int(os.environ.get('DB_PORT', 5442)),
}

# ----------------------   KIMI (Moonshot)   ----------------------
kimi_settings = {
    'api_key': os.environ.get('KIMI_API_KEY', ''),
    'api_base': os.environ.get('KIMI_API_BASE', 'https://api.moonshot.ai/v1'),
    'vision_model': os.environ.get('KIMI_VISION_MODEL', 'moonshot-v1-32k-vision-preview'),
    'text_model': os.environ.get('KIMI_TEXT_MODEL', 'moonshot-v1-32k'),
}

# ----------------------   SESSION   ----------------------
SESSION_COOKIE = "invhometka"

# ----------------------   ERROR   ----------------------
class MYE(Exception):
    pass

ce = CE(name_project='InvHome', email_settings=email_settings)
