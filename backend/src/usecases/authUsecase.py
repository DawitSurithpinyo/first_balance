import os
from datetime import datetime

import google_auth_oauthlib.flow
import requests
from config.googleOAuthConfig import CLIENT_SECRETS_FILE, REDIRECT_URI, SCOPES
from flask import session
from src.types.auth.POST import googleLoginRequest
from src.types.enum import loginChoice
from src.types.error.AppError import AppError
from src.types.user.common import userData
from src.types.user.GET import getUserGoogleProfileResponse
from src.utils.getGoogleUserProfile import getUserGoogleProfile


class authUsecase:
    def __init__(self):
        pass

    def googleLogin(self, data:googleLoginRequest):
        try:
            flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
                CLIENT_SECRETS_FILE,
                scopes=SCOPES,
                state=data.state
            )
            # flow.redirect_uri = 'postmessage'
            flow.redirect_uri = REDIRECT_URI

            # Exchange code and state with token
            flow.fetch_token(code=data.code)
            flowCreds = flow.credentials

            print(flowCreds)
            return flowCreds

            # try:
            #     userProfile = getUserGoogleProfileResponse( **getUserGoogleProfile(token=flowCreds.token) )
            # except requests.exceptions.Timeout:
            #     raise AppError(message="Request for user's Google profile info timed out.", statusCode=408)
            
            # # Keep necessary information in session cache
            # session['credentials'] = {
            #     "token": flowCreds.token,
            #     "userEmail": userProfile.email,
            #     "userName": userProfile.name,
            #     "userPictureLink": userProfile.pictureLink
            # }

            # user = userData( **{
            #     "userEmail": userProfile.email,
            #     "userName": userProfile.name,
            #     "userPictureLink": userProfile.pictureLink,
            #     "token": flowCreds.token,
            #     "refreshToken": flowCreds.refresh_token,
            #     "tokenURI": flowCreds.token_uri,
            #     "clientID": flowCreds.client_id,
            #     "grantedScopes": flowCreds.granted_scopes,
            #     "lastLoginChoice": loginChoice.google,
            #     "lastLoginTime": datetime.now().isoformat() 
            # } )
            # return user

        except Exception as e:
            print(f"Error on googleLogin usecase: {e}")
            if isinstance(e, AppError):
                raise e
            raise AppError(
                message=f"Unexpected internal server error on googleLogin usecase: {e}",
                statusCode=500
            )
