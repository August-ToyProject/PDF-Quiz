FROM openjdk:21-jdk-slim

ARG JAR_FILE=build/libs/quiz-application-0.0.1-SNAPSHOT.jar

COPY ${JAR_FILE} docker-springbootapp.jar

ENTRYPOINT ["java", "-Duser.timezone=Asia/Seoul" ,"-jar", "/docker-springbootapp.jar"]