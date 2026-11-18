# ---- 빌드 ----
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -q dependency:go-offline
COPY src src
RUN ./mvnw -q clean package -DskipTests

# ---- 실행 ----
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Render가 PORT 환경변수를 넣어준다 (application.properties의 server.port)
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
