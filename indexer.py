import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import os

def build_index(catalog_path="data/catalog.json", index_path="data/faiss_index.bin"):
    print("Loading catalog...")
    with open(catalog_path, "r", encoding="utf-8") as f:
        catalog = json.loads(f.read(), strict=False)
        
    print(f"Loaded {len(catalog)} items. Initializing embedding model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    texts = []
    for item in catalog:
        # Combine fields for rich semantic search
        name = item.get('name', '')
        desc = item.get('description', '')
        keys = ", ".join(item.get('keys', []))
        languages = ", ".join(item.get('languages', []))
        levels = ", ".join(item.get('job_levels', []))
        
        text = f"Assessment Name: {name}. Description: {desc}. Measures: {keys}. Job Levels: {levels}. Languages: {languages}."
        texts.append(text)
        
    print("Encoding texts...")
    embeddings = model.encode(texts, show_progress_bar=True)
    embeddings = np.array(embeddings).astype("float32")
    
    print("Building FAISS index...")
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension) # Inner product for cosine similarity (with normalization)
    faiss.normalize_L2(embeddings)
    index.add(embeddings)
    
    faiss.write_index(index, index_path)
    print(f"Index saved to {index_path} with {index.ntotal} items.")
    
    print("Computing semantic similarity graph...")
    similarity_matrix = np.dot(embeddings, embeddings.T)
    
    similarity_graph = {}
    for i in range(len(catalog)):
        top_indices = np.argsort(similarity_matrix[i])[-16:][::-1]
        neighbors = []
        for j in top_indices:
            if i != j:
                score = float(similarity_matrix[i][j])
                neighbors.append([int(j), score])
            if len(neighbors) == 15:
                break
        similarity_graph[str(i)] = neighbors
        
    graph_path = "data/similarity_graph.json"
    with open(graph_path, "w", encoding="utf-8") as f:
        json.dump(similarity_graph, f, indent=2)
    print(f"Similarity graph saved to {graph_path}")

if __name__ == "__main__":
    os.makedirs("data", exist_ok=True)
    build_index()
