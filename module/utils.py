# module/utils.py
from typing import List

def format_conversation_history(messages: List[dict]) -> str:
    """Format conversation history for context"""
    formatted = []
    for msg in messages:
        role = msg.get('role', 'user')
        content = msg.get('content', '')
        formatted.append(f"{role.upper()}: {content}")
    return "\n".join(formatted)

def clean_text(text: str) -> str:
    """Clean extracted text"""
    text = ' '.join(text.split())
    lines = text.split('\n')
    cleaned_lines = [line for line in lines if len(line) > 10]
    return '\n'.join(cleaned_lines)

def estimate_tokens(text: str) -> int:
    """Rough token count estimation (1 token ≈ 4 chars)"""
    return len(text) // 4

def truncate_context(context: str, max_tokens: int = 2000) -> str:
    """Truncate context to fit token limit"""
    if estimate_tokens(context) <= max_tokens:
        return context
    return context[:max_tokens * 4] + "..."