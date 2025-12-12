from sentence_transformers import SentenceTransformer
import numpy as np
import faiss

class Embedder:
    def __init__(self):
        self.model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

    def embed_text(self, text):
        return self.model.encode([text])[0]

class VectorIndex:
    def __init__(self, dim=384):
        self.dim = dim
        self.index = faiss.IndexFlatL2(dim)
        self.text_chunks = []

    def add(self, vector, chunk):
        self.index.add(np.array([vector]).astype("float32"))
        self.text_chunks.append(chunk)

    def search(self, query_vector, top_k=5):
        distances, indexes = self.index.search(
            np.array([query_vector]).astype("float32"), top_k
        )
        results = []
        for idx in indexes[0]:
            if idx < len(self.text_chunks):
                results.append(self.text_chunks[idx])
        return results
