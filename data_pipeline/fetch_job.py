import os
import datetime
from dotenv import load_dotenv
load_dotenv()
from sqlalchemy.orm import Session
from data_pipeline.kayak_client import KayakClient
from data_pipeline.database import SessionLocal, Base, engine
from data_pipeline.models import FlightPrice, JobRun

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

def run_fetch_job():
    """
    Fetches prices for configured routes for dates 1 to 90 days out.
    """
    db: Session = SessionLocal()
    client = KayakClient()
    
    routes_env = os.environ.get("TRACKED_ROUTES", "NYC-LON")
    routes = [r.strip().split("-") for r in routes_env.split(",") if "-" in r]
    currency = os.environ.get("TRACKING_CURRENCY", "USD")
    
    job_run = JobRun(status="RUNNING")
    db.add(job_run)
    db.commit()
    
    if not client.api_key:
        job_run.status = "FAILED"
        job_run.error_message = "Kayak API credentials not configured."
        db.commit()
        db.close()
        return

    records_added = 0
    today = datetime.date.today()
    
    try:
        # We will fetch prices for dates 14, 30, and 60 days out for each route
        # (to avoid hitting rate limits too hard on free tier, limit the lookahead)
        lookaheads = [14, 30, 60]
        
        for origin, destination in routes:
            for days_ahead in lookaheads:
                target_date = today + datetime.timedelta(days=days_ahead)
                target_date_str = target_date.strftime("%Y-%m-%d")
                
                print(f"Fetching {origin} -> {destination} for {target_date_str}...")
                
                result = client.get_cheapest_flight(origin, destination, target_date_str, currency)
                
                if result:
                    new_price = FlightPrice(
                        origin=origin,
                        destination=destination,
                        departure_date=target_date,
                        price=result['price'],
                        currency=result['currency'],
                        airline=result['airline'],
                        is_live=True
                    )
                    db.add(new_price)
                    records_added += 1
        
        db.commit()
        job_run.status = "SUCCESS"
        job_run.records_fetched = records_added
        db.commit()
        print(f"Fetch job completed. Added {records_added} records.")
        
    except Exception as e:
        db.rollback()
        job_run.status = "FAILED"
        job_run.error_message = str(e)
        db.commit()
        print(f"Fetch job failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_fetch_job()
