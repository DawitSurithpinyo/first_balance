from pydantic import ValidationError
from src.types.auth.GET import sessionPostLogin, sessionPreLogin


def checkSessionType(sessionDict: dict):
    try:
        sessionPreLogin.model_validate(sessionDict)
        return "preLogin"
    except ValidationError:
        pass

    try:
        sessionPostLogin.model_validate(sessionDict)
        return "postLogin"
    except ValidationError:
        pass

    return "unknown"