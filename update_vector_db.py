from sentence_transformers import SentenceTransformer
import weaviate
import os
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