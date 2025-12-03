import { QuestData, QuestChallenge, Story, StoryNode, ChallengeType } from '../types';
import defaultQuestData from '../zyber_quest_data.json';

const STORAGE_KEY = 'zyber_quest_data';
const ADMIN_PASSWORD = 'zyber2029'; // Simple password for demo - in production use proper auth

// Load quest data from localStorage, falling back to the JSON file
export const loadQuestData = (): QuestData => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as QuestData;
        }
    } catch (e) {
        console.error('[QuestDataService] Failed to load from localStorage:', e);
    }

    // Return default data from JSON file
    return defaultQuestData as QuestData;
};

// Save quest data to localStorage
export const saveQuestData = (data: QuestData): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log('[QuestDataService] Data saved successfully');
    } catch (e) {
        console.error('[QuestDataService] Failed to save:', e);
    }
};

// Reset to default data
export const resetToDefault = (): QuestData => {
    const defaultData = defaultQuestData as QuestData;
    saveQuestData(defaultData);
    return defaultData;
};

// Export data as downloadable JSON
export const exportQuestData = (): void => {
    const data = loadQuestData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zyber_quest_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Import data from JSON file
export const importQuestData = (jsonString: string): QuestData | null => {
    try {
        const data = JSON.parse(jsonString) as QuestData;
        // Validate structure
        if (!data.challenges || !Array.isArray(data.challenges)) {
            throw new Error('Invalid data structure: missing challenges array');
        }
        if (!data.stories || !Array.isArray(data.stories)) {
            data.stories = [];
        }
        saveQuestData(data);
        return data;
    } catch (e) {
        console.error('[QuestDataService] Import failed:', e);
        return null;
    }
};

// ========== CHALLENGE CRUD ==========

export const getChallenges = (): QuestChallenge[] => {
    return loadQuestData().challenges;
};

export const getChallengeById = (id: number): QuestChallenge | undefined => {
    return loadQuestData().challenges.find(c => c.id === id);
};

export const getChallengesByCategory = (category: ChallengeType): QuestChallenge[] => {
    return loadQuestData().challenges.filter(c => c.category === category);
};

export const getChallengesByDifficulty = (difficulty: 1 | 2 | 3): QuestChallenge[] => {
    return loadQuestData().challenges.filter(c => c.difficulty === difficulty);
};

export const searchChallenges = (query: string): QuestChallenge[] => {
    const lowerQuery = query.toLowerCase();
    return loadQuestData().challenges.filter(c =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.description.toLowerCase().includes(lowerQuery) ||
        c.category.toLowerCase().includes(lowerQuery) ||
        c.learning_objectives.toLowerCase().includes(lowerQuery)
    );
};

export const createChallenge = (challenge: Omit<QuestChallenge, 'id'>): QuestChallenge => {
    const data = loadQuestData();
    const maxId = data.challenges.reduce((max, c) => Math.max(max, c.id), 0);
    const newChallenge: QuestChallenge = {
        ...challenge,
        id: maxId + 1
    };
    data.challenges.push(newChallenge);
    saveQuestData(data);
    return newChallenge;
};

export const updateChallenge = (id: number, updates: Partial<QuestChallenge>): QuestChallenge | null => {
    const data = loadQuestData();
    const index = data.challenges.findIndex(c => c.id === id);
    if (index === -1) return null;

    data.challenges[index] = { ...data.challenges[index], ...updates, id }; // Ensure ID doesn't change
    saveQuestData(data);
    return data.challenges[index];
};

export const deleteChallenge = (id: number): boolean => {
    const data = loadQuestData();
    const index = data.challenges.findIndex(c => c.id === id);
    if (index === -1) return false;

    data.challenges.splice(index, 1);
    saveQuestData(data);
    return true;
};

// ========== STORY CRUD ==========

export const getStories = (): Story[] => {
    return loadQuestData().stories;
};

export const getStoryById = (id: string): Story | undefined => {
    return loadQuestData().stories.find(s => s.id === id);
};

export const createStory = (name: string, description?: string): Story => {
    const data = loadQuestData();
    const newStory: Story = {
        id: `story-${Date.now()}`,
        name,
        description,
        nodes: [
            {
                id: `node-start-${Date.now()}`,
                challengeId: null,
                type: 'start',
                x: 100,
                y: 200,
                label: 'START',
                connections: []
            }
        ],
        createdAt: Date.now(),
        lastEdited: Date.now()
    };
    data.stories.push(newStory);
    saveQuestData(data);
    return newStory;
};

export const updateStory = (id: string, updates: Partial<Story>): Story | null => {
    const data = loadQuestData();
    const index = data.stories.findIndex(s => s.id === id);
    if (index === -1) return null;

    data.stories[index] = {
        ...data.stories[index],
        ...updates,
        id, // Ensure ID doesn't change
        lastEdited: Date.now()
    };
    saveQuestData(data);
    return data.stories[index];
};

export const deleteStory = (id: string): boolean => {
    const data = loadQuestData();
    const index = data.stories.findIndex(s => s.id === id);
    if (index === -1) return false;

    data.stories.splice(index, 1);
    saveQuestData(data);
    return true;
};

// ========== STORY NODE OPERATIONS ==========

export const addNodeToStory = (storyId: string, node: Omit<StoryNode, 'id'>): StoryNode | null => {
    const data = loadQuestData();
    const storyIndex = data.stories.findIndex(s => s.id === storyId);
    if (storyIndex === -1) return null;

    const newNode: StoryNode = {
        ...node,
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    data.stories[storyIndex].nodes.push(newNode);
    data.stories[storyIndex].lastEdited = Date.now();
    saveQuestData(data);
    return newNode;
};

export const updateNodeInStory = (storyId: string, nodeId: string, updates: Partial<StoryNode>): StoryNode | null => {
    const data = loadQuestData();
    const storyIndex = data.stories.findIndex(s => s.id === storyId);
    if (storyIndex === -1) return null;

    const nodeIndex = data.stories[storyIndex].nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) return null;

    data.stories[storyIndex].nodes[nodeIndex] = {
        ...data.stories[storyIndex].nodes[nodeIndex],
        ...updates,
        id: nodeId // Ensure ID doesn't change
    };
    data.stories[storyIndex].lastEdited = Date.now();
    saveQuestData(data);
    return data.stories[storyIndex].nodes[nodeIndex];
};

export const deleteNodeFromStory = (storyId: string, nodeId: string): boolean => {
    const data = loadQuestData();
    const storyIndex = data.stories.findIndex(s => s.id === storyId);
    if (storyIndex === -1) return false;

    const nodeIndex = data.stories[storyIndex].nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) return false;

    // Remove the node
    data.stories[storyIndex].nodes.splice(nodeIndex, 1);

    // Remove any connections to this node
    data.stories[storyIndex].nodes.forEach(node => {
        node.connections = node.connections.filter(conn => conn !== nodeId);
        if (node.conditions) {
            node.conditions = node.conditions.filter(cond => cond.targetNodeId !== nodeId);
        }
    });

    data.stories[storyIndex].lastEdited = Date.now();
    saveQuestData(data);
    return true;
};

