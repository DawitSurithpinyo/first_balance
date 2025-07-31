from appSetup import createApp, initAppAddOns, initInfra
from config.flaskConfig import *

conf = DevConfig

# Initialize MongoDB and Redis for session before creating app to avoid circular import issues
sessionRedis, mongoClient = initInfra(conf)
app = createApp(conf)

# Set app.config['SESSION_REDIS'] before setting Session, CORS, and Cache
# to make sure Session point to the right Redis instance
app.config['SESSION_REDIS'] = sessionRedis
initAppAddOns(app, conf)


if __name__ == "__main__":
    app.run(port=conf.PORT)