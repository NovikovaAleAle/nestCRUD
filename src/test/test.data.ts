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
