import ChatList from '../components/ChatList';
import ChatRoom from '../components/ChatRoom';

export default function ChatPage() {
  return (
    <div className="flex max-w-6xl mx-auto my-8 border rounded-lg shadow-lg">
      {/* 왼쪽: 채팅 목록 */}
      <ChatList />

      {/* 오른쪽: 선택된 채팅방 */}
      <div className="flex-1">
        <ChatRoom />
      </div>
    </div>
  );
}
