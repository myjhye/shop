const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // --- 기존 API 프록시 설정 ---
  app.use(
    '/api', // '/api'로 시작하는 모든 요청을
    createProxyMiddleware({
      target: 'http://backend:8080', // 'backend' 서비스(컨테이너)의 8080 포트로 전달
      changeOrigin: true,
    })
  );

  // --- WebSocket을 위한 프록시 설정을 추가합니다 ---
  app.use(
    '/ws', // '/ws'로 시작하는 WebSocket 요청을
    createProxyMiddleware({
      target: 'http://backend:8080', // 'backend' 서비스(컨테이너)의 8080 포트로 전달
      ws: true, // WebSocket 프록시 활성화
    })
  );
};