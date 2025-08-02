from datetime import datetime

from flask import jsonify, request, session
from src.types.error.AppError import AppError
from src.utils.checkSessionType import checkSessionType

# some endpoints are public or handle credential checking on their own
whiteList = ['authController:getCredentials']

def authMiddleware():
    try:
        if request.endpoint is None:
            # if invalid API route, request.endpoint will be null
            raise AppError("API route not found.", 404)
        
        if request.endpoint in whiteList:
            # Automatically go to destination route if it's in whiteList
            return
        
        sessionType = checkSessionType(dict(session))
        if sessionType == "unknown":
            # Authenticated users should have server-side session
            # Even when they are not logged in yet, server should've established a pre-login session with login CSRF token already
            raise AppError("User is unauthenticated.", 401)

        if request.method not in ['GET', 'HEAD', 'OPTIONS']:
            # Check CSRF token for state-changing requests
            incomingCSRFToken = request.headers.get('X-CSRF-Token', type = str)
            sessionCSRFToken = session['CSRFToken']
            if incomingCSRFToken is None or sessionCSRFToken is None or incomingCSRFToken != sessionCSRFToken:
                raise AppError("Invalid CSRF token.", 401)
        
    except Exception as e:
        if isinstance(e, AppError):
            return jsonify({
                "success": False,
                "error": e.message,
                "datetime": datetime.now().isoformat()
            }), e.statusCode
        return jsonify({
            "success": False,
            "error": f"Unexpected internal server error on authMiddleware: {e}",
            "datetime": datetime.now().isoformat()
        }), 500