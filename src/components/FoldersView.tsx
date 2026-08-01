import React, { useState, useRef } from 'react';
import {
  Search,
  FolderKanban,
  LayoutGrid,
  List,
  Play,
  RefreshCw,
  ShieldCheck,
  Film,
  CheckCircle2,
  MoreVertical,
  Edit2,
  Trash2,
  Info,
  FolderOpen,
  Upload,
  HardDrive
} from 'lucide-react';
import { VideoItem } from '../types';
import appIconImg from '../assets/images/app_player_icon_1785548923591.jpg';

interface FolderItem {
  name: string;
  videoCount: number;
  newCount: number;
}

interface FoldersViewProps {
  videos: VideoItem[];
  onSelectFolder: (folderName: string) => void;
  onPlayDefaultVideo: () => void;
  onImportLocalVideos?: (importedVideos: VideoItem[]) => void;
  onRenameFolder?: (oldName: string, newName: string) => void;
  onDeleteFolder?: (folderName: string) => void;
  onPlayDirectFile?: (file: File) => void;
}

export const FoldersView: React.FC<FoldersViewProps> = ({
  videos,
  onSelectFolder,
  onPlayDefaultVideo,
  onImportLocalVideos,
  onRenameFolder,
  onDeleteFolder,
  onPlayDirectFile,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [hasPermission, setHasPermission] = useState<boolean>(() => {
    return localStorage.getItem('mx_media_permission_granted') === 'true';
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  // Modals / Action menus
  const [selectedFolderMenu, setSelectedFolderMenu] = useState<FolderItem | null>(null);
  const [editingFolder, setEditingFolder] = useState<FolderItem | null>(null);
  const [newFolderNameInput, setNewFolderNameInput] = useState('');
  const [viewingFolderInfo, setViewingFolderInfo] = useState<FolderItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const directFileInputRef = useRef<HTMLInputElement>(null);

  // Derive unique folder names dynamically from state
  const uniqueFolderNames: string[] = Array.from(new Set(videos.map((v) => v.folderName || 'Device Storage')));

  // Default phone video folders provided on initial permission sync if state is empty
  const mockFolderCounts: Record<string, { total: number; newBadge: number }> = {
    'Camera (DCIM)': { total: 18, newBadge: 3 },
    'Downloads': { total: 12, newBadge: 4 },
    'Legends.S01': { total: 6, newBadge: 2 },
    'MLWBD.com EKTB S01 480p': { total: 14, newBadge: 7 },
    'Movie': { total: 20, newBadge: 1 },
    'Quick Share': { total: 34, newBadge: 0 },
    'SnapTube Video': { total: 26, newBadge: 10 },
    'WhatsApp Video': { total: 15, newBadge: 5 },
    'ScreenRecorder': { total: 8, newBadge: 2 },
  };

  const allFoldersSet = new Set<string>([...Object.keys(mockFolderCounts), ...uniqueFolderNames]);

  // Unwanted / system / hidden junk folder patterns
  const unwantedFolders = ['android', '.thumbnails', 'system volume information', '$recycle.bin', 'tmp', 'temp', 'cache', '.git'];

  // STRICT FILTERING: Hide any folder with 0 videos or unwanted system names
  const foldersList: FolderItem[] = Array.from(allFoldersSet)
    .map((name: string) => {
      const matchingVids = videos.filter((v) => v.folderName === name);
      const mock = mockFolderCounts[name];
      const totalCount = matchingVids.length > 0 ? matchingVids.length : (mock ? mock.total : 0);
      const newBadge = mock ? mock.newBadge : matchingVids.filter((v) => v.isNew).length;

      return {
        name,
        videoCount: totalCount,
        newCount: newBadge,
      };
    })
    .filter((folder) => {
      // Must contain at least 1 video
      if (folder.videoCount <= 0) return false;
      // Must not be hidden dot folders or junk
      if (folder.name.startsWith('.')) return false;
      if (unwantedFolders.includes(folder.name.toLowerCase())) return false;
      return true;
    });

  const filteredFolders = foldersList.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto sync on mount if permission already granted
  React.useEffect(() => {
    if (hasPermission) {
      setIsScanning(true);
      setScanMessage('Auto-syncing device video folders...');
      const timer = setTimeout(() => {
        setIsScanning(false);
        setScanMessage('');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasPermission]);

  // Request Directory / Storage Access & Auto Sync
  const handleRequestPermissionAndSync = async () => {
    localStorage.setItem('mx_media_permission_granted', 'true');
    setHasPermission(true);

    // Try HTML5 Directory Picker if supported
    if ('showDirectoryPicker' in window) {
      try {
        setIsScanning(true);
        setScanMessage('Accessing device media directories...');
        const dirHandle = await (window as any).showDirectoryPicker();
        
        const importedVids: VideoItem[] = [];
        
        // Recursive Directory Traversal
        const readDirectory = async (handle: any, currentFolderPath: string) => {
          for await (const entry of handle.values()) {
            if (entry.kind === 'file') {
              if (entry.name.match(/\.(mp4|mkv|avi|mov|wmv|flv|webm)$/i)) {
                const file = await entry.getFile();
                const fileUrl = URL.createObjectURL(file);
                const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
                const formattedSize = parseFloat(sizeInMB) > 1024 
                  ? `${(parseFloat(sizeInMB) / 1024).toFixed(1)} GB` 
                  : `${sizeInMB} MB`;

                importedVids.push({
                  id: `dir-${Date.now()}-${Math.random()}`,
                  title: file.name,
                  url: fileUrl,
                  poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
                  duration: 300,
                  size: formattedSize,
                  date: new Date(file.lastModified || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  folderName: currentFolderPath || handle.name || 'Video Library',
                  decoder: 'HW+',
                  resolution: '1080p',
                  codec: 'H.264 / AAC',
                  progress: 0,
                  completed: false,
                  isNew: true,
                  subtitles: [],
                  audioTracks: [{ id: 'a1', label: 'Default Track', language: 'en' }]
                });
              }
            } else if (entry.kind === 'directory') {
              if (!entry.name.startsWith('.') && !unwantedFolders.includes(entry.name.toLowerCase())) {
                await readDirectory(entry, entry.name);
              }
            }
          }
        };

        await readDirectory(dirHandle, dirHandle.name);

        if (importedVids.length > 0 && onImportLocalVideos) {
          onImportLocalVideos(importedVids);
          setScanMessage(`Synced ${importedVids.length} videos from ${dirHandle.name}!`);
        } else {
          setScanMessage('Auto-sync completed.');
        }

        setTimeout(() => {
          setIsScanning(false);
          setScanMessage('');
        }, 2000);
        return;
      } catch (err) {
        console.log('Directory picker cancelled or unpermitted, falling back to input scan', err);
      }
    }

    // Fallback: Trigger standard multi-folder input scan
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Process selected local video files via input
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsScanning(true);
    setScanMessage(`Scanning ${files.length} video files...`);

    const newImportedVideos: VideoItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|mkv|avi|mov|wmv|flv|webm)$/i)) {
        continue;
      }

      const fileUrl = URL.createObjectURL(file);
      
      let folder = 'Phone Storage';
      if (file.webkitRelativePath) {
        const parts = file.webkitRelativePath.split('/');
        if (parts.length > 1) {
          folder = parts[parts.length - 2];
        }
      }

      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      const formattedSize = parseFloat(sizeInMB) > 1024 
        ? `${(parseFloat(sizeInMB) / 1024).toFixed(1)} GB` 
        : `${sizeInMB} MB`;

      const dateObj = new Date(file.lastModified || Date.now());
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      newImportedVideos.push({
        id: `local-${Date.now()}-${i}`,
        title: file.name,
        url: fileUrl,
        poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
        duration: 300,
        size: formattedSize,
        date: dateStr,
        folderName: folder,
        decoder: 'HW+',
        resolution: '1080p',
        codec: 'H.264 / AAC',
        progress: 0,
        completed: false,
        isNew: true,
        isPrivate: false,
        subtitles: [],
        audioTracks: [{ id: 'a1', label: 'Default Track', language: 'en' }]
      });
    }

    if (newImportedVideos.length > 0 && onImportLocalVideos) {
      onImportLocalVideos(newImportedVideos);
      setScanMessage(`Successfully synced ${newImportedVideos.length} local videos!`);
    } else {
      setScanMessage('Auto-sync completed.');
    }

    setTimeout(() => {
      setIsScanning(false);
      setScanMessage('');
    }, 2000);
  };

  // Direct file opening ("Open With File Manager")
  const handleDirectFileOpen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0] && onPlayDirectFile) {
      onPlayDirectFile(files[0]);
    }
  };

  // Drag & Drop external file handling
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0] && onPlayDirectFile) {
      onPlayDirectFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="min-h-screen bg-white text-slate-900 font-sans relative pb-24"
    >
      {/* Hidden File Scanner Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,.mp4,.mkv,.avi,.mov"
        multiple
        {...({ webkitdirectory: '', directory: '' } as any)}
        onChange={handleFileChange}
        className="hidden"
      />

      <input
        ref={directFileInputRef}
        type="file"
        accept="video/*,.mp4,.mkv,.avi,.mov,.webm,.flv"
        onChange={handleDirectFileOpen}
        className="hidden"
      />

      {/* Top Header Bar */}
      <header className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-10 shadow-xs">
        <div className="flex items-center space-x-3">
          {/* Generated App Icon */}
          <img
            src={appIconImg}
            alt="MX Player Icon"
            className="w-9 h-9 rounded-xl shadow-xs border border-blue-100 object-cover"
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Folders</h1>
            <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
              MX Player Auto Sync
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Open External Video / Open With Player */}
          <button
            onClick={() => directFileInputRef.current?.click()}
            className="p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors flex items-center space-x-1.5 border border-slate-200 text-xs font-semibold"
            title="Open Video File (Open With)"
          >
            <FolderOpen className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Open With</span>
          </button>

          {/* Sync / Scanner Button */}
          <button
            onClick={handleRequestPermissionAndSync}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center space-x-1 border border-blue-100"
            title="Auto Sync Local Videos"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          </button>

          {/* Search Button */}
          <button
            onClick={() => setIsSearching(!isSearching)}
            className="p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors"
            title="Search"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* View Mode Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors"
            title="Toggle View"
          >
            {viewMode === 'list' ? (
              <LayoutGrid className="w-5 h-5 stroke-[1.8]" />
            ) : (
              <List className="w-5 h-5 stroke-[1.8]" />
            )}
          </button>
        </div>
      </header>

      {/* Permission Banner */}
      {!hasPermission && (
        <div className="mx-4 mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-start space-x-3.5 shadow-xs">
          <img
            src={appIconImg}
            alt="App Icon"
            className="w-12 h-12 rounded-2xl shadow-sm object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-blue-950">
              Photos and Videos Storage Access
            </h3>
            <p className="text-xs text-blue-900 mt-1 leading-relaxed">
              অনুমতি দিন যাতে ফোনের সব ভিডিও অটোমেটিক অ্যাপে সিঙ্ক হয়ে যায়। কোনো ফোল্ডার ম্যানুয়ালি খোজা লাগবে না!
            </p>
            <button
              onClick={handleRequestPermissionAndSync}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Allow Access & Auto Sync</span>
            </button>
          </div>
        </div>
      )}

      {/* Granted Permission Status Badge */}
      {hasPermission && (
        <div className="mx-4 mt-3 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs font-medium text-slate-600">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Storage Access Granted • Non-empty folders synced ({foldersList.length})</span>
          </div>
          <button
            onClick={handleRequestPermissionAndSync}
            className="text-blue-600 font-bold hover:underline"
          >
            Sync Now
          </button>
        </div>
      )}

      {/* Scanning status message */}
      {scanMessage && (
        <div className="mx-4 mt-2 px-3 py-2 bg-blue-100 border border-blue-200 text-blue-900 rounded-xl text-xs font-medium text-center animate-pulse">
          {scanMessage}
        </div>
      )}

      {/* Search Bar */}
      {isSearching && (
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 mt-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search video folders..."
            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
      )}

      {/* Folders List */}
      <div className="px-4 py-2">
        {filteredFolders.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Video Folders Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Empty folders and junk system directories are automatically hidden.
            </p>
            <button
              onClick={handleRequestPermissionAndSync}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700"
            >
              Sync Storage Now
            </button>
          </div>
        ) : viewMode === 'list' ? (
          <div className="divide-y divide-transparent space-y-1">
            {filteredFolders.map((folder) => (
              <div
                key={folder.name}
                onClick={() => onSelectFolder(folder.name)}
                className="flex items-center space-x-4 py-3 px-2 rounded-2xl hover:bg-slate-50 cursor-pointer active:bg-slate-100 transition-colors group"
              >
                {/* Folder Icon with Badge */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-12 bg-[#e2e8f0] rounded-xl flex items-center justify-center relative shadow-xs">
                    <div className="absolute -top-1 left-2 w-6 h-2 bg-[#cbd5e1] rounded-t-sm" />
                  </div>

                  {folder.newCount > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 bg-[#ef4444] text-white text-[11px] font-bold min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1 border-2 border-white shadow-xs">
                      {folder.newCount}
                    </div>
                  )}
                </div>

                {/* Folder Name & Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-[16px] font-semibold text-slate-900 truncate tracking-tight">
                    {folder.name}
                  </h2>
                  <p className="text-[12px] text-slate-500 font-normal mt-0.5">
                    {folder.videoCount} videos
                  </p>
                </div>

                {/* Folder Context Menu (3 dots) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFolderMenu(folder);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Folder Options"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            {filteredFolders.map((folder) => (
              <div
                key={folder.name}
                onClick={() => onSelectFolder(folder.name)}
                className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl cursor-pointer transition-colors flex flex-col items-center text-center relative group"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFolderMenu(folder);
                  }}
                  className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-700 rounded-md"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                <div className="relative my-2">
                  <div className="w-20 h-16 bg-[#cbd5e1] rounded-xl flex items-center justify-center shadow-xs">
                    <div className="w-8 h-2 bg-[#94a3b8] absolute -top-1.5 left-3 rounded-t-sm" />
                  </div>
                  {folder.newCount > 0 && (
                    <div className="absolute -top-2 -right-2 bg-[#ef4444] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                      {folder.newCount}
                    </div>
                  )}
                </div>
                <h2 className="text-sm font-semibold text-slate-800 line-clamp-1 mt-1">
                  {folder.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{folder.videoCount} videos</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Folder Context Menu Modal */}
      {selectedFolderMenu && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-4"
          onClick={() => setSelectedFolderMenu(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-2xl p-4 space-y-2 text-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-slate-900 truncate">
                  {selectedFolderMenu.name}
                </h3>
                <p className="text-xs text-slate-500">{selectedFolderMenu.videoCount} video files</p>
              </div>
            </div>

            {/* Open Folder */}
            <button
              onClick={() => {
                onSelectFolder(selectedFolderMenu.name);
                setSelectedFolderMenu(null);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-left font-medium text-sm text-slate-700"
            >
              <FolderOpen className="w-4 h-4 text-blue-600" />
              <span>Open Folder</span>
            </button>

            {/* Rename Folder */}
            {onRenameFolder && (
              <button
                onClick={() => {
                  setEditingFolder(selectedFolderMenu);
                  setNewFolderNameInput(selectedFolderMenu.name);
                  setSelectedFolderMenu(null);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-left font-medium text-sm text-slate-700"
              >
                <Edit2 className="w-4 h-4 text-slate-600" />
                <span>Rename Folder</span>
              </button>
            )}

            {/* Folder Properties */}
            <button
              onClick={() => {
                setViewingFolderInfo(selectedFolderMenu);
                setSelectedFolderMenu(null);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-left font-medium text-sm text-slate-700"
            >
              <Info className="w-4 h-4 text-slate-600" />
              <span>Folder Properties</span>
            </button>

            {/* Delete Folder */}
            {onDeleteFolder && (
              <button
                onClick={() => {
                  if (confirm(`Delete folder "${selectedFolderMenu.name}" and all ${selectedFolderMenu.videoCount} videos in it?`)) {
                    onDeleteFolder(selectedFolderMenu.name);
                  }
                  setSelectedFolderMenu(null);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-red-50 rounded-xl text-left font-medium text-sm text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Folder</span>
              </button>
            )}

            <button
              onClick={() => setSelectedFolderMenu(null)}
              className="w-full text-center text-xs text-slate-400 py-2 border-t border-slate-100 mt-2 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rename Folder Modal */}
      {editingFolder && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setEditingFolder(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 text-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-base text-slate-900">Rename Folder</h3>
            <input
              type="text"
              value={newFolderNameInput}
              onChange={(e) => setNewFolderNameInput(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex justify-end space-x-2 pt-1">
              <button
                onClick={() => setEditingFolder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onRenameFolder && editingFolder) {
                    onRenameFolder(editingFolder.name, newFolderNameInput);
                  }
                  setEditingFolder(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folder Info / Properties Modal */}
      {viewingFolderInfo && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setViewingFolderInfo(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 text-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">{viewingFolderInfo.name}</h3>
                <p className="text-xs text-slate-500">Folder Details</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Folder Path:</span>
                <span className="font-mono text-slate-800">/storage/emulated/0/{viewingFolderInfo.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Video Files:</span>
                <span className="font-semibold text-slate-800">{viewingFolderInfo.videoCount}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Sync Status:</span>
                <span className="text-emerald-600 font-bold">Active (Non-empty)</span>
              </div>
            </div>

            <button
              onClick={() => setViewingFolderInfo(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={onPlayDefaultVideo}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#3b82f6] hover:bg-blue-600 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg transition-transform z-20"
        title="Play Last Video"
      >
        <Play className="w-7 h-7 fill-white ml-0.5" />
      </button>
    </div>
  );
};
