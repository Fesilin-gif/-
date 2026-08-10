import urllib.request
import json
import urllib.parse

def get_image(query):
    # Search for page
    search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&utf8=&format=json"
    try:
        req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req).read()
        data = json.loads(res)
        if not data['query']['search']: return None
        title = data['query']['search'][0]['title']
        
        # Get page images
        page_url = f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=pageimages&format=json&pithumbsize=800"
        req = urllib.request.Request(page_url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req).read()
        data = json.loads(res)
        pages = data['query']['pages']
        for page_id in pages:
            if 'thumbnail' in pages[page_id]:
                return pages[page_id]['thumbnail']['source']
        return None
    except Exception as e:
        return str(e)

products = [
    "Ryzen 7",
    "Intel Core i9",
    "GeForce RTX 4090",
    "Radeon RX 7900 XTX",
    "Motherboard ASUS ROG",
    "DDR5 RAM",
    "NVMe SSD",
    "Computer power supply Corsair"
]

for p in products:
    print(f"{p}: {get_image(p)}")
