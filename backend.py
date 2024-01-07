from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
from query_vector_db import sentence_to_conversation_query, conversation_to_conversation_query, sentence_to_sentence_query
import time

# uvicorn backend:app --reload
# lt --port 8000 --local-host "127.0.0.1" -o --print-requests

app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/query-sentence-conversation/{query}")
def query_sentence_to_conversation(query):
    return sentence_to_conversation_query(query) 

@app.get("/query-conversation-conversation/{query}")
def query_conversation_to_conversation(query):
    return conversation_to_conversation_query(query)

@app.get("/query-sentence-sentence/{query}")
def query_sentence_to_sentence(query):
    return sentence_to_sentence_query(query) 