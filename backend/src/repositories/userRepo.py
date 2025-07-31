from typing import Literal

from bson.errors import InvalidId
from bson.objectid import ObjectId
from pymongo import MongoClient, ReturnDocument
from redis import Redis
from src.types.error.AppError import AppError
from src.types.user.PATCH import userCredentials


class userRepository:
    """
        When initializing, either 
        
        - Don't supply any arguments, and it will use MongoDB and Redis for `Session` from `run.py`.
            - And use Redis instance internally created by app + `flask_caching`'s decorators for caching.
        - Or provide all three of them. May be useful for testing.
    """
    def __init__(self, 
                 mongo: MongoClient | None = None, 
                 redisSession: Redis | None = None,
                 redisCache: Redis | None = None):
        if mongo is None and redisSession is None and redisCache is None:
            from run import mongoClient, sessionRedis
            self.mongoClient = mongoClient
            self.sessionRedis = sessionRedis
            self.cacheRedis = None # use flask_caching's decorators
        else:
            self.mongoClient = mongo
            self.sessionRedis = redisSession
            self.cacheRedis = redisCache

    def patchUserCredentials(
            self, 
            user, 
            email: str | None = None, 
            OID: ObjectId | str | None = None,
            returnAs: Literal["whole"] | Literal["id"] | None = "id"
        ) -> userCredentials | str:
        """
            PATCH user credential document. Supply either `email` or `OID` for finding which document to PATCH.
            .. Return either the whole patched document or its `"_id"` (user ID) as string, depending on `returnAs` argument.
            .. note:: INCOMING FIELDS IN `user` MUST BE DEFINED WITHIN `userCredentials` TYPE.

            :param user: `dict` of class :class:`~src.types.user.PATCH.userCredentials` or a subset of it. Equivalent to `Partial<userCredentials>` if it was Typescript.
            :param email: user's email address.
            :param OID: user's ID created in MongoDB. Can be either `str` or `bson.objectid.ObjectId`.
            :param returnAs: Either `"whole"` or `"id"`. If `"whole"`, return the whole patched document from DB. If `"id"`, return only the user's ID (`_id`) as string. Default to `"id"`.
        """
        # try:
        client = self.mongoClient
        db = client['userCredsDB']
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

        if returnAs not in ["whole", "id"]:
            raise AppError("""Error from userRepo.patchUserCredentials: Invalid returnAs argument. ' \
            'Either supply with "whole" or "id", or don't, which defaults to "id".""", 400)
        
        proj: dict | None = None
        if returnAs is None or returnAs == "id":
            proj = { "_id": True }
        elif returnAs == "whole":
            proj = None

        result = col.find_one_and_update(
            filter = {
                filterField: filterVal
            },
            update = {
                '$set': { **user }
            },
            upsert = True,
            return_document = ReturnDocument.AFTER,
            projection = proj
        )

        if result:
            result["userID"] = str(result.pop("_id"))
        
        return result
        
        # except Exception as e:
        #     print(f'Error from userRepository.patchUserCredentials: {e}')