'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clipboard, FileSpreadsheet, Loader2, Upload, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ImportRow = Record<string, string>;
type ProductKind = 'tool' | 'prompt' | 'webwork';
type ImportStatus =
  | 'ready'
  | 'invalid'
  | 'exists_skip'
  | 'exists_update'
  | 'created'
  | 'updated'
  | 'skipped'
  | 'failed';
type ConflictMode = 'skip' | 'update';
type Source = 'csv' | 'prompt-sheet' | 'all-sheet';
type ImportAction = 'preview' | 'import';
type BusyState = { source: Source; action: ImportAction } | null;

type ImportResult = {
  rowNumber: number;
  ok: boolean;
  status: ImportStatus;
  message?: string;
  product?: { id: string; kind: ProductKind; slug: string; title: string };
  preview?: { kind: ProductKind; slug: string; title: string };
  error?: { code: string; message: string };
};

type ImportSummary = {
  total: number;
  ready: number;
  invalid: number;
  conflicts: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
};

type ImportResponse = { summary?: ImportSummary; results?: ImportResult[] };

const FULL_HEADER =
  'kind\ttitle\tslug\ttagline\tdescription\tcategories\ttags\tyoutube_url\tthumbnail_url\tgallery\tpricing_mode\tprice_vnd\tstatus\tfeatured\trepo_url\tprompt_preview\tprompt_full\tprompt_explanation\tdeliverables\tsupport_options\tprerequisites\tduration_label\tversions';

const TEMPLATES = {
  prompt: `kind\ttitle\tslug\ttagline\tdescription\tcategories\ttags\tthumbnail_url\tprompt_preview\tprompt_full\tprompt_explanation\tstatus\nprompt\tPrompt viết meta description SEO\tprompt-meta-seo\tTạo meta description nhanh\tPrompt giúp viết meta description theo keyword\tseo-blog|content-creator\tSEO|Content\thttps://drive.google.com/file/d/1PromptCoverFileIdAbCdEfGhIjKlMn/view?usp=sharing\tViết 3 meta description cho [keyword]...\tBạn là SEO copywriter...\t### Cách dùng\\n- Thay keyword\\n- Chọn tone\tpublished`,
  tool: `kind\ttitle\tslug\ttagline\tdescription\tcategories\ttags\tyoutube_url\tthumbnail_url\tgallery\tpricing_mode\tprice_vnd\tstatus\tfeatured\tdeliverables\tsupport_options\tprerequisites\tduration_label\tversions\ntool\tSheet Cleaner\tsheet-cleaner\tChuẩn hoá dữ liệu sheet nhanh\tTool dọn dòng trống và chuẩn hoá dữ liệu\tautomation|productivity\tGoogle Sheets|Excel\thttps://youtu.be/xxxxxxxxxxx\t\thttps://example.com/shot-1.png|https://example.com/shot-2.png\tfixed\t490000\tdraft\ttrue\tFile .exe|Hướng dẫn PDF\tdrive_folder|zalo_group\tWindows 10+|Chrome\tGiao ngay sau thanh toán\tSheetCleaner::sheet-cleaner::Windows 10+::available`,
  webwork: `kind\ttitle\tslug\ttagline\tdescription\tyoutube_url\trepo_url\tthumbnail_url\tstatus\nwebwork\tLanding page coach 1-1\tlanding-coach\tLanding page cá nhân gọn đẹp\tShowcase web/portfolio đã làm\t\thttps://demo.example.com\t\tdraft`,
  all: `${FULL_HEADER}\ntool\tSheet Cleaner\tsheet-cleaner\tChuẩn hoá dữ liệu sheet nhanh\tTool dọn dòng trống và chuẩn hoá dữ liệu\tautomation|productivity\tGoogle Sheets|Excel\thttps://youtu.be/xxxxxxxxxxx\t\thttps://example.com/shot-1.png|https://example.com/shot-2.png\tfixed\t490000\tdraft\ttrue\t\t\t\t\tFile .exe|Hướng dẫn PDF\tdrive_folder|zalo_group\tWindows 10+|Chrome\tGiao ngay sau thanh toán\tSheetCleaner::sheet-cleaner::Windows 10+::available\nprompt\tPrompt viết meta description SEO\tprompt-meta-seo\tTạo meta description nhanh\tPrompt giúp viết meta description theo keyword\tseo-blog|content-creator\tSEO|Content\t\thttps://drive.google.com/file/d/1PromptCoverFileIdAbCdEfGhIjKlMn/view?usp=sharing\t\tfixed\t\tpublished\tfalse\t\tViết 3 meta description cho [keyword]...\tBạn là SEO copywriter...\t### Cách dùng\\n- Thay keyword\t\t\t\t\t\nwebwork\tLanding page coach 1-1\tlanding-coach\tLanding page cá nhân gọn đẹp\tShowcase web/portfolio đã làm\t\t\t\t\tquote\t\tdraft\tfalse\thttps://demo.example.com\t\t\t\t\t\t\t\t`,
};

