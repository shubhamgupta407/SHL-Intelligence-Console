from bs4 import BeautifulSoup

with open("/Users/shubhamraj407/.gemini/antigravity-ide/brain/ec95f3bc-1455-47fa-a74c-00ea6122c050/.system_generated/steps/32/content.md", "r") as f:
    soup = BeautifulSoup(f.read(), 'html.parser')
scripts = soup.find_all('script', type='application/json')
for s in scripts:
    print(s.get('id'), len(s.string))
