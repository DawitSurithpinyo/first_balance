from datetime import datetime

from config.flaskConfig import *
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_caching import Cache
from flask_cors import CORS
from flask_session import Session
from pymongo import MongoClient
from redis import Redis
from src.controllers.authController import authController
from src.middleware import authMiddleware


def createApp(config) -> Flask:
    """
        Please supply config with any classes from `config/flaskConfig.py`, except `BaseConfig`.
    """
    try:
        load_dotenv()
        app = Flask(__name__)
        app.config.from_object(config)
        
        __initMiddlewares(app)
        __initViews(app)
        return app
        
    except Exception as e:
        print(f"Error while setting up server configs: {e}")
        with app.app_context():
            return jsonify({
                "success": False,
                "error": f"Internal server error on initiating server config: {e}",
                "timestamp": datetime.now().isoformat()
            }), 500


def initInfra(config) -> tuple[Redis, MongoClient]:
    """
        Set up MongoDB and Redis for `Session`. 

        Redis for `Cache` is already set internally in `createApp()` via `config.CACHE_REDIS_URL` and `config.CACHE_TYPE`.
        Use `flask_caching`'s decorators to perform caching.

        Please supply config with any classes from `config/flaskConfig.py`, except `BaseConfig`.
    """
    try:
        if not config.SESSION_REDIS_URL:
            raise ValueError("SESSION_REDIS_URL must be configured.")
        sessionRedis = Redis.from_url(config.SESSION_REDIS_URL)

        if not config.MONGO_URL:
            raise ValueError("MONGO_URL must be configured.")
        mongoClient = MongoClient(config.MONGO_URL)

    except Exception as e:
        print(f"Error while setting up MongoDB and Redis for Session: {e}")
        print(f"Timestamp: {datetime.now().isoformat()}")

    return sessionRedis, mongoClient


def initAppAddOns(app: Flask, config) -> None:
    """
        Add Session, CORS, and Cache.

        Please supply config with any classes from `config/flaskConfig.py`, except `BaseConfig`.
    """
    try:
        Cache(app)
        Session(app)
        if hasattr(config, 'CORS_CONFIGS'):
            CORS(app, **config.CORS_CONFIGS)
        else:
            CORS(app)
    
    except Exception as e:
        print(f"Error while setting up app Session, CORS, and Cache: {e}")
        with app.app_context():
            return jsonify({
                "success": False,
                "error": f"Internal server error on setting up app Session, CORS, and Cache: {e}",
                "timestamp": datetime.now().isoformat()
            }), 500


def __initMiddlewares(app: Flask) -> None:
    app.before_request(authMiddleware.authMiddleware)


def __initViews(app: Flask) -> None:
    URL_PREFIX: str = '/api'
    authController.register(app, route_base='/auth', route_prefix=URL_PREFIX)