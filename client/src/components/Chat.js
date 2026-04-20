import React, { useState, useRef, useEffect } from "react";
import "./Chat.css";

function Chat() {
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState(() => {
  const saved = localStorage.getItem("chats");
  return saved ? JSON.parse(saved) : [];
});

const [showSidebar, setShowSidebar] = useState(true);
const [activeChatId, setActiveChatId] = useState(null);
const [menuOpenId, setMenuOpenId] = useState(null);

const renameChat = (id) => {
  const newName = prompt("Enter new name:");
  if (!newName) return;
  setChats(prev =>
    prev.map(chat =>
      chat.id === id ? { ...chat, title: newName } : chat
    )
  );
  setMenuOpenId(null); // close menu after action
};

const deleteChat = (id) => {
  const updated = chats.filter(chat => chat.id !== id);
  setChats(updated);
  if (id === activeChatId) {
    setActiveChatId(updated.length ? updated[0].id : null);
  }
  setMenuOpenId(null); // close menu
};

const handleDragOver = (e) => {
  e.preventDefault();
  setIsDragging(true);
};

const handleDragLeave = () => {
  setIsDragging(false);
};

const handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();

  setIsDragging(false);

  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    setImage(URL.createObjectURL(file));
  }
};

const activeChat = chats.find(chat => chat.id === activeChatId);
const [loading, setLoading] = useState(false);
const bottomRef = useRef(null);

const createNewChat = () => {
  const newChat = {
    id: Date.now(),
    title: "New Chat",
    messages: [],
  };

  setChats((prev) => [...prev, newChat]);
  setActiveChatId(newChat.id);
};

const handleImageSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    setImage(URL.createObjectURL(file));
  }
};

const sendMessage = async () => {
  if ((!input.trim() && !image) || !activeChat) return;

  const userMessage = {
    sender: "user",
    text: input,
    image: image || null,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  const updatedChats = chats.map(chat => {
    if (chat.id === activeChatId) {
      return {
        ...chat,
        title:
          chat.messages.length === 0
            ? input.length > 20
              ? input.slice(0, 20) + "..."
              : input
            : chat.title,
        messages: [...chat.messages, userMessage],
      };
    }
    return chat;
  });

  setChats(updatedChats);
  setInput("");
  setImage(null);
  if (fileInputRef.current) fileInputRef.current.value = "";
  setLoading(true);

  try {
    const res = await fetch("https://ai-study-assistant-w7xd.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    const botMessage = {
      sender: "bot",
      text: data.reply,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChats(prev =>
      prev.map(chat =>
        chat.id === activeChatId
          ? { ...chat, messages: [...chat.messages, botMessage] }
          : chat
      )
    );

  } catch (err) {
    console.error("ERROR:", err);
    alert("Backend not responding ❌");
  }

  setLoading(false);
};

useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [chats, loading]);

useEffect(() => {
  localStorage.setItem("chats", JSON.stringify(chats));
}, [chats]);

useEffect(() => {
  const preventDefault = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  window.addEventListener("dragover", preventDefault);
  window.addEventListener("drop", preventDefault);

  return () => {
    window.removeEventListener("dragover", preventDefault);
    window.removeEventListener("drop", preventDefault);
  };
}, []);


return (
    <>hi
  <div className={`sidebar ${showSidebar ? "show" : "hide"}`}>
    <button className="nbtn"onClick={createNewChat}>+ New Chat</button>
      {chats.map(chat => (
    <div
      key={chat.id}
      className={`chat-item ${chat.id === activeChatId ? "active-chat" : ""}`}
      onClick={() => setActiveChatId(chat.id)}
    >
      <span className="chat-title">
        {chat.title || "New Chat"}
      </span>
      {/* Three dots */}
      <div
        className="menu-icon"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpenId(menuOpenId === chat.id ? null : chat.id);
        }}
      >
      <span>⋮</span>
      </div>
      {/* Dropdown menu */}
      {menuOpenId === chat.id && (
        <div className="dropdown-menu">
          <div onClick={(e) => {
            e.stopPropagation();
            renameChat(chat.id);
          }}>Rename ✏️</div>
          <div onClick={(e) => {
            e.stopPropagation();
            deleteChat(chat.id);
          }}>Delete 🗑️</div>
        </div>
      )}
    </div>
    ))}
  </div>
  <button
    className={`menu-btn ${showSidebar ? "open" : "closed"}`}
    onClick={() => setShowSidebar(!showSidebar)}
  >
    ☰
  </button>
  <div className="chat-container">
    
      <div
          className={`chat-box ${isDragging ? "drag-active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
      {activeChat?.messages.map((msg, i) => (
        <div
          key={i}
          className={msg.sender === "user" ? "user-msg" : "bot-msg"}
        >
          <div>
            {msg.text && <div>{msg.text}</div>}

            {msg.image && (
              <img src={msg.image} alt="upload" className="chat-image" />
            )}

            <div className="time">{msg.time}</div>
          </div>
        </div>
      ))}

        {loading && (
          <div className="bot-msg typing">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}
      <div ref={bottomRef}></div>
    </div>
    <div className="i">
      {image && (
        <div className="preview-container">
          <img src={image} alt="preview" />
          <span className="remove-img" onClick={() => setImage(null)}>
            ❌
          </span>
        </div>
      )}
      {/* <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
                <button id="send"onClick={sendMessage}>Send</button>
      </div> */}
      <div className="input-area">
        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImageSelect}
        />

        {/* + Button */}
        <button
          className="upload-btn"
          onClick={() => fileInputRef.current.click()}
        >
          +
        </button>

        {/* Text input */}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        {/* Send button */}
        <button onClick={sendMessage}>Send</button>

      </div>
        <div className="btn">
        <button className="clrbtn" onClick={() => {
          localStorage.removeItem("chats");
          // setMessages([]);
          setChats([]);
          setActiveChatId(null); 
        }}>
          Clear Chat 
        </button>
        </div>
      </div>
  </div>
  </>
);
}

export default Chat;