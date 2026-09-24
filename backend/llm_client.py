import os

from dotenv import load_dotenv
from groq import Groq


# --------------------------------------------------
# Load environment variables
# --------------------------------------------------

load_dotenv()


# --------------------------------------------------
# Get API key
# --------------------------------------------------

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError(
        "GROQ_API_KEY was not found. "
        "Please check your .env file."
    )


# --------------------------------------------------
# Model configuration
# --------------------------------------------------

MODEL_NAME = "openai/gpt-oss-120b"


# --------------------------------------------------
# Create Groq client
# --------------------------------------------------

client = Groq(api_key=api_key)


# --------------------------------------------------
# Function: send a prompt to the LLM
# --------------------------------------------------

def ask_llm(prompt: str) -> str:

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        reasoning_effort="medium"
    )

    return response.choices[0].message.content