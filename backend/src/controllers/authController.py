from datetime import datetime

import pydantic
from flask import jsonify, request
from flask_classful import FlaskView, route
from flask_cors import cross_origin
from src.types.auth.POST import googleLoginRequest
from src.types.error.AppError import AppError
from src.types.user.common import userData
from src.usecases.authUsecase import authUsecase


class authController(FlaskView):
    def __init__(self):
        self.authUsecase = authUsecase()
    
    @cross_origin(supports_credentials=True)
    @route("/googleLogin", methods=['POST'])
    def googleLogin(self):
        try:
            data = googleLoginRequest( **request.get_json() )
            if(data.code is None or data.state is None):
                raise AppError(
                    message="Missing code or state for Google login.",
                    statusCode=400
                )

            # loginResult: userData = self.authUsecase.googleLogin(data=data)
            loginResult = self.authUsecase.googleLogin(data=data)
            return jsonify({
                "success": True,
                "data": loginResult,
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