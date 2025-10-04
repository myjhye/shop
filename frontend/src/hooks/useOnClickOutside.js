import { useEffect } from 'react';

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // 모달 ref 안에 클릭된 요소(event.target)가 포함되지 않으면
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      // 핸들러 함수(모달 닫는 함수)를 실행합니다.
      handler(event);
    };

    // mousedown 이벤트 리스너를 document에 추가합니다.
    document.addEventListener('mousedown', listener);
    // clean-up 함수에서 이벤트 리스너를 제거합니다. (메모리 누수 방지)
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, handler]); // ref나 handler가 변경될 때만 이펙트를 다시 실행합니다.
}

export default useOnClickOutside;