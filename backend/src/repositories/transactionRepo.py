from bson.objectid import ObjectId
from pymongo import MongoClient
from src.types.transaction.common import transactionData
from src.types.transaction.POST import newTransactionData


class transactionRepository:
    def __init__(self, mongo: MongoClient | None = None):
        if mongo is None:
            self.mongoClient = mongo
        else:
            from run import mongoClient
            self.mongoClient = mongoClient

        self.userDataDB = self.mongoClient['userDataDB']

    def getTransactions(self, userID: str) -> list[transactionData] | list[None]:
        col = self.userDataDB[f'{userID}']

        records = list( col.find() )
        return records
    
    def addTransaction(self, data: newTransactionData, userID: str, returnDocumentID: bool | None = False) -> str | None:
        col = self.userDataDB[f'{userID}']

        result = col.insert_one(data)
        if returnDocumentID:
            return str(result.inserted_id)
        
    def deleteOne(self, transactionID: ObjectId, userID: str) -> None:
        col = self.userDataDB[f'{userID}']

        result = col.delete_one(
            filter = {
                "_id": transactionID
            }
        )
        return
    
    def deleteMany(self, transactionIDs: list[ObjectId], userID: str, returnNumberDeleted: bool | None = False) -> int | None:
        """
            :param transactionIDs: A list of transaction IDs as string. Must be in `bson.objectid.ObjectId` format.
            :param userID: User ID as string.
            :param returnNumberDeleted: Optional. Whether to return the number of documents deleted. Default to `False`.
        """
        col = self.userDataDB[f'{userID}']

        result = col.delete_many(
            filter = {
                {"_id": {"$in": transactionIDs} }
            }
        )

        if returnNumberDeleted:
            return result.deleted_count
