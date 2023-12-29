from sentence_transformers import SentenceTransformer
import weaviate
import os

#In the future, remove duplicates when adding to database
weaviate_url= "https://conversation-n4hov4ad.weaviate.network" #muddy.tot

weaviate_key = "tpgdv5P7B43bxH26cgOmIRUCrMJfJrTXXqeT"

model = SentenceTransformer('all-mpnet-base-v2')

client = weaviate.Client(
    url = weaviate_url,  # Replace with your endpoint
    auth_client_secret=weaviate.AuthApiKey(api_key=weaviate_key),  # Replace w/ your Weaviate instance API key
    timeout_config=500
)


def update_db():
    class_obj = {
        "class": "Transcript",
        "vectorizer": "none",
    }

    client.schema.create_class(class_obj)

    client.batch.configure(batch_size=100)  # Configure batch
    conversations = os.listdir('dataset')
    with client.batch as batch:
        for conversation in conversations:
            with open('dataset/' + conversation) as f:
                transcript = f.readlines()
                # Initialize a batch process
                properties = {
                    "answer": "myans",
                    "transcript": transcript,
                    "category": "mycategory",
                }
                batch.add_data_object(
                    data_object=properties,
                    class_name="Transcript"
                )
                print(f"TRANSCRIPT: {transcript}")

if __name__ == "__main__":
  update_db()