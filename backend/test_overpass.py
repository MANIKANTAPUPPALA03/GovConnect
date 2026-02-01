import requests
import json

# Query for Post Offices and Hospitals near Gachibowli, Hyderabad
query = """
[out:json];
(
  node["amenity"="post_office"](around:5000,17.44008,78.34891);
  node["amenity"="hospital"](around:5000,17.44008,78.34891);
);
out;
"""
print("Querying Overpass API...")
try:
    r = requests.get("https://overpass-api.de/api/interpreter", params={"data": query}, timeout=30)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        count = len(data.get("elements", []))
        print(f"Found {count} items.")
        if count > 0:
            print("Item 1:", data["elements"][0].get("tags", {}).get("name", "Unnamed"))
    else:
        print("Error:", r.text)
except Exception as e:
    print(f"Exception: {e}")