export const connectNodes = (storyId: string, fromNodeId: string, toNodeId: string): boolean => {
    const data = loadQuestData();
    const storyIndex = data.stories.findIndex(s => s.id === storyId);
    if (storyIndex === -1) return false;

    const fromNode = data.stories[storyIndex].nodes.find(n => n.id === fromNodeId);
    if (!fromNode) return false;

    if (!fromNode.connections.includes(toNodeId)) {
        fromNode.connections.push(toNodeId);
        data.stories[storyIndex].lastEdited = Date.now();
        saveQuestData(data);
    }
    return true;
};

export const disconnectNodes = (storyId: string, fromNodeId: string, toNodeId: string): boolean => {
    const data = loadQuestData();
    const storyIndex = data.stories.findIndex(s => s.id === storyId);
    if (storyIndex === -1) return false;

    const fromNode = data.stories[storyIndex].nodes.find(n => n.id === fromNodeId);
    if (!fromNode) return false;

    fromNode.connections = fromNode.connections.filter(conn => conn !== toNodeId);
    data.stories[storyIndex].lastEdited = Date.now();
    saveQuestData(data);
    return true;
};

// ========== ADMIN AUTH ==========

export const verifyAdminPassword = (password: string): boolean => {
    return password === ADMIN_PASSWORD;
};

export const isAdminLoggedIn = (): boolean => {
    return sessionStorage.getItem('admin_logged_in') === 'true';
};

export const adminLogin = (password: string): boolean => {
    if (verifyAdminPassword(password)) {
        sessionStorage.setItem('admin_logged_in', 'true');
        return true;
    }
    return false;
};

export const adminLogout = (): void => {
    sessionStorage.removeItem('admin_logged_in');
};

// ========== STATS ==========

export const getStats = () => {
    const data = loadQuestData();
    const categories = data.challenges.reduce((acc, c) => {
        acc[c.category] = (acc[c.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const difficulties = data.challenges.reduce((acc, c) => {
        acc[c.difficulty] = (acc[c.difficulty] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    return {
        totalChallenges: data.challenges.length,
        totalStories: data.stories.length,
        categoryCounts: categories,
        difficultyCounts: difficulties,
        avgTimeMinutes: Math.round(
            data.challenges.reduce((sum, c) => sum + c.time_minutes, 0) / data.challenges.length
        )
    };
};
