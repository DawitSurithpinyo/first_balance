from datetime import datetime

from pydantic import BaseModel, Field


class sessionPreLogin(BaseModel):
    CSRFToken: str

class sessionPostLogin(BaseModel):
    userID: str
    CSRFToken: str