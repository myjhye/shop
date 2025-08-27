export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            온라인 쇼핑몰에 오신 것을 환영합니다
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            최고의 상품을 합리적인 가격에 만나보세요
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">빠른 배송</h3>
              <p className="text-gray-600">당일 주문시 다음날 배송</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">품질 보장</h3>
              <p className="text-gray-600">엄선된 고품질 상품만 판매</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">고객 지원</h3>
              <p className="text-gray-600">24시간 고객센터 운영</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}