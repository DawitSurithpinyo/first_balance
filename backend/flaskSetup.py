import os
from datetime import datetime

import redis
from config.flaskConfig import Config
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_caching import Cache
from flask_cors import CORS
from flask_session import Session
from pymongo import MongoClient
from src.controllers.authController import authController
from src.middleware import authMiddleware


def createApp(test_config=None) -> Flask:
    try:
        load_dotenv()
        app = Flask(__name__)
        if test_config is not None:
            if issubclass(type(test_config), Config):
                app.config.from_object(test_config)
            elif isinstance(test_config, dict):
                app.config.update(test_config)
            else:
                app.config.from_envvar(test_config)

        Cache(app)
        redisClient = redis.Redis(host=os.getenv('REDIS_HOST', 'no host'), 
                                        port=os.getenv('REDIS_PORT', 'no port'), 
                                        password=os.getenv('REDIS_PASSWORD', 'no password'))
        app.config['SESSION_REDIS'] = redisClient
        app.redis = redisClient # For Redis client accessing in other files
        Session(app)

        CORS(app, origins=['http://localhost:8081', 'http://localhost:5000'], 
            supports_credentials=True, expose_headers=["Set-Cookie"])
        
        mongo = MongoClient(os.getenv('DATABASE_URL', 'no mongoDB url'))
        app.mongo = mongo # For MongoDB client accessing in other files
        
        with app.app_context():
            __initMiddlewares(app)
            __initViews(app)
            app.run(port=5000)
        return app
        
    except Exception as e:
        print(f"Error while setting up server configs: {e}")
        return jsonify({
            "success": False,
            "error": f"Internal server error on initiating server config: {e}",
            "timestamp": datetime.now().isoformat()
        }), 500
    

def __initMiddlewares(app: Flask) -> None:
    app.before_request(authMiddleware.authMiddleware)

def __initViews(app: Flask) -> None:
    URL_PREFIX: str = '/api'
    authController.register(app, route_base='/auth', route_prefix=URL_PREFIX)