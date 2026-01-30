export const appwriteConfig = {
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || 'raybet-db',
    collections: {
        rooms: import.meta.env.VITE_APPWRITE_COLLECTION_ROOMS || 'rooms',
        profiles: import.meta.env.VITE_APPWRITE_COLLECTION_PROFILES || 'profiles',
        matches: import.meta.env.VITE_APPWRITE_COLLECTION_MATCHES || 'matches',
        predictions: import.meta.env.VITE_APPWRITE_COLLECTION_PREDICTIONS || 'predictions',
    },
};
