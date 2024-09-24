import React, { useState, useEffect } from 'react';
import { ReactMediaRecorder } from 'react-media-recorder';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';
import CustomOrb from './CustomOrb';
import Orb from './Orb';
import AudioWave from './AudioWave';
import MicWave from './MicWave'; // Import MicWave component
import axios from 'axios';
import './JarvisInput.css';

const JarvisInput = () => {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCustomOrbVisible, setIsCustomOrbVisible] = useState(true);
  const [audioResponseUrl, setAudioResponseUrl] = useState(null); // URL for AI-generated audio response
  const [isAudioPlaying, setIsAudioPlaying] = useState(false); // Track if AI response audio is playing
  const [micWaveVisible, setMicWaveVisible] = useState(false); // Track visibility of MicWave

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Function to generate response (text or transcribed audio)
  const handleGenerateResponse = async (text) => {
    try {
      setIsProcessing(true);
      setIsCustomOrbVisible(false); // Hide CustomOrb, show processing Orb

      console.log('Sending input text to backend for response generation...');
      const response = await axios.post('http://localhost:5000/generate', { input: text });

      const fileUrl = `http://localhost:5000/audio/${response.data.audio_file}`;
      setAudioResponseUrl(fileUrl); // Set the AI-generated audio URL for the AudioWave component
      setIsAudioPlaying(true); // Mark that the AI response is playing

      console.log('Generated response:', response.data.response);
      console.log('Playing audio from:', fileUrl);
    } catch (error) {
      console.error('Error generating text response:', error);
      alert('Failed to generate response.');
    } finally {
      setIsProcessing(false);
      setIsCustomOrbVisible(true); // Restore CustomOrb after processing
    }
  };

  // Function to transcribe audio and send response
  const handleTranscribeAudio = async (mediaBlobUrl) => {
    try {
      setIsProcessing(true);
      setIsCustomOrbVisible(false); // Hide CustomOrb, show processing Orb

      const formData = new FormData();
      const audioBlob = await fetch(mediaBlobUrl).then((r) => r.blob());
      formData.append('audio', audioBlob, 'audio-recording.webm'); // Send audio file to the backend

      console.log('Sending WebM audio to backend for transcription...');

      // Send WebM audio to the transcribe endpoint
      const transcribeResponse = await axios.post('http://localhost:5000/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Transcription response:', transcribeResponse.data);

      const transcribedText = transcribeResponse.data.transcription;
      await handleGenerateResponse(transcribedText); // Generate response based on transcribed text
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Failed to transcribe audio.');
    } finally {
      setIsProcessing(false);
      setMicWaveVisible(false); // Hide micwave after recording ends
    }
  };

  // Play AI response and handle AudioWave visibility
  const handleAudioPlay = () => {
    setIsAudioPlaying(true);
  };

  const handleAudioEnd = () => {
    setIsAudioPlaying(false); // Hide AudioWave once audio finishes
    setAudioResponseUrl(null); // Reset the audio URL
  };

  // Automatically play AI response audio
  useEffect(() => {
    if (audioResponseUrl) {
      handleAudioPlay();
    }
  }, [audioResponseUrl]);

  return (
    <div className="container">
      {/* Step 1: Toggle between CustomOrb and processing Orb */}
      <div className="orb-container">
        {isProcessing ? <Orb /> : isCustomOrbVisible ? <CustomOrb /> : null}
      </div>

      {/* Step 4: Render MicWave when recording */}
      {micWaveVisible && <MicWave />}

      {/* Step 2: Render AudioWave when the AI response is playing */}
      {isAudioPlaying && <AudioWave audioUrl={audioResponseUrl} onEnded={handleAudioEnd} />}

      <p>Ask me anything</p>

      {/* ReactMediaRecorder for voice recording */}
      <ReactMediaRecorder
        audio
        render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
          <div className="input-container">
            <input
              type="text"
              placeholder="type here..."
              value={inputValue}
              onChange={handleInputChange}
              disabled={isProcessing}
            />

            {!inputValue && (
              <>
                {status === 'recording' ? (
                  <button
                    onClick={async () => {
                      stopRecording();
                      setMicWaveVisible(false); // Hide micwave when recording ends
                      if (mediaBlobUrl) {
                        await handleTranscribeAudio(mediaBlobUrl); // Send audio for transcription
                      }
                    }}
                  >
                    <FaStop style={{ fontSize: '1.5em', color: 'white' }} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      startRecording(); // Begin the recording
                      setMicWaveVisible(true); // Show micwave when recording starts
                    }}
                  >
                    <FaMicrophone />
                  </button>
                )}
              </>
            )}

            {/* Send text input to the backend */}
            {inputValue && (
              <button
                onClick={async () => {
                  await handleGenerateResponse(inputValue);
                  setInputValue(''); // Clear the input field immediately
                }}
                disabled={isProcessing}
              >
                <IoMdSend />
              </button>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default JarvisInput;
