const envIsExist = (nameEnv: string) => {
  const valueStr: string | undefined = process.env[nameEnv];
  if (!valueStr) {
    throw new Error(`Env ${nameEnv} not found`);
  }
  return valueStr;
};

export const parseStringEnv = (nameEnv: string): string => {
  return envIsExist(nameEnv);
};

export const parseIntEnv = (nameEnv: string): number => {
  const valueInt: number = parseInt(envIsExist(nameEnv));
  if (isNaN(valueInt)) {
    throw new Error(`Invalid env ${nameEnv}`);
  }
  return valueInt;
};

export const parseBooleanEnv = (nameEnv: string): boolean => {
  const valueStr: string = envIsExist(nameEnv);
  const lowerCaseValueStr: string = valueStr.toLowerCase();
  if (lowerCaseValueStr === 'true') {
    return true;
  }
  if (lowerCaseValueStr === 'false') {
    return false;
  }
  throw new Error(`Invalid env ${nameEnv}`);
};
