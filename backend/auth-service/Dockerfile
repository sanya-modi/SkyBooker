FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build
COPY . .
RUN mvn clean package -pl auth-service -am -DskipTests

WORKDIR /build/auth-service/target/extracted
RUN java -Djarmode=layertools -jar ../*.jar extract

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/auth-service/target/extracted/dependencies/ ./
COPY --from=builder /build/auth-service/target/extracted/spring-boot-loader/ ./
COPY --from=builder /build/auth-service/target/extracted/snapshot-dependencies/ ./
COPY --from=builder /build/auth-service/target/extracted/application/ ./
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
