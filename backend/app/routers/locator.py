"""
Service Locator Router

GET /api/locator/nearby - Find nearby government service centers using OpenStreetMap.
"""
import math
import httpx
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List

from app.models.schemas import ServiceLocatorResponse, ServiceCenter

router = APIRouter()

"""
Service Locator Router

GET /api/locator/nearby - Find nearby government service centers using OpenStreetMap Overpass API.
"""
import math
import httpx
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List, Dict, Tuple

from app.models.schemas import ServiceLocatorResponse, ServiceCenter

router = APIRouter()

# APIs
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

HEADERS = {
    "User-Agent": "GovConnect/1.0 (govconnect-project-demo)"
}

# Service Category Mapping to OSM Tags
SERVICE_TAGS = {
    "Police": ['node["amenity"="police"]', 'way["amenity"="police"]'],
    "Post Office": ['node["amenity"="post_office"]', 'way["amenity"="post_office"]'],
    "Hospital": ['node["amenity"="hospital"]', 'way["amenity"="hospital"]', 'node["amenity"="clinic"]'],
    "Bank": ['node["amenity"="bank"]', 'way["amenity"="bank"]'],
    "Administrative": [
        'node["office"="government"]', 'way["office"="government"]',
        'node["office"="administrative"]', 'way["office"="administrative"]',
        'node["amenity"="townhall"]', 'way["amenity"="townhall"]',
        'node["building"="public"]', 'way["building"="public"]'
    ],
    "Transport": ['node["amenity"="bus_station"]', 'node["railway"="station"]'],
    "Fire": ['node["amenity"="fire_station"]'],
    "Judiciary": ['node["amenity"="courthouse"]'],
    "Registration": ['node["amenity"="register_office"]'], # Land/Marriage registration
    "Social Welfare": ['node["amenity"="social_facility"]'] # Orphanages, shelters, etc.
}


