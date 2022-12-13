export interface profileDto {
  name: string;
  username: string;
  bio: string;
  type: string;
  github: string;
  stack: string[];
}

export interface profileDetailDto extends Omit<profileDto, 'type'> {
  id: number;
  isHost: boolean;
  isOwner: boolean;
  email: string;
}
export interface fileDto {
  path: string;
}
