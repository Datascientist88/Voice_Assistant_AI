from flask import Flask, request, jsonify, send_file
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
import os
import uuid
from openai import OpenAI
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs
import tempfile
import logging

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Allow CORS requests from frontend (localhost:3000)
CORS(app, resources={r"/*": {"origins": "https://patientvoiceassistant.onrender.com"}})

# Initialize logging for debugging
logging.basicConfig(level=logging.DEBUG)

# Initialize global variables
chat_history = []
collection_name = os.getenv("QDRANT_COLLECTION_NAME")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize ElevenLabs client
elevenlabs_client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

# Setup VectorStore
def get_vector_store():
    client = qdrant_client.QdrantClient(
        url=os.getenv("QDRANT_HOST"),
        api_key=os.getenv("QDRANT_API_KEY"),
    )
    embeddings = OpenAIEmbeddings()
    vector_store = Qdrant(
        client=client,
        collection_name=collection_name,
        embeddings=embeddings,
    )
    return vector_store

vector_store = get_vector_store()

# RAG Chain
def get_context_retriever_chain(vector_store=vector_store):
    llm = ChatOpenAI(model='gpt-4o')
    retriever = vector_store.as_retriever()
    prompt = ChatPromptTemplate.from_messages([
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
        ("user", "Generate a search query based on the conversation."),
    ])
    retriever_chain = create_history_aware_retriever(llm, retriever, prompt)
    return retriever_chain

def get_conversational_rag_chain(retriever_chain):
    llm = ChatOpenAI(model='gpt-4o')
    prompt = ChatPromptTemplate.from_messages([
        ("system", AI_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
    ])
    stuff_documents_chain = create_stuff_documents_chain(llm, prompt)
    return create_retrieval_chain(retriever_chain, stuff_documents_chain)

# Transcribe audio using OpenAI Whisper
def speech_to_text(audio_data_path):
    try:
        with open(audio_data_path, "rb") as audio_file:
            transcript = openai_client.audio.transcriptions.create(
                model="whisper-1", file=audio_file 
            )
        logging.debug(f"Transcription response: {transcript}")

        # Check for correct response structure
        if hasattr(transcript, 'text'):
            return {"text": transcript.text}  # Direct attribute access
        elif isinstance(transcript, dict) and "text" in transcript:
            return {"text": transcript["text"]}
        else:
            raise ValueError("Unexpected response structure")
    except Exception as e:
        logging.error(f"Error during transcription: {e}")
        raise ValueError(f"Failed to transcribe audio: {e}")

# Convert text to speech using Eleven Labs and save to a file
def text_to_speech_file(text: str) -> str:
    logging.debug(f"Converting text to speech: {text}")
    try:
        response = elevenlabs_client.text_to_speech.convert(
            voice_id="JBFqnCBsd6RMkjVDRZzb",
            optimize_streaming_latency="0",
            output_format="mp3_22050_32",
            text=text,
            model_id="eleven_turbo_v2_5",
            voice_settings=VoiceSettings(
                stability=0.0,
                similarity_boost=1.0,
                style=0.0,
                use_speaker_boost=True,
            ),
        )
        # Save audio to temp file
        save_file_path = os.path.join(tempfile.gettempdir(), f"{uuid.uuid4()}.mp3")
        with open(save_file_path, "wb") as f:
            for chunk in response:
                if chunk:
                    f.write(chunk)
        logging.debug(f"Audio file saved at: {save_file_path}")
        return save_file_path
    except Exception as e:
        logging.error(f"Error during text-to-speech conversion: {e}")
        raise ValueError(f"Failed to generate speech audio: {e}")
# Transcription Endpoint for Audio Files
@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]
    supported_formats = ['flac', 'm4a', 'mp3', 'mp4', 'mpeg', 'mpga', 'oga', 'ogg', 'wav', 'webm']
    file_extension = audio_file.filename.split('.')[-1].lower()
    if file_extension not in supported_formats:
        return jsonify({"error": f"Unsupported file format: {file_extension}. Supported formats: {supported_formats}"}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as temp_audio:
        audio_file.save(temp_audio.name)
        temp_audio_path = temp_audio.name

    try:
        transcript_result = speech_to_text(temp_audio_path)
    finally:
        os.remove(temp_audio_path)

    return jsonify({"transcript": transcript_result.get("text", "")})

# Generate response from text or transcribed audio
@app.route('/generate', methods=['POST'])
def generate():
    try:
        # Check if audio or text is being sent
        if 'audio' in request.files:
            logging.debug("Received audio input")
            audio_file = request.files['audio']
            audio_path = os.path.join(tempfile.gettempdir(), audio_file.filename)
            audio_file.save(audio_path)
            logging.debug(f"Audio file saved at: {audio_path}")
            
            # Transcribe the audio
            user_input = speech_to_text(audio_path)["text"]
        else:
            logging.debug("Received text input")
            user_input = request.json.get('input')

        # Add human message to chat history
        chat_history.append(HumanMessage(content=user_input))

        # Generate response
        retriever_chain = get_context_retriever_chain(vector_store)
        conversation_rag_chain = get_conversational_rag_chain(retriever_chain)
        response_content = conversation_rag_chain.invoke({
            "chat_history": chat_history, "input": user_input
        }).get("answer", "")

        # Add AI response to chat history
        chat_history.append(AIMessage(content=response_content))

        # Convert text response to audio and save the file
        audio_file_path = text_to_speech_file(response_content)

        # Return response and audio file path
        audio_file_name = os.path.basename(audio_file_path)
        return jsonify({"response": response_content, "audio_file": audio_file_name})
    
    except Exception as e:
        logging.error(f"Error in generate endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Serve generated audio files
@app.route('/audio/<filename>', methods=['GET'])
def serve_audio(filename):
    audio_path = os.path.join(tempfile.gettempdir(), filename)
    logging.debug(f"Serving audio file: {audio_path}")
    if os.path.exists(audio_path):
        return send_file(audio_path, mimetype='audio/mpeg')
    else:
        logging.error(f"Audio file not found: {audio_path}")
        return jsonify({"error": "Audio file not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)



