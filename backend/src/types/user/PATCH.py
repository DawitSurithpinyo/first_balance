from datetime import datetime

from bson.objectid import ObjectId
from pydantic import BaseModel, Field
from pydantic_mongo import PydanticObjectId


class userCredentials(BaseModel):
    userID: str # Object ID generated from MongoDB
    # I can enforce it to be exact type of ObjectID (PydanticObjectId/ObjectID), but it's headache in runtime, so just convert it to string.
    userEmail: str
    userName: str
    userPictureLink: str | None
    refreshToken: str | None
    grantedScopes: list[str] | str | None
    lastLoginTime: datetime = Field(default_factory=datetime.now().isoformat())
    # Default value for lastLoginTime is datetime.now().isoformat()
    # Either supply lastLoginTime=datetime.now().isoformat() when creating a userData object, or don't supply it at all