import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStomp } from '../context/StompContext';
import api from '../api/config';
import { format } from 'date-fns';

export default function ChatRoom() {
  const { roomId } = useParams();
  const { stompClient } = useStomp();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatInfo, setChatInfo] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // roomId가 없으면 API 호출 및 구독 로직을 실행하지 않습니다.
    if (!stompClient || !roomId) return;

    const fetchChatInfo = async () => {
      try {
        const response = await api.get(`/chat/rooms/${roomId}`);
        setChatInfo(response.data);
      } catch (error) {
        console.error("채팅방 정보 로딩 실패:", error);
      }
    };

    const fetchHistory = async () => {
      try {
        const response = await api.get(`/chat/rooms/${roomId}/messages`);
        setMessages(response.data);
      } catch (error) {
        console.error("메시지 내역 로딩 실패:", error);
      }
    };
    
    fetchChatInfo();
    fetchHistory();

    const destination = `/topic/chat/${roomId}`;
    const subscription = stompClient.subscribe(destination, (message) => {
      const receivedMessage = JSON.parse(message.body);
      setMessages((prevMessages) => [...prevMessages, receivedMessage]);
    });
    console.log(`✅ 구독 시작: ${destination}`);

    return () => {
      subscription.unsubscribe();
      console.log(`🔌 구독 취소: ${destination}`);
    };
  }, [stompClient, roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !stompClient?.connected) return;

    const messagePayload = {
      roomId: roomId,
      message: newMessage,
    };

    stompClient.publish({
      destination: '/app/chat/send',
      body: JSON.stringify(messagePayload),
    });

    setNewMessage('');
  };

  // roomId가 없는 경우, 채팅방 선택을 유도하는 메시지를 표시합니다.
  if (!roomId) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] max-w-3xl mx-auto my-8 border rounded-lg shadow-lg bg-gray-50">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700">채팅방을 선택해주세요. 💬</p>
          <p className="mt-2 text-gray-500">
            대화를 시작하려면 채팅 목록에서 채팅방을 클릭하세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[80vh] max-w-3xl mx-auto my-8 border rounded-lg shadow-lg">
      {/* --- 상품 정보 헤더 --- */}
      {chatInfo && (
        <div className="flex items-center p-3 border-b bg-gray-50">
          <img
            src={chatInfo.productThumbnail}
            alt={chatInfo.productName}
            className="w-16 h-16 rounded-md object-cover mr-4"
          />
          <p className="text-xl font-bold text-gray-900">
            {chatInfo.productName}
          </p>
        </div>
      )}

      {/* --- 메시지 목록 --- */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
        {messages.map((msg) => {
          console.log(`ID 비교: msg.sender.id (${typeof msg.sender.id}) / user.id (${typeof user.id})`);
          const isMe = user && msg.sender.id == user.id;

          return (
            <div
              key={msg.id}
              className={`flex mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div> 
                <p className={`text-xs text-gray-500 mb-1 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                  {msg.sender.username}
                </p>
                
                <div
                  className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                    isMe
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white border'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-1 opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>
                    {format(new Date(msg.createdAt), 'p')}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* --- 메시지 입력창 --- */}
      <form onSubmit={handleSendMessage} className="p-4 border-t flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="flex-1 px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-r-md hover:bg-indigo-700 disabled:bg-gray-400"
          disabled={!stompClient?.connected}
        >
          전송
        </button>
      </form>
    </div>
  );
}