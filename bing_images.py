import urllib.request
import re

def search(query):
    url = f"https://www.bing.com/images/search?q={urllib.parse.quote(query)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        urls = re.findall(r'murl&quot;:&quot;(.*?)&quot;', html)
        if urls:
            return urls[0]
    except Exception as e:
        return str(e)
    return None

import urllib.parse
print("Ryzen 7 7800X3D:", search("Ryzen 7 7800X3D OEM processor white background"))
print("Samsung 990 PRO:", search("Samsung 990 PRO M.2 SSD product photo"))
print("MSI B650 TOMAHAWK:", search("MSI MAG B650 TOMAHAWK WIFI motherboard white background"))
print("RTX 4090:", search("Gigabyte GeForce RTX 4090 AERO OC 24G White"))
print("ROG STRIX Z790-A:", search("ASUS ROG STRIX Z790-A GAMING WIFI II white background"))
