from datetime import datetime

from flask import session
from flask_caching import Cache
from pydantic import ValidationError
from src.repositories.transactionRepo import transactionRepository
from src.types.auth.GET import sessionPostLogin
from src.types.error.AppError import AppError
from src.types.transaction.common import transactionData
from src.types.transaction.POST import newTransactionData
from src.utils.convertStrToOID import convertStrToObjectID


class transactionUsecase:
    def __init__(self, cacher: Cache | None = None):
        self.transactionRepo = transactionRepository()
        if cacher is None:
            from run import cache
            self.cache = cache
        else:
            self.cache = cacher

    def getTransactions(self) -> list[transactionData] | list[None]:
        try:
            userID = sessionPostLogin( **dict(session) ).userID
        except ValidationError as e:
            raise AppError(f'Error from transactionUsecase.getTransactions: Invalid session format, likely because user is not authenticated. Details: {e}', 401)
        
        transactions: list = self.transactionRepo.getTransactions(userID = userID)
        if transactions is not None and len(transactions) > 0:
            for transaction in transactions:
                transaction["transactionID"] = str(transaction.pop("_id"))
                transaction["date"] = datetime.strptime(transaction.pop("date"), "%Y-%m-%d").strftime("%d-%m-%Y")
                try:
                    transaction = transactionData( **transaction )
                    transaction = transaction.model_dump()
                except ValidationError as e:
                    raise AppError(f'Error from transactionUsecase.getTransactions: Invalid transaction document returned from transactionRepository.getTransactions. Details: {e}', 500)

        return transactions
    
    def addTransaction(self, data: newTransactionData) -> str:
        try:
            userID = sessionPostLogin( **dict(session) ).userID
        except ValidationError as e:
            raise AppError(f'Error from transactionUsecase.addTransaction: Invalid session format, likely because user is not authenticated. Details: {e}', 401)
        
        insertedID: str = self.transactionRepo.addTransaction(data=data, userID=userID, returnDocumentID=True)
        return insertedID
    
    def deleteOne(self, transactionID: str) -> None:
        try:
            userID = sessionPostLogin( **dict(session) ).userID
        except ValidationError as e:
            raise AppError(f'Error from transactionUsecase.deleteOne: Invalid session format, likely because user is not authenticated. Details: {e}', 401)
        
        transactionID = convertStrToObjectID(field=transactionID, fieldName='transactionID', originFuncName='transactionUsecase.deleteOne')
        self.transactionRepo.deleteOne(transactionID=transactionID, userID=userID)

    def deleteMany(self, transactionIDs: list[str]) -> int:
        try:
            userID = sessionPostLogin( **dict(session) ).userID
        except ValidationError as e:
            raise AppError(f'Error from transactionUsecase.deleteMany: Invalid session format, likely because user is not authenticated. Details: {e}', 401)
        
        IDs = [ convertStrToObjectID(field=id, fieldName="transactionID", 
                originFuncName="transactionUsecase.deleteMany") for id in transactionIDs ]
            
        numberDeleted: int = self.transactionRepo.deleteMany(transactionIDs=IDs, userID=userID, returnNumberDeleted=True)
        return numberDeleted