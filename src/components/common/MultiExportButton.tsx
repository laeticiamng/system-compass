import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet, FileJson, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface ExportData {
  title: string;
  subtitle?: string;
  date: string;
  sections: Array<{
    heading: string;
    content: string | string[];
  }>;
  metadata?: Record<string, string>;
}

interface MultiExportButtonProps {
  data: ExportData;
  filename: string;
  formats?: ('pdf' | 'csv' | 'json')[];
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function MultiExportButton({
  data,
  filename,
  formats = ['pdf', 'csv', 'json'],
  variant = 'outline',
  size = 'sm',
}: MultiExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 20;

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(data.title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Subtitle
      if (data.subtitle) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(data.subtitle, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 8;
      }

      // Date
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Généré le ${data.date}`, pageWidth / 2, yPosition, { align: 'center' });
      doc.setTextColor(0);
      yPosition += 15;

      // Sections
      for (const section of data.sections) {
        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(section.heading, 14, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const content = Array.isArray(section.content) ? section.content : [section.content];
        for (const line of content) {
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
          const splitText = doc.splitTextToSize(line, pageWidth - 28);
          doc.text(splitText, 14, yPosition);
          yPosition += splitText.length * 5 + 3;
        }
        yPosition += 5;
      }

      // Metadata footer
      if (data.metadata) {
        doc.setFontSize(8);
        doc.setTextColor(150);
        let metaY = doc.internal.pageSize.getHeight() - 10;
        Object.entries(data.metadata).forEach(([key, value]) => {
          doc.text(`${key}: ${value}`, 14, metaY);
          metaY -= 4;
        });
      }

      doc.save(`${filename}.pdf`);
      toast.success('PDF exporté avec succès');
    } catch (error) {
      toast.error("Erreur lors de l'export PDF");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const rows: string[][] = [];
      rows.push(['Section', 'Contenu']);

      for (const section of data.sections) {
        const content = Array.isArray(section.content) ? section.content.join('; ') : section.content;
        rows.push([section.heading, content]);
      }

      const csvContent = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('CSV exporté avec succès');
    } catch (error) {
      toast.error("Erreur lors de l'export CSV");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    setIsExporting(true);
    try {
      const jsonData = {
        ...data,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('JSON exporté avec succès');
    } catch (error) {
      toast.error("Erreur lors de l'export JSON");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = (format: 'pdf' | 'csv' | 'json') => {
    switch (format) {
      case 'pdf':
        exportToPDF();
        break;
      case 'csv':
        exportToCSV();
        break;
      case 'json':
        exportToJSON();
        break;
    }
  };

  if (formats.length === 1) {
    return (
      <Button variant={variant} size={size} onClick={() => handleExport(formats[0])} disabled={isExporting}>
        {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
        Export {formats[0].toUpperCase()}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isExporting}>
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
          Exporter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {formats.includes('pdf') && (
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </DropdownMenuItem>
        )}
        {formats.includes('csv') && (
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export CSV
          </DropdownMenuItem>
        )}
        {formats.includes('json') && (
          <DropdownMenuItem onClick={() => handleExport('json')}>
            <FileJson className="h-4 w-4 mr-2" />
            Export JSON
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
