/**
 * ExportButton - Universal export component for PDF/CSV/JSON
 * Addresses: "Exports PDF multi-langues automatises" from audit
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileText, FileJson, Sheet, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ExportFormat = 'pdf' | 'csv' | 'json';

interface ExportButtonProps {
  data: Record<string, unknown> | unknown[];
  filename: string;
  title?: string;
  formats?: ExportFormat[];
  onExport?: (format: ExportFormat) => void;
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

function convertToCSV(data: unknown[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0] as Record<string, unknown>);
  const rows = data.map(item => {
    const record = item as Record<string, unknown>;
    return headers.map(header => {
      const value = record[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value).replace(/"/g, '""');
    }).map(v => `"${v}"`).join(',');
  });
  
  return [headers.join(','), ...rows].join('\n');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ExportButton({
  data,
  filename,
  title,
  formats = ['pdf', 'csv', 'json'],
  onExport,
  className,
  disabled = false,
  variant = 'outline',
  size = 'default',
}: ExportButtonProps) {
  const { t, i18n } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [exportedFormat, setExportedFormat] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setExportedFormat(null);

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const lang = i18n.language;
      const fullFilename = `${filename}_${lang}_${timestamp}`;

      switch (format) {
        case 'json': {
          const jsonContent = JSON.stringify(data, null, 2);
          downloadFile(jsonContent, `${fullFilename}.json`, 'application/json');
          break;
        }
        case 'csv': {
          const arrayData = Array.isArray(data) ? data : [data];
          const csvContent = convertToCSV(arrayData);
          downloadFile(csvContent, `${fullFilename}.csv`, 'text/csv;charset=utf-8');
          break;
        }
        case 'pdf': {
          // For PDF, we use the browser's print functionality or jsPDF
          // This is a simplified version - full implementation would use jsPDF
          const printContent = `
            <html>
              <head>
                <title>${title || filename}</title>
                <style>
                  body { font-family: system-ui, sans-serif; padding: 40px; }
                  h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                  pre { background: #f5f5f5; padding: 20px; border-radius: 8px; overflow-x: auto; }
                  .footer { margin-top: 40px; font-size: 12px; color: #666; }
                </style>
              </head>
              <body>
                <h1>${title || filename}</h1>
                <p>Exporté le ${new Date().toLocaleDateString(lang)} - Langue: ${lang.toUpperCase()}</p>
                <pre>${JSON.stringify(data, null, 2)}</pre>
                <div class="footer">
                  <p>Généré par Compass</p>
                </div>
              </body>
            </html>
          `;
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.print();
          }
          break;
        }
      }

      setExportedFormat(format);
      toast.success(t('export.success', 'Export réussi'));
      onExport?.(format);

      // Reset success state after 2 seconds
      setTimeout(() => setExportedFormat(null), 2000);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('export.error', 'Erreur lors de l\'export'));
    } finally {
      setIsExporting(false);
    }
  };

  const formatIcons: Record<ExportFormat, React.ReactNode> = {
    pdf: <FileText className="w-4 h-4" />,
    csv: <Sheet className="w-4 h-4" />,
    json: <FileJson className="w-4 h-4" />,
  };

  const formatLabels: Record<ExportFormat, string> = {
    pdf: 'PDF',
    csv: 'CSV',
    json: 'JSON',
  };

  if (formats.length === 1) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled={disabled || isExporting}
        onClick={() => handleExport(formats[0])}
        className={cn('gap-2', className)}
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : exportedFormat ? (
          <Check className="w-4 h-4 text-primary" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {size !== 'icon' && t('export.button', 'Exporter')}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || isExporting}
          className={cn('gap-2', className)}
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {size !== 'icon' && t('export.button', 'Exporter')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.map((format) => (
          <DropdownMenuItem
            key={format}
            onClick={() => handleExport(format)}
            className="gap-2"
          >
            {formatIcons[format]}
            <span>{t(`export.format.${format}`, formatLabels[format])}</span>
            {exportedFormat === format && (
              <Check className="w-4 h-4 text-primary ml-auto" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
