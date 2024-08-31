import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ChatPageSkeleton from "../../Skeleton/Messages/ChatPageSkeleton";
import "../../styles/Messages/ChatPage.css";
import Messages from "./Messages";

const ChatPage = () => {
  const { chatSlug } = useParams();
  const [chat, setChat] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [loadingChat, setLoadingChat] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;
  const [message, setMessage] = useState("");

  useEffect(() => {
    const receiverName = chatSlug.substring(1);

    const accessChat = async () => {
      try {
        const response = await axios.post(
          `${apiUrl}/api/chat/@${receiverName}`,
          {},
          {
            withCredentials: true,
          }
        );
        setChat(response.data.chat);
        setReceiver(response.data.receiver);
        console.log("response.data --accessChat is ", response.data);
      } catch (error) {
        console.log("error --accessChat is ", error);
      } finally {
        setLoadingChat(false);
      }
    };

    accessChat();
  }, [apiUrl, chatSlug]);

  if (loadingChat) {
    return <ChatPageSkeleton />;
  }

  if (!chat) {
    return <div>No chat found.</div>;
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      const response = await axios.post(
        `${apiUrl}/api/messages/`,
        {
          chatId: chat._id,
          content: message,
        },
        {
          withCredentials: true,
        }
      );

      console.log("response.data --handleSendMessage is :", response.data);
      setMessage("");
    } catch (error) {
      console.log("error --handleSendMessage is :", error);
    }
  };

  return (
    <div className="chat-page">
      <Link to={`/${receiver.userName}`} className="chat-header">
        <div className="avatar">{receiver.fullName[0]}</div>
        <span className="username">{receiver.fullName}</span>
      </Link>
      <div className="chat-section">
        <div className="avatar">{receiver.fullName[0]}</div>
        <p className="username">{receiver.userName}</p>
        <Link to={`/${receiver.userName}`} className="view-replies">
          View Profile
        </Link>
        <Messages chatId={chat._id} />
      </div>
      <div className="send-message-section">
        <div className="send-message-input-container">
          <input
            type="text"
            placeholder="Message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && message.trim()) {
                handleSendMessage();
              }
            }}
          />
          {message.trim() && (
            <button className="send-btn" onClick={handleSendMessage}>
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
