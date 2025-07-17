from flaskConfigs.config import DevConfig
from flaskSetup import createApp

config = DevConfig()
app = createApp(config)
# For pointing directly to the app instance or using it