const KIND_LABEL: Record<string, string> = { tool: 'Tool', prompt: 'Prompt', webwork: 'Web / Portfolio' };
const STATUS_LABEL: Record<ImportStatus, string> = {
  ready: 'Sẵn sàng tạo',
  invalid: 'Lỗi dữ liệu',
  exists_skip: 'Sẽ bỏ qua',
  exists_update: 'Sẽ cập nhật',
  created: 'Đã tạo',
  updated: 'Đã cập nhật',
  skipped: 'Đã bỏ qua',
  failed: 'Thất bại',
};

const SECONDARY_BTN_CLASS =
  'inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-white/14 bg-white/[0.04] px-3 py-2 text-xs font-medium text-foreground/85 transition hover:border-white/24 hover:bg-white/[0.08] hover:text-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange/45 disabled:cursor-not-allowed disabled:opacity-60';

const SHEET_INPUT_BASE =
  'mt-1.5 w-full rounded-xl border border-white/14 bg-[#141418] px-3.5 py-3 text-sm text-foreground shadow-inner shadow-white/[0.03] transition placeholder:text-foreground/38 hover:border-white/22 hover:bg-[#18181d] focus:outline-none focus:ring-2';

function stripBom(input: string) {
  return input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
}

function parseDelimited(input: string): string[][] {
  const delimiter = input.includes('\t') ? '\t' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];
    if (char === '"') {
      if (quoted && next === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (!quoted && char === delimiter) {
      row.push(cell.trim());
      cell = '';
      continue;
    }
    if (!quoted && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
      continue;
    }
    cell += char;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function rowsFromText(input: string): ImportRow[] {
  const parsed = parseDelimited(stripBom(input).trim());
  if (parsed.length < 2) return [];
  const headers = parsed[0].map((header) => stripBom(header).trim());
  return parsed.slice(1).map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])),
  );
}

function previewStatus(row: ImportRow) {
  const kind = (row.kind || row.loai || row.type || '').trim().toLowerCase();
  const title = (row.title || row.ten || row.tieu_de || row.name || '').trim();
  if (!kind || !['tool', 'prompt', 'webwork', 'web', 'portfolio'].includes(kind)) return 'Thiếu kind hợp lệ';
  if (!title) return 'Thiếu title';
  return 'Sẵn sàng';
}

function statusClass(status: ImportStatus) {
  if (['ready', 'created', 'updated'].includes(status)) return 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30';
  if (['exists_skip', 'exists_update', 'skipped'].includes(status)) return 'bg-sky-500/10 text-sky-300 ring-sky-500/30';
  return 'bg-red-500/10 text-red-300 ring-red-500/30';
}

