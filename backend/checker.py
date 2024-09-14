import os
from dotenv import load_dotenv
import google.generativeai as genai
from google.ai.generativelanguage_v1beta.types import content

def check_text(text):
    load_dotenv()
    genai.configure(api_key=os.getenv("GEMINI_KEY"))

    prompt = """
    You are a professional fact checker who checks text for any statements that may need to be fact checked.

    Given the following text, I want you to:
    (1) identify if there exists any statements that might need to be fact checked, where a statement that needs to be fact checked is defined as a statement that may or may not be true or is misleading, 
    (2) for each statement that should be fact checked, do all of steps 3-7, where each step is defined as follows:
    (3) pinpoint an exact quote of a statement within the text that should be highlighted as being fact checked,
    (4) provide a brief summary of the statement that is being fact checked as content,
    (6) provide a truthiness score between 0 and 1, where 0 is definitely false and 1 is definitely true,
    (7) provide a list of at least 3 citations that can be used to verify the truthiness of the statement. For each citation, provide a URL to the source of the citation and absolutely ensure that this URL is valid.  
    (8) if there are no statements that need to be fact checked, return an empty list.
    
    For example, given the text "All bacteria are harmful. Bacteria are harmful to humans because they cause disease. This is why you have to wash your hands when you get home or touch something dirty to prevent diseases.", you should return the following response: "While some bacteria can cause illness, many others are essential for human health. These beneficial bacteria, known as probiotics, play crucial roles in various bodily functions. For example, they aid in digestion, nutrient absorption, and immune system development." with a truthiness score of 0.9 and citations to three sources that support the statement.
    
    Text: {0}
    """.format(text)

    generation_config = {
        "temperature": 0.2,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 8192,
        "response_schema": content.Schema(
            type = content.Type.OBJECT,
            properties = {
            "truthiness": content.Schema(
                type = content.Type.NUMBER,
            ),
            "highlight": content.Schema(
                type = content.Type.STRING,
            ),
            "content": content.Schema(
                type = content.Type.STRING,
            ),
            "citations": content.Schema(
                type = content.Type.ARRAY,
                items = content.Schema(
                type = content.Type.STRING,
                ),
            ),
            },
        ),
        "response_mime_type": "application/json",
    }

    model = genai.GenerativeModel(
        model_name="gemini-1.5-pro",
        generation_config=generation_config,
    )

    # update as needed
    chat_session = model.start_chat(
        history=[]
    )

    response = chat_session.send_message(prompt)
    print(response.text)


# response = check_text("generative ai will harm the world. we do not trust generative AI and we will never trust it.")