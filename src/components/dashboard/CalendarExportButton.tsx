import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { 
  CalendarDays, 
  Download, 
  ExternalLink,
  Copy,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  isAllDay?: boolean;
}

interface CalendarExportButtonProps {
  events: CalendarEvent[];
  filename?: string;
}

export function CalendarExportButton({ events, filename = 'export' }: CalendarExportButtonProps) {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatDateICS = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const generateICS = (): string => {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//WorldAlignment//Compass//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    events.forEach(event => {
      const endDate = event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000);
      
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${event.id}@worldalignment.app`);
      lines.push(`DTSTAMP:${formatDateICS(new Date())}`);
      
      if (event.isAllDay) {
        lines.push(`DTSTART;VALUE=DATE:${event.startDate.toISOString().split('T')[0].replace(/-/g, '')}`);
        lines.push(`DTEND;VALUE=DATE:${endDate.toISOString().split('T')[0].replace(/-/g, '')}`);
      } else {
        lines.push(`DTSTART:${formatDateICS(event.startDate)}`);
        lines.push(`DTEND:${formatDateICS(endDate)}`);
      }
      
      lines.push(`SUMMARY:${event.title.replace(/,/g, '\\,')}`);
      
      if (event.description) {
        lines.push(`DESCRIPTION:${event.description.replace(/\n/g, '\\n').replace(/,/g, '\\,')}`);
      }
      
      if (event.location) {
        lines.push(`LOCATION:${event.location.replace(/,/g, '\\,')}`);
      }
      
      lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  };

  const downloadICS = () => {
    setExporting(true);
    try {
      const icsContent = generateICS();
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(t('calendar.export.success', '{{count}} événements exportés', { count: events.length }));
    } catch (error) {
      toast.error(t('calendar.export.error', 'Erreur lors de l\'export'));
    } finally {
      setExporting(false);
    }
  };

  const generateGoogleCalendarUrl = (event: CalendarEvent): string => {
    const start = formatDateICS(event.startDate);
    const end = event.endDate ? formatDateICS(event.endDate) : formatDateICS(new Date(event.startDate.getTime() + 60 * 60 * 1000));
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${start}/${end}`,
      details: event.description || '',
      location: event.location || '',
    });
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const copyToClipboard = async () => {
    try {
      const text = events.map(e => 
        `${e.startDate.toLocaleDateString()} - ${e.title}${e.description ? `: ${e.description}` : ''}`
      ).join('\n');
      
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(t('calendar.export.copied', 'Copié dans le presse-papiers'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('calendar.export.copyError', 'Erreur lors de la copie'));
    }
  };

  if (events.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {exporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CalendarDays className="w-4 h-4" />
          )}
          {t('calendar.export.button', 'Exporter')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          {t('calendar.export.title', 'Exporter les événements')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={downloadICS}>
          <Download className="w-4 h-4 mr-2" />
          {t('calendar.export.ics', 'Fichier ICS (iCal, Outlook)')}
        </DropdownMenuItem>
        
        {events.length === 1 && (
          <DropdownMenuItem onClick={() => window.open(generateGoogleCalendarUrl(events[0]), '_blank')}>
            <ExternalLink className="w-4 h-4 mr-2" />
            {t('calendar.export.google', 'Google Calendar')}
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={copyToClipboard}>
          {copied ? (
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          {t('calendar.export.copy', 'Copier la liste')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
