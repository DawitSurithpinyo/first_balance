from datetime import datetime

from flask import after_this_request, jsonify, request, session
from flask_classful import FlaskView, route
from pydantic import ValidationError
from src.types.auth.POST import googleLoginRequest
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
                "message": "Successfully logged in via Google.",
                "data": userCreds.model_dump(),
                "timestamp": datetime.now().isoformat()
            }), 200
        
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