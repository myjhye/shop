# --- 1단계: 빌드 환경 설정 ---
# 존재하지 않는 이미지 이름 -> 실제 존재하는 공식 이미지 이름으로 변경합니다.
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn package -DskipTests


# --- 2단계: 최종 실행 환경 설정 ---
# 이 이미지(JRE 21)는 이름이 올바르므로 그대로 둡니다.
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]