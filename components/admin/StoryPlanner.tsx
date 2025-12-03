import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Story, StoryNode, QuestChallenge } from '../../types';
import {
    getStories, getChallenges, createStory, deleteStory,
    addNodeToStory, updateNodeInStory, deleteNodeFromStory, connectNodes, disconnectNodes
} from '../../services/questDataService';

interface StoryPlannerProps {
    onBack: () => void;
}

const NODE_WIDTH = 200;
const NODE_HEIGHT = 90;

const StoryPlanner: React.FC<StoryPlannerProps> = ({ onBack }) => {
    const [stories, setStories] = useState<Story[]>([]);
    const [challenges, setChallenges] = useState<QuestChallenge[]>([]);
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [selectedNode, setSelectedNode] = useState<StoryNode | null>(null);
    const [isCreatingStory, setIsCreatingStory] = useState(false);
    const [newStoryName, setNewStoryName] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectFrom, setConnectFrom] = useState<string | null>(null);
    const [viewOffset] = useState({ x: 0, y: 0 });
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setStories(getStories());
        setChallenges(getChallenges());
    }, []);

    const refreshStory = useCallback(() => {
        if (selectedStory) {
            const updated = getStories().find(s => s.id === selectedStory.id);
            if (updated) setSelectedStory(updated);
        }
    }, [selectedStory]);

    const handleCreateStory = () => {
        if (!newStoryName.trim()) return;
        const story = createStory(newStoryName.trim());
        setStories(getStories());
        setSelectedStory(story);
        setIsCreatingStory(false);
        setNewStoryName('');
    };

    const handleDeleteStory = (id: string) => {
        if (deleteConfirm === id) {
            deleteStory(id);
            setStories(getStories());
            if (selectedStory?.id === id) {
                setSelectedStory(null);
            }
            setDeleteConfirm(null);
        } else {
            setDeleteConfirm(id);
        }
    };

    const handleAddNode = (type: StoryNode['type'], challengeId?: number) => {
        if (!selectedStory) return;

        const challenge = challengeId ? challenges.find(c => c.id === challengeId) : null;
        const label = type === 'start' ? 'START'
            : type === 'end' ? 'END'
                : type === 'branch' ? 'BRANCH'
                    : challenge?.name || 'Unknown Challenge';

        addNodeToStory(selectedStory.id, {
            challengeId: challengeId || null,
            type,
            x: 200 + Math.random() * 200,
            y: 100 + Math.random() * 200,
            label,
            connections: []
        });
        refreshStory();
    };

    const handleDeleteNode = (nodeId: string) => {
        if (!selectedStory) return;
        deleteNodeFromStory(selectedStory.id, nodeId);
        refreshStory();
        if (selectedNode?.id === nodeId) setSelectedNode(null);
    };

    const handleNodeMouseDown = (e: React.MouseEvent, node: StoryNode) => {
        if (isConnecting) {
            if (connectFrom && connectFrom !== node.id) {
                connectNodes(selectedStory!.id, connectFrom, node.id);
                refreshStory();
            }
            setIsConnecting(false);
            setConnectFrom(null);
            return;
        }

        e.stopPropagation();
        setSelectedNode(node);
        setIsDragging(true);

        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            setDragOffset({
                x: e.clientX - rect.left - node.x - viewOffset.x,
                y: e.clientY - rect.top - node.y - viewOffset.y
            });
        }
    };

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !selectedNode || !selectedStory) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const newX = e.clientX - rect.left - dragOffset.x - viewOffset.x;
        const newY = e.clientY - rect.top - dragOffset.y - viewOffset.y;

        updateNodeInStory(selectedStory.id, selectedNode.id, { x: newX, y: newY });
        refreshStory();
    };

    const handleCanvasMouseUp = () => {
        setIsDragging(false);
    };

    const startConnection = (nodeId: string) => {
        setIsConnecting(true);
        setConnectFrom(nodeId);
    };

    const handleDisconnect = (fromId: string, toId: string) => {
        if (!selectedStory) return;
        disconnectNodes(selectedStory.id, fromId, toId);
        refreshStory();
    };

    const getNodeColor = (type: StoryNode['type']): string => {
        switch (type) {
            case 'start': return 'border-emerald-400 bg-emerald-50';
            case 'end': return 'border-red-400 bg-red-50';
            case 'branch': return 'border-amber-400 bg-amber-50';
            case 'challenge': return 'border-indigo-400 bg-indigo-50';
            default: return 'border-slate-300 bg-slate-50';
        }
    };

    const getNodeHeaderColor = (type: StoryNode['type']): string => {
        switch (type) {
            case 'start': return 'text-emerald-700';
            case 'end': return 'text-red-700';
            case 'branch': return 'text-amber-700';
            case 'challenge': return 'text-indigo-700';
            default: return 'text-slate-700';
        }
    };

    const renderConnections = () => {
        if (!selectedStory) return null;

        return selectedStory.nodes.map(node => {
            return node.connections.map(targetId => {
                const targetNode = selectedStory.nodes.find(n => n.id === targetId);
                if (!targetNode) return null;

                const x1 = node.x + NODE_WIDTH / 2 + viewOffset.x;
                const y1 = node.y + NODE_HEIGHT / 2 + viewOffset.y;
                const x2 = targetNode.x + NODE_WIDTH / 2 + viewOffset.x;
                const y2 = targetNode.y + NODE_HEIGHT / 2 + viewOffset.y;

                return (
                    <g key={`${node.id}-${targetId}`}>
                        <line
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#6366f1"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                        />
                        <circle
                            cx={(x1 + x2) / 2}
                            cy={(y1 + y2) / 2}
                            r="10"
                            fill="#fef2f2"
                            stroke="#ef4444"
                            strokeWidth="2"
                            className="cursor-pointer hover:fill-red-100"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDisconnect(node.id, targetId);
                            }}
                        />
                        <text
                            x={(x1 + x2) / 2}
                            y={(y1 + y2) / 2 + 4}
                            fill="#ef4444"
                            fontSize="12"
                            fontWeight="bold"
                            textAnchor="middle"
                            className="pointer-events-none"
                        >
                            ×
                        </text>
                    </g>
                );
            });
        });
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div>
                        <button
                            onClick={onBack}
                            className="text-indigo-600 hover:text-indigo-800 transition-colors text-base font-medium flex items-center gap-1 mb-1"
                        >
                            &larr; Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-bold text-slate-800">
                            Story Planner
                        </h1>
                    </div>
                    {isConnecting && (
                        <div className="bg-amber-50 text-amber-700 px-5 py-2.5 rounded-lg border border-amber-200 font-medium text-base animate-pulse">
                            Click a target node to connect...
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1 flex">
                {/* Sidebar - Story List */}
                <div className="w-80 border-r border-slate-200 bg-white p-5 overflow-y-auto">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">Stories</h2>

                    {/* Create New Story */}
                    {isCreatingStory ? (
                        <div className="mb-4 space-y-3">
                            <input
                                type="text"
                                value={newStoryName}
                                onChange={(e) => setNewStoryName(e.target.value)}
                                placeholder="Story name..."
                                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 text-base focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateStory()}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCreateStory}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white text-base rounded-lg hover:bg-indigo-700 font-medium"
                                >
                                    Create
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCreatingStory(false);
                                        setNewStoryName('');
                                    }}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 text-base rounded-lg hover:bg-slate-200 font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsCreatingStory(true)}
                            className="w-full mb-4 px-4 py-2.5 bg-indigo-600 text-white text-base rounded-lg hover:bg-indigo-700 font-medium"
                        >
                            + New Story
                        </button>
                    )}

                    {/* Story List */}
                    <div className="space-y-3">
                        {stories.map(story => (
                            <div
                                key={story.id}
                                className={`rounded-lg p-4 cursor-pointer transition-all ${
                                    selectedStory?.id === story.id
                                        ? 'bg-indigo-50 border-2 border-indigo-300'
                                        : 'bg-slate-50 border border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div
                                    onClick={() => setSelectedStory(story)}
                                    className="text-slate-800 font-medium text-base mb-1"
                                >
                                    {story.name}
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">
                                        {story.nodes.length} nodes
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteStory(story.id);
                                        }}
                                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                            deleteConfirm === story.id
                                                ? 'bg-red-600 text-white'
                                                : 'text-red-600 hover:bg-red-50'
                                        }`}
                                    >
                                        {deleteConfirm === story.id ? 'Confirm?' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {stories.length === 0 && (
                        <div className="text-slate-400 text-base text-center py-8">
                            No stories yet. Create one to get started.
                        </div>
                    )}
                </div>

                {/* Main Canvas Area */}
                <div className="flex-1 flex flex-col bg-slate-100">
                    {selectedStory ? (
                        <>
                            {/* Toolbar */}
                            <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap gap-3 items-center">
                                <span className="text-slate-600 text-base font-medium mr-2">Add Node:</span>
                                <button
                                    onClick={() => handleAddNode('start')}
                                    className="px-4 py-2 bg-emerald-100 text-emerald-700 text-base rounded-lg hover:bg-emerald-200 font-medium"
                                >
                                    + Start
                                </button>
                                <button
                                    onClick={() => handleAddNode('end')}
                                    className="px-4 py-2 bg-red-100 text-red-700 text-base rounded-lg hover:bg-red-200 font-medium"
                                >
                                    + End
                                </button>
                                <button
                                    onClick={() => handleAddNode('branch')}
                                    className="px-4 py-2 bg-amber-100 text-amber-700 text-base rounded-lg hover:bg-amber-200 font-medium"
                                >
                                    + Branch
                                </button>
                                <select
                                    onChange={(e) => {
                                        const id = parseInt(e.target.value);
                                        if (id) handleAddNode('challenge', id);
                                        e.target.value = '';
                                    }}
                                    className="px-4 py-2 bg-indigo-100 text-indigo-700 text-base rounded-lg border-0 focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
                                    defaultValue=""
                                >
                                    <option value="" disabled>+ Add Challenge...</option>
                                    {challenges.map(c => (
                                        <option key={c.id} value={c.id}>
                                            [{c.category}] {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Canvas */}
                            <div
                                ref={canvasRef}
                                className="flex-1 relative overflow-hidden"
                                onMouseMove={handleCanvasMouseMove}
                                onMouseUp={handleCanvasMouseUp}
                                onMouseLeave={handleCanvasMouseUp}
                                style={{
                                    cursor: isDragging ? 'grabbing' : isConnecting ? 'crosshair' : 'default',
                                    backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
                                    backgroundSize: '20px 20px'
                                }}
                            >
                                {/* SVG for connections */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                    <defs>
                                        <marker
                                            id="arrowhead"
                                            markerWidth="10"
                                            markerHeight="7"
                                            refX="10"
                                            refY="3.5"
                                            orient="auto"
                                        >
                                            <polygon
                                                points="0 0, 10 3.5, 0 7"
                                                fill="#6366f1"
                                            />
                                        </marker>
                                    </defs>
                                    <g className="pointer-events-auto">
                                        {renderConnections()}
                                    </g>
                                </svg>

                                {/* Nodes */}
                                {selectedStory.nodes.map(node => (
                                    <div
                                        key={node.id}
                                        className={`absolute rounded-lg border-2 shadow-sm cursor-grab active:cursor-grabbing select-none ${getNodeColor(node.type)} ${
                                            selectedNode?.id === node.id ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                                        }`}
                                        style={{
                                            left: node.x + viewOffset.x,
                                            top: node.y + viewOffset.y,
                                            width: NODE_WIDTH,
                                            height: NODE_HEIGHT
                                        }}
                                        onMouseDown={(e) => handleNodeMouseDown(e, node)}
                                    >
                                        <div className="p-3 h-full flex flex-col">
                                            <div className={`text-sm font-semibold uppercase ${getNodeHeaderColor(node.type)}`}>
                                                {node.type}
                                            </div>
                                            <div className="text-base text-slate-800 font-medium truncate flex-1 mt-1">
                                                {node.label}
                                            </div>
                                            <div className="flex gap-1 mt-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        startConnection(node.id);
                                                    }}
                                                    className="px-2.5 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 font-medium"
                                                    title="Connect to another node"
                                                >
                                                    Connect →
                                                </button>
                                                {node.type !== 'start' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteNode(node.id);
                                                        }}
                                                        className="px-2.5 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium"
                                                        title="Delete node"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Instructions overlay */}
                                {selectedStory.nodes.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-slate-400 text-center">
                                            <div className="text-2xl mb-2">Add nodes using the toolbar above</div>
                                            <div className="text-lg">Drag nodes to position them, click "Connect" to link them</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400">
                            <div className="text-center">
                                <div className="text-2xl mb-2">Select or create a story to begin</div>
                                <div className="text-lg">Use the sidebar on the left to manage stories</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel - Node Details */}
                {selectedNode && selectedStory && (
                    <div className="w-80 border-l border-slate-200 bg-white p-5">
                        <h3 className="text-xl font-semibold text-slate-800 mb-5">Node Details</h3>
                        <div className="space-y-5">
                            <div>
                                <label className="text-slate-500 text-sm font-medium uppercase">Type</label>
                                <div className={`text-lg font-medium mt-1 ${getNodeHeaderColor(selectedNode.type)}`}>
                                    {selectedNode.type.toUpperCase()}
                                </div>
                            </div>
                            <div>
                                <label className="text-slate-500 text-sm font-medium uppercase">Label</label>
                                <input
                                    type="text"
                                    value={selectedNode.label}
                                    onChange={(e) => {
                                        updateNodeInStory(selectedStory.id, selectedNode.id, { label: e.target.value });
                                        refreshStory();
                                    }}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 text-base focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none mt-1"
                                />
                            </div>
                            {selectedNode.challengeId && (
                                <div>
                                    <label className="text-slate-500 text-sm font-medium uppercase">Challenge ID</label>
                                    <div className="text-indigo-600 font-medium text-lg mt-1">
                                        #{selectedNode.challengeId}
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="text-slate-500 text-sm font-medium uppercase">Connections</label>
                                <div className="text-slate-600 text-base mt-1">
                                    {selectedNode.connections.length} outgoing
                                </div>
                            </div>
                            <div>
                                <label className="text-slate-500 text-sm font-medium uppercase">Position</label>
                                <div className="text-slate-600 text-base mt-1">
                                    X: {Math.round(selectedNode.x)}, Y: {Math.round(selectedNode.y)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoryPlanner;
