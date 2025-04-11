import { plainToClass } from 'class-transformer';
import { Role } from '../config/constants';
import { PageOptionsDto } from '../dto/input.dto/page.options.dto';

export const createUserDtoTest = {
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

export const user = {
  id: 2,
  name: 'Ivan',
  surname: 'Ivanov',
  age: 21,
  role: Role.GUEST,
  credential: {
    username: 'Ivanushka',
    password: '123',
    email: 'ivan@example.ru',
  },
  UserPosts: [],
};

const pageOptionsDto = {
  page: 1,
  take: 4,
};

export const pageOptionsDtoTest = plainToClass(PageOptionsDto, pageOptionsDto, {
  excludeExtraneousValues: true,
});

export const users = [
  {
    id: 1,
    name: 'Petr',
    surname: 'Petrov',
    age: 23,
    role: Role.ADMIN,
  },
  {
    id: 2,
    name: 'Ivan',
    surname: 'Ivanov',
    age: 21,
    role: Role.GUEST,
  },
];

export const credential = {
  id: 1,
  username: 'Ivanushka',
  password: '123',
  email: 'ivan@example.ru',
};

export const updateUserDtoTest = {
  user: { name: 'Peter' },
  credential: { username: 'Petrovich' },
};

export const inputUserPostDtoTest = {
  title: 'Test post for test',
  content: 'test text for tset, test text for test, test text for test',    
}

export const updateUserPostDtoTest = {
  content: 'update content, update content, update content',
}

export const userPost = {
  id: 1,
  title: 'Test post for test',
  content: 'test text for test, test text for test, test text for test',
  image: null,
  user: user,
}

export const userPosts = [
  {
    id: 1,
    title: 'Test post for test',
    content: 'test text for test, test text for test, test text for test',
    image: null,
    user: user,
  },
  {
    id: 2,
    title: 'Test post for test two',
    content: 'test text for test two two two two',
    image: null,
    user: user,
  },
];