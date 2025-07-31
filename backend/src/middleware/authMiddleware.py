from datetime import datetime

from flask import jsonify, request, session
from src.types.error.AppError import AppError

allowed = ['authController:googleLogin']
def authMiddleware():
    try:
        if request.endpoint is None:
            # if invalid API route, request.endpoint will be null
            raise AppError("API route not found.", 404)
        
        if request.endpoint in allowed:
            # Automatically go to destination route if it's not restricted
            return
        
        if session is None or 'userID' not in session.keys():
            # Authenticated users should have server-side session with userID
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