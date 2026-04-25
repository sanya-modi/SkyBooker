FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build
COPY . .
RUN mvn clean package -f admin-user-service/pom.xml -DskipTests

WORKDIR /build/admin-user-service/target/extracted
RUN java -Djarmode=layertools -jar ../*.jar extract

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/admin-user-service/target/extracted/dependencies/ ./
COPY --from=builder /build/admin-user-service/target/extracted/spring-boot-loader/ ./
COPY --from=builder /build/admin-user-service/target/extracted/snapshot-dependencies/ ./
COPY --from=builder /build/admin-user-service/target/extracted/application/ ./
EXPOSE 8090
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
