import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/config';
import { useAuth } from '../context/AuthContext';

export default function ChatList() {
  const [chatRooms, setChatRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { roomId } = useParams(); // 현재 선택된 방

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/chat/my-rooms');
        setChatRooms(response.data);
      } catch (err) {
        console.error("채팅방 목록 로딩 오류:", err);
        setError("채팅방 목록을 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchChatRooms();
  }, [user]);

  if (isLoading) return <div className="text-center py-10">로딩 중...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="w-1/3 border-r bg-gray-50 h-[80vh] overflow-y-auto">
      <div className="p-4 font-bold text-lg border-b bg-gray-100">
        내 채팅 목록
      </div>

      {chatRooms.length === 0 ? (
        <p className="text-gray-500 p-4">아직 진행 중인 채팅이 없습니다.</p>
      ) : (
        chatRooms.map((room) => (
          <Link
            key={room.roomId}
            to={`/chat/${room.roomId}`}
            className={`block p-4 border-b transition ${
              room.roomId == roomId
                ? 'bg-indigo-100 font-semibold'
                : 'hover:bg-gray-100'
            }`}
          >
            <div className="text-indigo-700">{room.partnerName}님과의 대화</div>
            <p className="text-sm text-gray-600 mt-1 truncate">
              상품: {room.productName}
            </p>
          </Link>
        ))
      )}
    </div>
  );
}
