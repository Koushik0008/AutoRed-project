import os

from dotenv import load_dotenv
from groq import Groq


# --------------------------------------------------
# STEP 1: Load variables from .env
# --------------------------------------------------

load_dotenv()


# --------------------------------------------------
# STEP 2: Get Groq API key
# --------------------------------------------------

api_key = os.getenv("GROQ_API_KEY")


if not api_key:
    print("ERROR: GROQ_API_KEY was not found.")
    print("Please check your .env file.")
    exit()


print("========================================")
print("          AUTORED - GROQ TEST")
print("========================================")

print("API key found in .env")
print("Connecting to Groq...")


# --------------------------------------------------
# STEP 3: Create Groq client
# --------------------------------------------------

client = Groq(api_key=api_key)


# --------------------------------------------------
# STEP 4: Test connection
# --------------------------------------------------

try:

    models = client.models.list()

    print("\nConnection successful!")

    print("Available models found:", len(models.data))

    print("\nAvailable model IDs:")

    for model in models.data:
        print("-", model.id)


except Exception as e:

    print("\nERROR while connecting to Groq:")

    print("Error type:", type(e).__name__)

    print("Error message:", e)