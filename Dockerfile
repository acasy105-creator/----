# 1. Java 17環境でビルド（構築）する
FROM maven:3-eclipse-temurin-17 AS build
WORKDIR /app

# backendフォルダ内のコードをコピー
COPY backend/pom.xml backend/
COPY backend/src backend/src/

# Spring Bootをパッケージ化
RUN cd backend && mvn clean package -DskipTests

# 2. 実行用の環境を用意
FROM eclipse-temurin:17-jre
WORKDIR /app

# 出来上がったサーバーファイルをコピー
COPY --from=build /app/backend/target/*.jar app.jar
EXPOSE 8080

# 起動コマンド
ENTRYPOINT ["java", "-jar", "app.jar"]