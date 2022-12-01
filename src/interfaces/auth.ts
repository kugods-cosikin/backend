export interface userAuthDto {
  email: string;
  password: string;
}

export interface tokenDto {
  accessToken: string;
  refreshToken: string;
}
