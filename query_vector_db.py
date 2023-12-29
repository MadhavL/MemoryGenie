from sentence_transformers import SentenceTransformer
import weaviate
import json

#In the future, remove duplicates when adding to database
weaviate_url= "https://conversation-n4hov4ad.weaviate.network" #muddy.tot

weaviate_key = "tpgdv5P7B43bxH26cgOmIRUCrMJfJrTXXqeT"

model = SentenceTransformer('all-mpnet-base-v2')

client = weaviate.Client(
    url = weaviate_url,  # Replace with your endpoint
    auth_client_secret=weaviate.AuthApiKey(api_key=weaviate_key),  # Replace w/ your Weaviate instance API key
    timeout_config=500
)

def query_db():
    query = input("What are you searching for? (x to exit) ")
    while (query != 'x'):
      # nearText = {"concepts": ["macroeconomic policy"]}
      # nearVector = {"vector": model.encode(query)}
      queryvector = model.encode(query)
      response = (
          client.query
          .get("Transcript", ["transcript", "answer", "category"])
          .with_hybrid(
              query=query,
              vector=queryvector
              )
          .with_limit(10)
          .do()
      )
      print(json.dumps(response, indent=4))
      query = input("What are you searching for? (x to exit) ")

if __name__ == "__main__":
  query_db()