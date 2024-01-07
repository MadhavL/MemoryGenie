from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
from query_vector_db import sentence_to_conversation_query, conversation_to_conversation_query, sentence_to_sentence_query
import time
from pydantic import BaseModel
from update_vector_db import update_db


# uvicorn backend:app --reload
# lt --port 8000 --local-host "127.0.0.1" -o --print-requests
class Query(BaseModel):
    query: str

class Update(BaseModel):
    text: str
    type: str
    id: str

app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/query-sentence-conversation/")
def query_sentence_to_conversation(query: Query):
    return sentence_to_conversation_query(query.query) 

@app.post("/query-conversation-conversation/")
def query_conversation_to_conversation(query: Query):
    return conversation_to_conversation_query(query.query)

@app.post("/query-sentence-sentence/")
def query_sentence_to_sentence(query: Query):
    return sentence_to_sentence_query(query.query)

@app.post("/update-db/")
def update(update: Update):
    update_db(update.text, update.type, update.id)