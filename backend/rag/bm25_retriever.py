# backend/rag/bm25_retriever.py
import pickle
import json
from pathlib import Path
from rank_bm25 import BM25Okapi
import re

class BM25Retriever:
    def __init__(self, vector_store_dir):
        self.vector_store_dir = Path(vector_store_dir)
        self.documents = []
        self.metadata = []
        self.bm25 = None
        
        # Load documents and metadata
        with open(self.vector_store_dir / "index" / "documents.pkl", 'rb') as f:
            self.documents = pickle.load(f)
        
        with open(self.vector_store_dir / "index" / "metadata.json", 'r') as f:
            self.metadata = json.load(f)
        
        # Preprocess and build BM25
        tokenized_docs = [self._tokenize(doc) for doc in self.documents]
        self.bm25 = BM25Okapi(tokenized_docs)
    
    def _tokenize(self, text):
        return re.findall(r'\w+', text.lower())
    
    # backend/rag/bm25_retriever.py
    def search(self, query, k=3):
        tokenized_query = self._tokenize(query)
        doc_scores = self.bm25.get_scores(tokenized_query)
        top_indices = sorted(range(len(doc_scores)), 
                        key=lambda i: doc_scores[i], reverse=True)[:k]
        
        results = []
        for idx in top_indices:
            # Ensure metadata has source field
            metadata = self.metadata[idx] if idx < len(self.metadata) else {}
            if "source" not in metadata and "path" in metadata:
                # Extract source from path as fallback
                path = metadata["path"]
                source = os.path.basename(path).split('.')[0]
                metadata["source"] = source
            elif "source" not in metadata:
                # Last resort
                metadata["source"] = f"document_{idx}"
                
            results.append({
                "content": self.documents[idx],
                "metadata": metadata
            })
        return results