"use client";

import React, { useState, useEffect } from "react";
import "./ChatWidget.css"; // Import your CSS file
import Image from "next/image";
import { MINIMIZE_ICON, USER_ICON } from "@/constants";

const initialMessages = [
  { id: 1, text: "Hello, how can I help you today?", isCustomer: false },
  { id: 2, text: "Hi, I'm looking for a new laptop", isCustomer: true },
];

function ChatWidget() {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  const receiveMessage = (messageText, isCustomer = false) => {
    const newMessage = { id: Date.now(), text: messageText, isCustomer };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const sendAgentResponse = () => {
    receiveMessage(
      "Thank you for contacting us! How can we assist you today?",
      false
    );
  };

  const handleUserMessageSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    receiveMessage(newMessage, true);
    setNewMessage("");
    setTimeout(sendAgentResponse, 1000);
  };

  useEffect(() => {
    const chatContainer = document.getElementById("chat-container");
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, [messages]);

  const toggleMinimize = () => {
    setIsMinimized((prevMinimized) => !prevMinimized);
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
          <div
            key={message.id}
            className={`message ${message.isCustomer ? "customer" : "agent"}`}
          >
            {message.text}
          </div>
        ))}
      </div>
      <form className="message-input-form" onSubmit={handleUserMessageSubmit}>
        <input
          type="text"
          className="message-input"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatWidget;
