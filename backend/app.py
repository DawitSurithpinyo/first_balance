import datetime

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)
client = MongoClient("mongodb://localhost:27017/")
db = client["transactionsDB"]
collection = db["transactions"]

# when the transaction list page is loaded for the first time,
# or when data has been edited i.e., new record added,
# re-fetch records by loading them from the database
@app.route('/get_all_records', methods=['GET'])
def get_records():
    records = list(collection.find())
    for rec in records:
       rec["_id"] = str(rec["_id"])
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
      Date_obj = datetime.datetime.strptime(Date, "%d-%m-%Y")
    except ValueError:
      return jsonify({"error": "Invalid Date format. Expected DD-MM-YYYY"}), 400
    
    # Check whether record with the same data (all required fields are the same) already exist
    exist = False
    existing = collection.find()
    for entry in existing:
       if entry["TransactionName"] == TransactionName and entry["AccountID"] == AccountID and entry["Value"] == Value\
       and entry["Date"] == Date:
          exist = True
    
    if exist == True:
       return jsonify({"error": "Record already existed."}), 400
    
    new_record = {
       "TransactionName": TransactionName,
       "AccountID": AccountID,
       "Value": Value,
       "Date": Date, # No point to keep date as datetime object, "DD-MM-YYYY" is enough
       "Memo": Memo
    }

    result = collection.insert_one(new_record)
    return jsonify({"message": "Record added successfully"}), 201


# May add upDate and delete later

if __name__ == '__main__':
   # Test database
   if len(list(collection.find())) > 0:
      result = collection.delete_many({})
   t1 = {
      "TransactionName": "A",
      "AccountID": "01",
      "Value": -20,
      "Date": "20-10-2025",
      "Memo": "test1"
   }
   t2 = {
      "TransactionName": "B",
      "AccountID": "02",
      "Value": 50,
      "Date": "01-05-2025",
   }
   result = collection.insert_many([t1, t2])

   app.run(host='0.0.0.0', port=5000)