import { VarChar } from 'mssql';

import { getPool } from '@/connection/db';

export interface UserRecord {
  UserName: string;
  Password?: string;
}

/**
 * Find a user by their username in the Users table.
 * @param username The username to search for.
 * @returns The user record or null if not found.
 */
export async function findUserByUsername(username: string): Promise<UserRecord | null> {
  const pool = await getPool();
  const request = pool.request();

  request.input('username', VarChar, username.trim());

  const query = `
    SELECT UserName, Password
    FROM dbo.Users
    WHERE LTRIM(RTRIM(UserName)) = @username
  `;

  const result = await request.query(query);

  if (result.recordset.length > 0) {
    return result.recordset[0] as UserRecord;
  }

  return null;
}
