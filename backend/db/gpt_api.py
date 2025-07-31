import openai

# Set your OpenAI API key here or use environment variable
OPENAI_API_KEY = ""

client = openai.OpenAI(api_key=OPENAI_API_KEY)

def chat_with_gpt(prompt, model="gpt-3.5-turbo", temperature=0.7, max_tokens=256):
    """
    Sends a prompt to the OpenAI ChatGPT API and returns the response.
    """
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        max_tokens=max_tokens
    )
    content = response.choices[0].message.content
    return content.strip() if content else ""

def generate_word_info(word):
    """
    Uses GPT-4o-mini to generate antonyms, synonyms, examples, transcription, and syllables for the given word.
    Returns a dictionary with these fields.
    """
    import json
    prompt = f"""
        For the English word '{word}', provide the following as a JSON object with these keys:
        - meaning: the meaning of the word
        - antonyms: a comma-separated string of antonyms
        - synonyms: a comma-separated string of synonyms
        - examples: three example sentences using the word
        - transcription: the IPA transcription of the word
        - syllables: the word broken down into syllables, separated by hyphens
        Example output:
        {{
        "meaning": "...",
        "antonyms": "...",
        "synonyms": "...",
        "examples": "...",
        "transcription": "...",
        "syllables": "..."
        }}
    """
    response = chat_with_gpt(prompt, model="gpt-4o-mini", temperature=0.2, max_tokens=256)
    try:
        info = json.loads(response)
    except Exception:
        # Try to extract JSON from response if not pure JSON
        import re
        match = re.search(r'\{.*\}', response, re.DOTALL)
        if match:
            info = json.loads(match.group(0))
        else:
            raise ValueError("Could not parse GPT response as JSON: " + response)
    return info

# Example usage
def example():
    prompt = "Hello, who won the world cup in 2018?"
    answer = chat_with_gpt(prompt)
    print("GPT response:", answer)

if __name__ == "__main__":
    example() 