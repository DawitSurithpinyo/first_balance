from datetime import datetime

from flask import abort, jsonify, request

allowed = ['auth.google_login', 'test.test_hello']
def authMiddleware():
    if request.endpoint is None:
        # if invalid API route, request.endpoint will be null
        return jsonify({
            "success": False,
            "error": "API route not found.",
            "timestamp": datetime.now().isoformat()
        }), 404
    
    if request.endpoint in allowed:
        # success cases -> return empty
        # It will automatically go to destination route
        return

    print("not supposed to be here")
    # TODO: implement jwt for normal login and check token here
    # For Google OAuth login, check token here too