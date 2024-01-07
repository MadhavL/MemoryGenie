from sentence_transformers import SentenceTransformer
import weaviate
import json
import time

#In the future, remove duplicates when adding to database
weaviate_url= "https://memorygenie-iwdu90fy.weaviate.network" #muddy.tot

weaviate_key = "j3MWdO2oqV1Dse4oHuOhVfSWftzkVOqev5LW"

model = SentenceTransformer('all-mpnet-base-v2')

client = weaviate.Client(
    url = weaviate_url,  # Replace with your endpoint
    auth_client_secret=weaviate.AuthApiKey(api_key=weaviate_key),  # Replace w/ your Weaviate instance API key
    timeout_config=500
)

def sentence_to_conversation_query(query):
    queryvector = model.encode(query)
    initial_response = (
        client.query
        .get("Transcript", ["transcript", "type", "conversation_id"])
        .with_where({
            "path": ["type"],
            "operator": "Equal",
            "valueString": "full"
        })
        .with_hybrid(
            query=query,
            vector=queryvector
            )
        .with_limit(10)
        .do()
    )

    if initial_response:
        full_text = initial_response['data']['Get']['Transcript'][0]['transcript']
        conv_id = initial_response['data']['Get']['Transcript'][0]['conversation_id']
        final_response = (
            client.query
            .get("Transcript", ["transcript", "type", "conversation_id"])
            .with_where({
                "operator": "And",
                "operands": [
                    {
                    "path": ["type"],
                    "operator": "Equal",
                    "valueString": "sentence"
                    },
                    {
                    "path": ["conversation_id"],
                    "operator": "Equal",
                    "valueText": conv_id
                    }

                ]
                
            })
            .with_hybrid(
                query=query,
                vector=queryvector
                )
            .with_limit(10)
            .do()
        )
        relevant_sentences = final_response['data']['Get']['Transcript']
        return json.dumps({'conversation': full_text, 'relevant_sentences': [sentence['transcript'] for sentence in relevant_sentences]})
    else:
        return json.dumps({'conversation': '', 'relevant_sentences': ''})
    
def sentence_to_sentence_query(query):
    queryvector = model.encode(query)
    initial_response = (
        client.query
        .get("Transcript", ["transcript", "type", "conversation_id"])
        .with_where({
            "path": ["type"],
            "operator": "Equal",
            "valueString": "sentence"
        })
        .with_hybrid(
            query=query,
            vector=queryvector
            )
        .with_limit(10)
        .do()
    )
    if initial_response:
        relevant_sentences = initial_response['data']['Get']['Transcript']
        return json.dumps({'relevant_sentences': [sentence['transcript'] for sentence in relevant_sentences]})
    else:
        return json.dumps({'relevant_sentences': ''})
    
def conversation_to_conversation_query(query):
    queryvector = model.encode(query)
    initial_response = (
        client.query
        .get("Transcript", ["transcript", "type", "conversation_id"])
        .with_where({
            "path": ["type"],
            "operator": "Equal",
            "valueString": "full"
        })
        .with_hybrid(
            query=query,
            vector=queryvector
            )
        .with_limit(10)
        .do()
    )
    if initial_response:
        conversation = initial_response['data']['Get']['Transcript'][0]['transcript']
        return json.dumps({'conversation': conversation})
    else:
        return json.dumps({'conversation': ''})