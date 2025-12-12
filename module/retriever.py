from module.embedder import Embedder, VectorIndex

class Retriever:
    def __init__(self):
        self.embedder = Embedder()
        self.index = VectorIndex()

    def build_index(self, documents):
        for doc in documents:
            text = doc["text"]
            chunks = text.split("\n\n")  # splitting into chunks, this part needs improvement
            for chunk in chunks:
                if len(chunk.strip()) > 50:
                    vec = self.embedder.embed_text(chunk)
                    self.index.add(vec, chunk)

    def retrieve(self, query):
        query_vec = self.embedder.embed_text(query)
        return self.index.search(query_vec)
