from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import pytz
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Timezone data
TIMEZONE_DATA = {
    # North America
    "America/New_York": {"name": "New York", "region": "North America"},
    "America/Chicago": {"name": "Chicago", "region": "North America"},
    "America/Denver": {"name": "Denver", "region": "North America"},
    "America/Los_Angeles": {"name": "Los Angeles", "region": "North America"},
    "America/Vancouver": {"name": "Vancouver", "region": "North America"},
    "America/Toronto": {"name": "Toronto", "region": "North America"},
    "America/Mexico_City": {"name": "Mexico City", "region": "North America"},
    
    # Europe
    "Europe/London": {"name": "London", "region": "Europe"},
    "Europe/Paris": {"name": "Paris", "region": "Europe"},
    "Europe/Berlin": {"name": "Berlin", "region": "Europe"},
    "Europe/Rome": {"name": "Rome", "region": "Europe"},
    "Europe/Madrid": {"name": "Madrid", "region": "Europe"},
    "Europe/Amsterdam": {"name": "Amsterdam", "region": "Europe"},
    "Europe/Zurich": {"name": "Zurich", "region": "Europe"},
    "Europe/Vienna": {"name": "Vienna", "region": "Europe"},
    "Europe/Stockholm": {"name": "Stockholm", "region": "Europe"},
    "Europe/Helsinki": {"name": "Helsinki", "region": "Europe"},
    "Europe/Moscow": {"name": "Moscow", "region": "Europe"},
    
    # Asia
    "Asia/Tokyo": {"name": "Tokyo", "region": "Asia"},
    "Asia/Seoul": {"name": "Seoul", "region": "Asia"},
    "Asia/Shanghai": {"name": "Shanghai", "region": "Asia"},
    "Asia/Hong_Kong": {"name": "Hong Kong", "region": "Asia"},
    "Asia/Singapore": {"name": "Singapore", "region": "Asia"},
    "Asia/Bangkok": {"name": "Bangkok", "region": "Asia"},
    "Asia/Jakarta": {"name": "Jakarta", "region": "Asia"},
    "Asia/Manila": {"name": "Manila", "region": "Asia"},
    "Asia/Kuala_Lumpur": {"name": "Kuala Lumpur", "region": "Asia"},
    "Asia/Dubai": {"name": "Dubai", "region": "Asia"},
    "Asia/Riyadh": {"name": "Riyadh", "region": "Asia"},
    "Asia/Tehran": {"name": "Tehran", "region": "Asia"},
    "Asia/Kolkata": {"name": "Kolkata", "region": "Asia"},
    "Asia/Dhaka": {"name": "Dhaka", "region": "Asia"},
    "Asia/Karachi": {"name": "Karachi", "region": "Asia"},
    
    # Australia & Oceania
    "Australia/Sydney": {"name": "Sydney", "region": "Australia & Oceania"},
    "Australia/Melbourne": {"name": "Melbourne", "region": "Australia & Oceania"},
    "Australia/Brisbane": {"name": "Brisbane", "region": "Australia & Oceania"},
    "Australia/Perth": {"name": "Perth", "region": "Australia & Oceania"},
    "Pacific/Auckland": {"name": "Auckland", "region": "Australia & Oceania"},
    "Pacific/Honolulu": {"name": "Honolulu", "region": "Australia & Oceania"},
    
    # Africa
    "Africa/Cairo": {"name": "Cairo", "region": "Africa"},
    "Africa/Lagos": {"name": "Lagos", "region": "Africa"},
    "Africa/Johannesburg": {"name": "Johannesburg", "region": "Africa"},
    "Africa/Nairobi": {"name": "Nairobi", "region": "Africa"},
    "Africa/Casablanca": {"name": "Casablanca", "region": "Africa"},
    
    # South America
    "America/Sao_Paulo": {"name": "São Paulo", "region": "South America"},
    "America/Argentina/Buenos_Aires": {"name": "Buenos Aires", "region": "South America"},
    "America/Lima": {"name": "Lima", "region": "South America"},
    "America/Bogota": {"name": "Bogotá", "region": "South America"},
    "America/Santiago": {"name": "Santiago", "region": "South America"},
}

# Define Models
class TimezoneInfo(BaseModel):
    id: str
    name: str
    offset: str
    region: str

class ConversionRequest(BaseModel):
    source_timezone: str
    target_datetime: Optional[str] = None  # ISO format, if None uses current time

class ConversionResult(BaseModel):
    source_time: str
    source_date: str
    source_timezone: str
    source_offset: str
    ist_time: str
    ist_date: str
    ist_offset: str = "+05:30"

