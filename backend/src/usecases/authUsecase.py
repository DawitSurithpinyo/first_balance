import secrets
from datetime import datetime
from typing import Literal

import google_auth_oauthlib.flow
from argon2 import PasswordHasher, exceptions
from config.googleOAuthConfig import (DEV_CLIENT_SECRETS_FILE,
                                      DEV_REDIRECT_URI, SCOPES)
from flask import current_app, request, session
from flask_caching import Cache
from googleapiclient.discovery import build
from pydantic import ValidationError
from redis import Redis
from src.repositories.userRepo import userRepository
from src.types.auth.GET import sessionPostLogin, sessionPreLogin
from src.types.auth.POST import (googleLoginRequest, manualSignInRequest,
                                 manualSignUpRequest)
from src.types.error.AppError import AppError
from src.types.user.PATCH import fullUserCredentials, userCredentials
from src.utils.checkSessionType import checkSessionType


class authUsecase:
    def __init__(self, 
                 redisSession: Redis | None = None,
                 pwHasher: PasswordHasher | None = None,
                 cacher: Cache | None = None):
        self.userRepo = userRepository()
        if redisSession is None and pwHasher is None and cacher is None:
            from run import cache, passwordHasher, sessionRedis
            self.redisSession = sessionRedis
            self.cache = cache
            self.passwordHasher = passwordHasher
        else:
            self.redisSession = redisSession
            self.cache = cacher
            self.passwordHasher = pwHasher

    def googleLogin(self, data: googleLoginRequest) -> userCredentials:
        flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
            DEV_CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            state=request.headers.get('CSRFToken', type = str)
        )
        flow.redirect_uri = 'postmessage'

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
            "token": flowCreds.token,
            "refreshToken": flowCreds.refresh_token,
            "grantedScopes": flowCreds.granted_scopes,
            "lastLoginTime": datetime.now().isoformat()
        }
        try:
            result = userCredentials( **self.userRepo.patchUserCredentials(user, email = userInfo['email'], projection = {'hashedPassword': False}) )
        except ValidationError as e:
            raise AppError(f'Error from authUsecase.googleLogin: Invalid userRepo.patchUserCredentials return data. Details: {e}', 500)
        
        session.clear() # Clear pre-login session
        session.update( sessionPostLogin( **{
            "userID": result.userID,
            "CSRFToken": secrets.token_urlsafe(128)
        } ).model_dump() )
        current_app.session_interface.regenerate() # regenerate session ID

        return result

    def retrieveCredentials(self) -> \
        tuple[None, Literal["newPreLogin"]] | \
        tuple[None, Literal["existingPreLogin"]] | \
        tuple[userCredentials, Literal["postLogin"]]:

        sessionType = checkSessionType(dict(session))
        if sessionType == "unknown":
            # This is user's first time visiting, or their cookies and session has expired
            # They will need to log in
            data = sessionPreLogin( **{
                "CSRFToken": secrets.token_urlsafe(128)
            } )
            session.update(data.model_dump())
            return None, "newPreLogin"
        
        elif sessionType == "preLogin":
            # User is not authenticated yet, but already received the pre-login CSRFToken
            # This is for when user refreshes the page and lost in-memory CSRF token
            # So we will just send back the CSRF token via header
            return None, "existingPreLogin"
        
        elif sessionType == "postLogin":
            result: userCredentials = self.userRepo.getUserCredentials(
                userID = session['userID'],
                projection = {'hashedPassword': False}
            )
            return result, "postLogin"
        
        raise AppError('Error from authUsecase.retrieveCredentials: server session not valid.', 500)

    def signIn(self, data: manualSignInRequest) -> userCredentials:
        try:
            cred = fullUserCredentials( **self.userRepo.getUserCredentials(userEmail = data.userEmail) )
        except ValidationError as e:
            raise AppError(f'Error from authUsecase.signIn: Invalid userRepo.patchUserCredentials return data. Details: {e}', 500)
        
        if cred is None or cred.hashedPassword is None:
            raise AppError('Error from authUsecase.signIn: this user has never registered manually with a password before.', 400)
        
        try:
            self.passwordHasher.verify(cred.hashedPassword, data.password)
        except exceptions.VerifyMismatchError:
            raise AppError('Error from authUsecase.signIn: userName or password is incorrect.', 400)
        
        session.clear() # Clear pre-login session
        session.update( sessionPostLogin( **{
            "userID": cred.userID,
            "CSRFToken": secrets.token_urlsafe(128)
        } ).model_dump() )
        current_app.session_interface.regenerate() # regenerate session ID

        if self.passwordHasher.check_needs_rehash(cred.hashedPassword):
            newHash = self.passwordHasher.hash(data.password)
            try:
                result = userCredentials( **self.userRepo.patchUserCredentials(
                    user = {
                        'hashedPassword': newHash
                    },
                    OID = cred['userID'],
                    projection = {'hashedPassword': False}
                ) )
                return result
            except ValidationError as e:
                raise AppError(f'Error from authUsecase.signIn: Invalid userRepo.patchUserCredentials return data. Details: {e}', 500)

        del cred.hashedPassword
        try:
            result = userCredentials( **cred )
            return result
        except ValidationError as e:
            raise AppError(f'Error from authUsecase.signIn: Invalid return data. Details: {e}', 500)
        
    def signUp(self, data: manualSignUpRequest) -> userCredentials:
        exists = self.userRepo.getUserCredentials(
            userEmail = data.userEmail,
            projection = {'_id': True}
        )
        if exists is not None:
            raise AppError('Error from authUsecase.signUp: user with this email already exists.')
        
        hashcode = self.passwordHasher.hash(data.password)
        result = self.userRepo.patchUserCredentials(
            user = {
                'userEmail': data.userEmail,
                'userName': data.userName,
                'hashedPassword': hashcode
            },
            email = data.userEmail,
            projection = {'hashedPassword': False}
        )

        try:
            cred = userCredentials( **result )
        except ValidationError as e:
            raise AppError(f'Error from authUsecase.signUp: Invalid userRepo.patchUserCredentials return data. Details: {e}', 500)

        return cred
        
    def logout(self) -> None:
        key = f"session:{session.sid}"
        session.clear()
        self.redisSession.delete(key)
