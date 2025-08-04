from datetime import datetime

from flask import after_this_request, jsonify, redirect, request, session
from flask_classful import FlaskView, route
from pydantic import ValidationError
from src.types.auth.POST import (googleLoginRequest, manualSignInRequest,
                                 manualSignUpRequest)
from src.types.error.AppError import AppError
from src.types.user.PATCH import userCredentials
from src.usecases.authUsecase import authUsecase


class authController(FlaskView):
    def __init__(self, useCase: authUsecase | None = None):
        if useCase is None:
            self.authUsecase = authUsecase()
        else:
            self.authUsecase = useCase
    
    @route("/googleLogin", methods=['POST'])
    def googleLogin(self):
        try:
            try:
                data = googleLoginRequest( **request.get_json() )
            except ValidationError as e:
                raise AppError(f'Invalid request body for api/auth/googleLogin: {e}', 400)

            userCreds: userCredentials = self.authUsecase.googleLogin(data=data)

            # Set custom header for CSRF token
            @after_this_request
            def addCSRFTokenHeader(response):
                response.headers["X-CSRF-Token"] = session["CSRFToken"]
                return response
            
            return jsonify({
                "success": True,
                "message": "Logged in via Google.",
                "data": userCreds.model_dump(),
                "timestamp": datetime.now().isoformat()
            }), 201
        
        except Exception as e:
            print(f"Error on googleLogin controller: {e}")
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now().isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on googleLogin controller: {e}",
                "timestamp": datetime.now().isoformat()
            }), 500
        
    @route("/getCredentials", methods=['GET'])
    def getCredentials(self):
        try:
            data, sessionDescription = self.authUsecase.retrieveCredentials()
            @after_this_request
            def addCSRFTokenHeader(response):
                response.headers["X-CSRF-Token"] = session["CSRFToken"]
                return response

            if sessionDescription == "newPreLogin":
                redirect('/')
                return jsonify({
                    "success": True,
                    "message": "Created a new pre-login session with a new CSRF token.",
                    "timestamp": datetime.now().isoformat()
                }), 201
            
            elif sessionDescription == "existingPreLogin":
                redirect('/')
                return jsonify({
                    "success": True,
                    "message": "Retrieved the CSRF token of existing pre-login session.",
                    "timestamp": datetime.now().isoformat()
                }), 200
            
            elif sessionDescription == "postLogin":
                redirect('/dashboard')
                return jsonify({
                    "success": True,
                    "message": "Retrieved the credentials of existing post-login session.",
                    "data": data.model_dump(),
                    "timestamp": datetime.now().isoformat()
                }), 200
            
        except Exception as e:
            print(f"Error on getCredentials controller: {e}")
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now().isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on getCredentials controller: {e}",
                "timestamp": datetime.now().isoformat()
            }), 500
        
    @route("/signIn", methods=['POST'])
    def signIn(self):
        try:
            try:
                data = manualSignInRequest( **request.get_json() )
            except ValidationError as e:
                raise AppError(f'Invalid request body for api/auth/signIn: {e}', 400)

            result: userCredentials = self.authUsecase.signIn(data=data)
            @after_this_request
            def addCSRFTokenHeader(response):
                response.headers["X-CSRF-Token"] = session["CSRFToken"]
                return response
            
            return jsonify({
                "success": True,
                "message": "Signed in.",
                "data": result.model_dump(),
                "timestamp": datetime.now().isoformat()
            }), 201
        
        except Exception as e:
            print(f"Error on signIn controller: {e}")
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now().isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on signIn controller: {e}",
                "timestamp": datetime.now().isoformat()
            }), 500
    
    @route("/signUp", methods=['POST'])
    def signUp(self):
        try:
            try:
                data = manualSignUpRequest( **request.get_json() )
            except ValidationError as e:
                raise AppError(f'Invalid request body for api/auth/signUp: {e}', 400)
            
            result: userCredentials = self.authUsecase.signUp(data=data)
            return jsonify({
                "success": True,
                "message": "Signed up.",
                "data": result.model_dump(),
                "timestamp": datetime.now().isoformat()
            }), 201

        except Exception as e:
            print(f"Error on signUp controller: {e}")
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now().isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on signUp controller: {e}",
                "timestamp": datetime.now().isoformat()
            }), 500
        
    @route("/logout", methods=['POST'])
    def logout(self):
        try:
            self.authUsecase.logout()
            return jsonify({
                "success": True,
                "message": "Successfully logged out.",
                "timestamp": datetime.now().isoformat()
            }), 200
        except Exception as e:
            print(f"Error on logout controller: {e}")
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now().isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on logout controller: {e}",
                "timestamp": datetime.now().isoformat()
            }), 500