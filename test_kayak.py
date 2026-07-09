import os
import httpx
from dotenv import load_dotenv

load_dotenv()

RAPIDAPI_KEY = os.environ.get("RAPIDAPI_KEY")
RAPIDAPI_HOST = os.environ.get("RAPIDAPI_HOST")

url = "https://kayak-api.p.rapidapi.com/search-flights"

payload = {
    "origin": "MIA",
    "destination": "NYC",
    "departure_date": "2026-07-25",
    "return_date": "2026-07-30",
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
    "X-RapidAPI-Key": RAPIDAPI_KEY,
    "X-RapidAPI-Host": RAPIDAPI_HOST
}

try:
    print(f"Requesting {url}...")
    response = httpx.post(url, json=payload, headers=headers, timeout=30.0)
    print("Status:", response.status_code)
    data = response.json()
    print("Keys:", list(data.keys()) if isinstance(data, dict) else "Not a dict")
    
    # Dump a portion of the response for inspection
    import json
    with open("kayak_response.json", "w") as f:
        json.dump(data, f, indent=2)
    print("Dumped full response to kayak_response.json")
    
except Exception as e:
    print(e)
