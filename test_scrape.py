import requests
from bs4 import BeautifulSoup

url = "https://www.shl.com/solutions/products/product-catalog/"
headers = {"User-Agent": "Mozilla/5.0"}
resp = requests.get(url, headers=headers)
soup = BeautifulSoup(resp.text, 'html.parser')
links = soup.find_all('a')
print("Total links:", len(links))
product_links = [a['href'] for a in links if a.has_attr('href') and '/products/product-catalog/view/' in a['href']]
print("Product links:", len(product_links))
print(product_links[:5])
