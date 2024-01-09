from sentence_transformers import SentenceTransformer
import weaviate
import os
import time

#In the future, remove duplicates when adding to database
WEAVIATE_URL= "https://memory-genie-2ib0f0rx.weaviate.network"

WEAVIATE_KEY = "kjSVPEXT3FwccyvwE0YLcuAiJjfp4QGGHIgi"

model = SentenceTransformer('all-mpnet-base-v2')

client = weaviate.Client(
    url = WEAVIATE_URL,  # Replace with your endpoint
    auth_client_secret=weaviate.AuthApiKey(api_key=WEAVIATE_KEY),  # Replace w/ your Weaviate instance API key
    timeout_config=500
)

#Take in a list of strings, embed/vectorize, and add them to the database
def update_db(utterances, type, conv_id):
    class_obj = {
        "class": "Transcript",
        "vectorizer": "none",
    }

    schema = client.schema.get()
    for w_class in schema['classes']:
        if ("Transcript" not in w_class.values()):
            client.schema.create_class(class_obj)

    client.batch.configure(batch_size=100)  # Configure batch
    conversations = os.listdir('dataset')
    with client.batch as batch:
        for utterance in utterances:
            
            # Initialize a batch process
            properties = {
                "conversation_id": conv_id,
                "type": type,
                "transcript": utterance,
            }
            batch.add_data_object(
                data_object=properties,
                class_name="Transcript"
            )
            print(f"TRANSCRIPT: {utterance}")

if __name__ == "__main__":
  update_db()