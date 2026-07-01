import os
import re
import json
import time
import requests
from typing import List, Dict, Tuple

def parse_trace(filepath: str) -> List[Dict]:
    """Parses a markdown trace file into a structured format of turns."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    turns = []
    # Split by turn headings
    turn_blocks = re.split(r'### Turn \d+', content)[1:]
    
    for block in turn_blocks:
        turn = {}
        # Extract User message
        user_match = re.search(r'\*\*User\*\*\s*>\s*(.*?)(?=\*\*Agent\*\*|$)', block, re.DOTALL)
        if user_match:
            turn['user'] = user_match.group(1).strip()
            
        # Extract Expected Agent Output
        agent_section = block[user_match.end() if user_match else 0:]
        
        # Check end of conversation
        if '`end_of_conversation`: **true**' in agent_section:
            turn['end_of_conversation'] = True
        else:
            turn['end_of_conversation'] = False
            
        # Check recommendations
        if '`recommendations: null`' in agent_section or 'No recommendations this turn' in agent_section:
            turn['expected_urls'] = []
        else:
            # Extract URLs from markdown table
            urls = re.findall(r'<(https?://www\.shl\.com[^>]+)>', agent_section)
            if not urls:
                # sometimes they might just be in the table without <>
                # fallback regex for table rows
                urls = re.findall(r'(https?://www\.shl\.com[^\s|]+)', agent_section)
            turn['expected_urls'] = list(set(urls))
            
        turns.append(turn)
    return turns

def evaluate(api_url: str, traces_dir: str, subset_files: List[str] = None):
    trace_files = [f for f in os.listdir(traces_dir) if f.endswith('.md')]
    if subset_files:
        trace_files = [f for f in trace_files if f in subset_files]
    
    total_recall = 0
    total_queries = 0
    schema_failures = 0
    hallucinations = 0
    
    catalog_urls = set()
    try:
        with open("data/catalog.json", "r", encoding="utf-8") as f:
            cat = json.loads(f.read(), strict=False)
            catalog_urls = {c["link"] for c in cat}
    except Exception as e:
        print(f"Warning: could not load catalog.json for hallucination checks. {e}")

    for trace_file in trace_files:
        print(f"\nEvaluating trace: {trace_file}")
        filepath = os.path.join(traces_dir, trace_file)
        turns = parse_trace(filepath)
        
        messages = []
        for i, turn in enumerate(turns):
            if 'user' not in turn: continue
            
            messages.append({"role": "user", "content": turn['user']})
            
            print(f"  Turn {i+1} User: {turn['user'][:50]}...")
            
            try:
                resp = requests.post(f"{api_url}/chat", json={"messages": messages}, timeout=30)
                if resp.status_code != 200:
                    print(f"    API Error {resp.status_code}: {resp.text}")
                    schema_failures += 1
                    break
                    
                data = resp.json()
                
                # Check schema
                if 'reply' not in data or 'recommendations' not in data or 'end_of_conversation' not in data:
                    print("    Schema Error: Missing fields")
                    schema_failures += 1
                    break
                    
                rec_urls = [r['url'] for r in (data['recommendations'] or [])]
                expected_urls = turn.get('expected_urls', [])
                
                # Check Hallucinations
                for u in rec_urls:
                    if u not in catalog_urls:
                        print(f"    Hallucination detected! URL not in catalog: {u}")
                        hallucinations += 1
                
                # Recall@10 calculation for this turn (if expected > 0)
                if len(expected_urls) > 0:
                    hits = sum(1 for u in expected_urls if u in rec_urls)
                    recall = hits / len(expected_urls)
                    total_recall += recall
                    total_queries += 1
                    print(f"    Recall@10: {recall:.2f} ({hits}/{len(expected_urls)})")
                else:
                    if len(rec_urls) > 0:
                        print(f"    Warning: Expected 0 recommendations, got {len(rec_urls)}")
                        
                # End of conversation check
                if turn['end_of_conversation'] and not data['end_of_conversation']:
                    print("    Warning: Expected end_of_conversation=True, but agent returned False")
                elif not turn['end_of_conversation'] and data['end_of_conversation']:
                    print("    Warning: Expected end_of_conversation=False, but agent returned True")

                # Append assistant response to history
                messages.append({"role": "assistant", "content": data['reply']})
                
                time.sleep(3) # Avoid Groq Free Tier rate limits
                
            except requests.exceptions.Timeout:
                print("    Timeout Error (>30s)")
            except Exception as e:
                print(f"    Error: {e}")
                
    print("\n--- Evaluation Summary ---")
    print(f"Total Traces Tested: {len(trace_files)}")
    print(f"Schema Failures: {schema_failures}")
    print(f"Hallucinations: {hallucinations}")
    mean_recall = (total_recall / total_queries) if total_queries > 0 else 0
    print(f"Mean Recall@10 (over {total_queries} queries): {mean_recall:.2f}")

if __name__ == "__main__":
    traces_path = "data/traces/GenAI_SampleConversations"
    if not os.path.exists(traces_path):
        traces_path = "data/traces"
    # Test only a subset of traces first to avoid hitting rate limits
    evaluate("http://localhost:8000", traces_path, subset_files=["C1.md", "C5.md", "C7.md"])
