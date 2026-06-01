import { googleApiKey } from '@/lib/google-drive-images';

const SHEET_ID_PATTERN = /^[a-zA-Z0-9_-]{20,}$/;
const DEFAULT_RANGE = 'A:Z';
const SHEETS_FETCH_TIMEOUT_MS = 10_000;

type GoogleSheetsValuesResponse = {
  values?: unknown[][];
  error?: { message?: string; status?: string };
};

export class GoogleSheetsError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function extractSpreadsheetId(input: string) {
  const value = input.trim();
  if (!value) return null;
  if (SHEET_ID_PATTERN.test(value) && !value.startsWith('http')) return value;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (!url.hostname.endsWith('docs.google.com')) return null;

  const match = url.pathname.match(/\/spreadsheets\/d\/([^/]+)/);
  return match?.[1] && SHEET_ID_PATTERN.test(match[1]) ? match[1] : null;
}

function normalizeRange(range: string | null | undefined) {
  const value = range?.trim();
  return value || DEFAULT_RANGE;
}

function rowsFromValues(values: unknown[][] | undefined) {
  if (!values || values.length < 2) return [];
  const headers = values[0].map((header) => String(header ?? '').trim());
  return values.slice(1)
    .filter((row) => row.some((cell) => String(cell ?? '').trim()))
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, String(row[index] ?? '').trim()])));
}

export async function fetchGoogleSheetRows(input: string, range?: string) {
  const spreadsheetId = extractSpreadsheetId(input);
  if (!spreadsheetId) {
    throw new GoogleSheetsError('invalid_sheet', 'Google Sheet URL/ID không hợp lệ.', 422);
  }

  const key = googleApiKey();
  if (!key) {
    throw new GoogleSheetsError('missing_api_key', 'Thiếu GOOGLE_API_KEY trong env.', 500);
  }

  const safeRange = normalizeRange(range);
  const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(safeRange)}`);
  url.searchParams.set('majorDimension', 'ROWS');
  url.searchParams.set('valueRenderOption', 'FORMATTED_VALUE');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SHEETS_FETCH_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { 'x-goog-api-key': key },
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new GoogleSheetsError('google_sheets_timeout', 'Google Sheet phản hồi quá lâu. Hãy thử lại hoặc kiểm tra quyền truy cập Sheet.', 504);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
  const body = await res.json().catch(() => ({})) as GoogleSheetsValuesResponse;

  if (!res.ok) {
    const message = body.error?.status === 'PERMISSION_DENIED'
      ? 'Không đọc được Sheet. Hãy share Google Sheet ở chế độ Anyone with the link can view hoặc kiểm tra API key.'
      : body.error?.message ?? 'Không đọc được Google Sheet.';
    throw new GoogleSheetsError(body.error?.status ?? 'google_sheets_error', message, res.status);
  }

  return rowsFromValues(body.values);
}
