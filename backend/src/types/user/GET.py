from pydantic import BaseModel


class getUserGoogleProfileResponse(BaseModel):
    email: str
    name: str
    pictureLink: str | None