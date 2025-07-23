from datetime import datetime

from flask import jsonify, request

allowed = ['authController:googleLogin', 'test.test_hello']
def authMiddleware():
    print(request.endpoint)
    if request.endpoint is None:
        # if invalid API route, request.endpoint will be null
        return jsonify({
            "success": False,
            "error": "API route not found.",
            "timestamp": datetime.now().isoformat()
        }), 404
    
    if request.endpoint in allowed:
        # Automatically go to destination route if it's not restricted
        return

    print("not supposed to be here")
    # TODO: implement jwt for normal login and check token here
    # For Google OAuth login, check token here too