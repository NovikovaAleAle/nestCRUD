import * as bcrypt from 'bcrypt';

export const salt = async (): Promise<string> => {
  return bcrypt.genSalt();
};

export const isMatch = async (
  password: string,
  hashPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};
