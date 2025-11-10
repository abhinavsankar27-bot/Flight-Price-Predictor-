import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
import pickle

# Load dataset
df = pd.read_csv("flight.csv")  # Make sure flight.csv is in backend folder

# Encode categorical columns
encoder = LabelEncoder()
df['Airline'] = encoder.fit_transform(df['Airline'])
df['Source'] = encoder.fit_transform(df['Source'])
df['Destination'] = encoder.fit_transform(df['Destination'])

X = df[['Airline', 'Source', 'Destination', 'Total_Stops', 'Journey_Day', 'Journey_Month']]
y = df['Price']

# Split into train-test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Train model
model = RandomForestRegressor()
model.fit(X_train, y_train)

# Save model
pickle.dump(model, open("model.pkl", "wb"))

print("✅ Model Saved as model.pkl!")
