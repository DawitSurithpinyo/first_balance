from datetime import datetime
from types.error.AppError import AppError

from flask import jsonify, request, session
from flask_classful import FlaskView, route
from flask_cors import cross_origin


class transactionController(FlaskView):
    def __init__(self):
        pass

    @cross_origin(supports_credentials=True)
    @route("/get", methods=['GET'])
    def getAllTransactions(self):
        try:
            pass
        except Exception as e:
            print(f"Error on getAllTransactions controller: {e}")
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now().isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on getAllTransactions controller: {e}",
                "timestamp": datetime.now().isoformat()
            }), 500