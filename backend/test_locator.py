import requests
import json

def test_locator():
    url = "http://localhost:8000/api/locator/nearby"
    
    # Test 1: Pincode 500032 (Hyderabad)
    print("\n--- Testing Pincode 500032 (Hyderabad) ---")
    try:
        r = requests.get(url, params={"pincode": "500032", "radius": "5"})
        if r.status_code == 200:
            data = r.json()
            print(f"Total Found: {data['total']}")
            for s in data['services'][:5]:
                print(f"- {s['name']} ({s['type']})")
        else:
            print(f"Error: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"Exception: {e}")

    # Test 2: Invalid Pincode
    print("\n--- Testing Invalid Pincode 999999 ---")
    try:
        r = requests.get(url, params={"pincode": "999999"})
        print(f"Total Found: {r.json()['total']}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_locator()
