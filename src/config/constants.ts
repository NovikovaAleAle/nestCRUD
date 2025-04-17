export const CLIENT_KAFKA_NAME = 'appNest';
export const ROLE_KEY = 'role';

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

export enum Env {
  PORT = 'PORT',
  DATABASE = 'DATABASE',
  DATABASE_HOST = 'DATABASE_HOST',
  DATABASE_PORT = 'DATABASE_PORT',
  DATABASE_USERNAME = 'DATABASE_USERNAME',
  DATABASE_PASSWORD = 'DATABASE_PASSWORD',
  KAFKA_BROKER = 'KAFKA_BROKER',
  KAFKA_TOPIC = 'KAFKA_TOPIC',
  KAFKA_GROUP_ID = 'KAFKA_GROUP_ID',
  JWT_SECRET_KEY = 'JWT_SECRET_KEY',
  JWT_EXPIRES_IN = 'JWT_EXPIRES_IN',
  CREDENTIAL_USERNAME = 'CREDENTIAL_USERNAME',
  CREDENTIAL_PASSWORD = 'CREDENTIAL_PASSWORD',
  CREDENTIAL_EMAIL = 'CREDENTIAL_EMAIL',
  MAILER_HOST = 'MAILER_HOST',
  MAILER_PORT = 'MAILER_PORT',
  MAILER_USER = 'MAILER_USER',
  MAILER_PASSWORD = 'MAILER_PASSWORD',
  MAILER_USER_SECURE = 'MAILER_USER_SECURE',
  ADMIN_NAME = 'ADMIN_NAME',
  ADMIN_SURNAME = 'ADMIN_SURNAME',
  ADMIN_AGE = 'ADMIN_AGE',
  MINIO_ROOT_USER = 'MINIO_ROOT_USER',
  MINIO_ROOT_PASSWORD = 'MINIO_ROOT_PASSWORD',
  MINIO_ENDPOINT = 'MINIO_ENDPOINT',
  MINIO_API_PORT = 'MINIO_API_PORT',
  MINIO_BUCKET = 'MINIO_BUCKET',
  UUID_LIFE_TIME = 'UUID_LIFE_TIME',
}
