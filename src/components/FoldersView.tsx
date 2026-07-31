import React, { useState, useRef } from 'react';
import { Search, FolderKanban, LayoutGrid, List, Play, RefreshCw, ShieldCheck, Film, CheckCircle2 } from 'lucide-react';
import { VideoItem } from '../types';

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
}

export const FoldersView: React.FC<FoldersViewProps> = ({
  videos,
  onSelectFolder,
  onPlayDefaultVideo,
  onImportLocalVideos,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [hasPermission, setHasPermission] = useState<boolean>(() => {
    return localStorage.getItem('mx_media_permission_granted') === 'true';
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive folders dynamically from videos list
  const uniqueFolderNames: string[] = Array.from(new Set(videos.map((v) => v.folderName || 'Device Storage')));

  // Pre-defined phone video folders auto-synced on permission grant
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

  // List of unwanted/system/junk folder patterns to exclude
  const unwantedFolders = ['android', '.thumbnails', 'system volume information', '$recycle.bin', 'tmp', 'temp', 'cache'];

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
      // Must not be hidden or in unwanted system folders
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
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [hasPermission]);

  // Trigger permission & folder/file scanner
  const handleRequestPermissionAndSync = () => {
    localStorage.setItem('mx_media_permission_granted', 'true');
    setHasPermission(true);

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Process selected local video files
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
      
      // Determine folder name from webkitRelativePath or default
      let folder = 'Phone Storage';
      if (file.webkitRelativePath) {
        const parts = file.webkitRelativePath.split('/');
        if (parts.length > 1) {
          folder = parts[parts.length - 2];
        }
      }

      // Format file size
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      const formattedSize = parseFloat(sizeInMB) > 1024 
        ? `${(parseFloat(sizeInMB) / 1024).toFixed(1)} GB` 
        : `${sizeInMB} MB`;

      // Date string
      const dateObj = new Date(file.lastModified || Date.now());
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      newImportedVideos.push({
        id: `local-${Date.now()}-${i}`,
        title: file.name,
        url: fileUrl,
        poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
        duration: 300, // Default estimate until loaded in player
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

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans relative pb-24">
      {/* Hidden File Scanner Input - supports bulk directory scanning */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,.mp4,.mkv,.avi,.mov"
        multiple
        {...({ webkitdirectory: "", directory: "" } as any)}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Header Bar */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Folders</h1>

        <div className="flex items-center space-x-3">
          {/* Sync / Scanner Button */}
          <button
            onClick={handleRequestPermissionAndSync}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-1"
            title="Auto Sync Local Videos"
          >
            <RefreshCw className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
          </button>

          {/* Folder All icon */}
          <button
            className="p-1.5 text-slate-700 hover:text-blue-600 transition-colors"
            title="All Folders"
          >
            <FolderKanban className="w-6 h-6 stroke-[1.8]" />
          </button>

          {/* Search Button */}
          <button
            onClick={() => setIsSearching(!isSearching)}
            className="p-1.5 text-slate-700 hover:text-blue-600 transition-colors"
            title="Search"
          >
            <Search className="w-6 h-6 stroke-[1.8]" />
          </button>

          {/* View Mode Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="p-1.5 text-slate-700 hover:text-blue-600 transition-colors"
            title="Toggle View"
          >
            {viewMode === 'list' ? (
              <LayoutGrid className="w-6 h-6 stroke-[1.8]" />
            ) : (
              <List className="w-6 h-6 stroke-[1.8]" />
            )}
          </button>
        </div>
      </header>

      {/* Photos & Videos Permission Banner */}
      {!hasPermission && (
        <div className="mx-4 mt-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start space-x-3 shadow-xs">
          <div className="p-2 bg-blue-600 text-white rounded-xl flex-shrink-0 mt-0.5">
            <Film className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-blue-950">
              Photos and Videos Permission
            </h3>
            <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
              অনুমতি দিন যাতে ফোনের সব ভিডিও অটোমেটিক অ্যাপে সিঙ্ক হয়ে যায়।
            </p>
            <button
              onClick={handleRequestPermissionAndSync}
              className="mt-2.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Allow Access & Auto Sync</span>
            </button>
          </div>
        </div>
      )}

      {/* Granted Permission Status Badge */}
      {hasPermission && (
        <div className="mx-4 mt-3 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-medium text-slate-600">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Photos & Videos Access Granted (Auto Sync Active)</span>
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

      {/* Search Input Bar (Expandable) */}
      {isSearching && (
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 mt-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search folders..."
            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
      )}

      {/* Folders List */}
      <div className="px-4 py-2">
        {viewMode === 'list' ? (
          <div className="divide-y divide-transparent space-y-1">
            {filteredFolders.map((folder) => (
              <div
                key={folder.name}
                onClick={() => onSelectFolder(folder.name)}
                className="flex items-center space-x-4 py-3 px-2 rounded-xl hover:bg-slate-50 cursor-pointer active:bg-slate-100 transition-colors"
              >
                {/* Folder Icon with Badge */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-12 bg-[#e2e8f0] rounded-xl flex items-center justify-center relative shadow-xs">
                    {/* Folder Tab SVG Shape */}
                    <div className="absolute -top-1 left-2 w-6 h-2 bg-[#cbd5e1] rounded-t-sm" />
                  </div>

                  {/* Red Notification Badge */}
                  {folder.newCount > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 bg-[#ef4444] text-white text-[11px] font-bold min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1 border-2 border-white shadow-xs">
                      {folder.newCount}
                    </div>
                  )}
                </div>

                {/* Folder Name & Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-[17px] font-semibold text-slate-900 truncate tracking-tight">
                    {folder.name}
                  </h2>
                  <p className="text-[13px] text-slate-500 font-normal mt-0.5">
                    {folder.videoCount} videos
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            {filteredFolders.map((folder) => (
              <div
                key={folder.name}
                onClick={() => onSelectFolder(folder.name)}
                className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl cursor-pointer transition-colors flex flex-col items-center text-center relative"
              >
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