async def get_lat_lon_from_pincode(pincode: str) -> Tuple[Optional[float], Optional[float], str]:
    """
    Geocode pincode to Lat/Lon using Nominatim.
    Returns: (lat, lon, display_name)
    """
    params = {
        "q": f"{pincode}, India",
        "format": "json",
        "limit": 1
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(NOMINATIM_URL, params=params, headers=HEADERS, timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                if data:
                    return float(data[0]["lat"]), float(data[0]["lon"]), data[0]["display_name"]
        except Exception as e:
            print(f"Nominatim Error: {e}")
            
    return None, None, ""


async def fetch_overpass_services(lat: float, lon: float, radius: float, categories: Optional[List[str]] = None) -> List[dict]:
    """
    Fetch services around a point using Overpass API with multi-category support.
    """
    # Convert Radius km to meters
    radius_meters = int(radius * 1000)
    
    # Build query parts
    query_parts = []
    
    # Determine which tags to fetch
    target_tags = []
    
    if categories and len(categories) > 0:
        # Fetch specific requested categories
        for cat in categories:
            if cat in SERVICE_TAGS:
                target_tags.extend(SERVICE_TAGS[cat])
    else:
        # Fetch ALL generic government related services if no specific category requested
        for key, tags in SERVICE_TAGS.items():
            target_tags.extend(tags)
            
    # Add each tag query
    for tag in target_tags:
        query_parts.append(f'{tag}(around:{radius_meters},{lat},{lon});')

    # Construct full QL query
    ql_query = f"""
    [out:json][timeout:25];
    (
      {''.join(query_parts)}
    );
    out body;
    >;
    out skel qt;
    """
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(OVERPASS_URL, params={"data": ql_query}, timeout=30.0)
            if response.status_code == 200:
                return response.json().get("elements", [])
        except Exception as e:
            print(f"Overpass Error: {e}")
            
    return []


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate Haversine distance in km."""
    if not (lat1 and lon1 and lat2 and lon2):
        return 0.0
    R = 6371
    try:
        lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        return round(R * c, 2)
    except (ValueError, TypeError):
        return 0.0


@router.get("/nearby", response_model=ServiceLocatorResponse)
async def find_nearby_services(
    pincode: Optional[str] = Query(None, description="PIN code to search near"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lng: Optional[float] = Query(None, description="Longitude"),
    radius: Optional[float] = Query(5.0, description="Search radius in km"),
    service: Optional[str] = Query(None, description="Type of service"),
    type: Optional[str] = Query(None, description="Type of center (comma separated)")
):
    """
    Find services using Overpass API (High Precision).
    """
    search_lat, search_lon = lat, lng
    location_name = "User Location"
    
    # Resolving Location
    if pincode and (not lat or not lng):
        plat, plon, pname = await get_lat_lon_from_pincode(pincode)
        if plat and plon:
            search_lat, search_lon = plat, plon
            location_name = pname
        else:
            # Pincode not found
            return ServiceLocatorResponse(services=[], total=0)
            
    if not search_lat or not search_lon:
        return ServiceLocatorResponse(services=[], total=0)

    # Convert generic 'service' or 'type' query to list of known categories
    search_categories = []
    
    # Check 'service' and 'type' params
    raw_query = f"{service or ''},{type or ''}"
    query_parts = [p.strip().lower() for p in raw_query.split(",") if p.strip()]
    
    if not query_parts:
        # No filter = All
        search_categories = []
    else:
        # Match user query against known SERVICE_TAGS keys
        # We try to match leniently (e.g. 'police station' -> 'Police')
        for part in query_parts:
            # Check exact match first
            found = False
            for key in SERVICE_TAGS.keys():
                if part == key.lower():
                    search_categories.append(key)
                    found = True
                    break
            
            # Substring match if exact failed
            if not found:
                for key in SERVICE_TAGS.keys():
                    if part in key.lower() or key.lower() in part:
                        search_categories.append(key)
                        break
    
    # Deduplicate
    search_categories = list(set(search_categories))

    # Fetch Data with Multi-Category Support
    raw_data = await fetch_overpass_services(search_lat, search_lon, radius, search_categories)
    
    # Process Results
    centers = []
    seen_ids = set()
    
    for item in raw_data:
        # Only process nodes/ways with tags
        tags = item.get("tags", {})
        if not tags or item["id"] in seen_ids:
            continue
            
        seen_ids.add(item["id"])
        
        name = tags.get("name") or tags.get("name:en")
        if not name:
            continue # Skip unnamed features
            
        # Determine type
        amenity = tags.get("amenity", "")
        office = tags.get("office", "")
        ctype = (amenity or office or "Government").title().replace("_", " ")
        
        # Coordinates
        ilat = item.get("lat")
        ilon = item.get("lon")
        # For 'ways', overpass returns center or we skip.
        # Simple mode: skip ways if no lat/lon (center query needed in Overpass for ways, but simpler strictly nodes/center)
        if not ilat:
            continue

        dist = calculate_distance(search_lat, search_lon, ilat, ilon)
        
        # Infer Services
        services_offered = ["General Inquiry"]
        if "police" in ctype.lower(): services_offered = ["FIR", "Verification"]
        elif "post" in ctype.lower(): services_offered = ["Mail", "Savings"]
        elif "hospital" in ctype.lower(): services_offered = ["OPD", "Emergency"]

        centers.append(
            ServiceCenter(
                name=name,
                type=ctype,
                address=f"{name}, {location_name}", # Overpass doesn't give full address easily, use approximate
                pincode=tags.get("addr:postcode", pincode or "Unknown"),
                latitude=ilat,
                longitude=ilon,
                distance=dist,
                phone=tags.get("phone") or tags.get("contact:phone"),
                timings=tags.get("opening_hours"),
                services=services_offered
            )
        )
        
    # Sort by distance
    centers.sort(key=lambda x: x.distance or float('inf'))
    
    return ServiceLocatorResponse(services=centers, total=len(centers))


@router.get("/types")
async def get_service_types():
    return {"types": list(SERVICE_TAGS.keys())}

@router.get("/reverse")
async def reverse_geocode(lat: float, lng: float):
    """
    Reverse geocode Lat/Lng to Address via Nominatim
    """
    params = {
        "lat": lat,
        "lon": lng,
        "format": "json",
        "zoom": 18,
        "addressdetails": 1
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(NOMINATIM_URL.replace("search", "reverse"), params=params, headers=HEADERS, timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                address = data.get("address", {})
                
                # Construct a friendly area name
                area_parts = [
                    address.get("suburb"),
                    address.get("neighbourhood"), 
                    address.get("residential"),
                    address.get("village"),
                    address.get("hamlet"),
                    address.get("road"),
                    address.get("city") or address.get("town") or address.get("county") or address.get("district")
                ]
                area_name = ", ".join([p for p in area_parts if p])
                
                return {
                    "display_name": data.get("display_name"),
                    "area": area_name,
                    "pincode": address.get("postcode", "")
                }
        except Exception as e:
            print(f"Nominatim Reverse Error: {e}")
            
    return {"error": "Failed to resolve location"}

