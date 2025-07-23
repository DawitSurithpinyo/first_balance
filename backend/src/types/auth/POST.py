from pydantic import BaseModel


class googleLoginRequest(BaseModel):
    code: str
    state: str