export interface UserResponse {
  id: string;
  email: string;
  password?: string;
  name: {
    first: string;
    last: string;
  };
  dni?: string;
  rol: string;
  state: string;
}
