import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { adminClient } from "../lib/client";

export function SettingsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editedColor, setEditedColor] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const { data: wallpaper, isLoading } = useQuery({
    queryKey: ["defaultWallpaper"],
    queryFn: () => adminClient.getDefaultWallpaper(),
  });

  const invalidateWallpapers = () => {
    queryClient.invalidateQueries({ queryKey: ["defaultWallpaper"] });
    queryClient.invalidateQueries({ queryKey: ["wallpaper"] });
  };

  const uploadMutation = useMutation({
    mutationFn: (imageData: Uint8Array) =>
      adminClient.setDefaultWallpaper(imageData),
    onSuccess: invalidateWallpapers,
  });

  const removeMutation = useMutation({
    mutationFn: () => adminClient.setDefaultWallpaper(),
    onSuccess: invalidateWallpapers,
  });

  const textColorMutation = useMutation({
    mutationFn: (color: string) =>
      adminClient.setDefaultWallpaperTextColor(color),
    onSuccess: () => {
      setEditedColor(null);
      invalidateWallpapers();
    },
  });

  const textColor = editedColor ?? wallpaper?.color ?? "#ffffff";

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    uploadMutation.mutate(new Uint8Array(arrayBuffer));
    e.target.value = "";
  };

  return (
    <div className="h-full flex">
      <aside className="w-80 bg-surface-800 border-r border-surface-600 flex flex-col overflow-hidden">
        <h2 className="text-2xl font-semibold text-white px-6 pt-6 pb-4 shrink-0">
          System
        </h2>
        <div className="px-6 pb-6 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
            Default wallpaper
          </h3>
          <p className="text-sm text-gray-400 mt-2">
            Stations show this image whenever the contest has no wallpaper of
            its own.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="w-full mt-4 px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-surface-600 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {uploadMutation.isPending
              ? "Uploading..."
              : wallpaper
                ? "Replace image"
                : "Upload image"}
          </button>
          {uploadMutation.isError && (
            <p className="text-danger-500 text-sm mt-2">
              Failed to upload image
            </p>
          )}

          {wallpaper && (
            <>
              <button
                onClick={() => removeMutation.mutate()}
                disabled={removeMutation.isPending}
                className="w-full mt-2 px-4 py-3 bg-surface-700 hover:bg-surface-600 disabled:text-gray-500 text-danger-500 rounded-lg text-sm font-medium transition-colors"
              >
                {removeMutation.isPending ? "Removing..." : "Remove image"}
              </button>
              {removeMutation.isError && (
                <p className="text-danger-500 text-sm mt-2">
                  Failed to remove image
                </p>
              )}

              <div className="mt-4 p-4 rounded-lg bg-surface-700 border border-surface-600">
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                  Text color
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setEditedColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setEditedColor(e.target.value)}
                    className="flex-1 bg-surface-600 border border-surface-500 rounded px-3 py-2 text-gray-200 text-sm font-mono"
                    placeholder="#ffffff"
                  />
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => textColorMutation.mutate(textColor)}
                    disabled={
                      textColorMutation.isPending ||
                      textColor === wallpaper.color
                    }
                    className="flex-1 px-3 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-surface-600 disabled:text-gray-500 text-white rounded text-sm transition-colors"
                  >
                    {textColorMutation.isPending ? "Saving..." : "Save color"}
                  </button>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`px-3 py-2 rounded text-sm transition-colors ${
                      showPreview
                        ? "bg-primary-500 text-white"
                        : "bg-surface-600 text-gray-300 hover:bg-surface-500"
                    }`}
                  >
                    Preview
                  </button>
                </div>
                {textColorMutation.isError && (
                  <p className="text-danger-500 text-sm mt-2">
                    Failed to save color
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </aside>
      <div className="flex-1 bg-surface-700 flex items-center justify-center relative overflow-hidden">
        {isLoading ? (
          <p className="text-gray-400 text-lg">Loading wallpaper...</p>
        ) : wallpaper ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative inline-flex items-center justify-center max-w-full max-h-full">
              <img
                src={wallpaper.url}
                alt="Default wallpaper"
                className="max-w-full max-h-full w-auto h-auto object-contain block"
              />
              {showPreview && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span
                    className="text-4xl font-bold drop-shadow-lg text-center px-4"
                    style={{ color: textColor }}
                  >
                    Team Name
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-surface-600 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No default wallpaper</p>
            <p className="text-gray-600 text-sm mt-1">
              Upload an image to show it on stations between contests
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
