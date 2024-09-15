import json
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from groq import Groq


class Result(BaseModel):
    truthiness: float
    highlight: str
    content: str
    citations: list[str]

def groq_validator(json_string: str):
    load_dotenv()
    groq = Groq(os.getenv("GROQ_KEY"))

    chat_completion = groq.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a JSON string validator that outputs a response in JSON object.\n"
                # Pass the json schema to the model. Pretty printing improves results.
                f" The JSON object must use the schema: {json.dumps(Result.model_json_schema(), indent=2)}",
            },
            {
                "role": "user",
                "content": f"Ensure that this JSON has exactly 4 keys: thruthiness, highlight, content, and citations. Truthiness must be a float, where 0.0 means the statement is completely false and 1.0 means the statement is completely true. Highlight is a short quote that is a statement that can be true or false. Content is a longer description explaining why the statement is true or false. Citations is a list of strings where each item is a valid URL. Check the following string and return its correct JSON object: {json_string}",
            },
        ],
        model="llama3-8b-8192",
        temperature=0,
        # Streaming is not supported in JSON mode
        stream=False,
        # Enable JSON mode by setting the response format
        response_format={"type": "json_object"},
    )
    return Result.model_validate_json(chat_completion.choices[0].message.content)
