from module.embedder import Embedder, VectorIndex

class Retriever:
    def __init__(self):
        self.embedder = Embedder()
        self.index = VectorIndex()

    def chunk_text(self, text, chunk_size=100):
        words = text.split()
        chunks = []
        for i in range(0, len(words), chunk_size):
            chunks.append(" ".join(words[i:i + chunk_size]))
        return chunks

    def build_index(self, documents):
        for doc in documents:
            text = doc["text"]
            chunks = self.chunk_text(text, chunk_size=100)
            for chunk in chunks:
                if len(chunk.strip()) > 50:
                    vec = self.embedder.embed_text(chunk)
                    self.index.add(vec, chunk)

    def retrieve(self, query):
        query_vec = self.embedder.embed_text(query)
        return self.index.search(query_vec)