class SavedTimezone(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timezone_id: str
    name: str
    user_id: str = "default"  # For future user management
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SavedTimezoneCreate(BaseModel):
    timezone_id: str
    name: str

class SavedTimezoneResponse(BaseModel):
    id: str
    timezone_id: str
    name: str
    offset: str
    region: str

# Utility functions
def get_timezone_offset(timezone_id: str, dt: datetime = None) -> str:
    """Get timezone offset in +HH:MM format"""
    try:
        tz = pytz.timezone(timezone_id)
        if dt is None:
            dt = datetime.now()
        
        # Localize the datetime to the timezone
        localized_dt = tz.localize(dt) if dt.tzinfo is None else dt.astimezone(tz)
        
        # Get the offset
        offset = localized_dt.utcoffset()
        
        # Format as +HH:MM
        total_seconds = int(offset.total_seconds())
        hours, remainder = divmod(abs(total_seconds), 3600)
        minutes, _ = divmod(remainder, 60)
        
        sign = "+" if total_seconds >= 0 else "-"
        return f"{sign}{hours:02d}:{minutes:02d}"
    except Exception:
        return "+00:00"

def convert_to_ist(source_timezone: str, source_datetime: datetime = None) -> ConversionResult:
    """Convert time from source timezone to IST"""
    try:
        # Use current time if no datetime provided
        if source_datetime is None:
            source_datetime = datetime.now()
        
        # Get source timezone
        source_tz = pytz.timezone(source_timezone)
        
        # Get IST timezone
        ist_tz = pytz.timezone('Asia/Kolkata')
        
        # If source_datetime is naive, localize it to source timezone
        if source_datetime.tzinfo is None:
            source_localized = source_tz.localize(source_datetime)
        else:
            source_localized = source_datetime.astimezone(source_tz)
        
        # Convert to IST
        ist_time = source_localized.astimezone(ist_tz)
        
        # Format times
        source_time_str = source_localized.strftime("%H:%M:%S")
        source_date_str = source_localized.strftime("%a, %b %d, %Y")
        source_offset = get_timezone_offset(source_timezone, source_datetime)
        
        ist_time_str = ist_time.strftime("%H:%M:%S")
        ist_date_str = ist_time.strftime("%a, %b %d, %Y")
        
        return ConversionResult(
            source_time=source_time_str,
            source_date=source_date_str,
            source_timezone=TIMEZONE_DATA.get(source_timezone, {}).get("name", source_timezone),
            source_offset=source_offset,
            ist_time=ist_time_str,
            ist_date=ist_date_str,
            ist_offset="+05:30"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Timezone conversion error: {str(e)}")

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Timezone Converter API"}

@api_router.get("/timezones", response_model=List[TimezoneInfo])
async def get_timezones():
    """Get all available timezones"""
    timezones = []
    for tz_id, tz_data in TIMEZONE_DATA.items():
        offset = get_timezone_offset(tz_id)
        timezones.append(TimezoneInfo(
            id=tz_id,
            name=tz_data["name"],
            offset=offset,
            region=tz_data["region"]
        ))
    return timezones

@api_router.post("/convert", response_model=ConversionResult)
async def convert_timezone(request: ConversionRequest):
    """Convert time from source timezone to IST"""
    try:
        # Parse target datetime if provided
        target_dt = None
        if request.target_datetime:
            target_dt = datetime.fromisoformat(request.target_datetime.replace('Z', '+00:00'))
            if target_dt.tzinfo:
                target_dt = target_dt.replace(tzinfo=None)
        
        result = convert_to_ist(request.source_timezone, target_dt)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/ist-time")
async def get_ist_time():
    """Get current IST time"""
    ist_tz = pytz.timezone('Asia/Kolkata')
    now = datetime.now(ist_tz)
    
    return {
        "time": now.strftime("%H:%M:%S"),
        "date": now.strftime("%a, %b %d, %Y"),
        "offset": "+05:30",
        "timezone": "Asia/Kolkata"
    }

@api_router.get("/saved-timezones", response_model=List[SavedTimezoneResponse])
async def get_saved_timezones():
    """Get all saved timezones"""
    saved_timezones = await db.saved_timezones.find().to_list(100)
    
    result = []
    for saved_tz in saved_timezones:
        tz_info = TIMEZONE_DATA.get(saved_tz["timezone_id"], {})
        offset = get_timezone_offset(saved_tz["timezone_id"])
        
        result.append(SavedTimezoneResponse(
            id=saved_tz["id"],
            timezone_id=saved_tz["timezone_id"],
            name=tz_info.get("name", saved_tz["name"]),
            offset=offset,
            region=tz_info.get("region", "Unknown")
        ))
    
    return result

@api_router.post("/saved-timezones", response_model=SavedTimezoneResponse)
async def add_saved_timezone(request: SavedTimezoneCreate):
    """Add a timezone to saved list"""
    # Check if timezone exists
    if request.timezone_id not in TIMEZONE_DATA:
        raise HTTPException(status_code=404, detail="Timezone not found")
    
    # Check if already saved
    existing = await db.saved_timezones.find_one({"timezone_id": request.timezone_id})
    if existing:
        raise HTTPException(status_code=409, detail="Timezone already saved")
    
    # Create new saved timezone
    saved_tz = SavedTimezone(
        timezone_id=request.timezone_id,
        name=request.name
    )
    
    await db.saved_timezones.insert_one(saved_tz.dict())
    
    # Return response
    tz_info = TIMEZONE_DATA[request.timezone_id]
    offset = get_timezone_offset(request.timezone_id)
    
    return SavedTimezoneResponse(
        id=saved_tz.id,
        timezone_id=saved_tz.timezone_id,
        name=tz_info["name"],
        offset=offset,
        region=tz_info["region"]
    )

@api_router.delete("/saved-timezones/{timezone_id}")
async def remove_saved_timezone(timezone_id: str):
    """Remove a timezone from saved list"""
    result = await db.saved_timezones.delete_one({"timezone_id": timezone_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Saved timezone not found")
    
    return {"message": "Timezone removed from saved list"}

@api_router.get("/timezone-times")
async def get_timezone_times(timezone_ids: str):
    """Get current time for multiple timezones"""
    tz_ids = timezone_ids.split(",")
    results = []
    
    for tz_id in tz_ids:
        if tz_id in TIMEZONE_DATA:
            try:
                tz = pytz.timezone(tz_id)
                now = datetime.now(tz)
                
                results.append({
                    "timezone_id": tz_id,
                    "name": TIMEZONE_DATA[tz_id]["name"],
                    "time": now.strftime("%H:%M:%S"),
                    "date": now.strftime("%a, %b %d, %Y"),
                    "offset": get_timezone_offset(tz_id)
                })
            except Exception:
                continue
    
    return results

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()