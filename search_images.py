import urllib.request
import re
import urllib.parse
from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = []
        
    def handle_starttag(self, tag, attrs):
        if tag == 'img':
            attrs_dict = dict(attrs)
            if 'src' in attrs_dict and 'http' in attrs_dict['src']:
                self.images.append(attrs_dict['src'])

def search_image(query):
    url = f"https://duckduckgo.com/html/?q={urllib.parse.quote(query)}+site:mvideo.ru+OR+site:dns-shop.ru"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        parser = MyHTMLParser()
        parser.feed(html)
        return parser.images
    except Exception as e:
        return str(e)

print(search_image("Samsung 990 PRO M.2"))
