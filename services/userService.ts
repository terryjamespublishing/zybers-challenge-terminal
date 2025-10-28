import { User } from '../types';

const USERS_KEY = 'zyber_users';
const USER_DATA_KEY = 'zyber_user_data';

// Helper to get all users' passwords
const getUsers = (): Record<string, string> => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
};

// Helper to get all users' data
const getAllUserData = (): Record<string, Omit<User, 'username'>> => {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : {};
}

export const doesUserExist = (username: string): boolean => {
    const users = getUsers();
    return username.toLowerCase() in users;
};

export const authenticateUser = (username: string, password: string): User | null => {
    const users = getUsers();
    const normalizedUsername = username.toLowerCase();
    // In a real app, you'd use a hashed password comparison
    if (users[normalizedUsername] === password) {
        return loadUserData(username);
    }
    return null;
};

export const registerUser = (username: string, password: string): User => {
    const users = getUsers();
    const normalizedUsername = username.toLowerCase();

    // Only set the password if the user truly doesn't exist yet.
    if (!users[normalizedUsername]) {
        users[normalizedUsername] = password;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    
    // Let loadUserData handle the creation of the user's data file.
    return loadUserData(username);
};

export const loadUserData = (username: string): User => {
    const allData = getAllUserData();
    const normalizedUsername = username.toLowerCase();
    const userData = allData[normalizedUsername];
    
    if (userData) {
        return { username, ...userData };
    }
    
    // This case is hit for new users, or if data is missing for an existing user.
    const newUser: Omit<User, 'username'> = {
        level: 1,
        xp: 0,
        dataBits: 0,
        accessKeys: 0,
    };
     allData[normalizedUsername] = newUser;
     localStorage.setItem(USER_DATA_KEY, JSON.stringify(allData));
    return { username, ...newUser };
};

export const saveUserData = (user: User): void => {
    const allData = getAllUserData();
    const { username, ...dataToSave } = user;
    const normalizedUsername = username.toLowerCase();
    
    allData[normalizedUsername] = dataToSave;
    
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(allData));
};