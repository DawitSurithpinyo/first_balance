from flask import Blueprint, jsonify
from flask_cors import cross_origin
from src.controllers.test import hello

test_bp = Blueprint('test', __name__, url_prefix='/api/test')

@test_bp.route('/test_hello', methods=['GET'])
@cross_origin(supports_credentials=True)
def test_hello():
    return hello()