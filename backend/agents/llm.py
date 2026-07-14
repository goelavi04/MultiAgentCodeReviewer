import os
from dotenv import load_dotenv
from langchain_core.language_models import BaseChatModel

load_dotenv()


def get_llm() -> BaseChatModel:
    provider = os.getenv("LLM_PROVIDER", "groq").lower()
    groq_key = os.getenv("GROQ_API_KEY", "")

    if provider == "groq" and groq_key and groq_key != "your_key_here":
        from langchain_groq import ChatGroq
        return ChatGroq(model="llama-3.1-8b-instant", api_key=groq_key, temperature=0.1)

    from langchain_ollama import ChatOllama
    return ChatOllama(model="llama3", temperature=0.1)
