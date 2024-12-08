import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ChatInputWidget from "./ChatInputWidget";
import useAudioStore from "./store/audioStore";
import "./Chat.css";

const Chat = () => {
  const [chats, setChats] = useState([
    { msg: "Hi there! How can I assist you today?", who: "bot" },
  ]);
  const [loading, setLoading] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const chatContentRef = useRef(null);

  const { setAudioUrl } = useAudioStore();

  const scrollToBottom = () => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTo({
        top: chatContentRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats, loading]);

  const handleNewMessage = async (data) => {
    setIsChatVisible(true);

    if (data.text && data.text.trim().length > 0) {
      setChats((prevChats) => [...prevChats, { msg: data.text, who: "me" }]);
      setLoading(true);

      try {
        const response = await axios.post("https://voiceassistantflaskbackend.onrender.com/generate", {
          input: data.text,
        });

        const { response: botResponse, audio } = response.data;

        // Update chat with bot response
        setChats((prevChats) => [
          ...prevChats,
          { msg: botResponse, who: "bot" },
        ]);

        // Pass audio to Zustand store for playback
        if (audio) {
          const audioBlob = base64ToBlob(audio, "audio/mp3");
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioUrl);
        }
      } catch (error) {
        console.error("Error fetching response from /generate:", error);
        setChats((prevChats) => [
          ...prevChats,
          {
            msg: "Sorry, I couldn't process your request. Please try again.",
            who: "bot",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleChatVisibility = () => {
    setIsChatVisible((prevState) => !prevState);
  };

  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length).fill().map((_, i) => slice.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: mimeType });
  };

  return (
    <>
      {isChatVisible && (
        <div className="chat-content" ref={chatContentRef}>
          {chats.map((chat, index) => (
            <div key={index} className={`chat-message ${chat.who}`}>
              {chat.who === "bot" && (
                <figure className="avatar">
                  <img
                    src="./avatar.gif"
                    alt="avatar"
                  />
                </figure>
              )}
              <div className="message-text">{chat.msg}</div>
            </div>
          ))}

          {loading && (
            <div className="chat-message loading">
              <figure className="avatar">
                <img
                  src="./avatar.gif"
                  alt="avatar"
                />
              </figure>
              <div
                style={{ padding: "5px", display: "flex", alignItems: "center" }}
              >
                <lottie-player
                  src="https://lottie.host/47000d95-a3cd-43b8-ba63-fc7b3216f1cf/6gPsoPB6JM.json"
                  style={{ width: "130px", height: "130px" }}
                  loop
                  autoplay
                  speed="1"
                  direction="1"
                  mode="normal"
                ></lottie-player>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="chat-footer">
        <ChatInputWidget onSendMessage={handleNewMessage} />
        <button className="toggle-button" onClick={toggleChatVisibility}>
          {isChatVisible ? "-" : "+"}
        </button>
      </div>
    </>
  );
};

export default Chat;



