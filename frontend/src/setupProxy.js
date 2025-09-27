const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api', // '/api'로 시작하는 모든 요청을
    createProxyMiddleware({
      target: 'http://backend:8080', // 'backend' 서비스(컨테이너)의 8080 포트로 전달해줘
      changeOrigin: true,
    })
  );
};