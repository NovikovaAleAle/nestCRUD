import { Role } from '../config/constants';

export interface RoleCredentialDto {
  id: number;
  username: string;
  role: Role;
}
