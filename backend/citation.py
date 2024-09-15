import requests
from groq import Groq
import dotenv
import os
import json
from bs4 import BeautifulSoup

dotenv.load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_KEY"))


def get_citations(content):
    query = ask_groq(content)
    search_results = search(query)
    if "webPages" in search_results:
        return [result['url'] for result in search_results["webPages"]["value"]]
    else:
        return []


def ask_groq(content):
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": """
You are a helpful assistant that generates Google search queries based on a given prompt.
From now on, you will be given a prompt and you will respond with a Google search query that will return a list of citations supporting the prompt.
Tone: spartan, just a search query. No intro, no explanation, just the query. Only plain text.

Text: {0}


""".format(
                    content
                ),
            }
        ],
        model="llama3-8b-8192",
    )
    print(chat_completion.choices[0].message.content)
    return chat_completion.choices[0].message.content


def search(query):
    headers = {
        "Ocp-Apim-Subscription-Key": os.environ.get("BING_KEY"),
    }

    params = {
        "q": query,
    }

    response = requests.get(
        "https://api.bing.microsoft.com/v7.0/search", params=params, headers=headers
    )
    return response.json()

def validate_citations(citations):
    valid_citations = []
    for citation in citations:
        try:
            response = requests.get(citation, allow_redirects=True, timeout=5)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                title = soup.title.string if soup.title else "No title found"
                valid_citations.append({"url": citation, "title": title})
        except requests.RequestException:
            continue
    return valid_citations

# validate_citations(get_citations("Artists are protesting against AI art"))