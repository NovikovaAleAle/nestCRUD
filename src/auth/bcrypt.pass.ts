import * as bcrypt from 'bcrypt';

const salt = async (): Promise<string> => {
  return bcrypt.genSalt();
};

export const hashedPassword = async (
  password: string | undefined,
): Promise<string> => {
  if (!password) {
    throw new Error('Password undefined');
  }
  return await bcrypt.hash(password, await salt());
};

export const isMatch = async (
  password: string,
  hashPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};
