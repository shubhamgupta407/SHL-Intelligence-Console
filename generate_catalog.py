import json
import os
import re

traces_dir = "/Users/shubhamraj407/Desktop/SHL/data/traces/GenAI_SampleConversations"
catalog = {}

for filename in os.listdir(traces_dir):
    if not filename.endswith(".md"): continue
    filepath = os.path.join(traces_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Parse markdown tables
    # | 1 | Name | Test Type | Keys | Duration | Languages | URL |
    lines = content.split('\n')
    for line in lines:
        if line.startswith('|') and 'Name' not in line and '---' not in line:
            parts = [p.strip() for p in line.split('|')]
            if len(parts) >= 8:
                try:
                    name = parts[2]
                    test_type = parts[3]
                    keys_str = parts[4]
                    duration = parts[5]
                    languages = parts[6]
                    url_match = re.search(r'<(https?://[^>]+)>', parts[7])
                    url = url_match.group(1) if url_match else parts[7].replace('<', '').replace('>', '')
                    
                    if url not in catalog:
                        catalog[url] = {
                            "entity_id": str(len(catalog) + 1000),
                            "name": name,
                            "link": url,
                            "description": f"{name} measures {keys_str}.",
                            "job_levels": ["General Population", "Manager"],
                            "job_levels_raw": "General Population, Manager",
                            "languages": [l.strip() for l in languages.split(',') if l.strip()],
                            "languages_raw": languages,
                            "duration": duration,
                            "duration_raw": duration,
                            "status": "ok",
                            "remote": "yes",
                            "adaptive": "no",
                            "keys": [k.strip() for k in keys_str.split(',') if k.strip()]
                        }
                except Exception as e:
                    print(f"Error parsing line: {line} - {e}")

output = list(catalog.values())
with open("data/catalog.json", "w") as f:
    json.dump(output, f, indent=2)
print(f"Extracted {len(output)} catalog items.")
