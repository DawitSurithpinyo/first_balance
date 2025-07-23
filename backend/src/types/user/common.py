from datetime import datetime

from pydantic import BaseModel, Field
from src.types.enum import loginChoice


class userData(BaseModel):
    userEmail: str
    userName: str
    userPictureLink: str | None
    token: str | None
    refreshToken: str | None
    tokenURI: str | None
    clientID: str | None
    grantedScopes: list[str] | str | None
    lastLoginChoice: loginChoice
    lastLoginTime: datetime = Field(default_factory=datetime.now().isoformat())
    # Default value for lastLoginTime is datetime.now().isoformat()
    # Either supply lastLoginTime=datetime.now().isoformat() when creating a userData object, or don't supply it at all