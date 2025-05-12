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


# When adding a new record, frontend just need to input date in format "DD-MM-YYYY",
# then it will convert to datetime object here
@app.route('/add_record', methods=['POST'])
def add_record():
    data = request.get_json()

    transactionName = data.get("transactionName")
    accountID = data.get("accountID")
    value = data.get("value")
    date = data.get("date")
    memo = data.get("memo")

    # transaction name, account ID, value, and date are required
    if not transactionName or not accountID or not value or not date:
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
      date_obj = datetime.datetime.strptime(date, "%d-%m-%Y")
    except ValueError:
      return jsonify({"error": "Invalid date format. Expected DD-MM-YYYY"}), 400
    
    # Check whether record with the same data (all required fields are the same) already exist
    exist = False
    existing = collection.find()
    for entry in existing:
       if entry["transactionName"] == transactionName and entry["accountID"] == accountID and entry["value"] == value\
       and entry["date"] == date_obj:
          exist = True
    
    if exist == True:
       return jsonify({"error": "Record already existed."}), 400
    
    new_record = {
       "transactionName": transactionName,
       "accountID": accountID,
       "value": value,
       "date": date_obj,
       "memo": memo
    }

    result = collection.insert_one(new_record)
    return jsonify({"message": "Record added successfully"}), 201


# May add update and delete later

if __name__ == '__main__':
    app.run(port=5000)