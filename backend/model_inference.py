import requests

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"


def load_context_from_txt(txt_path, max_chars=2000):
    with open(txt_path, "r", encoding="utf-8") as f:
        return f.read()[:max_chars]


def generate_guided_answer(context, question, model="qwen2.5:3b"):
    """
    Generate an educational answer using ONLY provided context.
    The model guides the student instead of giving final solutions.
    """

    prompt = f"""
You are Haya, an academic learning assistant.

Rules:
- Use ONLY the provided context.
- Do NOT give final answers or formulas.
- Ask guiding questions.
- Explain concepts step by step.
- Encourage the student to think.

Context:
{context}

Student Question:
{question}

Guided Explanation:
"""

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": model,
            "prompt": prompt,
            "stream": False
        },
        timeout=600
    )

    response.raise_for_status()
    return response.json()["response"]


if __name__ == "__main__":
    # Load REAL processed PDF text
    context = load_context_from_txt(
        "data/processed/Basic_Business_Statistics_Concepts_and_Applns_12th_ed_intro_txt.txt"
    )

    question = "What does a probability space mean?"

    answer = generate_guided_answer(context, question)

    print("\nHaya says:\n")
    print(answer)
