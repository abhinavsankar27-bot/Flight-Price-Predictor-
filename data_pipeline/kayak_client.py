import os
import httpx
import json

class KayakClient:
    def __init__(self):
        self.api_key = os.environ.get("RAPIDAPI_KEY")
        self.api_host = os.environ.get("RAPIDAPI_HOST")
        self.url = "https://kayak-api.p.rapidapi.com/search-flights"

    def get_cheapest_flight(self, origin, destination, departure_date, currency="USD"):
        if not self.api_key or not self.api_host:
            print("Missing RapidAPI credentials.")
            return None
        
        # We need a return date for Kayak API, so let's just make it 5 days after departure
        # just to satisfy the API, since some flight APIs require round trip for standard searches.
        import datetime
        dep = datetime.datetime.strptime(departure_date, "%Y-%m-%d")
        ret = dep + datetime.timedelta(days=5)
        return_date = ret.strftime("%Y-%m-%d")

        payload = {
            "origin": origin,
            "destination": destination,
            "departure_date": departure_date,
            "return_date": return_date,
            "searchMetaData": {
                "pageNumber": 1,
                "priceMode": "per-person"
            },
            "userSearchParams": {
                "sortMode": "price_a",
                "passengers": ["ADT"]
            }
        }
        
        headers = {
            "content-type": "application/json",
            "X-RapidAPI-Key": self.api_key,
            "X-RapidAPI-Host": self.api_host
        }

        try:
            response = httpx.post(self.url, json=payload, headers=headers, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            
            if "data" in data and "results" in data["data"]:
                results = data["data"]["results"]
                if not results:
                    return None
                    
                # Find first result with price
                for r in results:
                    if "price" in r and "price" in r["price"]:
                        return {
                            "price": r["price"]["price"],
                            "currency": r["price"].get("currency", currency),
                            "airline": r.get("providerName", "Unknown Airline")
                        }
                        
            return None
            
        except Exception as e:
            print(f"Error fetching from Kayak API: {e}")
            return None
