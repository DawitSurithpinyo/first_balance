import os

from dotenv import load_dotenv

load_dotenv()
class BaseConfig(object):
    DEBUG = False
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
        

class DevConfig(BaseConfig):
    DEBUG = True
    SECRET_KEY = os.getenv("DEV_FLASK_SECRET_KEY", "no flask secret key")

    # CACHE_TYPE = "RedisCache"
    # CACHE_REDIS_URL = os.getenv('DEV_CACHE_REDIS_URL', 'no cache Redis url')

    SESSION_TYPE = "redis"
    SESSION_COOKIE_NAME = "First_balance"
    SESSION_COOKIE_SECURE = False

    # Below are other custom configs that are not for the Flask app
    PORT = 5000 # for app.run()
    CORS_CONFIGS = {
        "origins": ['http://localhost:8081', 'http://localhost:5000'],
        "supports_credentials": True,
        "expose_headers": ["X-CSRF-Token"], # custom headers must be exposed so that front-end can receive them
        "allow_headers": ["X-CSRF-Token"]
    } # For CORS()

    MONGO_CONFIGS = {
        "host": os.getenv('DEV_DATABASE_URL', 'no MongoDB url'),
        "tz_aware": True
    }
    SESSION_REDIS_URL = os.getenv('DEV_SESSION_REDIS_URL', 'no session Redis url')