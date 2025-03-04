export const parseStringEnv = (name: string): string => {
  const valueStr: string | undefined = process.env[name];
  if (!valueStr) {
    throw new Error(`Invalid env ${name}`);
  }
  return valueStr;
};

export const parseIntEnv = (name: string): number => {
  const valueStr: string | undefined = process.env[name];
  if (!valueStr) {
    throw new Error(`Invalid env ${name}`);
  }
  const valueInt: number = parseInt(valueStr);
  if (isNaN(valueInt)) {
    throw new Error(`Invalid env ${name}`);
  }
  return valueInt;
};
