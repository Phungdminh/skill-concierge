const DRIVE_FILE_ID_PATTERN = /^[a-zA-Z0-9_-]{20,}$/;

export function googleApiKey() {
  return process.env.GOOGLE_API_KEY?.trim() || null;
}

export function extractGoogleDriveFileId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  if (DRIVE_FILE_ID_PATTERN.test(value) && !value.startsWith('http')) return value;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (!url.hostname.endsWith('drive.google.com') && !url.hostname.endsWith('googleusercontent.com')) {
    return null;
  }

  const idParam = url.searchParams.get('id');
  if (idParam && DRIVE_FILE_ID_PATTERN.test(idParam)) return idParam;

  const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
  if (fileMatch?.[1] && DRIVE_FILE_ID_PATTERN.test(fileMatch[1])) return fileMatch[1];

  const ucMatch = url.pathname.match(/\/uc\/([^/]+)/);
  if (ucMatch?.[1] && DRIVE_FILE_ID_PATTERN.test(ucMatch[1])) return ucMatch[1];

  return null;
}

export function normalizeGoogleDriveImageUrl(input: string): string {
  const fileId = extractGoogleDriveFileId(input);
  if (!fileId) return input;
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}
