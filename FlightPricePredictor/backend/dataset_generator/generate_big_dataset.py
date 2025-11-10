import csv
import random

airlines = [
    "IndiGo", "Air India", "SpiceJet", "Vistara", "Air Asia",
    "Go First", "Akasa Air", "Qatar Airways", "Emirates", "Singapore Airlines",
    "Etihad", "Lufthansa", "United Airlines", "British Airways", "Air France"
]

cities = [
    "Delhi", "Mumbai", "Bangalore", "Kolkata", "Chennai", "Hyderabad", "Pune", "Ahmedabad",
    "Jaipur", "Lucknow", "Dubai", "Doha", "Singapore", "London", "New York", "Paris",
    "Frankfurt", "Tokyo", "Sydney", "Toronto"
]

# Season impact factors
month_season_multiplier = {
    1: 0.7,   # Jan (off-season)
    2: 0.8,   # Feb
    3: 1.0,   # Mar
    4: 1.1,   # Apr
    5: 1.3,   # May (peak)
    6: 1.4,   # Jun (peak)
    7: 1.3,   # Jul (peak)
    8: 1.2,   # Aug
    9: 1.0,   # Sep
    10: 1.1,  # Oct
    11: 1.5,  # Nov (festive)
    12: 1.6   # Dec (holiday peak)
}

# Weekend multiplier
weekend_multiplier = {
    "weekday": 1.0,
    "weekend": 1.2
}

# Airline quality impact
airline_quality_multiplier = {
    "IndiGo": 1.0,
    "Air India": 1.2,
    "SpiceJet": 0.9,
    "Vistara": 1.3,
    "Air Asia": 0.95,
    "Go First": 0.85,
    "Akasa Air": 0.9,
    "Qatar Airways": 2.0,
    "Emirates": 2.2,
    "Singapore Airlines": 2.0,
    "Etihad": 2.1,
    "Lufthansa": 2.0,
    "United Airlines": 2.2,
    "British Airways": 2.0,
    "Air France": 2.1
}

num_records = 10000

filename = "flight.csv"

with open(filename, mode="w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow(["Airline", "Source", "Destination", "Total_Stops", "Journey_Day", "Journey_Month", "Price"])

    for _ in range(num_records):
        airline = random.choice(airlines)
        source = random.choice(cities)
        destination = random.choice([c for c in cities if c != source])

        total_stops = random.choice([0, 1, 2, 3])
        day = random.randint(1, 28)
        month = random.randint(1, 12)

        # Base domestic price
        base_price = random.randint(3000, 9000)

        # International flights significantly higher
        if source in ["London", "New York", "Paris", "Tokyo", "Sydney", "Toronto"] or \
           destination in ["London", "New York", "Paris", "Tokyo", "Sydney", "Toronto"]:
            base_price += random.randint(20000, 40000)

        # Apply seasonal multiplier
        base_price *= month_season_multiplier[month]

        # Weekend detection
        weekend = "weekend" if day in [5, 6, 7, 12, 13, 14, 19, 20, 21, 26, 27, 28] else "weekday"
        base_price *= weekend_multiplier[weekend]

        # Airline quality multiplier
        base_price *= airline_quality_multiplier[airline]

        # Stops effect
        base_price += total_stops * 1000

        # Add surge pricing effect (10% chance)
        if random.random() < 0.1:
            base_price *= random.uniform(1.2, 1.5)

        price = int(base_price)

        writer.writerow([airline, source, destination, total_stops, day, month, price])

print(f"✅ BIG dataset generated successfully! Saved as {filename}")
