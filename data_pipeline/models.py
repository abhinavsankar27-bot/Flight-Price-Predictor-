from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean
from data_pipeline.database import Base
from datetime import datetime

class FlightPrice(Base):
    __tablename__ = "flight_prices"

    id = Column(Integer, primary_key=True, index=True)
    origin = Column(String, index=True)
    destination = Column(String, index=True)
    departure_date = Column(Date, index=True)
    search_date = Column(DateTime, default=datetime.utcnow, index=True)
    price = Column(Float)
    currency = Column(String, default="USD")
    airline = Column(String)
    is_live = Column(Boolean, default=True) # True if from Amadeus, False if synthetic/model

class JobRun(Base):
    __tablename__ = "job_runs"
    
    id = Column(Integer, primary_key=True, index=True)
    run_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String) # SUCCESS, FAILED
    records_fetched = Column(Integer, default=0)
    error_message = Column(String, nullable=True)
