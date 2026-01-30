import { ID } from 'appwrite';
import { account } from '../client';
import type { Models } from 'appwrite';

export const authService = {
    async createAccount(email: string, password: string, name: string): Promise<Models.User<Models.Preferences>> {
        return await account.create(ID.unique(), email, password, name);
    },

    async createSession(email: string, password: string): Promise<Models.Session> {
        return await account.createEmailPasswordSession(email, password);
    },

    async getAccount(): Promise<Models.User<Models.Preferences>> {
        return await account.get();
    },

    async deleteSession(): Promise<void> {
        await account.deleteSession('current');
    },

    async getCurrentSession(): Promise<Models.Session> {
        return await account.getSession('current');
    }
};
