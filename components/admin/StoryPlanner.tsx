import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Story, StoryNode, QuestChallenge, AdminScreen } from '../../types';
import {
    getStories, getChallenges, createStory, updateStory, deleteStory,
    addNodeToStory, updateNodeInStory, deleteNodeFromStory, connectNodes, disconnectNodes
} from '../../services/questDataService';
import { playKeyPressSound, playErrorSound, playSuccessSound } from '../../utils/uiSfx';

interface StoryPlannerProps {
    onBack: () => void;
}

const NODE_WIDTH = 180;
const NODE_HEIGHT = 80;

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
    const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
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
        if (!newStoryName.trim()) {
            playErrorSound();
            return;
        }
        const story = createStory(newStoryName.trim());
        playSuccessSound();
        setStories(getStories());
        setSelectedStory(story);
        setIsCreatingStory(false);
        setNewStoryName('');
    };

    const handleDeleteStory = (id: string) => {
        if (deleteConfirm === id) {
            deleteStory(id);
            playSuccessSound();
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
        playSuccessSound();
    };

    const handleDeleteNode = (nodeId: string) => {
        if (!selectedStory) return;
        deleteNodeFromStory(selectedStory.id, nodeId);
        refreshStory();
        if (selectedNode?.id === nodeId) setSelectedNode(null);
        playSuccessSound();
    };

    const handleNodeMouseDown = (e: React.MouseEvent, node: StoryNode) => {
        if (isConnecting) {
            if (connectFrom && connectFrom !== node.id) {
                connectNodes(selectedStory!.id, connectFrom, node.id);
                refreshStory();
                playSuccessSound();
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
        playKeyPressSound();
    };

    const handleDisconnect = (fromId: string, toId: string) => {
        if (!selectedStory) return;
        disconnectNodes(selectedStory.id, fromId, toId);
        refreshStory();
        playSuccessSound();
    };

    const getNodeColor = (type: StoryNode['type']): string => {
        switch (type) {
            case 'start': return 'border-green-500 bg-green-500/10';
            case 'end': return 'border-red-500 bg-red-500/10';
            case 'branch': return 'border-yellow-500 bg-yellow-500/10';
            case 'challenge': return 'border-primary bg-primary/10';
            default: return 'border-primary/50';
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
                            stroke="rgba(0, 255, 65, 0.5)"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                        />
                        {/* Disconnect button at midpoint */}
                        <circle
                            cx={(x1 + x2) / 2}
                            cy={(y1 + y2) / 2}
                            r="8"
                            fill="rgba(255, 0, 0, 0.3)"
                            stroke="rgba(255, 0, 0, 0.5)"
                            className="cursor-pointer hover:fill-red-500/50"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDisconnect(node.id, targetId);
                            }}
                        />
                        <text
                            x={(x1 + x2) / 2}
                            y={(y1 + y2) / 2 + 4}
                            fill="white"
                            fontSize="10"
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
            <div className="p-4 border-b border-primary/30 flex justify-between items-start">
                <div>
                    <button
                        onClick={onBack}
                        className="text-accent hover:text-primary transition-colors mb-2 flex items-center gap-2"
                    >
                        ← BACK TO DASHBOARD
                    </button>
                    <h1 className="text-2xl md:text-3xl text-primary" style={{ textShadow: '0 0 10px currentColor' }}>
                        STORY PLANNER
                    </h1>
                </div>
                {isConnecting && (
                    <div className="text-yellow-400 animate-pulse px-4 py-2 border border-yellow-400">
                        Click target node to connect...
                    </div>
                )}
            </div>

            <div className="flex-1 flex">
                {/* Sidebar - Story List */}
                <div className="w-64 border-r border-primary/30 p-4 bg-black/30 overflow-y-auto">
                    <h2 className="text-primary text-lg mb-4">STORIES</h2>

                    {/* Create New Story */}
                    {isCreatingStory ? (
                        <div className="mb-4 space-y-2">
                            <input
                                type="text"
                                value={newStoryName}
                                onChange={(e) => setNewStoryName(e.target.value)}
                                placeholder="Story name..."
                                className="w-full bg-black/50 border border-primary/30 px-2 py-1 text-primary text-sm focus:border-primary outline-none"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCreateStory}
                                    className="flex-1 px-2 py-1 border border-accent text-accent text-xs hover:bg-accent/10"
                                >
                                    CREATE
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCreatingStory(false);
                                        setNewStoryName('');
                                    }}
                                    className="px-2 py-1 border border-primary/50 text-primary text-xs hover:bg-primary/10"
                                >
                                    CANCEL
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsCreatingStory(true)}
                            className="w-full mb-4 px-2 py-2 border border-accent/50 text-accent text-sm hover:bg-accent/10"
                        >
                            + NEW STORY
                        </button>
                    )}

                    {/* Story List */}
                    <div className="space-y-2">
                        {stories.map(story => (
                            <div
                                key={story.id}
                                className={`border p-2 cursor-pointer transition-all ${
                                    selectedStory?.id === story.id
                                        ? 'border-accent bg-accent/10'
                                        : 'border-primary/30 hover:border-primary/50'
                                }`}
                            >
                                <div
                                    onClick={() => setSelectedStory(story)}
                                    className="text-primary text-sm mb-1"
                                >
                                    {story.name}
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-primary/50">
                                        {story.nodes.length} nodes
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteStory(story.id);
                                        }}
                                        className={`px-2 py-0.5 text-xs transition-all ${
                                            deleteConfirm === story.id
                                                ? 'text-red-500 bg-red-500/20'
                                                : 'text-red-500/50 hover:text-red-500'
                                        }`}
                                    >
                                        {deleteConfirm === story.id ? 'CONFIRM?' : 'DEL'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {stories.length === 0 && (
                        <div className="text-primary/40 text-sm text-center py-4">
                            No stories yet
                        </div>
                    )}
                </div>

                {/* Main Canvas Area */}
                <div className="flex-1 flex flex-col">
                    {selectedStory ? (
                        <>
                            {/* Toolbar */}
                            <div className="p-2 border-b border-primary/30 bg-black/20 flex flex-wrap gap-2">
                                <span className="text-primary/70 text-sm py-1">Add Node:</span>
                                <button
                                    onClick={() => handleAddNode('end')}
                                    className="px-2 py-1 border border-red-500/50 text-red-500 text-xs hover:bg-red-500/10"
                                >
                                    + END
                                </button>
                                <button
                                    onClick={() => handleAddNode('branch')}
                                    className="px-2 py-1 border border-yellow-500/50 text-yellow-500 text-xs hover:bg-yellow-500/10"
                                >
                                    + BRANCH
                                </button>
                                <select
                                    onChange={(e) => {
                                        const id = parseInt(e.target.value);
                                        if (id) handleAddNode('challenge', id);
                                        e.target.value = '';
                                    }}
                                    className="px-2 py-1 bg-black/50 border border-primary/30 text-primary text-xs focus:border-primary outline-none"
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
                                className="flex-1 relative overflow-hidden bg-black/20"
                                onMouseMove={handleCanvasMouseMove}
                                onMouseUp={handleCanvasMouseUp}
                                onMouseLeave={handleCanvasMouseUp}
                                style={{ cursor: isDragging ? 'grabbing' : isConnecting ? 'crosshair' : 'default' }}
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
                                                fill="rgba(0, 255, 65, 0.7)"
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
                                        className={`absolute border-2 ${getNodeColor(node.type)} cursor-grab active:cursor-grabbing select-none ${
                                            selectedNode?.id === node.id ? 'ring-2 ring-accent' : ''
                                        }`}
                                        style={{
                                            left: node.x + viewOffset.x,
                                            top: node.y + viewOffset.y,
                                            width: NODE_WIDTH,
                                            height: NODE_HEIGHT
                                        }}
                                        onMouseDown={(e) => handleNodeMouseDown(e, node)}
                                    >
                                        <div className="p-2 h-full flex flex-col">
                                            <div className="text-xs text-primary/50 uppercase">
                                                {node.type}
                                            </div>
                                            <div className="text-sm text-primary truncate flex-1">
                                                {node.label}
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        startConnection(node.id);
                                                    }}
                                                    className="px-1 py-0.5 text-xs border border-accent/50 text-accent hover:bg-accent/20"
                                                    title="Connect to another node"
                                                >
                                                    →
                                                </button>
                                                {node.type !== 'start' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteNode(node.id);
                                                        }}
                                                        className="px-1 py-0.5 text-xs border border-red-500/50 text-red-500 hover:bg-red-500/20"
                                                        title="Delete node"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Instructions overlay */}
                                {selectedStory.nodes.length <= 1 && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-primary/30 text-center">
                                            <div className="text-2xl mb-2">Drag nodes to position them</div>
                                            <div className="text-sm">Click → to connect nodes</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-primary/40">
                            Select or create a story to begin
                        </div>
                    )}
                </div>

                {/* Right Panel - Node Details */}
                {selectedNode && selectedStory && (
                    <div className="w-64 border-l border-primary/30 p-4 bg-black/30">
                        <h3 className="text-primary text-lg mb-4">NODE DETAILS</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-primary/70 text-xs">TYPE</label>
                                <div className="text-primary">{selectedNode.type.toUpperCase()}</div>
                            </div>
                            <div>
                                <label className="text-primary/70 text-xs">LABEL</label>
                                <input
                                    type="text"
                                    value={selectedNode.label}
                                    onChange={(e) => {
                                        updateNodeInStory(selectedStory.id, selectedNode.id, { label: e.target.value });
                                        refreshStory();
                                    }}
                                    className="w-full bg-black/50 border border-primary/30 px-2 py-1 text-primary text-sm focus:border-primary outline-none"
                                />
                            </div>
                            {selectedNode.challengeId && (
                                <div>
                                    <label className="text-primary/70 text-xs">CHALLENGE</label>
                                    <div className="text-accent text-sm">
                                        #{selectedNode.challengeId}
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="text-primary/70 text-xs">CONNECTIONS</label>
                                <div className="text-primary/60 text-sm">
                                    {selectedNode.connections.length} outgoing
                                </div>
                            </div>
                            <div>
                                <label className="text-primary/70 text-xs">POSITION</label>
                                <div className="text-primary/60 text-sm">
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
