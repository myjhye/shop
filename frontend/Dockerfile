# --- 1단계: 빌드(Build) 스테이지 ---
# Node.js 20 버전을 'builder'라는 이름의 빌드 환경으로 사용합니다.
FROM node:20-alpine AS builder

WORKDIR /app

# package.json과 package-lock.json을 먼저 복사합니다.
COPY package*.json ./

# 의존성을 설치합니다.
RUN npm install

# 나머지 소스 코드를 복사합니다.
COPY . .

# 프로덕션용으로 React 앱을 빌드합니다. /app/build 폴더가 생성됩니다.
RUN npm run build


# --- 2단계: 실행(Runtime) 스테이지 ---
# 가볍고 빠른 Nginx 이미지를 최종 실행 환경으로 사용합니다.
FROM nginx:stable-alpine

# 'builder' 스테이지에서 생성된 빌드 결과물(/app/build)을 
# Nginx의 기본 웹 루트 디렉토리(/usr/share/nginx/html)로 복사합니다.
# 기존에 있던 기본 Nginx 페이지는 삭제합니다.
COPY --from=builder /app/build /usr/share/nginx/html

# React Router가 정상적으로 동작하도록, 우리가 만든 Nginx 설정을 복사합니다.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 컨테이너 외부에서 80 포트로 접속할 수 있도록 포트를 노출합니다.
EXPOSE 80

# Nginx 서버를 실행합니다.
CMD ["nginx", "-g", "daemon off;"]