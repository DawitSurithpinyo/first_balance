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
      Date_obj = datetime.datetime.strptime(Date, "%d-%m-%Y")
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


# May add upDate and delete later

if __name__ == '__main__':
   app.run(host='0.0.0.0', port=5000)