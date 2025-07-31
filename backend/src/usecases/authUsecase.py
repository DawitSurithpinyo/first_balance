import secrets
from datetime import datetime

import google_auth_oauthlib.flow
from config.googleOAuthConfig import (DEV_CLIENT_SECRETS_FILE,
                                      DEV_REDIRECT_URI, SCOPES)
from flask import session
from googleapiclient.discovery import build
from pydantic import ValidationError
from redis import Redis
from src.repositories.userRepo import userRepository
from src.types.auth.POST import googleLoginRequest
from src.types.error.AppError import AppError
from src.types.user.PATCH import userCredentials


class authUsecase:
    def __init__(self, 
                 redisSession: Redis | None = None,
                 userRep: userRepository | None = None):
        from run import sessionRedis
        self.userRepo = userRepository()
        self.redisSession = sessionRedis

        if redisSession is not None:
            self.redisSession = redisSession
        if userRep is not None:
            self.userRepo = userRep

    def googleLogin(self, data: googleLoginRequest) -> userCredentials:
        # try:
        state = secrets.token_urlsafe(128)
        flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
            DEV_CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            state=state
        )
        flow.redirect_uri = 'postmessage'
        # flow.redirect_uri = DEV_REDIRECT_URI

        # Exchange authorization code for refresh and access tokens
        flow.fetch_token(code=data.code)
        flowCreds = flow.credentials

        # Extract user's Google profile info
        userInfoService = build(serviceName='oauth2', version='v2', credentials=flowCreds)
        userInfo = userInfoService.userinfo().get().execute()

        user = {
            "userEmail": userInfo['email'],
            "userName": userInfo['name'],
            "userPictureLink": userInfo['picture'],
            "refreshToken": flowCreds.refresh_token,
            "grantedScopes": flowCreds.granted_scopes,
            "lastLoginTime": datetime.now().isoformat()
        }
        try:
            result = userCredentials( **self.userRepo.patchUserCredentials(user, email = userInfo['email'], returnAs = "whole") )
        except ValidationError as e:
            raise AppError(f'Error from authUsecase.googleLogin: Invalid userRepo.patchUserCredentials return data. Details: {e}', 400)

        # Keep necessary information in server-side session
        csrfToken = secrets.token_urlsafe(128)
        session.update( **{
            "userID": result.userID,
            "token": flowCreds.token,
            "refreshToken": flowCreds.refresh_token,
            "CSRFToken": csrfToken
        } )

        return result

        # except Exception as e:
        #     print(f"Error from authUsecase.googleLogin: {e}")

    def logout(self) -> None:
        # How to delete session of specific user?
        # self.redisSession.delete()
        # Hm, no. We don't need to do the above. 
        # I think flask_session itself will manually delete session in the DB once it expires.
        # Which I think the default age for session is 31 days.
        session.clear()
