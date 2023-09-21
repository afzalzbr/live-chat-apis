"use client";

import React, { useState, useEffect } from "react";
import "./ChatWidget.css"; // Import your CSS file
import Image from "next/image";
import { MINIMIZE_ICON, USER_ICON } from "@/constants";

function ChatWidget({ messages, sendMessage }) {
  // const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  const handleUserMessageSubmit = () => {
    if (newMessage.trim() === "") return;
    const messageId = `${Math.random() * 1000}`;
    sendMessage(messageId, newMessage);
    setNewMessage("");
  };

  useEffect(() => {
    const chatContainer = document.getElementById("chat-container");
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, [messages]);

  const toggleMinimize = () => {
    setIsMinimized((prevMinimized) => !prevMinimized);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleUserMessageSubmit();
    }
  };

  return (
    <div className={`chat-widget ${isMinimized ? "minimized" : ""}`}>
      <div
        className={`widget-header ${isMinimized ? "minimized" : ""}`}
        {...(isMinimized && { onClick: toggleMinimize })}
      >
        <div className={`header-avatar`}>
          {/* Add your header avatar/logo here */}
          <Image
            src={USER_ICON}
            alt="Avatar"
            width={isMinimized ? 50 : 40}
            height={isMinimized ? 50 : 40}
          />
        </div>
        <div className="header-info">
          <div className="header-title">Customer Support</div>
          <div className="header-status">Online</div>
        </div>
        <div className="header-buttons">
          <button onClick={toggleMinimize}>
            <Image src={MINIMIZE_ICON} alt="minimize" width={40} height={40} />
          </button>
        </div>
      </div>
      <div id="chat-container" className="chat-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            {message.text}
          </div>
        ))}
      </div>
      <div className="message-input-form">
        <input
          type="text"
          className="message-input"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          onClick={handleUserMessageSubmit}
          className="send-button"
          disabled={newMessage.trim() === ""}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWidget;
