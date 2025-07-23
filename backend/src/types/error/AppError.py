class AppError(Exception):
    def __init__(self, message:str, statusCode:int = 500):
        super().__init__(message)
        self.message = message
        self.statusCode = statusCode