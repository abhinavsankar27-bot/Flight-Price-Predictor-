import os
from amadeus import Client, ResponseError
from dotenv import load_dotenv

load_dotenv()

class AmadeusClient:
    def __init__(self):
        self.client_id = os.environ.get("AMADEUS_CLIENT_ID")
        self.client_secret = os.environ.get("AMADEUS_CLIENT_SECRET")
        
        if not self.client_id or not self.client_secret:
            print("Warning: Amadeus API credentials not set. Live data fetching will fail.")
            self.amadeus = None
        else:
            self.amadeus = Client(
                client_id=self.client_id,
                client_secret=self.client_secret,
                hostname='test' # Use 'production' for live environment if you have a paid quota
            )

    def get_cheapest_flight(self, origin: str, destination: str, departure_date: str, currency: str = "USD") -> dict:
        """
        Fetches the cheapest flight offer for a given route and date.
        departure_date format: YYYY-MM-DD
        Returns a dict with price, airline, or None if failed.
        """
        if not self.amadeus:
            return None

        try:
            # Flight Offers Search API
            response = self.amadeus.shopping.flight_offers_search.get(
                originLocationCode=origin,
                destinationLocationCode=destination,
                departureDate=departure_date,
                adults=1,
                currencyCode=currency,
                max=5
            )
            
            if not response.data:
                return None
                
            # The data is sorted by price by default, but let's be sure
            cheapest = min(response.data, key=lambda x: float(x['price']['total']))
            
            # Extract airline code from the first segment
            itineraries = cheapest.get('itineraries', [])
            airline = "UNKNOWN"
            if itineraries and itineraries[0].get('segments'):
                airline = itineraries[0]['segments'][0].get('carrierCode', 'UNKNOWN')
                
            return {
                "price": float(cheapest['price']['total']),
                "currency": cheapest['price']['currency'],
                "airline": airline
            }

        except ResponseError as error:
            print(f"Amadeus API Error: {error}")
            return None
        except Exception as e:
            print(f"Unexpected error fetching flights: {e}")
            return None
