import sys
sys.path.append('.')
from module.rag_engine import RAGEngine

rag = RAGEngine()

print("Haya is ready. Type your question (or 'quit' to exit)\n")

history = []
while True:
    question = input("You: ")
    if question.lower() == 'quit':
        break
    
    result = rag.query(question, history)
    print(f"\nHaya: {result['answer']}")
    print(f"Sources: {result['sources']}")
    print(f"Confidence: {result['confidence']:.2f}\n")
    
    history.append({"role": "user", "content": question})
    history.append({"role": "assistant", "content": result['answer']})