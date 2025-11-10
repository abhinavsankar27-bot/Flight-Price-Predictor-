from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

app = Flask(__name__)
CORS(app)

print("✅ Loading model...")
model = pickle.load(open("model.pkl", "rb"))
print("✅ Model loaded!")

@app.route("/")
def home():
    return "✅ Flight Price Prediction API is Running!"

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    airline = data["airline"]
    source = data["source"]
    destination = data["destination"]
    stops = int(data["stops"])
    day = int(data["day"])
    month = int(data["month"])

    input_data = np.array([[airline, source, destination, stops, day, month]])
    prediction = model.predict(input_data)[0]

    return jsonify({"predicted_price": float(prediction)})

if __name__ == "__main__":
    print("✅ Starting Flask server...")
    app.run(debug=True)