export function ProductImportForm() {
  const [raw, setRaw] = useState(TEMPLATES.all.replaceAll('\t', ','));
  const [sheet, setSheet] = useState('');
  const [range, setRange] = useState('A:Z');
  const [allProductsSheet, setAllProductsSheet] = useState('');
  const [allProductsRange, setAllProductsRange] = useState('A:Z');
  const [conflictMode, setConflictMode] = useState<ConflictMode>('skip');
  const [busy, setBusy] = useState<BusyState>(null);
  const [copied, setCopied] = useState<keyof typeof TEMPLATES | null>(null);
  const [lastSource, setLastSource] = useState<Source | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const rows = useMemo(() => rowsFromText(raw), [raw]);
  const readyRows = rows.filter((row) => previewStatus(row) === 'Sẵn sàng').length;
  const importableRows = results.filter((result) =>
    ['ready', 'exists_update', 'exists_skip'].includes(result.status),
  ).length;

  function resetPreview() {
    setResults([]);
    setSummary(null);
    setError(null);
    setLastSource(null);
  }

  async function uploadCsv(file: File | undefined) {
    if (!file) return;
    setRaw(await file.text());
    resetPreview();
  }

  async function copyTemplate(key: keyof typeof TEMPLATES) {
    try {
      await navigator.clipboard.writeText(TEMPLATES[key]);
      setCopied(key);
      setTimeout(() => setCopied((current) => (current === key ? null : current)), 1200);
    } catch {
      setError('Không copy được template. Hãy thử browser khác hoặc cấp quyền clipboard.');
    }
  }

  async function requestImport(source: Source, action: ImportAction) {
    const endpoint = source === 'csv' ? '/api/admin/products/import' : '/api/admin/products/import/google-sheet';
    const body =
      source === 'csv'
        ? { rows, action, conflictMode }
        : source === 'prompt-sheet'
          ? { sheet, range, mode: 'prompt', action, conflictMode }
          : { sheet: allProductsSheet, range: allProductsRange, mode: 'all', action, conflictMode };
    setBusy({ source, action });
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as ImportResponse & { error?: { message?: string } };
      if (!res.ok) throw new Error(data?.error?.message ?? 'Import không thành công.');
      setResults(data.results ?? []);
      setSummary(data.summary ?? null);
      setLastSource(source);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import không thành công.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-[#0d0d10] p-4 md:p-5">
        <h2 className="text-sm font-semibold text-foreground">Cách xử lý slug trùng</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {(['skip', 'update'] as const).map((mode) => (
            <label
              key={mode}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm transition',
                conflictMode === mode
                  ? 'border-brand-orange/60 bg-brand-orange/12'
                  : 'border-white/12 bg-white/[0.035] hover:border-white/20',
              )}
            >
              <input
                type="radio"
                checked={conflictMode === mode}
                onChange={() => {
                  setConflictMode(mode);
                  resetPreview();
                }}
                className="h-4 w-4 accent-brand-orange"
              />
              {mode === 'skip' ? 'Bỏ qua slug đã tồn tại' : 'Cập nhật sản phẩm có slug trùng'}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-400/18 bg-[#0f1712] p-4 md:p-5">
        <CardHeader title="Import prompt từ Google Sheet" tone="emerald" />
        <SheetInputs
          sheet={sheet}
          setSheet={(v) => {
            setSheet(v);
            resetPreview();
          }}
          range={range}
          setRange={setRange}
          tone="emerald"
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
          <CopyButton
            label="Copy template prompt"
            doneLabel="Đã copy template prompt"
            active={copied === 'prompt'}
            onClick={() => copyTemplate('prompt')}
          />
          <ActionButtons
            canPreview={Boolean(sheet.trim())}
            canImport={lastSource === 'prompt-sheet' && importableRows > 0}
            source="prompt-sheet"
            busy={busy}
            onPreview={requestImport}
            onImport={requestImport}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-sky-400/18 bg-[#0e141b] p-4 md:p-5">
        <CardHeader title="Import tool / prompt / web từ Google Sheet" tone="sky" />
        <SheetInputs
          sheet={allProductsSheet}
          setSheet={(v) => {
            setAllProductsSheet(v);
            resetPreview();
          }}
          range={allProductsRange}
          setRange={setAllProductsRange}
          tone="sky"
        />
        <p className="mt-3 rounded-xl border border-sky-400/18 bg-sky-400/[0.06] px-3 py-2 text-xs leading-relaxed text-foreground/70">
          Sheet phải có cột <span className="font-mono text-foreground">kind</span>: tool, prompt hoặc webwork.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
          <div className="flex flex-wrap gap-2">
            <CopyButton label="Copy tool" doneLabel="Đã copy tool" active={copied === 'tool'} onClick={() => copyTemplate('tool')} />
            <CopyButton label="Copy web" doneLabel="Đã copy web" active={copied === 'webwork'} onClick={() => copyTemplate('webwork')} />
            <CopyButton label="Copy all-products" doneLabel="Đã copy all" active={copied === 'all'} onClick={() => copyTemplate('all')} />
          </div>
          <ActionButtons
            canPreview={Boolean(allProductsSheet.trim())}
            canImport={lastSource === 'all-sheet' && importableRows > 0}
            source="all-sheet"
            busy={busy}
            onPreview={requestImport}
            onImport={requestImport}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-brand-orange/18 bg-[#15110d] p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Dán sheet hoặc CSV</h2>
            <p className="mt-1 text-xs text-foreground/60">
              Copy bảng từ Google Sheets/Excel rồi dán vào đây, hoặc upload CSV.
            </p>
          </div>
          <label className={cn(SECONDARY_BTN_CLASS, 'cursor-pointer')}>
            <Upload className="h-3.5 w-3.5" /> Upload CSV
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => uploadCsv(e.target.files?.[0])}
            />
          </label>
        </div>
        <textarea
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            resetPreview();
          }}
          rows={12}
          spellCheck={false}
          className="mt-4 w-full rounded-xl border border-white/14 bg-[#141418] px-3.5 py-3 font-mono text-xs leading-relaxed text-foreground shadow-inner shadow-white/[0.03] transition placeholder:text-foreground/42 hover:border-white/22 hover:bg-[#18181d] focus:border-brand-orange/55 focus:outline-none focus:ring-2 focus:ring-brand-orange/45"
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
          <div className="text-xs text-foreground/60">
            Đọc được <span className="font-semibold text-foreground">{rows.length}</span> dòng,{' '}
            <span className="font-semibold text-brand-orange">{readyRows}</span> dòng sẵn sàng sơ bộ.
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton
              label="Copy template"
              doneLabel="Đã copy template"
              active={copied === 'all'}
              onClick={() => copyTemplate('all')}
            />
            <ActionButtons
              canPreview={rows.length > 0}
              canImport={lastSource === 'csv' && importableRows > 0}
              source="csv"
              busy={busy}
              onPreview={requestImport}
              onImport={requestImport}
            />
          </div>
        </div>
      </section>

      {rows.length > 0 && <LocalPreview rows={rows} />}
      {error && (
        <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/30">{error}</p>
      )}
      {results.length > 0 && <ResultsPanel results={results} summary={summary} />}
    </div>
  );
}

function CardHeader({ title, tone }: { title: string; tone: 'emerald' | 'sky' }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-foreground/60">
          Bấm preview trước để kiểm tra dữ liệu, sau đó mới confirm import.
        </p>
      </div>
      <FileSpreadsheet className={cn('h-5 w-5', tone === 'emerald' ? 'text-emerald-300' : 'text-sky-300')} />
    </div>
  );
}

function SheetInputs({
  sheet,
  setSheet,
  range,
  setRange,
  tone,
}: {
  sheet: string;
  setSheet: (v: string) => void;
  range: string;
  setRange: (v: string) => void;
  tone: 'emerald' | 'sky';
}) {
  const focus = tone === 'emerald'
    ? 'focus:border-emerald-400/55 focus:ring-emerald-400/35'
    : 'focus:border-sky-400/55 focus:ring-sky-400/35';
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
      <label className="block text-xs font-medium text-foreground/75">
        Google Sheet URL/ID
        <input
          value={sheet}
          onChange={(e) => setSheet(e.target.value)}
          placeholder="https://docs.google.com/spreadsheets/d/..."
          className={cn(SHEET_INPUT_BASE, focus)}
        />
      </label>
      <label className="block text-xs font-medium text-foreground/75">
        Range
        <input
          value={range}
          onChange={(e) => setRange(e.target.value)}
          placeholder="A:Z"
          className={cn(SHEET_INPUT_BASE, focus)}
        />
      </label>
    </div>
  );
}

