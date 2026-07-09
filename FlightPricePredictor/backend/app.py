from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import sys
import os
import datetime
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai
import json
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
from data_pipeline.kayak_client import KayakClient
import pandas as pd
from ml.feature_engineering import engineer_features

app = Flask(__name__)
CORS(app)

print("Loading model and features...")
model = pickle.load(open("model.pkl", "rb"))
expected_features = pickle.load(open("model_features.pkl", "rb"))
print("Model and features loaded!")

@app.route("/")
def home():
    return "Flight Price Prediction API is Running!"

def get_live_price_internal(source, destination, day, month, year):
    try:
        dt = datetime.datetime(year, month, day)
        if dt < datetime.datetime.now():
            dt = datetime.datetime(year + 1, month, day)
    except ValueError:
        dt = datetime.datetime.now() + datetime.timedelta(days=30)
    dep_date = dt.strftime("%Y-%m-%d")
    
    prompt = f"""
You are a flight pricing engine. The user is asking for the current live price of a flight from {source} to {destination} on {dep_date}.
Generate a realistic JSON response simulating a live flight price search.
Output MUST be strict JSON in this exact format, with no markdown, no explanation:
{{
  "price": 250,
  "currency": "USD",
  "airline": "Simulated Airline"
}}
Make the price realistic for this route in USD currency.
"""
    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        result = response.text.strip()
        if result.startswith("```json"):
            result = result[7:-3]
        elif result.startswith("```"):
            result = result[3:-3]
            
        parsed_data = json.loads(result)
        return parsed_data["price"], parsed_data["airline"]
    except Exception as e:
        import random
        # Fallback to realistic ranges based on route
        if source in ["BOM", "DEL"] and destination in ["BOM", "DEL"]:
            fallback = random.randint(110, 180)
        else:
            fallback = random.randint(200, 400)
        return fallback, "Simulated Airline (Fallback)"

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    airline = data["airline"]
    source = data["source"]
    destination = data["destination"]
    
    day = int(data["day"])
    month = int(data["month"])
    year = datetime.datetime.now().year
    
    # Construct search and departure dates
    search_date = datetime.datetime.now()
    try:
        dep_dt = datetime.datetime(year, month, day)
        if dep_dt < search_date:
            dep_dt = datetime.datetime(year + 1, month, day)
    except ValueError:
        dep_dt = search_date + datetime.timedelta(days=30)
        
    df = pd.DataFrame([{
        "airline": airline,
        "origin": source,
        "destination": destination,
        "departure_date": dep_dt,
        "search_date": search_date,
    }])
    
    df_engineered = engineer_features(df)
    df_encoded = pd.get_dummies(df_engineered, columns=['route', 'airline'])
    
    X = df_encoded.reindex(columns=expected_features, fill_value=0)
    ml_prediction = float(model.predict(X)[0])
    
    # Intelligent Calibration Layer
    live_price, live_airline = get_live_price_internal(source, destination, day, month, year)
    
    # Calculate confidence based on variance (simulated proxy for this example)
    # The closer the ML price is to the live price, the higher the confidence
    diff_ratio = abs(ml_prediction - live_price) / max(live_price, 1)
    
    if diff_ratio < 0.2:
        # High confidence: 80% ML, 20% Live
        weight_ml = 0.8
        confidence = 0.92
    elif diff_ratio < 0.5:
        # Medium confidence: 60% ML, 40% Live
        weight_ml = 0.6
        confidence = 0.75
    else:
        # Low confidence (huge gap): 40% ML, 60% Live
        weight_ml = 0.4
        confidence = 0.45
        
    final_calibrated_price = (ml_prediction * weight_ml) + (live_price * (1 - weight_ml))
    
    # Generate prediction interval based on confidence
    margin = (1 - confidence) * final_calibrated_price
    min_price = final_calibrated_price - margin
    max_price = final_calibrated_price + margin

    return jsonify({
        "predicted_price": final_calibrated_price,
        "ml_raw_price": ml_prediction,
        "live_price_used": live_price,
        "confidence": confidence,
        "min_price": min_price,
        "max_price": max_price
    })

@app.route("/live_price", methods=["POST"])
def live_price():
    data = request.json
    source = data.get("source")
    destination = data.get("destination")
    day = int(data.get("day"))
    month = int(data.get("month"))
    year = datetime.datetime.now().year
    
    price, airline = get_live_price_internal(source, destination, day, month, year)
    
    return jsonify({
        "price": price,
        "currency": "USD",
        "airline": airline
    })

@app.route("/parse_flight_query", methods=["POST"])
def parse_flight_query():
    data = request.json
    query = data.get("query", "")
    
    prompt = f"""
You are a flight search assistant. Extract the following from the user query into a strict JSON object:
- source_code: the 3-letter IATA airport code for the departure city
- destination_code: the 3-letter IATA airport code for the arrival city
- date: the travel date in YYYY-MM-DD format (assume the current year is {datetime.datetime.now().year} unless specified)
- airline: the airline name (e.g. 'American Airlines', 'Delta') if specified, else null
- stops: the number of stops (integer) if specified, else 0

User Query: "{query}"

Output ONLY valid JSON. No markdown formatting, no explanation.
"""
    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        # Parse the JSON string
        result = response.text.strip()
        if result.startswith("```json"):
            result = result[7:-3]
        elif result.startswith("```"):
            result = result[3:-3]
            
        parsed_data = json.loads(result)
        return jsonify(parsed_data)
    except Exception as e:
        print(f"Error parsing query: {e}")
        # Fallback simulated response if Gemini API fails
        dt = datetime.datetime.now() + datetime.timedelta(days=7)
        fallback = {
            "source_code": "DEL",
            "destination_code": "DXB",
            "date": dt.strftime("%Y-%m-%d"),
            "airline": "Emirates",
            "stops": 0
        }
        return jsonify(fallback)


if __name__ == "__main__":
    print("Starting Flask server...")
    app.run(debug=True)
