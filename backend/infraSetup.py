# May need to migrate redis, Mongo, (potentially) postgresql infra setup
# to here in the future

from config.flaskConfig import *
from pymongo import MongoClient
from redis import Redis

if __name__ == "__main__":
    conf = DevConfig

    