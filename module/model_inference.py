import requests

def generate_llm_answer(context, question, model="qwen2.5:7b"):
    prompt = f"""
You are Haya — an educational assistant.
Use ONLY the context to explain the answer clearly.
Do NOT give direct solutions. Explain step-by-step.

Context:
{context}

Question:
{question}
"""

    response = requests.post(
        "http://127.0.0.1:4571/",
        json={"model": model, "prompt": prompt}
    )

    return response.json().get("response", "")


# for testing
context = """Machine learning is a method of data analysis that automates analytical model building.
It allows systems to learn from data and make decisions with minimal human intervention."""

question = "How does machine learning help computers learn from data?"
answer = generate_llm_answer(context, question)

print("Generated Answer:")
print(answer)
