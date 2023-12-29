from sentence_transformers import SentenceTransformer
import weaviate
import json

#In the future, remove duplicates when adding to database
weaviate_url= "https://memorygenie-iwdu90fy.weaviate.network" #muddy.tot

weaviate_key = "j3MWdO2oqV1Dse4oHuOhVfSWftzkVOqev5LW"

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
    #   print(json.dumps(initial_response, indent=4))
      full_text = initial_response['data']['Get']['Transcript'][0]['transcript']
      conv_id = initial_response['data']['Get']['Transcript'][0]['conversation_id']
      print(f"Full text: {full_text}")
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
      print("\nRelevant sentences: ")
      relevant_sentences = final_response['data']['Get']['Transcript']
      for sentence in relevant_sentences:
         print(sentence['transcript'])
         print('\n')

      query = input("What are you searching for? (x to exit) ")

def query_db_with_query(query):
    # query = input("What are you searching for? (x to exit) ")
      # nearText = {"concepts": ["macroeconomic policy"]}
      # nearVector = {"vector": model.encode(query)}
    queryvector = model.encode(query)
    initial_response = (
        client.query
        .get("Transcript", ["transcript", "conversation_id"])
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
    print(json.dumps(initial_response, indent=4))

if __name__ == "__main__":
  query_db()