function CopyButton({
  label,
  doneLabel,
  active,
  onClick,
}: {
  label: string;
  doneLabel: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={SECONDARY_BTN_CLASS} aria-live="polite">
      <Clipboard className="h-3.5 w-3.5" />
      {active ? doneLabel : label}
    </button>
  );
}

function ActionButtons({
  canPreview,
  canImport,
  source,
  busy,
  onPreview,
  onImport,
}: {
  canPreview: boolean;
  canImport: boolean;
  source: Source;
  busy: BusyState;
  onPreview: (source: Source, action: ImportAction) => void;
  onImport: (source: Source, action: ImportAction) => void;
}) {
  const anyBusy = busy !== null;
  const previewingMe = busy?.source === source && busy?.action === 'preview';
  const importingMe = busy?.source === source && busy?.action === 'import';
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onPreview(source, 'preview')}
        disabled={!canPreview || anyBusy}
        className={cn(
          'inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
          canPreview && !anyBusy
            ? 'bg-white text-black hover:bg-white/90'
            : 'cursor-not-allowed bg-white/5 text-muted-foreground',
        )}
      >
        {previewingMe && <Loader2 className="h-4 w-4 animate-spin" />}
        Preview
      </button>
      <button
        type="button"
        onClick={() => onImport(source, 'import')}
        disabled={!canImport || anyBusy}
        className={cn(
          'inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
          canImport && !anyBusy
            ? 'bg-brand-gradient text-black hover:brightness-110'
            : 'cursor-not-allowed bg-white/5 text-muted-foreground',
        )}
      >
        {importingMe && <Loader2 className="h-4 w-4 animate-spin" />}
        Confirm import
      </button>
    </div>
  );
}

