FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build
COPY pom.xml .
COPY payment-service/pom.xml ./payment-service/pom.xml
COPY payment-service/src ./payment-service/src
RUN cd payment-service && mvn clean package -DskipTests

WORKDIR /build/payment-service/target/extracted
RUN java -Djarmode=layertools -jar ../*.jar extract

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/payment-service/target/extracted/dependencies/ ./
COPY --from=builder /build/payment-service/target/extracted/spring-boot-loader/ ./
COPY --from=builder /build/payment-service/target/extracted/snapshot-dependencies/ ./
COPY --from=builder /build/payment-service/target/extracted/application/ ./
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
