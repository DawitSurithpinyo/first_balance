import math
from datetime import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS
# we do not have other web domains that need to interact with, so maybe CORS is not needed here?
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)
client = MongoClient("mongodb+srv://<db_username>:<db_password>@cluster0.cojpnwm.mongodb.net/")
db = client["transactionsDB"]
collection = db["transactions"]

# when the transaction list page is loaded for the first time,
# or when data has been edited i.e., new record added,
# re-fetch records by loading them from the database
@app.route('/get_all_records', methods=['GET'])
def get_records():
    records = list(collection.find())
    for record in records:
       record["_id"] = str(record["_id"])
    return jsonify({"all_records": records}), 200


@app.route('/add_record', methods=['POST'])
def add_record():
    data = request.get_json()

    TransactionName = data.get("TransactionName")
    AccountID = data.get("AccountID")
    Value = data.get("Value")
    Date = data.get("Date")
    Memo = data.get("Memo")

    # transaction name, account ID, Value, and Date are required
    if not TransactionName or not AccountID or not Value or not Date:
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
      Date_obj = datetime.strptime(Date, "%d-%m-%Y")
    except ValueError:
      return jsonify({"error": "Invalid Date format. Expected DD-MM-YYYY"}), 400
    
    # Check whether record with the same data (all required fields are the same) already exist
    existing = collection.find_one({
      "TransactionName": TransactionName,
      "AccountID": AccountID,
      "Value": Value,
      "Date": Date
    })
    if existing:
      return jsonify({"error": "Record already exists"}), 400
    
    new_record = {
       "TransactionName": TransactionName,
       "AccountID": AccountID,
       "Value": Value,
       "Date": Date, # No point to keep date as datetime object, "DD-MM-YYYY" is enough
       "Memo": Memo
    }

    result = collection.insert_one(new_record)
    return jsonify({"message": "Record added successfully"}), 201


@app.route('/delete_one', methods=['DELETE'])
def delete_one():
   data = request.get_json()
   TransactionName = data.get("TransactionName")
   AccountID = data.get("AccountID")
   Value = data.get("Value")
   Date = data.get("Date")
   Memo = data.get("Memo")

   result = collection.delete_one({
      "TransactionName": TransactionName,
      "AccountID": AccountID,
      "Value": Value,
      "Date": Date,
      "Memo": Memo
   })

   return jsonify({"message": "Successfully deleted a transaction"}), 200


@app.route('/delete_many', methods=['DELETE'])
def delete_many():
   try:
      data = request.get_json()
      TNameFilter = data.get("TransactionName")
      AccountIDFilter = data.get("AccountID")
      minValueFilter = data.get("MinValue")
      maxValueFilter = data.get("MaxValue")
      startDateFilter = data.get("StartDate")
      endDateFilter = data.get("EndDate")
      MemoFilter = data.get("Memo")

      # For string fields, if user gave "" as filter, then
      # match documents with any value for those fields for deletion

      # For any type of fields, if want to match any values,
      # use { "$exists": True }, not {}. If we use {}, MongoDB will only
      # match documents where that field is an empty object.

      valueQuery = {}
      if minValueFilter is None or math.isnan(minValueFilter):
         valueQuery = { "$lte": maxValueFilter }
      elif maxValueFilter is None or math.isnan(maxValueFilter):
         valueQuery = { "$gte": minValueFilter }
      else: # both not None
         valueQuery = { "$gte": minValueFilter, "$lte": maxValueFilter }
      if minValueFilter is None or math.isnan(minValueFilter) \
         and maxValueFilter is None or math.isnan(maxValueFilter):
         valueQuery = { "$exists": True }

      # date handling
      def _to_ISO_format(date_str):
         # expect "DD-MM-YYYY" input
         try:
            return datetime.strptime(date_str, "%d-%m-%Y").strftime("%Y-%m-%d")
         except ValueError:
            return date_str  # Fallback if already formatted
      
      def _to_DD_MM_YYYY(date_str):
         try:
            return datetime.strptime(date_str, "%Y-%m-%d").strftime("%d-%m-%Y")
         except ValueError:
            return date_str
      
      # change documents dates to "YYYY-MM-DD"
      for rec in collection.find({}):
         rec["Date"] = _to_ISO_format(rec["Date"])
         collection.update_one({"_id": rec["_id"]}, {"$set": {"Date": rec["Date"]}})

      # And change the filter too
      dateQuery = {}
      if startDateFilter is not None:
         dateQuery["$gte"] = _to_ISO_format(startDateFilter)
      if endDateFilter is not None:
         dateQuery["$lte"] = _to_ISO_format(endDateFilter)
      if len(dateQuery) == 0: # both None
         dateQuery = { "$exists": True }


      query = {
         "TransactionName": {"$regex": TNameFilter, "$options": "i"},
         "AccountID": {"$regex": AccountIDFilter, "$options": "i"},
         "Value": valueQuery,
         "Date": dateQuery,
         "Memo": {"$regex": MemoFilter, "$options": "i"}
      }
      result = collection.delete_many(query)

      # Finally, convert date of remaining documents back to "DD-MM-YYYY"
      try:
         all_remaining = collection.find({})
         for rec in all_remaining:
            rec["Date"] = _to_DD_MM_YYYY(rec["Date"])
            collection.update_one({"_id": rec["_id"]}, {"$set": {"Date": rec["Date"]}})
      except Exception:
         pass
   
   except Exception as e:
      app.logger.error(f"Delete many failed: {str(e)}")
      return jsonify({"error": str(e)}), 500

   return jsonify({"message": f"Successfully deleted {result.deleted_count} matched transactions"}), 200


@app.route('/update_one', methods=['PATCH'])
def update_one():
   data = request.get_json()

   # Format of incoming data:
   # {
   #    "original": {"TransactionName": ..., "AccountID"...},
   #    "newData": {"TransactionName": ..., "AccountID"...}
   # }
   original = data.get("original", {})
   new = data.get("newData", {})

   originalTransactionName = original.get("TransactionName")
   originalAccountID = original.get("AccountID")
   originalValue = original.get("Value")
   originalDate = original.get("Date")
   originalMemo = original.get("Memo")

   newTransactionName = new.get("TransactionName")
   newAccountID = new.get("AccountID")
   newValue = new.get("Value")
   newDate = new.get("Date")
   newMemo = new.get("Memo")

   result = collection.update_one(
      {
         "TransactionName": originalTransactionName,
         "AccountID": originalAccountID,
         "Value": originalValue,
         "Date": originalDate,
         "Memo": originalMemo
      },
      { "$set": {
         "TransactionName": newTransactionName,
         "AccountID": newAccountID,
         "Value": newValue,
         "Date": newDate,
         "Memo": newMemo
      }}
   )

   return jsonify({"message": "Successfully updated a transaction"}), 200



if __name__ == '__main__':
   app.run(host='0.0.0.0', port=5000)