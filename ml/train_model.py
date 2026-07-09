import os
import sqlite3
import numpy as np
import pandas as pd
import joblib
import warnings
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error, r2_score
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
import shap

from ml.feature_engineering import engineer_features, prepare_training_data
warnings.filterwarnings('ignore')

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

def load_data(db_path: str = '../data/flights.db') -> pd.DataFrame:
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'flights.db'))
    conn = sqlite3.connect(abs_path)
    df = pd.read_sql_query('SELECT * FROM flight_prices', conn)
    conn.close()
    return df

def train_and_evaluate():
    print("Loading data from database...")
    df = load_data()
    
    if df.empty:
        print("No data found! Run the synthetic data generator first.")
        return

    print(f"Loaded {len(df)} records. Engineering advanced features...")
    df_features = engineer_features(df)
    X, y, feature_cols = prepare_training_data(df_features)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, shuffle=True)
    
    # Define models to test
    models = {
        'RandomForest': RandomForestRegressor(random_state=42),
        'XGBoost': XGBRegressor(random_state=42),
        'LightGBM': LGBMRegressor(random_state=42, verbose=-1)
    }

    # Define hyperparameter grids
    param_grids = {
        'RandomForest': {
            'n_estimators': [50, 100],
            'max_depth': [None, 10, 20],
            'min_samples_split': [2, 5]
        },
        'XGBoost': {
            'n_estimators': [50, 100],
            'learning_rate': [0.05, 0.1],
            'max_depth': [3, 6]
        },
        'LightGBM': {
            'n_estimators': [50, 100],
            'learning_rate': [0.05, 0.1],
            'num_leaves': [31, 50]
        }
    }

    best_model = None
    best_score = float('inf')
    best_model_name = ""

    print("Starting Hyperparameter Optimization...")
    for name, model in models.items():
        print(f"Tuning {name}...")
        search = RandomizedSearchCV(model, param_grids[name], n_iter=3, cv=3, scoring='neg_mean_absolute_percentage_error', random_state=42, n_jobs=-1)
        search.fit(X_train, y_train)
        
        preds = search.predict(X_test)
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        mape = mean_absolute_percentage_error(y_test, preds)
        r2 = r2_score(y_test, preds)
        
        print(f"{name} Best Params: {search.best_params_}")
        print(f"{name} Metrics - RMSE: {rmse:.2f}, MAPE: {mape:.2%}, R2: {r2:.4f}\n")
        
        if mape < best_score:
            best_score = mape
            best_model = search.best_estimator_
            best_model_name = name

    print(f"Best Model: {best_model_name} with MAPE: {best_score:.2%}")

    # Generate SHAP values for Explainable AI
    print("Generating SHAP explainability values...")
    try:
        # Taking a sample to save time
        X_sample = X_train.sample(min(100, len(X_train)), random_state=42)
        if best_model_name == 'RandomForest':
            explainer = shap.TreeExplainer(best_model)
        else:
            explainer = shap.Explainer(best_model)
            
        shap_values = explainer(X_sample)
        
        # Save summary plot
        plt.figure()
        shap.summary_plot(shap_values, X_sample, show=False)
        plt.savefig(os.path.join(MODEL_DIR, 'shap_summary.png'), bbox_inches='tight')
        print("SHAP summary plot saved.")
    except Exception as e:
        print(f"Warning: Failed to generate SHAP plots ({e})")
    
    print("Saving the best model...")
    # NOTE: The backend loads `model.pkl`, not `price_model.pkl` in FlightPricePredictor/backend/app.py!
    # Wait, in app.py it does:
    # model = pickle.load(open("model.pkl", "rb"))
    # So I should save to that directory or update app.py
    
    # Save in the ml/models folder
    model_path = os.path.join(MODEL_DIR, 'price_model.pkl')
    features_path = os.path.join(MODEL_DIR, 'model_features.pkl')
    
    joblib.dump(best_model, model_path)
    joblib.dump(X.columns.tolist(), features_path)
    
    print(f"Model saved to {model_path}")

    # Also save to backend directory for the API
    api_model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'FlightPricePredictor', 'backend', 'model.pkl'))
    api_features_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'FlightPricePredictor', 'backend', 'model_features.pkl'))
    
    import pickle
    with open(api_model_path, 'wb') as f:
        pickle.dump(best_model, f)
    with open(api_features_path, 'wb') as f:
        pickle.dump(X.columns.tolist(), f)
    print(f"Copied to backend API: {api_model_path}")

if __name__ == "__main__":
    train_and_evaluate()
