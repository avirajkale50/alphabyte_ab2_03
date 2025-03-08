from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from typing import Optional
from typing import Dict, Any, List
import os
import json
from typing import List, Dict, Any, Tuple
import numpy as np
from dotenv import load_dotenv
import requests
from langchain.prompts import PromptTemplate
from langchain_community.document_loaders import PyPDFLoader, TextLoader, WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain_community.retrievers import BM25Retriever
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain.schema import Document
from langchain.schema.retriever import BaseRetriever
from langchain_community.vectorstores.utils import filter_complex_metadata
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import faiss
from datetime import datetime
import google.generativeai as genai
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI

# Load environment variables
load_dotenv()

# Configure Google Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

class MedicalDataSource:
    """Base class for medical data sources"""
    def __init__(self, name: str):
        self.name = name
    
    def fetch_data(self) -> List[Document]:
        """Fetch data from the source and return as documents"""
        raise NotImplementedError("Subclasses must implement fetch_data")
    
    def get_citation_info(self) -> Dict[str, Any]:
        """Return citation information for this data source"""
        raise NotImplementedError("Subclasses must implement get_citation_info")

class PubMedDataSource(MedicalDataSource):
    """Data source for PubMed articles"""
    def __init__(self, api_key: str = None):
        super().__init__("PubMed")
        self.api_key = api_key or os.getenv("PUBMED_API_KEY")
        self.base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
        
    def search_articles(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """Search for articles on PubMed"""
        search_url = f"{self.base_url}esearch.fcgi"
        params = {
            "db": "pubmed",
            "term": query,
            "retmode": "json",
            "retmax": max_results
        }
        if self.api_key:
            params["api_key"] = self.api_key
            
        response = requests.get(search_url, params=params)
        response.raise_for_status()
        result = response.json()
        
        if "esearchresult" not in result or "idlist" not in result["esearchresult"]:
            return []
            
        id_list = result["esearchresult"]["idlist"]
        
        if not id_list:
            return []
            
        fetch_url = f"{self.base_url}efetch.fcgi"
        fetch_params = {
            "db": "pubmed",
            "id": ",".join(id_list),
            "retmode": "xml"
        }
        if self.api_key:
            fetch_params["api_key"] = self.api_key
            
        fetch_response = requests.get(fetch_url, fetch_params)
        fetch_response.raise_for_status()
        
        # For demonstration purposes, we'll parse minimally
        # In a production system, use a proper XML parser
        articles = []
        for pmid in id_list:
            summary_url = f"{self.base_url}esummary.fcgi"
            summary_params = {
                "db": "pubmed",
                "id": pmid,
                "retmode": "json"
            }
            if self.api_key:
                summary_params["api_key"] = self.api_key
                
            summary_response = requests.get(summary_url, summary_params)
            summary_response.raise_for_status()
            summary_result = summary_response.json()
            
            if "result" not in summary_result or pmid not in summary_result["result"]:
                continue
                
            article_data = summary_result["result"][pmid]
            
            articles.append({
                "pmid": pmid,
                "title": article_data.get("title", "Unknown Title"),
                "authors": [author.get("name", "Unknown Author") for author in article_data.get("authors", [])],
                "journal": article_data.get("fulljournalname", "Unknown Journal"),
                "publication_date": article_data.get("pubdate", "Unknown Date"),
                "abstract": article_data.get("abstract", "Abstract not available")
            })
            
        return articles
        
    def fetch_data(self, query: str = "clinical guidelines") -> List[Document]:
        """Fetch data from PubMed based on a query"""
        articles = self.search_articles(query)
        documents = []
        
        for article in articles:
            content = f"Title: {article['title']}\nAuthors: {', '.join(article['authors'])}\n"
            content += f"Journal: {article['journal']}\nPublication Date: {article['publication_date']}\n"
            content += f"Abstract: {article['abstract']}\n"
            
            # Convert list of authors to a comma-separated string to avoid complex metadata
            authors_str = ", ".join(article["authors"])
            
            metadata = {
                "source": self.name,
                "pmid": article["pmid"],
                "title": article["title"],
                "authors_str": authors_str,  # Store as string instead of list
                "journal": article["journal"],
                "publication_date": article["publication_date"]
            }
            
            documents.append(Document(page_content=content, metadata=metadata))
            
        return documents
        
    def get_citation_info(self, doc: Document) -> Dict[str, Any]:
        """Return citation information for a PubMed document"""
        if "pmid" not in doc.metadata:
            return {"source": self.name, "citation": "No citation information available"}
        
        # Get author string from metadata    
        author_text = doc.metadata.get("authors_str", "Unknown Author")
        if "," in author_text:
            # If multiple authors, use first author et al.
            first_author = author_text.split(",")[0].strip()
            author_text = f"{first_author} et al."
            
        journal = doc.metadata.get("journal", "Unknown Journal")
        pub_date = doc.metadata.get("publication_date", "Unknown Date")
        title = doc.metadata.get("title", "Unknown Title")
        pmid = doc.metadata.get("pmid", "Unknown PMID")
        
        citation = f"{author_text}. {title}. {journal}. {pub_date}. PMID: {pmid}"
        url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
        
        return {
            "source": self.name,
            "citation": citation,
            "url": url,
            "title": title,
            "author_text": author_text,
            "publication_date": pub_date,
            "journal": journal,
            "pmid": pmid
        }
class FirstAidDataSource(MedicalDataSource):
    """Data source for first aid information from MedlinePlus and other sources"""
    def __init__(self, storage_dir="./first_aid_data"):
        super().__init__("First Aid Information")
        # Use the NLM E-utilities endpoint instead
        self.nlm_base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
        self.mayo_clinic_base_url = "https://www.mayoclinic.org"
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)
        
        # Common first aid topics and conditions
        self.first_aid_topics = [
            "common cold", "influenza", "sore throat", "runny nose", "fever", "cough",
            "headache", "migraine", "allergies", "sinusitis", "bronchitis", "ear infection",
            "pink eye", "conjunctivitis", "stye", "cuts", "scrapes", "burns", "sunburn",
            "insect bites", "bee sting", "spider bite", "poison ivy", "rash", "hives",
            "bruise", "sprain", "strain", "fracture", "broken bone", "concussion",
            "head injury", "nosebleed", "bleeding", "choking", "heimlich maneuver",
            "cpr", "chest pain", "heart attack", "stroke", "seizure", "fainting",
            "unconsciousness", "shock", "heat exhaustion", "heat stroke", "hypothermia",
            "frostbite", "dehydration", "food poisoning", "vomiting", "diarrhea",
            "abdominal pain", "stomachache", "indigestion", "heartburn", "constipation",
            "back pain", "muscle pain", "toothache", "dental emergency"
        ]
        
        # First aid procedures
        self.first_aid_procedures = [
            "wound cleaning", "wound dressing", "bandaging", "splinting", "cpr procedure",
            "recovery position", "heimlich maneuver", "rescue breathing", "stopping bleeding",
            "treating burns", "treating shock", "treating hypothermia", "treating hyperthermia",
            "treating sprains", "treating fractures", "treating concussion", "treating seizures",
            "treating allergic reactions", "treating anaphylaxis", "using epipen", "first aid kit"
        ]
        
    def fetch_medlineplus_data(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Fetch data from MedlinePlus via NLM E-utilities"""
        try:
            # First search for relevant terms
            search_params = {
                "db": "pubmed",
                "term": f"{query} AND medlineplus[sb]",  # Filter for MedlinePlus content
                "retmode": "json",
                "retmax": max_results
            }
            
            search_url = f"{self.nlm_base_url}/esearch.fcgi"
            response = requests.get(search_url, params=search_params)
            response.raise_for_status()
            search_data = response.json()
            
            results = []
            if "esearchresult" in search_data and "idlist" in search_data["esearchresult"]:
                id_list = search_data["esearchresult"]["idlist"]
                
                if id_list:
                    # Fetch detailed information for each ID
                    summary_url = f"{self.nlm_base_url}/esummary.fcgi"
                    summary_params = {
                        "db": "pubmed",
                        "id": ",".join(id_list),
                        "retmode": "json"
                    }
                    
                    summary_response = requests.get(summary_url, params=summary_params)
                    summary_response.raise_for_status()
                    summary_data = summary_response.json()
                    
                    for pmid in id_list:
                        if "result" in summary_data and pmid in summary_data["result"]:
                            article = summary_data["result"][pmid]
                            
                            # Extract MedlinePlus URL if available in articleids
                            medlineplus_url = ""
                            for id_obj in article.get("articleids", []):
                                if id_obj.get("idtype") == "medline" and "value" in id_obj:
                                    medlineplus_url = f"https://medlineplus.gov/ency/article/{id_obj['value']}.htm"
                                    break
                            
                            results.append({
                                "title": article.get("title", "Unknown Title"),
                                "url": medlineplus_url or f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                                "snippet": article.get("description", article.get("title", "No description available")),
                                "source": "MedlinePlus"
                            })
            
            return results
            
        except Exception as e:
            print(f"Error fetching from MedlinePlus via NLM API: {e}")
            # Fallback to direct web URL construction for common topics
            results = []
            normalized_query = query.replace(" ", "-").lower()
            medlineplus_url = f"https://medlineplus.gov/ency/article/{normalized_query}.htm"
            results.append({
                "title": f"{query.title()} - First Aid Information",
                "url": medlineplus_url,
                "snippet": f"Information about {query}",
                "source": "MedlinePlus"
            })
            return results
    
    def fetch_web_content(self, urls: List[str]) -> List[Document]:
        """Fetch and parse content from web pages"""
        documents = []
        
        for url in urls:
            try:
                loader = WebBaseLoader(url)
                docs = loader.load()
                
                # Add metadata
                for doc in docs:
                    doc.metadata["source"] = self.name
                    doc.metadata["url"] = url
                    doc.metadata["title"] = url.split("/")[-1].replace("-", " ").title()
                
                documents.extend(docs)
            except Exception as e:
                print(f"Error loading content from {url}: {e}")
        
        return documents
    
    def generate_first_aid_documents(self) -> List[Document]:
        """Generate first aid documents using the Gemini API for common conditions and save to disk"""
        documents = []
        
        # Configure Gemini model
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Combine topics and procedures
        all_topics = self.first_aid_topics + self.first_aid_procedures
        
        for topic in all_topics:
            # Create a filename-safe version of the topic
            safe_topic = topic.replace(" ", "_").replace("/", "_")
            file_path = os.path.join(self.storage_dir, f"{safe_topic}.md")
            
            # Check if we already have this document saved
            if os.path.exists(file_path):
                try:
                    # Load existing document
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    print(f"Loaded existing first aid document for: {topic}")
                    
                except Exception as e:
                    print(f"Error loading existing document for '{topic}': {e}")
                    continue
            else:
                # Generate new document
                try:
                    prompt = f"""Create a comprehensive first aid guide for '{topic}'. Include:
                    1. Definition and symptoms
                    2. When to seek emergency medical help
                    3. Step-by-step first aid procedures
                    4. Home remedies and self-care tips
                    5. Prevention measures
                    
                    Format the information in a structured, factual manner suitable for a medical reference document.
                    """
                    
                    response = model.generate_content(prompt)
                    content = response.text
                    
                    # Save the generated content to disk
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    
                    print(f"Generated and saved first aid document for: {topic}")
                    
                except Exception as e:
                    print(f"Error generating content for '{topic}': {e}")
                    continue
            
            # Create Document object with metadata
            metadata = {
                "source": self.name,
                "title": f"First Aid Guide: {topic.title()}",
                "topic": topic,
                "document_type": "generated_first_aid",
                "date_created": datetime.now().strftime("%Y-%m-%d"),
                "file_path": file_path
            }
            
            documents.append(Document(page_content=content, metadata=metadata))
        
        # Save document index
        self.save_document_index(documents)
        
        return documents
        
    def save_document_index(self, documents: List[Document], index_dir: str = "./document_index"):
        """Save all documents and create a searchable index"""
        os.makedirs(index_dir, exist_ok=True)
        
        # Create a JSON index of all documents
        index = []
        for i, doc in enumerate(documents):
            # Create a unique filename for this document
            source = doc.metadata.get("source", "unknown")
            topic = doc.metadata.get("topic", f"document_{i}")
            safe_topic = topic.replace(" ", "_").replace("/", "_")
            filename = f"{safe_topic}_{i}.txt"
            file_path = os.path.join(index_dir, filename)
            
            # Save document content
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(doc.page_content)
            
            # Add to index
            index_entry = {
                "id": i,
                "file_path": file_path,
                "metadata": doc.metadata,
                "content_preview": doc.page_content[:100] + "..." if len(doc.page_content) > 100 else doc.page_content
            }
            index.append(index_entry)
        
        # Save the index as JSON
        with open(os.path.join(index_dir, "document_index.json"), 'w', encoding='utf-8') as f:
            json.dump(index, f, indent=2, default=str)
        
        print(f"Saved {len(documents)} documents to {index_dir}")
        print(f"Index file created at {os.path.join(index_dir, 'document_index.json')}")
        
        return os.path.join(index_dir, "document_index.json")
    
    def fetch_data(self) -> List[Document]:
        """Fetch first aid information from multiple sources"""
        documents = []
        
        # Try to fetch from NLM E-utilities API first
        web_urls = []
        for topic in self.first_aid_topics[:20]:  # Limit to first 20 topics to avoid rate limits
            results = self.fetch_medlineplus_data(topic)
            for result in results:
                if result["url"]:
                    web_urls.append(result["url"])
        
        # Fetch content from web pages
        if web_urls:
            print(f"Fetching content from {len(web_urls)} web pages...")
            web_documents = self.fetch_web_content(web_urls)
            documents.extend(web_documents)
        
        # Generate additional documents using Gemini if needed
        if len(documents) < 150:
            remaining = 150 - len(documents)
            print(f"Generating {remaining} additional first aid documents...")
            generated_documents = self.generate_first_aid_documents()
            documents.extend(generated_documents[:remaining])
        
        print(f"Created {len(documents)} first aid documents")
        return documents
    
    def get_citation_info(self, doc: Document) -> Dict[str, Any]:
        """Return citation information for a first aid document"""
        if "url" in doc.metadata:
            # Web content
            url = doc.metadata.get("url", "")
            title = doc.metadata.get("title", "First Aid Information")
            source = "MedlinePlus" if "medlineplus.gov" in url else "Medical Website"
            
            citation = f"{title}. {source}. URL: {url}"
            
            return {
                "source": self.name,
                "citation": citation,
                "url": url,
                "title": title
            }
        else:
            # Generated content
            title = doc.metadata.get("title", "First Aid Information")
            topic = doc.metadata.get("topic", "General First Aid")
            date = doc.metadata.get("date_created", datetime.now().strftime("%Y-%m-%d"))
            
            citation = f"{title}. First Aid Database. Generated on {date}."
            
            return {
                "source": self.name,
                "citation": citation,
                "title": title,
                "topic": topic,
                "date": date
            }

class MedicalGuidelinesDataSource(MedicalDataSource):
    """Data source for clinical practice guidelines"""
    def __init__(self, guidelines_dir: str = "./medical_guidelines"):
        super().__init__("Medical Guidelines")
        self.guidelines_dir = guidelines_dir
        os.makedirs(self.guidelines_dir, exist_ok=True)
        
    def fetch_data(self) -> List[Document]:
        """Load medical guidelines from PDF and text files"""
        documents = []
        
        # Process all PDF files in the guidelines directory
        for filename in os.listdir(self.guidelines_dir):
            file_path = os.path.join(self.guidelines_dir, filename)
            
            if filename.endswith('.pdf'):
                try:
                    loader = PyPDFLoader(file_path)
                    pdf_docs = loader.load()
                    
                    # Add source information to metadata
                    for doc in pdf_docs:
                        doc.metadata["source"] = self.name
                        doc.metadata["filename"] = filename
                        doc.metadata["file_path"] = file_path
                        doc.metadata["guideline_title"] = filename.replace('.pdf', '')
                        
                    documents.extend(pdf_docs)
                except Exception as e:
                    print(f"Error loading PDF {filename}: {e}")
                    
            elif filename.endswith('.txt'):
                try:
                    loader = TextLoader(file_path)
                    txt_docs = loader.load()
                    
                    # Add source information to metadata
                    for doc in txt_docs:
                        doc.metadata["source"] = self.name
                        doc.metadata["filename"] = filename
                        doc.metadata["file_path"] = file_path
                        doc.metadata["guideline_title"] = filename.replace('.txt', '')
                        
                    documents.extend(txt_docs)
                except Exception as e:
                    print(f"Error loading text file {filename}: {e}")
                    
        return documents
        
    def get_citation_info(self, doc: Document) -> Dict[str, Any]:
        """Return citation information for a guideline document"""
        if "filename" not in doc.metadata:
            return {"source": self.name, "citation": "No citation information available"}
            
        guideline_title = doc.metadata.get("guideline_title", "Unknown Guideline")
        filename = doc.metadata.get("filename", "Unknown File")
        
        # In a production system, you would parse more detailed citation information
        # from the guideline documents themselves
        citation = f"Clinical Practice Guideline: {guideline_title}"
        
        return {
            "source": self.name,
            "citation": citation,
            "title": guideline_title,
            "filename": filename,
            "file_path": doc.metadata.get("file_path", "")
        }

class MedicalRAGPipeline:
    """End-to-end RAG pipeline for medical question answering"""
    def __init__(self):
        # Use Gemini model instead of OpenAI
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.2,
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )
        
        # Use Google's embeddings
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )
        
        self.data_sources = []
        self.documents = []
        self.vector_store = None
        self.bm25_retriever = None
        self.hybrid_retriever = None
        
    def add_data_source(self, data_source: MedicalDataSource):
        """Add a data source to the pipeline"""
        self.data_sources.append(data_source)
        
    def load_and_process_data(self):
        """Load and process data from all sources"""
        all_documents = []
        
        for source in self.data_sources:
            print(f"Loading data from {source.name}...")
            source_documents = source.fetch_data()
            all_documents.extend(source_documents)
            
        print(f"Loaded {len(all_documents)} documents from {len(self.data_sources)} sources")
        
        # Split documents into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        
        self.documents = text_splitter.split_documents(all_documents)
        print(f"Split into {len(self.documents)} chunks")
        
        # Ensure all documents are proper Document objects
        valid_documents = []
        for i, doc in enumerate(self.documents):
            if isinstance(doc, Document):
                # Ensure metadata is a dict
                if not isinstance(doc.metadata, dict):
                    doc.metadata = {"source": f"document_{i}"}
                valid_documents.append(doc)
            elif isinstance(doc, tuple):
                # Convert tuple to Document
                try:
                    content = doc[0] if len(doc) > 0 else ""
                    metadata = doc[1] if len(doc) > 1 and isinstance(doc[1], dict) else {"source": f"document_{i}"}
                    valid_documents.append(Document(page_content=content, metadata=metadata))
                    print(f"Converted tuple to Document object: {i}")
                except Exception as e:
                    print(f"Error converting tuple to Document: {e}")
            else:
                print(f"Invalid document type at index {i}: {type(doc)}")
        
        self.documents = valid_documents
        print(f"Using {len(self.documents)} valid documents")
        
        if not self.documents:
            raise ValueError("No valid documents to process!")
        
        # Filter complex metadata manually
        filtered_documents = []
        for doc in self.documents:
            # Create a new metadata dict with only simple types
            filtered_metadata = {}
            for key, value in doc.metadata.items():
                if isinstance(value, (str, int, float, bool)) or value is None:
                    filtered_metadata[key] = value
                elif isinstance(value, list) and all(isinstance(x, (str, int, float, bool)) for x in value):
                    # Convert list to comma-separated string
                    filtered_metadata[key] = ", ".join(str(x) for x in value)
                else:
                    # Skip complex types
                    filtered_metadata[f"{key}_type"] = str(type(value))
            
            # Create a new document with filtered metadata
            filtered_doc = Document(page_content=doc.page_content, metadata=filtered_metadata)
            filtered_documents.append(filtered_doc)
        
        print(f"Filtered metadata for {len(filtered_documents)} documents")
        
        # Debug - print sample document
        if filtered_documents:
            print("Sample document metadata:")
            print(filtered_documents[0].metadata)
        
        # Create vector store for semantic search
        try:
            # First verify we can embed one document
            print("Testing embedding generation...")
            test_embedding = self.embeddings.embed_query("test")
            print(f"Test embedding generated with {len(test_embedding)} dimensions")
            
            print("Creating vector store...")
            self.vector_store = Chroma.from_documents(
                documents=filtered_documents,
                embedding=self.embeddings,
                persist_directory="./chroma_db"
            )
            print("Vector store created successfully")
        except Exception as e:
            print(f"Error creating vector store: {e}")
            # Fallback to BM25 retriever only
            print("Using BM25 retriever only as fallback")
            self.vector_store = None
        
        # Create BM25 retriever for keyword search
        self.bm25_retriever = BM25Retriever.from_documents(self.documents)
        self.bm25_retriever.k = 5  # Number of documents to retrieve
        
        # Create hybrid retriever only if vector store was created
        if self.vector_store:
            self.create_hybrid_retriever()
        else:
            print("Using BM25 retriever as the primary retriever")
            # Define a wrapper for the BM25 retriever that inherits from BaseRetriever
            class FallbackRetriever(BaseRetriever):
                def __init__(self, retriever):
                    super().__init__()
                    self.retriever = retriever
                    
                def _get_relevant_documents(self, query):
                    return self.retriever.get_relevant_documents(query)
                    
            self.hybrid_retriever = FallbackRetriever(self.bm25_retriever)
        
    def create_hybrid_retriever(self):
        """Create a hybrid retriever that combines vector search and BM25"""
        from langchain.schema.retriever import BaseRetriever
        from pydantic import Field
        from typing import Any, List

        class HybridRetriever(BaseRetriever):
            vector_retriever: Any = Field(description="Vector retriever for semantic search")
            bm25_retriever: Any = Field(description="BM25 retriever for keyword search") 
            weight_vector: float = Field(default=0.7, description="Weight given to vector search results")

            def _get_relevant_documents(self, query: str) -> List[Document]:
                # Get documents from both retrievers
                vector_docs = self.vector_retriever.get_relevant_documents(query)
                bm25_docs = self.bm25_retriever.get_relevant_documents(query)
                
                # Normalize BM25 scores (since they're not naturally between 0-1)
                max_bm25_score = 0
                for doc in bm25_docs:
                    if hasattr(doc, '_score') and doc._score is not None:
                        max_bm25_score = max(max_bm25_score, doc._score)
                
                # Combine and deduplicate documents
                seen_contents = set()
                unique_docs = []
                
                # First add vector docs with proper scores
                for i, doc in enumerate(vector_docs):
                    if doc.page_content not in seen_contents:
                        seen_contents.add(doc.page_content)
                        doc.metadata["retrieval_method"] = "vector"
                        
                        # Calculate actual similarity score - higher rank = higher similarity
                        # Scores decrease from 1.0 to 0.6 based on position
                        similarity = 1.0 - (i * 0.1) if i < 5 else 0.5
                        
                        # Apply vector weight to the score
                        doc.metadata["retrieval_score"] = round(similarity * self.weight_vector, 2)
                        unique_docs.append(doc)
                
                # Then add BM25 docs with proper scores
                for i, doc in enumerate(bm25_docs):
                    if doc.page_content not in seen_contents:
                        seen_contents.add(doc.page_content)
                        doc.metadata["retrieval_method"] = "bm25"
                        
                        # Get actual BM25 score if available, otherwise use position-based score
                        if hasattr(doc, '_score') and doc._score is not None and max_bm25_score > 0:
                            # Normalize BM25 score to 0-1 range
                            similarity = doc._score / max_bm25_score
                        else:
                            # Fallback to position-based scoring
                            similarity = 1.0 - (i * 0.1) if i < 5 else 0.5
                        
                        # Apply BM25 weight to the score
                        doc.metadata["retrieval_score"] = round(similarity * (1 - self.weight_vector), 2)
                        unique_docs.append(doc)
                
                return unique_docs
                
        vector_retriever = self.vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 5}
        )
        
        self.hybrid_retriever = HybridRetriever(
            vector_retriever=vector_retriever,
            bm25_retriever=self.bm25_retriever
        )
        
    def get_qa_chain(self):
        """Create a QA chain for answering medical questions"""
        template = """You are an advanced medical AI assistant designed to help with clinical decision support.
        Use the following pieces of retrieved medical information to answer the user's question.
        If you don't know the answer, just say that you don't know, don't try to make up an answer.
        
        Retrieved information:
        {context}
        
        User Question: {question}
        
        Instructions:
        1. Analyze the user's question carefully.
        2. Provide a comprehensive answer based on the retrieved information.
        3. Explain your reasoning behind any diagnostic suggestions or treatment recommendations.
        4. Indicate your confidence level in the answer (Low, Medium, High).
        5. Cite the specific sources used in your answer.
        6. If the question cannot be answered with the retrieved information, say so clearly.
        7. Remind the user that this is AI-assisted guidance and not a replacement for professional medical advice.
        
        Format your answer as follows:
        
        Answer: [Your detailed answer here]
        
        Reasoning: [Explain your thought process]
        
        Confidence: [Low/Medium/High]
        
        Sources:
        [List the sources with citations]
        
        Medical Disclaimer: This information is provided for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
        """
        
        prompt = PromptTemplate(
            template=template,
            input_variables=["context", "question"]
        )
        
        chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.hybrid_retriever,
            chain_type_kwargs={"prompt": prompt},
            return_source_documents=True
        )
        
        return chain
    
    def generate_explanation(self, question: str, answer: str, source_docs: List[Document]) -> Dict[str, Any]:
        """Generate an explanation with citations for the answer"""
        # Extract citation information from source documents
        citations = []
        for i, doc in enumerate(source_docs):
            source_type = doc.metadata.get("source", "Unknown")
            
            # Get similarity score if available
            similarity_score = doc.metadata.get("retrieval_score", None)
            
            for data_source in self.data_sources:
                if data_source.name == source_type:
                    citation_info = data_source.get_citation_info(doc)
                    # Add similarity score to citation info
                    if similarity_score is not None:
                        citation_info["similarity_score"] = round(similarity_score, 2)
                    citations.append(citation_info)
                    break
            else:
                # Generic citation for other sources
                citation_info = {
                    "source": source_type,
                    "citation": f"Source document {i+1}"
                }
                if similarity_score is not None:
                    citation_info["similarity_score"] = round(similarity_score, 2)
                citations.append(citation_info)
        
        # Extract confidence level
        confidence = "Unknown"
        if "Confidence: Low" in answer:
            confidence = "Low"
        elif "Confidence: Medium" in answer:
            confidence = "Medium"
        elif "Confidence: High" in answer:
            confidence = "High"
        
        # Extract reasoning
        reasoning = ""
        if "Reasoning:" in answer and "Confidence:" in answer:
            reasoning_start = answer.find("Reasoning:") + len("Reasoning:")
            reasoning_end = answer.find("Confidence:")
            reasoning = answer[reasoning_start:reasoning_end].strip()
        
        # Create the explanation
        explanation = {
            "question": question,
            "answer": answer,
            "confidence": confidence,
            "reasoning": reasoning,
            "citations": citations,
            "timestamp": datetime.now().isoformat()
        }
        
        return explanation
    
    def answer_medical_question(self, question: str) -> Dict[str, Any]:
        """Answer a medical question with explanations and citations"""
        qa_chain = self.get_qa_chain()
        result = qa_chain.invoke({"query": question})
        
        answer = result.get("result", "I couldn't generate an answer based on the available information.")
        source_documents = result.get("source_documents", [])
        
        explanation = self.generate_explanation(
            question=question,
            answer=answer,
            source_docs=source_documents
        )
        
        return explanation

class MedicalChatbot:
    """Medical chatbot interface"""
    def __init__(self):
        self.pipeline = MedicalRAGPipeline()
        
        # Add data sources
        pubmed_source = PubMedDataSource()
        self.pipeline.add_data_source(pubmed_source)
        
        # Add the new First Aid data source
        first_aid_source = FirstAidDataSource()
        self.pipeline.add_data_source(first_aid_source)
        
        guidelines_source = MedicalGuidelinesDataSource()
        self.pipeline.add_data_source(guidelines_source)
        
        # Load and process data
        self.pipeline.load_and_process_data()
        
        self.conversation_history = []
        
    def process_message(self, message: str) -> Dict[str, Any]:
        """Process a user message and generate a response"""
        self.conversation_history.append({"role": "user", "message": message})
        
        # Get the answer from the RAG pipeline
        result = self.pipeline.answer_medical_question(message)
        
        # Store the response in conversation history
        self.conversation_history.append({"role": "assistant", "message": result["answer"]})
        
        return result
    
    def clear_conversation(self):
        """Clear the conversation history"""
        self.conversation_history = []

# Add all the previous class definitions here (MedicalDataSource, PubMedDataSource, etc.)

app = FastAPI(title="Medical Chatbot API", version="1.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str

class CitationResponse(BaseModel):
    source: str
    citation: str
    url: Optional[str] = None
    similarity_score: Optional[float] = None
    title: Optional[str] = None
    publication_date: Optional[str] = None

class QueryResponse(BaseModel):
    question: str
    answer: str
    confidence: str
    reasoning: str
    citations: List[CitationResponse]
    timestamp: str

# Initialize the chatbot instance during startup
@app.on_event("startup")
async def startup_event():
    print("Initializing Medical Chatbot with Gemini AI...")
    app.state.chatbot = MedicalChatbot()
    print("\nMedical Chatbot initialized and ready.")

@app.post("/query", response_model=QueryResponse, summary="Ask a medical question", description="Process a medical question and return a response with citations")
async def process_query(query: QueryRequest) -> Dict[str, Any]:
    try:
        result = app.state.chatbot.process_message(query.question)
        
        # Convert citations to the response model
        formatted_citations = []
        for citation in result["citations"]:
            formatted_citations.append(CitationResponse(
                source=citation.get("source", "Unknown"),
                citation=citation.get("citation", ""),
                url=citation.get("url"),
                similarity_score=citation.get("similarity_score"),
                title=citation.get("title"),
                publication_date=citation.get("publication_date")
            ))
        
        return {
            "question": result["question"],
            "answer": result["answer"],
            "confidence": result["confidence"],
            "reasoning": result["reasoning"],
            "citations": formatted_citations,
            "timestamp": result["timestamp"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)