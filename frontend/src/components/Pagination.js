import { ChevronLeftIcon, ChevronRightIcon, DoubleChevronLeftIcon, DoubleChevronRightIcon } from "./Icons";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // 한 번에 보여줄 최대 페이지 번호 개수
  const maxPageNumbersToShow = 10;

  // 현재 페이지가 속한 그룹 계산
  const currentPageGroup = Math.floor(currentPage / maxPageNumbersToShow);
  
  // 현재 그룹의 시작 페이지 번호 계산
  const startPage = currentPageGroup * maxPageNumbersToShow;
  
  // 현재 그룹의 끝 페이지 번호 계산 (totalPages를 넘지 않도록)
  const endPage = Math.min(startPage + maxPageNumbersToShow, totalPages);

  // 페이지 번호 버튼들을 생성하는 함수
  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = startPage; i < endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-4 py-2 mx-1 rounded-md text-sm font-medium ${
            currentPage === i
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {i + 1}
        </button>
      );
    }
    return pageNumbers;
  };

  const handlePrevGroup = () => {
    const prevGroupStartPage = startPage - maxPageNumbersToShow;
    if (prevGroupStartPage >= 0) {
      onPageChange(prevGroupStartPage);
    }
  };

  const handleNextGroup = () => {
    if (endPage < totalPages) {
      onPageChange(endPage);
    }
  };

  return (
    <div className="flex justify-center items-center mt-12 space-x-2">
      {/* 개별 페이지 이전 버튼 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="px-3 py-2 bg-white text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        aria-label="Previous Page"
      >
        <ChevronLeftIcon />
      </button>

      {/* 이전 페이지 그룹 이동 버튼 (10개 이상일 때만 보임) */}
      {totalPages > maxPageNumbersToShow && (
          <button
            onClick={handlePrevGroup}
            disabled={startPage === 0}
            className="px-3 py-2 bg-white text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            aria-label="Previous Page Group"
          >
            <DoubleChevronLeftIcon />
          </button>
      )}
      
      {/* 페이지 번호 목록 */}
      {renderPageNumbers()}
      
      {/* 다음 페이지 그룹 이동 버튼 (10개 이상일 때만 보임) */}
      {totalPages > maxPageNumbersToShow && (
          <button
            onClick={handleNextGroup}
            disabled={endPage >= totalPages}
            className="px-3 py-2 bg-white text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            aria-label="Next Page Group"
          >
            <DoubleChevronRightIcon />
          </button>
      )}

      {/* 개별 페이지 다음 버튼 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="px-3 py-2 bg-white text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        aria-label="Next Page"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}