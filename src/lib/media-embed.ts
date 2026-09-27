export type MediaType = 'YOUTUBE' | 'GDRIVE_FOLDER' | 'GDRIVE_FILE' | 'OTHER';

export interface MediaEmbedInfo {
  type: MediaType;
  originalUrl: string;
  embedUrl: string;
  id?: string;
  isValid: boolean;
  label: string;
}

export function parseMediaEmbedUrl(url?: string | null): MediaEmbedInfo | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // 1. YouTube Detection
  // Matches: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID
  const ytRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i;
  const ytMatch = trimmed.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'YOUTUBE',
      originalUrl: trimmed,
      embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`,
      id: videoId,
      isValid: true,
      label: 'YouTube Video',
    };
  }

  // 2. Google Drive Folder Detection
  // Matches: drive.google.com/drive/folders/ID or drive.google.com/drive/u/0/folders/ID
  const gdriveFolderRegex = /drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/i;
  const gdriveFolderMatch = trimmed.match(gdriveFolderRegex);
  if (gdriveFolderMatch && gdriveFolderMatch[1]) {
    const folderId = gdriveFolderMatch[1];
    return {
      type: 'GDRIVE_FOLDER',
      originalUrl: trimmed,
      embedUrl: `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`,
      id: folderId,
      isValid: true,
      label: 'Folder Google Drive',
    };
  }

  // 3. Google Drive File / Photo / Video Detection
  // Matches: drive.google.com/file/d/ID/view or drive.google.com/open?id=ID
  const gdriveFileRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i;
  const gdriveFileMatch = trimmed.match(gdriveFileRegex);
  if (gdriveFileMatch && gdriveFileMatch[1]) {
    const fileId = gdriveFileMatch[1];
    return {
      type: 'GDRIVE_FILE',
      originalUrl: trimmed,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      id: fileId,
      isValid: true,
      label: 'File Google Drive',
    };
  }

  const gdriveOpenRegex = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i;
  const gdriveOpenMatch = trimmed.match(gdriveOpenRegex);
  if (gdriveOpenMatch && gdriveOpenMatch[1]) {
    const id = gdriveOpenMatch[1];
    return {
      type: 'GDRIVE_FILE',
      originalUrl: trimmed,
      embedUrl: `https://drive.google.com/file/d/${id}/preview`,
      id,
      isValid: true,
      label: 'Google Drive',
    };
  }

  // 4. Fallback / Other valid URL
  try {
    const parsed = new URL(trimmed);
    return {
      type: 'OTHER',
      originalUrl: trimmed,
      embedUrl: parsed.href,
      isValid: true,
      label: 'Tautan Media',
    };
  } catch {
    return {
      type: 'OTHER',
      originalUrl: trimmed,
      embedUrl: trimmed,
      isValid: false,
      label: 'URL Tidak Valid',
    };
  }
}
