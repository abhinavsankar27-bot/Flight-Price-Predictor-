import math
import pandas as pd
import numpy as np

def create_cyclic_features(df: pd.DataFrame, col_name: str, period: int):
    """
    Creates sine and cosine features for a cyclic variable to preserve continuity.
    For example, month 12 is close to month 1.
    """
    df[f"{col_name}_sin"] = np.sin(df[col_name] * (2. * np.pi / period))
    df[f"{col_name}_cos"] = np.cos(df[col_name] * (2. * np.pi / period))
    return df

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Given a dataframe with flight prices, creates temporal and seasonal features.
    Required columns: departure_date (datetime), search_date (datetime), origin, destination, airline
    """
    # Ensure datetime format
    df['departure_date'] = pd.to_datetime(df['departure_date'])
    df['search_date'] = pd.to_datetime(df['search_date'])
    
    # Days until departure
    df['days_until_departure'] = (df['departure_date'] - df['search_date']).dt.days
    df['days_until_departure'] = df['days_until_departure'].apply(lambda x: max(0, x))
    
    # Temporal features
    df['departure_month'] = df['departure_date'].dt.month
    df['departure_day_of_year'] = df['departure_date'].dt.dayofyear
    df['departure_day_of_week'] = df['departure_date'].dt.dayofweek
    
    # Weekend flag (5 = Saturday, 6 = Sunday)
    df['is_weekend'] = df['departure_day_of_week'].isin([5, 6]).astype(int)
    
    # Cyclic encoding for month (period=12) and day of year (period=365)
    df = create_cyclic_features(df, 'departure_month', 12)
    df = create_cyclic_features(df, 'departure_day_of_year', 365)
    
    # Drop original cyclic columns to avoid multicollinearity, though tree models don't care as much
    # df.drop(columns=['departure_month', 'departure_day_of_year'], inplace=True)
    
    # Simple holidays (US)
    # Peak summer: July, August
    df['is_peak_summer'] = df['departure_month'].isin([6, 7, 8]).astype(int)
    
    # Winter holiday (Late Dec)
    df['is_winter_holiday'] = ((df['departure_month'] == 12) & (df['departure_day_of_year'] >= 354)).astype(int)
    
    # Advance Purchase buckets
    df['is_last_minute'] = (df['days_until_departure'] <= 7).astype(int)
    df['is_early_bird'] = (df['days_until_departure'] >= 60).astype(int)
    
    # Route feature (categorical)
    df['route'] = df['origin'] + "-" + df['destination']
    
    return df

def prepare_training_data(df: pd.DataFrame):
    """
    Prepares the final feature matrix X and target y.
    """
    # One-hot encode categorical features (route, airline)
    df_encoded = pd.get_dummies(df, columns=['route', 'airline'], drop_first=True)
    
    # Drop columns not used for training
    cols_to_drop = ['id', 'origin', 'destination', 'departure_date', 'search_date', 'price', 'currency', 'is_live']
    
    X = df_encoded.drop(columns=[c for c in cols_to_drop if c in df_encoded.columns])
    y = df_encoded['price']
    
    return X, y, df_encoded.columns.tolist()
