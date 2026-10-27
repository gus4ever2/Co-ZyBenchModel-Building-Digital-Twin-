import api, { removeAccessToken, setAccessToken } from "../lib/api";

export type LoginCredentials = {
  email: string;
  password: string;
};

export type ProfileType =
  "STUDENT" | "EDUCATOR" | "RESEARCHER" | "BUILDING_PROFESSIONAL" | "OTHER";

export type SignUpCredentials = LoginCredentials & {
  firstName: string;
  lastName: string;
  profileType: ProfileType;
};

type UserResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileType: ProfileType;
  roles: string[];
};

type AuthResponse = {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: UserResponse;
};

function persistAuthentication(response: AuthResponse) {
  setAccessToken(response.accessToken);
  return response;
}

export async function login(credentials: LoginCredentials) {
  const response = await api.post<AuthResponse>(
    "/v1/auth/sign-in",
    credentials,
  );

  return persistAuthentication(response.data);
}

export async function signUp(credentials: SignUpCredentials) {
  const response = await api.post<AuthResponse>(
    "/v1/auth/sign-up",
    credentials,
  );

  return persistAuthentication(response.data);
}

export function logout() {
  removeAccessToken();
}
