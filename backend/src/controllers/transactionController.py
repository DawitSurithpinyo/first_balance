import traceback
from datetime import datetime, timezone

from flask import jsonify, request
from flask_classful import FlaskView, route
from pydantic import ValidationError
from src.types.error.AppError import AppError
from src.types.transaction.DELETE import (deleteManyTransactionsRequest,
                                          deleteOneTransactionRequest)
from src.types.transaction.PATCH import partialTransaction
from src.types.transaction.POST import newTransactionData
from src.usecases.transactionUsecase import transactionUsecase


class transactionController(FlaskView):
    def __init__(self, useCase: transactionUsecase):
        self.transactionUsecase = useCase

    @route("/get", methods=['GET'])
    def getAllTransactions(self):
        try:
            transactions: list | None = self.transactionUsecase.getTransactions()
            if transactions is None:
                return jsonify({
                    "success": True,
                    "message": "User's transactions data is up to date, no re-fetching is needed.",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }), 302

            return jsonify({
                "success": True,
                "message": "Retrieved user's data.",
                "data": transactions,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 200
        except Exception as e:
            print("Error on transactionController.getAllTransactions: ")
            traceback.print_exc()
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on transactionController.getAllTransactions: {e}",
                "timestamp": datetime.now(timezone.utc).isoformat()
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
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 201
        
        except Exception as e:
            print("Error on transactionController.addTransaction: ")
            traceback.print_exc()
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on transactionController.addTransaction: {e}",
                "timestamp": datetime.now(timezone.utc).isoformat()
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
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 200
        
        except Exception as e:
            print("Error on transactionController.deleteOne: ")
            traceback.print_exc()
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on transactionController.deleteOne: {e}",
                "timestamp": datetime.now(timezone.utc).isoformat()
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
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 200
        except Exception as e:
            print("Error on transactionController.deleteMany: ")
            traceback.print_exc()
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on transactionController.deleteMany: {e}",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 500      
        
    @route("/update", methods=['PATCH']) 
    def update(self):
        try:
            try:
                data = partialTransaction( **request.get_json() )
            except ValidationError as e:
                raise AppError(f'Invalid request body for api/transaction/update: {e}', 400)
            
            updated = self.transactionUsecase.updateTransaction(transaction=data)
            if not updated:
                return jsonify({
                    "success": True,
                    "message": "Only transactionID is provided, no update is made.",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }), 200
            return jsonify({
                "success": True,
                "message": "Updated a transaction.",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 200
        
        except Exception as e:
            print("Error on transactionController.update: ")
            traceback.print_exc()
            if isinstance(e, AppError):
                return jsonify({
                    "success": False,
                    "error": e.message,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }), e.statusCode
            return jsonify({
                "success": False,
                "error": f"Unexpected internal server error on transactionController.update: {e}",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }), 500    