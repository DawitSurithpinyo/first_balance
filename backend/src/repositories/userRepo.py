from typing import Any, Literal

from bson.errors import InvalidId
from bson.objectid import ObjectId
from pymongo import MongoClient, ReturnDocument
from redis import Redis
from src.types.error.AppError import AppError


class userRepository:
    def __init__(self, 
                 mongo: MongoClient | None = None, 
                 redisSession: Redis | None = None,
                 redisCache: Redis | None = None):
        if mongo is None and redisSession is None and redisCache is None:
            from run import cache, mongoClient, sessionRedis
            self.mongoClient = mongoClient
            self.sessionRedis = sessionRedis
            self.cacheRedis = cache
        else:
            self.mongoClient = mongo
            self.sessionRedis = redisSession
            self.cacheRedis = redisCache

    def patchUserCredentials(
            self, 
            user, 
            email: str | None = None, 
            OID: ObjectId | str | None = None,
            projection: dict | None = None
        ) -> Any:
        """
            PATCH user credentials document. Supply either `email` or `OID` for finding which document to PATCH.
            .. Return either the whole patched document or its `"_id"` (user ID) as string, depending on `returnAs` argument.
            .. note:: INCOMING FIELDS IN `user` MUST BE DEFINED WITHIN `fullUserCredentials` TYPE.

            :param user: `dict` of class :class:`~src.types.user.PATCH.fullUserCredentials` or a subset of it. Equivalent to `Partial<fullUserCredentials>` if it was Typescript.
            :param email: user's email address.
            :param OID: user's ID created in MongoDB. Can be either `str` or `bson.objectid.ObjectId`.
            :param projection:
                - Optional. A dict to specify what fields to include or exclude. Return all fields if not specified.
                Will be passed directly to the `projection` argument of `collection.find_one_and_update()`.

                - NOTE: SHOULD supply fields belonging to `src.types.user.PATCH.fullUserCredentials` type.
        """
        db = self.mongoClient['userCredsDB']
        col = db['credsCollection']

        if email is None or email == "" and OID is None:
            raise AppError('Error from userRepo.patchUserCredentials: Need either email or OID for patching.', 400)
        if not isinstance(email, str) and ( not isinstance(OID, ObjectId) or not isinstance(OID, str) ):
            raise AppError('Error from userRepo.patchUserCredentials: email must be string, and OID must be either bson.objectid.ObjectId or string.', 400)
        
        if isinstance(OID, str):
            try:
                OID = ObjectId(OID)
            except InvalidId:
                raise AppError('Error from userRepo.patchUserCredentials: Invalid OID format.', 400)
            
        filterField: str = ""
        filterVal: str | ObjectId
        if email is None or email == "":
            filterVal = OID
            filterField = "_id"
        else:
            filterVal = email
            filterField = "userEmail"

        result = col.find_one_and_update(
            filter = {
                filterField: filterVal
            },
            update = {
                '$set': { **user }
            },
            upsert = True,
            return_document = ReturnDocument.AFTER,
            projection = projection
        )

        if result:
            result["userID"] = str(result.pop("_id"))
        
        return result
    
    def getUserCredentials(self, userID: str | None, userEmail: str | None, projection: dict | None = None) -> Any:
        """
            Get credentials of a user from database by their `userID` or `userEmail`.

            :param userID: User's ID as string. Must be in format of `bson.objectid.ObjectId`.
            :param userEmail:
            :param projection: 
                - Optional. A dict to specify what fields to include or exclude. Return all fields if not specified.
                Will be passed directly to the `projection` argument of `collection.find_one()`.

                - NOTE: SHOULD supply fields belonging to `src.types.user.PATCH.fullUserCredentials` type.
        """
        db = self.mongoClient['userCredsDB']
        col = db['credsCollection']

        if userEmail is None and userID is None:
            raise AppError('Error from userRepo.getUserCredentials: Both userID and userEmail are null, need one of them.', 400)

        filterField: str = ""
        filterVal: str | ObjectId = ""
        if userID is not None:
            filterField = "_id"
            try:
                filterVal = ObjectId(userID)
            except InvalidId:
                raise AppError('Error from userRepo.getUserCredentials: Invalid userID format.', 400)
        else:
            filterField = "userEmail"
            filterVal = userEmail

        result = col.find_one(
            filter = {
                filterField: filterVal
            },
            projection = projection
        )

        if result and hasattr(result, "_id"):
            result["userID"] = str(result.pop("_id"))
        
        return result