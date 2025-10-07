# Shopping 플랫폼 프로젝트 (Spring Boot + React)

<br>

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=React&logoColor=black">
  <img src="https://img.shields.io/badge/SpringBoot-6DB33F?style=for-the-badge&logo=SpringBoot&logoColor=white">
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=MySQL&logoColor=white">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=Docker&logoColor=white">
  <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=Nginx&logoColor=white">
  <img src="https://img.shields.io/badge/GitHubActions-2088FF?style=for-the-badge&logo=GitHubActions&logoColor=white">
  <img src="https://img.shields.io/badge/AWS%20EC2-FF9900?style=for-the-badge&logo=Amazon-AWS&logoColor=white">
</p>


<br>

단순 CRUD 쇼핑몰을 넘어 **주문 동시성 제어**, **구매 검증 기반 리뷰**, **CI/CD 자동 배포**까지 구현한 풀스택 프로젝트입니다.  
**Spring Boot + React + Docker**를 기반으로 설계되었으며, AWS 인프라 위에서 배포·운영됩니다.

<br><br>

<img width="1920" height="1644" alt="image" src="https://github.com/user-attachments/assets/8b0f89fb-904c-4c15-b645-1d7f2b2fbb03" />

<br><br>

## 목차
- [주요 기능 (Features)](#주요-기능-features)
- [인프라 및 배포 (Infrastructure & Deployment)](#인프라-및-배포-infrastructure--deployment)
- [기술 스택 (Tech Stack)](#기술-스택-tech-stack)
- [문제 해결 및 학습 경험 (Troubleshooting & Learnings)](#문제-해결-및-학습-경험-troubleshooting--learnings)

<br>

## 주요 기능 (Features)

### 사용자 & 인증
- 회원가입, 로그인, 로그아웃 (Spring Security + JWT Access Token)
- React Context API를 통한 전역 인증 상태 관리

### 상품 관리
- 상품 등록/조회/수정/삭제 (CRUD)
- Cloudinary 연동 이미지 업로드
- 상품 검색/필터 (카테고리, 가격대)
- 최신순/가격순 정렬, 페이지네이션
- 마이페이지에서 내가 등록한 상품만 관리 가능

### 장바구니 & 주문
- 장바구니 생성, 조회, 수량 변경
- 주문(Order, OrderItem) 엔티티 설계 및 API 구현
- 마이페이지에서 주문 내역 조회
- **JPA @Version 기반 동시성 제어**: 재고 1개 남은 상품 동시 주문 시 Race Condition 방지

### 리뷰 시스템
- 구매 이력 검증 후 리뷰 작성
- 페이징 처리된 리뷰 목록 조회
- 작성자 본인만 리뷰 수정/삭제
- 마이페이지에서 내가 쓴 리뷰 조회

### 실시간 채팅
- **WebSocket(STOMP)을 이용한 구매자-판매자 간 실시간 메시지 통신**
- StompHandler에서 JWT 토큰을 검증하여 인증된 사용자만 소켓 연결을 허용
- 상품별로 채팅방을 생성하고, '내 채팅 목록'에서 참여 중인 모든 채팅방 조회

<br>

## 인프라 및 배포 (Infrastructure & Deployment)
- **Docker 컨테이너화**  
  - Backend(Spring Boot), Frontend(React), Database(MySQL), Proxy(Nginx) 각각 컨테이너로 분리
  - `docker-compose`로 통합 관리
- **AWS 인프라**  
  - EC2: 애플리케이션 서버
  - DB: 로컬 MySQL 컨테이너
  - 보안 그룹 및 포트 포워딩으로 외부 접근 제어
- **Nginx 리버스 프록시**  
  - API 요청(`/api/*`)과 정적 파일 요청(`/`) 분리 처리
- **CI/CD (GitHub Actions)**  
  - Git push 시 자동으로 EC2에 배포
  - SSH 접속 없이 배포 자동화

<br>

## 기술 스택 (Tech Stack)

| 구분 | 기술 | 설명 |
|---|---|---|
| **Frontend** | `React`, `React Router DOM` | SPA 및 라우팅 |
| | `Context API` | 인증/장바구니 전역 상태 관리 |
| | `Axios` | 서버와의 HTTP 통신 |
| | `Tailwind CSS` | UI 스타일링 |
| | `@stomp/stompjs, sockjs-client` | WebSocket(STOMP) 클라이언트 |
| **Backend** | `Spring Boot`, `Spring Data JPA` | REST API 서버 및 ORM |
| | `Spring Security + JWT` | 인증/인가 |
| | `Spring WebSocket` | STOMP 프로토콜 기반 실시간 통신 |
| | `MySQL` | 관계형 데이터베이스 |
| | `Cloudinary` | 이미지 업로드 |
| **DevOps** | `Docker`, `Docker Compose` | 컨테이너 기반 배포 |
| | `Nginx` | 리버스 프록시 및 정적 파일 서빙 |
| | `GitHub Actions` | CI/CD 자동 배포 |
| | `AWS EC2` | 애플리케이션 서버 운영 |

<br>

## 문제 해결 및 학습 경험 (Troubleshooting & Learnings)
- **동시성 제어**  
  - 재고 수량 동시 차감 문제를 JPA `@Version`(Optimistic Lock)으로 해결
- **WebSocket JWT 인증 연동**  
  - HTTP API에 사용하던 JWT 인증 방식을 WebSocket 연결 시에도 적용
  - StompHandler로 CONNECT 단계에서 토큰을 검증하고, 인증된 사용자만 세션을 연결하는 실시간 통신 채널 구축
- **구매 검증 기반 리뷰 작성**  
  - 구매자만 리뷰 작성 가능하도록 Order 데이터 검증 로직 추가
- **Docker 기반 배포 환경**  
  - 개발/운영 환경 차이를 컨테이너화로 해소
  - MySQL 포트 매핑 + 보안 그룹 설정으로 로컬 GUI 툴에서 EC2 DB 원격 접속 가능
- **CI/CD 구축 경험**  
  - GitHub Actions → EC2 자동 배포 파이프라인을 통해 운영 효율화
  - `git push`만으로 빌드·배포까지 완료되는 환경 설계
