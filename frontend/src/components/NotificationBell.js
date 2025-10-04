import { useState, Fragment, useRef } from 'react';
import { useNotificationsContext } from '../context/NotificationContext';
import { Transition } from '@headlessui/react';
import useOnClickOutside from '../hooks/useOnClickOutside';

export default function NotificationBell() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { notifications, unreadCount, markAllAsRead, removeNotification } =
    useNotificationsContext();

  const handleBellClick = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  const modalRef = useRef();
  useOnClickOutside(modalRef, () => setIsModalOpen(false));

  return (
    <>
      {/* 알림 벨 아이콘 */}
      <div
        className="fixed bottom-8 right-8 z-50 h-16 w-16 cursor-pointer rounded-full bg-indigo-600 text-white shadow-lg transition-all hover:bg-indigo-700 active:scale-95 flex items-center justify-center"
        onClick={handleBellClick}
      >
        <div className="relative">
          <span className="text-3xl">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute top-[-4px] right-[-8px] flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* 알림 모달 */}
      <Transition
        show={isModalOpen}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div ref={modalRef} className="fixed bottom-28 right-8 w-80 max-h-[50vh] flex flex-col rounded-lg bg-white shadow-2xl border border-gray-200 z-50">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="font-bold text-lg">
              알림 목록 ({notifications.length})
              {unreadCount > 0 && (
                <span className="text-red-500 text-sm ml-2">
                  ({unreadCount} 새로운 알림)
                </span>
              )}
            </h3>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-2xl text-gray-500 hover:text-gray-800"
            >
              ×
            </button>
          </div>

          <ul className="flex-1 list-none p-0 m-0 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(n => (
                <li key={n.id} className="p-4 border-b border-gray-100 last:border-b-0 space-y-1">
                  <p className="text-sm font-semibold text-gray-800">{n.message}</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">"{n.content}"</p>
                  <div className="flex justify-between items-center text-xs text-gray-400 pt-1">
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                    
                    {/* ▼▼▼ 삭제 버튼 추가 ▼▼▼ */}
                    <button
                      onClick={() => removeNotification(n.id)}
                      className="ml-4 px-2 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      삭제
                    </button>
                    {/* ▲▲▲ 삭제 버튼 추가 ▲▲▲ */}
                  </div>
                </li>
              ))
            ) : (
              <li className="p-4 text-center text-sm text-gray-500">새로운 알림이 없습니다.</li>
            )}
          </ul>
        </div>
      </Transition>
    </>
  );
}