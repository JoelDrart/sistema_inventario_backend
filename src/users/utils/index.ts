import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';

export function generateUserId(): string {
  return uuidv4();
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  // console.log(password, hashedPassword);
  return await bcrypt.compare(password, hashedPassword);
}
