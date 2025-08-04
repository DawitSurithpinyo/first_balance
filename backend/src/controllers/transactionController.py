from datetime import datetime
from types.error.AppError import AppError

from flask import jsonify, request
from flask_classful import FlaskView, route
from pydantic import ValidationError
from src.types.transaction.common import transactionData
from src.types.transaction.DELETE import (deleteManyTransactionsRequest,
                                          deleteOneTransactionRequest)
from src.types.transaction.POST import newTransactionData
from src.usecases.transactionUsecase import transactionUsecase


class transactionController(FlaskView):
    def __init__(self, useCase: transactionUsecase | None = None):
        if useCase is None:
            self.transactionUsecase = transactionUsecase()
        else:
            self.transactionUsecase = useCase

    @route("/get", methods=['GET'])
    def getAllTransactions(self):
        try:
            transactions: list = self.transactionUsecase.getTransactions()

            return jsonify({
                "success": True,
                "message": "Retrieved user's data.",
                "data": transactions,
                "timestamp": datetime.now().isoformat()
            }), 200
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
        
    @route("/add", methods=['POST'])
    def addTransaction(self):
        try:
            try:
                data = newTransactionData( **request.get_json() )
            except ValidationError as e:
                raise AppError(f'Invalid request body for api/transaction/add: {e}', 400)
            
            insertedID: str = self.transactionUsecase.addTransaction(data=data)
            return jsonify({
                "success": True,
                "message": f"Inserted a transaction with ID {insertedID}.",
                "timestamp": datetime.now().isoformat()
            }), 201
        except Exception as e:
            print(f"Error on addTransaction controller: {e}")
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now().isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on addTransaction controller: {e}",
                "timestamp": datetime.now().isoformat()
            }), 500

    @route("/deleteOne", methods=['DELETE']) 
    def deleteOne(self):
        try:
            try:
                data = deleteOneTransactionRequest( **request.get_json() )
            except ValidationError as e:
                raise AppError(f'Invalid request body for api/transaction/deleteOne: {e}', 400)
            
            self.transactionUsecase.deleteOne(transactionID=data.transactionID)
            return jsonify({
                "success": True,
                "message": f"Deleted a transaction with object ID {data.transactionID}.",
                "timestamp": datetime.now().isoformat()
            }), 200
        except Exception as e:
            print(f"Error on deleteOne controller: {e}")
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now().isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on deleteOne controller: {e}",
                "timestamp": datetime.now().isoformat()
            }), 500
    
    @route("/deleteMany", methods=['DELETE']) 
    def deleteMany(self):
        try:
            try:
                data = deleteManyTransactionsRequest( **request.get_json() )
            except ValidationError as e:
                raise AppError(f'Invalid request body for api/transaction/deleteMany: {e}', 400)
            
            numberDeleted = self.transactionUsecase.deleteMany(transactionIDs=data.transactionIDsList)
            return jsonify({
                "success": True,
                "message": f"Deleted {numberDeleted} transactions.",
                "timestamp": datetime.now().isoformat()
            }), 200
        except Exception as e:
            print(f"Error on deleteMany controller: {e}")
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now().isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on deleteMany controller: {e}",
                "timestamp": datetime.now().isoformat()
            }), 500      
        
    @route("/update", methods=['PATCH']) 
    def update(self):
        try:
            try:
                data = transactionData( **request.get_json() )
            except ValidationError as e:
                raise AppError(f'Invalid request body for api/transaction/update: {e}', 400)
            
        except Exception as e:
            print(f"Error on update controller: {e}")
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now().isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on update controller: {e}",
                "timestamp": datetime.now().isoformat()
            }), 500    