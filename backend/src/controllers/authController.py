import traceback
from datetime import datetime, timezone

from flask import after_this_request, jsonify, redirect, request, session
from flask_classful import FlaskView, route
from pydantic import ValidationError
from src.types.auth.DELETE import deleteAccountRequest
from src.types.auth.POST import (activateAccountRequest, forgotPasswordRequest,
                                 googleLoginRequest, manualSignInRequest,
                                 manualSignUpRequest, resetPasswordRequest)
from src.types.error.AppError import AppError
from src.types.user.common import googleUser, normalUser
from src.usecases.authUsecase import authUsecase


class authController(FlaskView):
    def __init__(self, useCase: authUsecase):
        self.authUsecase = useCase
    
    @route("/googleLogin", methods=['POST'])
    def googleLogin(self):
        try:
            try:
                data = googleLoginRequest( **request.get_json() )
            except ValidationError as e:
                raise AppError(f'Invalid request body for api/auth/googleLogin: {e}', 400)

            userCreds: googleUser = self.authUsecase.googleLogin(data=data)

            # Set custom header for CSRF token
            @after_this_request
            def addCSRFTokenHeader(response):
                response.headers["X-CSRF-Token"] = session["CSRFToken"]
                return response
            
            return jsonify({
                "success": True,
                "message": "Logged in via Google.",
                "data": userCreds.model_dump(exclude_none=True),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 201
        
        except Exception as e:
            print(f"Error on authController.googleLogin: ")
            traceback.print_exc()
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on authController.googleLogin: {e}",
                "timestamp": datetime.now(timezone.utc).isoformat()
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
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }), 201
            
            elif sessionDescription == "existingPreLogin":
                redirect('/')
                return jsonify({
                    "success": True,
                    "message": "Retrieved the CSRF token of existing pre-login session.",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }), 302
            
            elif sessionDescription == "postLogin":
                redirect('/dashboard')
                return jsonify({
                    "success": True,
                    "message": "Retrieved the credentials of existing post-login session.",
                    "data": data.model_dump(exclude_none=True),
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }), 302
            
        except Exception as e:
            print(f"Error on authController.getCredentials: ")
            traceback.print_exc()
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on authController.getCredentials: {e}",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 500
        
    @route("/signIn", methods=['POST'])
    def signIn(self):
        try:
            try:
                data = manualSignInRequest( **request.get_json() )
            except ValidationError as e:
                raise AppError(f'Invalid request body for api/auth/signIn: {e}', 400)

            result: normalUser = self.authUsecase.signIn(data=data)
            @after_this_request
            def addCSRFTokenHeader(response):
                response.headers["X-CSRF-Token"] = session["CSRFToken"]
                return response
            
            return jsonify({
                "success": True,
                "message": "Signed in.",
                "data": result.model_dump(exclude_none=True),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 201
        
        except Exception as e:
            print("Error on authController.signIn controller: ")
            traceback.print_exc()
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on authController.signIn: {e}",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 500
    
    @route("/signUp", methods=['POST'])
    def signUp(self):
        try:
            try:
                data = manualSignUpRequest( **request.get_json() )
            except ValidationError as e:
                raise AppError(f'Invalid request body for api/auth/signUp: {e}', 400)
            
            token: str = self.authUsecase.signUp(data=data)
            return jsonify({
                "success": True,
                "message": "Signed up with the following account activation token and an activation email sent to client.",
                "data": token,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 201

        except Exception as e:
            print("Error on authController.signUp: ")
            traceback.print_exc()
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on authController.signUp: {e}",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 500

    @route("/activateAccount", methods=['POST']) 
    def activateAccount(self):
        try:
            token = request.args.get('token', default=None, type=str)
            if token is None:
                raise AppError('Expect "token" parameter on URL query string.', 400)
            
            result: normalUser = self.authUsecase.activateAccount(token=token)
            return jsonify({
                "success": True,
                "message": "Account activated.",
                "data": result.model_dump(exclude_none=True),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 201
        
        except Exception as e:
            print("Error on authController.activateAccount: ")
            traceback.print_exc()
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on authController.activateAccount: {e}",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 500
        
    @route("/requestForgotPassword", methods=['POST'])
    def requestForgotPassword(self):
        try:
            try:
                data = forgotPasswordRequest( **request.get_json() )
            except ValidationError as e:
                raise AppError(f"Invalid request body for api/auth/requestForgotPassword: {e}", 400)
            
            token: str = self.authUsecase.requestForgotPassword(data=data)
            return jsonify({
                "success": True,
                "message": "Request to reset password activated with the following token.",
                "data": token,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 201
        
        except Exception as e:
            print("Error on authController.requestForgotPassword: ")
            traceback.print_exc()
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on authController.requestForgotPassword: {e}",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 500 
        
    @route("/resetPassword", methods=['POST'])
    def resetPassword(self):
        try:
            try:
                data = resetPasswordRequest( **request.get_json() )
            except ValidationError as e:
                raise AppError(f"Invalid request body for api/auth/resetPassword: {e}", 400)
            
            token = request.args.get("token", default = None, type = str)
            if token is None:
                raise AppError('Expect "token" parameter on the URL query string.', 400)
            
            result: normalUser = self.authUsecase.resetPassword(data=data, token=token)
            return jsonify({
                "success": True,
                "message": "Password reset.",
                "data": result.model_dump(exclude_none=True),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 201

        except Exception as e:
            print("Error on authController.resetPassword: ")
            traceback.print_exc()
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on authController.resetPassword: {e}",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 500 
        
    @route("/logout", methods=['POST'])
    def logout(self):
        try:
            self.authUsecase.logout()
            return jsonify({
                "success": True,
                "message": "Logged out.",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 200
        
        except Exception as e:
            print("Error on authController.logout: ")
            traceback.print_exc()
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on authController.logout: {e}",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 500
    
    @route("/deleteAccount", methods=['DELETE'])
    def deleteAccount(self):
        try:
            try:
                data = deleteAccountRequest( **request.get_json() )
            except ValidationError as e:
                raise AppError(f'Invalid request body for api/auth/deleteAccount: {e}', 400)
            
            result: normalUser = self.authUsecase.deleteAccount(userID=data.userID)
            # redirect("/")
            return jsonify({
                "success": True,
                "message": "The following account is deleted.",
                "data": result.model_dump(exclude_none=True),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 200

        except Exception as e:
            print("Error on authController.deleteAccount: ")
            traceback.print_exc()
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on authController.deleteAccount: {e}",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 500