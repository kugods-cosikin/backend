import JWT from 'jsonwebtoken';
import { hash, verify } from 'argon2';
import User from '@/entities/user';
import { userAuthDto, tokenDto } from '@/interfaces/auth';
import AppDataSource from '@/config/app-data-source';
import Token from '@/entities/token';
import { IPayload } from '@/middlewares/jwt';

export const login = async (userData: userAuthDto):
  Promise<tokenDto> => {
  const { email, password } = userData;

  const findUser: User = await User.findOne({
    where: { email },
  });

  if (!findUser) {
    throw Error('invalid email');
  }

  const { userId } = findUser;

  // verify password
  const hashedPwd = findUser.password;

  if (!await verify(hashedPwd, password)) {
    throw Error('invalid password');
  }

  const secret = process.env.JWT_TOKEN_SECRET;
  // create JWT access token
  const accessToken = JWT.sign(
    { userId },
    secret,
    {
      expiresIn: '30m',
    },
  );
  const refreshToken = JWT.sign(
    { userId },
    secret,
    {
      expiresIn: '30d',
    },
  );
  await AppDataSource
    .createQueryBuilder()
    .insert()
    .into(Token)
    .values({
      accessToken,
      refreshToken,
    })
    .execute();

  const logInResult: tokenDto = {
    accessToken,
    refreshToken,
  };

  console.info(logInResult.accessToken, logInResult.refreshToken);

  return logInResult;
};

export const signup = async (user: userAuthDto):
  Promise<tokenDto> => {
  const mailRegex = /[a-z0-9A-Z]+@[a-z0-9A-Z.]+.[a-z0-9A-Z]+/;
  if (!mailRegex.test(user.email)) {
    throw Error('Invalid Email');
  }

  // number , 특수문자 하나씩 포함 8-20자
  const pwdRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/;
  if (!pwdRegex.test(user.password)) {
    throw Error('Invalid Password');
  }

  const existingUser = await User.findOne({ where: { email: user.email } });
  if (existingUser) {
    throw Error('User Already Exists');
  }

  const hashedPwd = await hash((user.password));

  const newUser = await AppDataSource
    .createQueryBuilder()
    .insert()
    .into(User)
    .values({
      email: user.email,
      password: hashedPwd,
    })
    .execute();
  const userId = newUser.identifiers[0].userId as number;

  const secret = process.env.JWT_TOKEN_SECRET;
  // create JWT access token
  const accessToken = JWT.sign(
    { userId },
    secret,
    {
      expiresIn: '30m',
    },
  );
  const refreshToken = JWT.sign(
    { userId },
    secret,
    {
      expiresIn: '30d',
    },
  );
  await AppDataSource
    .createQueryBuilder()
    .insert()
    .into(Token)
    .values({
      accessToken,
      refreshToken,
    })
    .execute();
  const logInResult: tokenDto = {
    accessToken,
    refreshToken,
  };

  return logInResult;
};

export const getNewToken = async (userId: number, refreshToken: string, accessToken: string):
  Promise<tokenDto> => {
  const secret = process.env.JWT_TOKEN_SECRET;

  const result = await Token.findOne({ where: { refreshToken } });
  if (!result) {
    throw Error('Invalid Refresh Token');
  }
  if (result.accessToken !== accessToken) {
    throw Error('Invalid Access Token');
  }
  const payload = JWT.verify(refreshToken, secret) as IPayload;

  if (payload.userId !== userId) {
    throw Error('Invalid User');
  }
  await result.remove();

  // create JWT access token
  const newAccessToken = JWT.sign(
    { userId },
    secret,
    {
      expiresIn: '30m',
    },
  );
  const newRefreshToken = JWT.sign(
    { userId },
    secret,
    {
      expiresIn: '30d',
    },
  );
  console.info(accessToken);
  await AppDataSource
    .createQueryBuilder()
    .insert()
    .into(Token)
    .values({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    })
    .execute();
  const tokens: tokenDto = {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };

  return tokens;
};
export const logout = async (refreshToken: string) => {
  const result = await Token.findOne({ where: { refreshToken } });
  if (!result) {
    throw Error('Invalid Refresh Token');
  }
  await result.remove();

  return true;
};
