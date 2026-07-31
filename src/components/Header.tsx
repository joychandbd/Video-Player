import React from 'react';
import {
  Video,
  Search,
  Grid,
  List,
  Lock,
  Plus,
  RefreshCw,
  Folder,
  Film,
  SlidersHorizontal
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (m: 'grid' | 'list') => void;
  activeTab: 'all' | 'folders' | 'private';
  setActiveTab: (tab: 'all' | 'folders' | 'private') => void;
  selectedFolder: string;
  setSelectedFolder: (folder: string) => void;
  folders: string[];
  sortBy: string;
  setSortBy: (sort: string) => void;
  onOpenVault: () => void;
  onOpenAddModal: () => void;
  onRefresh: () => void;
  videoCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  activeTab,
  setActiveTab,
  selectedFolder,
  setSelectedFolder,
  folders,
  sortBy,
  setSortBy,
  onOpenVault,
  onOpenAddModal,
  onRefresh,
  videoCount
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#1a1a1a] text-white">
      {/* Top Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center text-white shadow-sm">
            <Video className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              MX Player Ultra
            </h1>
            <p className="text-xs text-neutral-400 hidden sm:block font-normal">
              Hardware Engine • 200% Audio Boost • Subtitle Sync
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search videos, files or formats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141414] border border-[#222222] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-neutral-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Header Right Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Refresh / Scan */}
          <button
            onClick={onRefresh}
            title="Scan & Refresh Media Library"
            className="p-2 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] text-neutral-300 hover:text-white border border-[#222222] transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* View Mode Toggle (Grid/List) */}
          <div className="bg-[#141414] p-1 rounded-xl border border-[#222222] flex items-center space-x-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Private Vault Folder */}
          <button
            onClick={onOpenVault}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#141414] border border-[#222222] text-neutral-200 hover:bg-[#1f1f1f] text-xs font-semibold transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Private Vault</span>
          </button>

          {/* Add Video Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Video</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-bar / Tabs & Filters */}
      <div className="border-t border-[#1a1a1a] bg-[#080808] px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Main Category Tabs */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setActiveTab('all');
                setSelectedFolder('All Videos');
              }}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'bg-[#141414] text-neutral-300 hover:bg-[#1f1f1f] hover:text-white border border-[#222222]'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>All Videos ({videoCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('folders')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'folders'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'bg-[#141414] text-neutral-300 hover:bg-[#1f1f1f] hover:text-white border border-[#222222]'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Folder View</span>
            </button>
          </div>

          {/* Folder Pills (when in folder mode or filter) */}
          {activeTab === 'folders' && (
            <div className="flex items-center space-x-1.5 overflow-x-auto py-1 max-w-xl no-scrollbar">
              {folders.map((folder) => (
                <button
                  key={folder}
                  onClick={() => setSelectedFolder(folder)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedFolder === folder
                      ? 'bg-white text-black font-semibold'
                      : 'bg-[#141414] text-neutral-400 hover:bg-[#1f1f1f] hover:text-neutral-200 border border-[#222222]'
                  }`}
                >
                  {folder}
                </button>
              ))}
            </div>
          )}

          {/* Sorting Dropdown */}
          <div className="flex items-center space-x-2 ml-auto">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-xs text-neutral-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#141414] text-neutral-200 text-xs rounded-xl border border-[#222222] px-2.5 py-1 focus:outline-none focus:border-neutral-400"
            >
              <option value="name">Name (A-Z)</option>
              <option value="date">Date Added (Newest)</option>
              <option value="size">Size (Largest)</option>
              <option value="duration">Duration (Longest)</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
