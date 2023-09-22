"use client";
import React, { useState, useEffect, useCallback } from "react";
import ChatWidget from "./ChatWidget";
import * as CustomerSDK from "@livechat/customer-sdk";

const ChatWidgetWrapperSDK = ({ clientId, licenseId }) => {
  const [customerSDK, setCustomerSDK] = useState(null);
  const [state, setState] = useState({ chat: null, users: {} });
  const [messages, setMessages] = useState([]);
  const [customerId, setCustomerId] = useState("");

  useEffect(() => {
    console.log("useEffect: ", clientId, Number(licenseId));
    // if (customerSDK) return;
    const sdk = new CustomerSDK.init({
      licenseId: 16142280,
      clientId: "cb29ee529b302062032f83fa653c33e0",
    });

    setCustomerSDK(sdk);

    return () => {
      sdk.disconnect();
    };
  }, []);

  //   const init = () => {
  //     const sdk = new CustomerSDK.init({
  //       licenseId: 16142280,
  //       clientId: "cb29ee529b302062032f83fa653c33e0",
  //     });
  //     setCustomerSDK(sdk);
  //   };

  useEffect(() => {
    // Subscribe to chat events when customerSDK is available
    if (customerSDK) {
      customerSDK.on("new_event", handleNewEvent);
      customerSDK.on("connected", handleConnected);
      customerSDK.on("incoming_chat", ({ chat }) => handleChatStart(chat));

      customerSDK.on("chat_deactivated", (payload) => {
        const { chatId } = payload;
        // console.log("chat_deactivated", { chatId });
      });
      customerSDK.on("incoming_event", ({ event }) => {
        // console.log("incoming_event: ", event);
        if (event.type !== "message") {
          return;
        }
        const author = state.users[event.authorId];
        let message = {
          id: event.id,
          text: event.text,
          sender: isAgent(author) ? "agent" : "customer",
        };
        setMessages((oldState) => [...oldState, message]);
      });
      customerSDK.on("connection_restored", noop("connection_restored"));
      customerSDK.on("user_is_typing", noop("user_is_typing"));
      customerSDK.on("user_stopped_typing", noop("user_stopped_typing"));
      customerSDK.on("user_joined_chat", noop("user_joined_chat"));
      customerSDK.on("user_left_chat", noop("user_left_chat"));
      customerSDK.on("customer_id", (id) => {
        console.log("customer_id: ", id);
        setCustomerId(id);
      });
      customerSDK.on("user_data", (user) => {
        let newState = {
          ...state,
        };
        newState.users[user.id] = user;
        setState((oldState) => ({
          ...oldState,
          ...newState,
        }));
        // state.users[user.id] = user;
      });
      customerSDK.on("disconnected", ({ reason }) => {
        console.log("disconnected: ", reason);
        if (reason === "inactivity_timeout") {
          customerSDK.connect();
        }
      });
    }
  }, [customerSDK]);

  useEffect(() => {
    if (customerId && state.chat) {
      loadInitialHistory(state.chat).then(() => {});
    }
  }, [customerId, state.chat]);

  const startChat = (pendingMessages) => {
    const payload = {
      chat: {
        ...(state.chat && { id: state.chat?.id }),
        ...(pendingMessages.length > 0 && {
          thread: {
            events: pendingMessages,
          },
        }),
      },
    };
    const action = state?.chat?.id
      ? customerSDK.resumeChat
      : customerSDK.startChat;
    action(payload)
      .then(({ chat }) => {
        setState((oldState) => ({
          ...oldState,
          chat: { ...state.chat, active: true },
        }));
        if (state.chat?.id) {
          handleResumeChat(chat);
        } else {
          handleChatStart(chat);
        }
      })
      .catch((err) => {
        console.log("startChat catch(): ", err);
      });
  };

  const sendMessage = (id, text) => {
    const message = { customId: id, text, type: "message" };
    console.log("customerId: ", customerId);
    console.log("state: ", state);
    let chatId = state.chat?.id;
    if (state?.chat?.active === false) {
      startChat([
        {
          ...message,
        },
      ]);
    } else {
      customerSDK.sendEvent({ chatId, event: message }).then(
        (confirmedMessage) => {
          console.log("sendMessage confirmedMessage: ", confirmedMessage);
          const newMessage = {
            id: confirmedMessage.id,
            text: confirmedMessage.text,
            sender: "customer",
          };
          setMessages((oldState) => [...oldState, newMessage]);
        },
        (err) => {
          console.log("sendMessage error", err);
        }
      );
    }
  };

  const sendRichMessagePostback = (postback) => {
    const { postbackId, threadId, eventId } = postback;
    let chatId = state.chat?.id;

    customerSDK
      .sendRichMessagePostback({
        chatId: chatId,
        threadId: threadId,
        eventId: eventId,
        postback: {
          id: postbackId,
          toggled: true,
        },
      })
      .then(() => {
        console.log("success");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const noop = (args) => {
    console.log("noop: ", args);
  };

  const handleNewEvent = (newEvent) => {
    console.log("new_event: ", newEvent);
  };

  const handleChatStart = (chat) => {
    // console.log("incoming_chat: ", chat);
    if (!chat.thread) return;
    const newMessages = getMessagesFromThreads([chat.thread]);
    setMessages(newMessages);
  };

  const handleResumeChat = (chat) => {
    // console.log("handleResumeChat: ", chat);
    if (!chat.thread) return;
    getMessagesFromThreads([chat.thread]);
    // setMessages(newMessages);
  };

  const handleConnected = () => {
    console.log("connected");
    if (!customerSDK) {
      console.log("no customerSDK");
      return;
    }
    handleCustomerStatusChange();
  };

  const handleCustomerStatusChange = () => {
    console.log("handleCustomerStatusChange");
    customerSDK
      .listChats()
      .then(({ chatsSummary, totalChats }) => {
        console.log("chatsSummary: ", chatsSummary);
        console.log("totalChats: ", totalChats);
        if (state.chat) {
          return;
        }

        if (totalChats > 0) {
          const chat = chatsSummary[0];
          setState((oldState) => ({ ...oldState, chat }));
        } else {
          customerSDK
            .startChat({
              chat: {
                thread: {},
              },
            })
            .then((chat) => {
              console.log("chat: ", chat);
              setState((oldState) => ({ ...oldState, chat: chat.chat }));
            })
            .catch((err) => {
              console.log("startChat err: ", err);
            });
        }
      })
      .catch((err) => {
        console.log("handleCustomerStatusChange err: ", err);
      });
  };

  const loadInitialHistory = (chat) => {
    const chatId = chat.id;
    const newState = {
      chat,
    };
    const loadLatestHistory = () => loadHistory(chatId).then(() => {});
    setState((oldState) => ({ ...oldState, ...newState }));
    return loadLatestHistory(chatId)
      .catch((err) => {
        loadLatestHistory();
      })
      .catch((err) => {
        noop();
      });
  };

  const getMessagesFromThreads = (threads) => {
    let allMessages = threads
      .map(({ events }) => events || [])
      .reduce((acc, current) => [...acc, ...current], [])
      .map((event) => {
        const author = state.users[event.authorId];
        let messageObject = {
          id: event.id,
          text: event.text,
          type: event.type,
          threadId: event.threadId,
        };
        if (event.type === "message") {
          messageObject.sender = isAgent(author) ? "agent" : "customer";
        }
        if (event.type === "rich_message") {
          messageObject.sender = "agent";
          messageObject.type = event.type;
          messageObject.elements = event.elements;
        }
        return messageObject;
      });
    return allMessages;
  };

  const appendMessagesFromThreads = (threads) => {
    const newMessages = getMessagesFromThreads(threads);
    setMessages((oldState) => [...oldState, ...newMessages]);
  };

  const isAgent = useCallback(
    (user) => {
      return user.id !== customerId;
    },
    [customerId]
  ); // Include customerId as a dependency

  const loadHistory = (chatId) => {
    return new Promise((resolve, reject) => {
      customerSDK
        .getChatHistory({ chatId })
        .next()
        .then(
          ({ value: { threads }, done }) => {
            console.log("loadHistory: ", threads, done);
            if (!threads) {
              return;
            }
            const messages = getMessagesFromThreads(threads);
            setMessages(messages);
            resolve();
          },
          (err) => {
            console.log("loadHistory err: ", err);
            reject(err);
          }
        );
    });
  };

  if (!customerSDK) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* <button onClick={init}>now</button> */}
      <ChatWidget
        chat={state.chat}
        sendMessage={sendMessage}
        sendRichMessagePostback={sendRichMessagePostback}
        messages={messages}
        setMessages={setMessages}
      />
    </div>
  );
};

export default ChatWidgetWrapperSDK;
