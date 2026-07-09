import os
import random
import datetime
import math
from data_pipeline.database import SessionLocal, Base, engine
from data_pipeline.models import FlightPrice

Base.metadata.create_all(bind=engine)

def generate_synthetic_data(num_days=365):
    """
    Generates synthetic historical flight data with seasonal patterns.
    """
    db = SessionLocal()
    
    routes = [("NYC", "LON"), ("SFO", "JFK"), ("BOS", "MIA"), ("LAX", "HNL")]
    airlines = ["DL", "AA", "UA", "BA"]
    
    today = datetime.date.today()
    start_date = today - datetime.timedelta(days=num_days)
    
    print(f"Generating synthetic data from {start_date} to {today}...")
    records_added = 0
    
    for i in range(num_days):
        current_date = start_date + datetime.timedelta(days=i)
        
        # Day of year (1-365)
        day_of_year = current_date.timetuple().tm_yday
        
        # Create a seasonal multiplier using a sine wave (Peak in Summer (~180) and Winter holidays (~350))
        # Summer peak
        summer_peak = math.sin((day_of_year - 90) / 365 * 2 * math.pi) * 0.3
        # Winter peak (sharp)
        winter_dist = min(abs(day_of_year - 355), 365 - abs(day_of_year - 355))
        winter_peak = max(0, (20 - winter_dist) / 20) * 0.4
        
        seasonal_multiplier = 1.0 + summer_peak + winter_peak
        
        # Weekend premium
        if current_date.weekday() >= 4: # Friday, Saturday, Sunday
            seasonal_multiplier += 0.15
            
        for origin, destination in routes:
            # Base prices
            base_prices = {
                "NYC-LON": 600,
                "SFO-JFK": 350,
                "BOS-MIA": 200,
                "LAX-HNL": 400
            }
            
            base_price = base_prices.get(f"{origin}-{destination}", 300)
            
            # Simulate a few prices for different search dates leading up to departure
            # In reality, price drops or increases as departure approaches.
            for days_prior in [60, 30, 14, 7, 1]:
                search_date = current_date - datetime.timedelta(days=days_prior)
                
                # Prices usually go up as departure approaches
                urgency_multiplier = 1.0 + (30 / max(days_prior, 1)) * 0.05
                
                final_price = base_price * seasonal_multiplier * urgency_multiplier
                final_price += random.uniform(-50, 50) # Random noise
                
                airline = random.choice(airlines)
                
                # Add to DB
                price_record = FlightPrice(
                    origin=origin,
                    destination=destination,
                    departure_date=current_date,
                    search_date=datetime.datetime.combine(search_date, datetime.time(12, 0)),
                    price=round(max(50.0, final_price), 2),
                    currency="USD",
                    airline=airline,
                    is_live=False
                )
                
                db.add(price_record)
                records_added += 1
                
        if i % 30 == 0:
            db.commit()
            
    db.commit()
    db.close()
    print(f"Done. Generated {records_added} synthetic records.")

if __name__ == "__main__":
    generate_synthetic_data()
