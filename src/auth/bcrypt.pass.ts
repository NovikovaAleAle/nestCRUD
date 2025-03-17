import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;

export const hashedPassword = async (
  password: string | undefined,
): Promise<string> => {
  if (!password) {
    throw new Error('Password not found');
  }
  return await bcrypt.hash(password, saltOrRounds);
};

export const isMatch = async (
  password: string,
  hashPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};
