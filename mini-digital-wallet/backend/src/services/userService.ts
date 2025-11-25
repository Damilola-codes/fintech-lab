import {db} from '../database'
import {User} from '../models/User'

export const createUser = async (user: User): Promise<User> => {
    const query = `
        INSERT INTO users (username, full_name, email, date_of_birth)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `
    const values = [user.identity.username, user.identity.firstName + ' ' + user.identity.lastName, user.identity.contact, user.identity.dateOfBirth];
    const result = await db.query(query, values);
    return result.rows[0];
}

export const getUserById = async (userID: string): Promise<User | null> => {
    const query = `
        SELECT * FROM users WHERE user_id = $1
    `
    const values = [userID];
    const result = await db.query(query, values);
    return result.rows[0] || null;
}

export const getUserByUsername = async (username: string): Promise<User | null> => {
    const query = `
        SELECT * FROM users WHERE username = $1
    `
    const values = [username];
    const result = await db.query(query, values);
    return result.rows[0] || null;
}

export const updateUserEmailVerification = async (userID: string, verified: boolean): Promise<void> => {
    const query = `
        UPDATE users SET email_verified = $1 WHERE user_id = $2
    `
    const values = [verified, userID];
    await db.query(query, values);
}

export const updateUserPhoneVerification = async (userID: string, verified: boolean): Promise<void> => {
    const query = `
        UPDATE users SET phone_verified = $1 WHERE user_id = $2
    `
    const values = [verified, userID];
    await db.query(query, values);
}

// export const getAllUsers = async (): Promise<User[]> => {
//     const query = 'SELECT * FROM users';
//     const result = await db.query(query);
//     return result.rows.map(row => ({
//         userID: row.user_id,
//         identity: {
//             username: row.username,
//             firstName: row.full_name.split(' ')[0],
//             lastName: row.full_name.split(' ')[1] || '',
//             contact: row.email,
//             dateOfBirth: row.date_of_birth,
//         },
//         status: row.status,
//         emailVerified: row.email_verified,
//         phoneVerified: row.phone_verified,
//         createdAt: row.created_at,
//         updatedAt: row.updated_at,
//         authentication: {},
//         compliance: {},
//         financial: {},
//         deviceFingerprint: {},
//         profile: {},
//         settings: {},
//     }));
// };

