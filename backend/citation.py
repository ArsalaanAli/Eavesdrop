import requests
import groq

def get_citations(content):

def ask_groq(content):
    

def search_brave(query):
    headers = {
        'Accept': 'application/json',
        # 'Accept-Encoding': 'gzip',
        'X-Subscription-Token': '<YOUR_API_KEY>',
    }

    params = {
        'q': query,
    }

    response = requests.get('https://api.search.brave.com/res/v1/web/search', params=params, headers=headers)
    return response.json()