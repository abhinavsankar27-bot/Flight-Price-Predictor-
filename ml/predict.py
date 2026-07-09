import os
import joblib
import pandas as pd
import datetime
from ml.feature_engineering import engineer_features

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

class FlightPricePredictor:
    def __init__(self):
        self.model = None
        self.feature_columns = None
        self._load_model()
        
    def _load_model(self):
        model_path = os.path.join(MODEL_DIR, 'price_model_xgb.pkl')
        features_path = os.path.join(MODEL_DIR, 'model_features.pkl')
        
        if os.path.exists(model_path) and os.path.exists(features_path):
            self.model = joblib.load(model_path)
            self.feature_columns = joblib.load(features_path)
        else:
            print("Warning: Model files not found. Run train_model.py first.")
            
    def predict_price(self, origin: str, destination: str, departure_date: str, search_date: str = None, airline: str = "DL") -> float:
        """
        Predicts the flight price for a specific route and date.
        """
        if not self.model:
            return None
            
        if not search_date:
            search_date = datetime.date.today().strftime("%Y-%m-%d")
            
        # Create a single-row dataframe for prediction
        df = pd.DataFrame([{
            'origin': origin,
            'destination': destination,
            'departure_date': departure_date,
            'search_date': search_date,
            'airline': airline
        }])
        
        # Engineer features
        df = engineer_features(df)
        
        # One-hot encode the same way as training
        df_encoded = pd.get_dummies(df, columns=['route', 'airline'])
        
        # Align columns with training data (fill missing with 0)
        X = pd.DataFrame(columns=self.feature_columns)
        for col in self.feature_columns:
            if col in df_encoded.columns:
                X[col] = df_encoded[col]
            else:
                X[col] = 0
                
        # Fill any NaNs that might have sneaked in
        X = X.fillna(0)
        
        # Predict
        price = self.model.predict(X)[0]
        return round(float(price), 2)
        
    def get_trend(self, origin: str, destination: str, start_date: str, days: int = 30) -> list:
        """
        Returns a list of predicted prices for the next N days.
        Useful for building the seasonal price trend chart.
        """
        if not self.model:
            return []
            
        base_date = pd.to_datetime(start_date)
        today = datetime.date.today().strftime("%Y-%m-%d")
        
        trend = []
        for i in range(days):
            dep_date = (base_date + datetime.timedelta(days=i)).strftime("%Y-%m-%d")
            price = self.predict_price(origin, destination, dep_date, today)
            trend.append({
                "date": dep_date,
                "predicted_price": price
            })
            
        return trend
