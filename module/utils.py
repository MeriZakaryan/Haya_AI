# module/utils.py
import ollama
from typing import Dict, Any

def check_ollama_connection() -> bool:
    """Check if Ollama is running and accessible"""
    try:
        # Try to list models
        models = ollama.list()
        return True
    except Exception as e:
        print(f"Ollama connection error: {e}")
        return False

def get_available_models() -> list:
    """Get list of available Ollama models"""
    try:
        response = ollama.list()
        return [model['name'] for model in response.get('models', [])]
    except Exception as e:
        print(f"Error getting models: {e}")
        return []

def format_conversation_history(messages: list) -> str:
    """Format conversation history for context"""
    formatted = []
    for msg in messages:
        role = msg.get('role', 'user')
        content = msg.get('content', '')
        formatted.append(f"{role.upper()}: {content}")
    return "\n".join(formatted)

def clean_text(text: str) -> str:
    """Clean extracted text"""
    # Remove excessive whitespace
    text = ' '.join(text.split())
    
    # Remove page numbers and headers (simple heuristic)
    lines = text.split('\n')
    cleaned_lines = [line for line in lines if len(line) > 10]
    
    return '\n'.join(cleaned_lines)

def estimate_tokens(text: str) -> int:
    """Rough estimation of token count"""
    # Rough approximation: 1 token ≈ 4 characters
    return len(text) // 4

def truncate_context(context: str, max_tokens: int = 2000) -> str:
    """Truncate context to fit within token limit"""
    estimated = estimate_tokens(context)
    
    if estimated <= max_tokens:
        return context
    
    # Truncate to approximate token limit
    char_limit = max_tokens * 4
    return context[:char_limit] + "..."