export const validUserData = {
  user: {
    name: 'Ivan',
    surname: 'Ivanov',
    age: 21,
  },
  credential: {
    username: 'TestValidUser',
    password: 'Password123!',
    email: 'test@example.com',
  },
};

export const invalidUserData = {
  user: {
    name: 'Ivan',
    surname: 'Ivanov',
    age: 34,
  },
  credential: {
    username: 'TestInvalidUser',
    password: 'Password123!',
    email: 'invalid-email', // invalid email
  },
};
