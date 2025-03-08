# backend/rag/query_gemini.py
import os
from pathlib import Path
import google.generativeai as genai
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
import traceback
from typing import List
from langchain.schema import Document
from .bm25_retriever import BM25Retriever

class GeminiQuery:
    def __init__(self, vector_store_path):
        self.vector_store_path = Path(vector_store_path)
        self.vector_store = None
        self.bm25_retriever = None
        self.model = None
        
        try:
            # Verify vector store exists
            if not (self.vector_store_path / "index.faiss").exists():
                raise FileNotFoundError("Vector store index directory missing")
            
            # Initialize Google AI
            api_key = "AIzaSyDpSleO3jTRPwEjbACX885cfy7B5VncHTk"
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash')
            
            # Initialize FAISS
            embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
            self.vector_store = FAISS.load_local(
                str(self.vector_store_path),
                embeddings,
                allow_dangerous_deserialization=True
            )
            
            # Initialize BM25
            self.bm25_retriever = BM25Retriever(self.vector_store_path)
            
            print("Hybrid retriever initialized successfully")
            
        except Exception as e:
            print(f"Initialization error: {str(e)}")
            traceback.print_exc()
            raise

    # backend/rag/query_gemini.py
    def _combine_results(self, faiss_docs, bm25_docs, k):
        # Convert BM25 results to Document objects
        bm25_documents = []
        for doc in bm25_docs:
            # Add defensive programming to ensure 'source' key exists
            metadata = doc["metadata"]
            if "source" not in metadata:
                # Create a default source if missing
                metadata["source"] = "unknown"
            
            bm25_documents.append(Document(
                page_content=doc["content"],
                metadata=metadata
            ))
        
        combined = faiss_docs + bm25_documents
        
        # Use a more robust method to deduplicate
        seen = set()
        unique_docs = []
        for doc in combined:
            # Handle the case where metadata might not have 'source'
            source = doc.metadata.get("source", f"doc_{len(seen)}")
            if source not in seen:
                seen.add(source)
                unique_docs.append(doc)
        
        return unique_docs[:k]

    def query(self, question, k=3):
        try:
            k_faiss = max(1, k // 2)
            k_bm25 = max(1, k - k_faiss)
            
            faiss_docs = self.vector_store.similarity_search(question, k=k_faiss)
            bm25_docs = self.bm25_retriever.search(question, k=k_bm25)
            
            final_docs = self._combine_results(faiss_docs, bm25_docs, k)
            
            context = "\n\n".join([doc.page_content for doc in final_docs])
            
            # Use more robust method to extract sources
            sources = []
            for doc in final_docs:
                if "source" in doc.metadata:
                    sources.append(doc.metadata["source"])
                elif "path" in doc.metadata:
                    # Extract filename as source if path exists
                    sources.append(os.path.basename(doc.metadata["path"]).split('.')[0])
                else:
                    # Fallback
                    sources.append("unknown source")
            
            # Remove duplicates while preserving order
            unique_sources = []
            for source in sources:
                if source not in unique_sources:
                    unique_sources.append(source)
            
            prompt = f"""Answer based on context:
            {context}
            
            Question: {question}
            Answer:"""
            
            response = self.model.generate_content(prompt)
            answer = response.text
            
            if unique_sources:
                answer += f"\n\nSources: {', '.join(unique_sources)}"
                
            return answer
            
        except Exception as e:
            print(f"Query error: {str(e)}")
            traceback.print_exc()
            return f"Error generating answer: {str(e)}"