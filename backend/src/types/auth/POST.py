from pydantic import BaseModel


class googleLoginRequest(BaseModel):
    code: str

class manualSignInRequest(BaseModel):
    userEmail: str
    password: str

class manualSignUpRequest(BaseModel):
    userEmail: str
    userName: str
    password: str