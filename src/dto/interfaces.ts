import { Role } from '../config/constants';

export interface RoleCredentialDto {
  id: number;
  username: string;
  role: Role;
}

export interface UrlDto {
  url: string;
}

export interface UserRoleDto {
  id: number;
  role: Role;
}

export interface CustomSentMessageInfo {
  accepted: string[];
  rejected: string[];
  ehlo: string[];
  envelopeTime: number;
  messageTime: number;
  messageSize: number;
  response: string;
  envelope: object;
  messageId: string;
}
