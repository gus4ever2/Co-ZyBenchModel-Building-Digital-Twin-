# Build the Spring Boot app with the Java version configured in pom.xml.
FROM eclipse-temurin:25-jdk AS build

WORKDIR /workspace

COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw \
    && ./mvnw --batch-mode --no-transfer-progress -DskipTests dependency:go-offline

COPY src ./src
RUN ./mvnw --batch-mode --no-transfer-progress -DskipTests package

# Keep Maven and the JDK out of the runtime image.
FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=build --chown=10001:10001 /workspace/target/*.jar /app/app.jar

USER 10001

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
