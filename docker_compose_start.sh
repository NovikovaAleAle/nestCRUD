echo "Docker compose starting..."
docker compose up -d
echo "Waiting for the containers to launch..."
sleep 10
echo "Kafka topic creating if not exists..."
docker exec -it broker sh -c "/opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic ${KAFFKA_TOPIC} --if-not-exists"