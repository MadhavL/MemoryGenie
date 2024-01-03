from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
from query_vector_db import query_db_with_query
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

@app.get("/query/{query}")
def query_db(query):
    # print(time.time())
    return query_db_with_query(query) 