function LocalPreview({ rows }: { rows: ImportRow[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/8 bg-[#0d0d10]">
      <div className="border-b border-white/8 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Preview local
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-normal">Dòng</th>
              <th className="px-4 py-3 font-normal">Loại</th>
              <th className="px-4 py-3 font-normal">Tiêu đề</th>
              <th className="px-4 py-3 font-normal">Slug</th>
              <th className="px-4 py-3 font-normal">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {rows.slice(0, 20).map((row, index) => {
              const status = previewStatus(row);
              const kind = (row.kind || row.loai || row.type || '').trim().toLowerCase();
              return (
                <tr key={index} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-foreground/60">{index + 2}</td>
                  <td className="px-4 py-3">{KIND_LABEL[kind] ?? (kind || '—')}</td>
                  <td className="px-4 py-3 font-medium">
                    {row.title || row.ten || row.tieu_de || row.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-foreground/60">{row.slug || 'Tự tạo'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ring-1',
                        status === 'Sẵn sàng'
                          ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
                      )}
                    >
                      {status === 'Sẵn sàng' ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length > 20 && (
        <p className="border-t border-white/8 px-4 py-3 text-xs text-foreground/50">Chỉ preview 20 dòng đầu.</p>
      )}
    </section>
  );
}

function ResultsPanel({ results, summary }: { results: ImportResult[]; summary: ImportSummary | null }) {
  return (
    <section className="rounded-2xl border border-white/8 bg-[#0d0d10] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">Kết quả server preview/import</h2>
        {summary && (
          <div className="text-xs text-foreground/60">
            Tổng {summary.total} · Ready {summary.ready} · Trùng {summary.conflicts} · Tạo {summary.created} · Update {summary.updated} · Skip {summary.skipped} · Lỗi {summary.invalid + summary.failed}
          </div>
        )}
      </div>
      <div className="mt-3 space-y-2">
        {results.map((result) => (
          <div
            key={`${result.rowNumber}-${result.status}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5 text-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              {result.ok ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              ) : (
                <XCircle className="h-4 w-4 text-red-300" />
              )}
              <span>Dòng {result.rowNumber}</span>
              <span className={cn('rounded-full px-2.5 py-1 text-xs ring-1', statusClass(result.status))}>
                {STATUS_LABEL[result.status]}
              </span>
              <span className="font-medium text-foreground">
                {result.preview?.title ?? result.product?.title ?? result.error?.message}
              </span>
              {result.message && <span className="text-xs text-foreground/55">{result.message}</span>}
            </div>
            {result.product && (
              <Link
                href={`/admin/products/${result.product.id}/edit`}
                className="text-xs text-brand-orange hover:underline"
              >
                Mở sản phẩm
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
