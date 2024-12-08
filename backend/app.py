from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from langchain_core.messages import AIMessage, HumanMessage
from langchain_community.vectorstores.qdrant import Qdrant
import qdrant_client
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from Template.promptAI import AI_prompt
from elevenlabs import ElevenLabs
import base64
import os
import orjson
import logging

# Load environment variables
load_dotenv()

# Initialize Flask App
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://usmle-conversationalassistant.onrender.com"}})

# Initialize logger
logging.basicConfig(level=logging.INFO)

# Initialize ElevenLabs client
elevenlabs_client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

# Initialize global variables
chat_history = []

# Qdrant configuration
def get_vector_store():
    client = qdrant_client.QdrantClient(
        url=os.getenv("QDRANT_HOST"),
        api_key=os.getenv("QDRANT_API_KEY"),
    )
    embeddings = OpenAIEmbeddings()
    vector_store = Qdrant(
        client=client,
        collection_name=os.getenv("QDRANT_COLLECTION_NAME"),
        embeddings=embeddings,
    )
    return vector_store

vector_store = get_vector_store()

# Initialize LLM and chains
llm = ChatOpenAI()
retriever = vector_store.as_retriever()

retriever_prompt = ChatPromptTemplate.from_messages([
    MessagesPlaceholder(variable_name="chat_history"),
    ("user", "{input}"),
    ("user", "Generate a search query based on the conversation."),
])
retriever_chain = create_history_aware_retriever(llm, retriever, retriever_prompt)

conversational_prompt = ChatPromptTemplate.from_messages([
    ("system", AI_prompt),
    MessagesPlaceholder(variable_name="chat_history"),
    ("user", "{input}"),
])
stuff_documents_chain = create_stuff_documents_chain(llm, conversational_prompt)
conversation_rag_chain = create_retrieval_chain(retriever_chain, stuff_documents_chain)

# Text-to-speech using ElevenLabs
def text_to_speech_base64(text):
    """Convert text to speech and return audio as base64."""
    try:
        response = elevenlabs_client.text_to_speech.convert(
            voice_id="Xb7hH8MSUJpSbSDYk0k2",  # Replace with your desired voice ID
            model_id="eleven_multilingual_v2",
            text=text,
        )
        audio_data = b"".join(chunk for chunk in response if chunk)
        return base64.b64encode(audio_data).decode("utf-8")
    except Exception as e:
        app.logger.error(f"Error generating audio with ElevenLabs: {e}")
        return None

# Efficient JSON response helper
def jsonify_fast(data):
    return app.response_class(response=orjson.dumps(data), mimetype="application/json")

# Generate endpoint
@app.route('/generate', methods=['POST'])
def generate():
    try:
        user_input = request.json.get('input')
        app.logger.info(f"User input: {user_input}")
        
        # Update chat history
        chat_history.append(HumanMessage(content=user_input))

        # Generate response synchronously
        response = conversation_rag_chain.invoke({
            "chat_history": chat_history,
            "input": user_input,
        })
        response_content = response.get("answer", "")
        chat_history.append(AIMessage(content=response_content))

        # Generate audio
        audio_base64 = text_to_speech_base64(response_content)

        # Return response and audio
        return jsonify_fast({
            "response": response_content,
            "audio": audio_base64
        })
    except Exception as e:
        app.logger.error(f"Error in /generate endpoint: {e}")
        return jsonify({"error": str(e)}), 500

# Run Flask App with hypercorn or similar
if __name__ == '__main__':
    app.run(debug=True, threaded=True)




