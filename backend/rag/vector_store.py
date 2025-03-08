# backend/rag/vector_store.py
import os
import faiss
import pickle
import json
from pathlib import Path
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.docstore.document import Document

def create_vector_store(text_folder, rag_folder):
    # Create directories if they don't exist
    Path(rag_folder).mkdir(parents=True, exist_ok=True)
    index_dir = Path(rag_folder) / "index"
    index_dir.mkdir(exist_ok=True)

    documents = []
    metadata_list = []

    # Process text files and collect metadata
    for filename in os.listdir(text_folder):
        if filename.endswith(".txt"):
            file_path = os.path.join(text_folder, filename)
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
            
            # Create document with metadata
            source = filename.rsplit('.', 1)[0]  # Remove .txt extension
            doc = Document(
                page_content=text,
                metadata={"source": source, "path": file_path}
            )
            documents.append(doc)

    # Split documents into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    splits = text_splitter.split_documents(documents)

    # Extract content and metadata for storage
    split_contents = [doc.page_content for doc in splits]
    split_metadata = [doc.metadata for doc in splits]

    # Save documents and metadata for BM25
    with open(index_dir / "documents.pkl", "wb") as f:
        pickle.dump(split_contents, f)
    
    with open(index_dir / "metadata.json", "w") as f:
        json.dump(split_metadata, f, indent=2)

    # Create and save FAISS index
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vector_store = FAISS.from_documents(splits, embeddings)
    vector_store.save_local(rag_folder)

    return vector_store