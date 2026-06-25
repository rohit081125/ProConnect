FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY backend /app/backend
WORKDIR /app/backend
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/backend/target/*.jar app.jar
EXPOSE 7860
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+UseContainerSupport"
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
