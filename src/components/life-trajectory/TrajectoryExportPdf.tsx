// Life Trajectory PDF Export Component
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Download, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { TrajectoryRecommendation, LifeMotorProfile, LIFE_MOTOR_PROFILES } from '@/lib/types';

interface TrajectoryExportPdfProps {
  profile: LifeMotorProfile;
  trajectories: TrajectoryRecommendation[];
}

export function TrajectoryExportPdf({ profile, trajectories }: TrajectoryExportPdfProps) {
  const { t, i18n } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const motorProfile = LIFE_MOTOR_PROFILES[profile];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let y = margin;

      // Title
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('lifeTrajectory.pdfTitle', 'Life Trajectory Analysis'), pageWidth / 2, y, { align: 'center' });
      y += 15;

      // Subtitle with date
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(128, 128, 128);
      const dateStr = new Date().toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      pdf.text(dateStr, pageWidth / 2, y, { align: 'center' });
      y += 15;

      // Profile Section
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('lifeTrajectory.yourProfile', 'Your Motor Profile'), margin, y);
      y += 8;

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(79, 70, 229);
      pdf.text(`${motorProfile?.icon || '🎯'} ${t(motorProfile?.label || profile)}`, margin, y);
      y += 7;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      const descLines = pdf.splitTextToSize(t(motorProfile?.description || ''), pageWidth - margin * 2);
      pdf.text(descLines, margin, y);
      y += descLines.length * 5 + 10;

      // Trajectories Section
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('lifeTrajectory.recommendedTrajectories', 'Recommended Trajectories'), margin, y);
      y += 10;

      trajectories.forEach((traj, index) => {
        if (y > pageHeight - 60) {
          pdf.addPage();
          y = margin;
        }

        // Trajectory header
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        const planLabel = traj.plan === 'SAFE' ? '🛡️ Safe' : traj.plan === 'HYBRID' ? '⚖️ Hybrid' : '🚀 Ambitious';
        pdf.text(`${index + 1}. ${planLabel} - ${t(traj.title)}`, margin, y);
        y += 6;

        // Duration
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(`${t('lifeTrajectory.duration', 'Duration')}: ${traj.duration}`, margin + 5, y);
        y += 5;

        // Description
        const trajDescLines = pdf.splitTextToSize(t(traj.description), pageWidth - margin * 2 - 10);
        pdf.text(trajDescLines, margin + 5, y);
        y += trajDescLines.length * 4 + 3;

        // First Steps
        if (traj.firstSteps?.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(0, 0, 0);
          pdf.text(t('lifeTrajectory.firstSteps', 'First Steps') + ':', margin + 5, y);
          y += 4;
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(60, 60, 60);
          traj.firstSteps.slice(0, 3).forEach(step => {
            pdf.text(`• ${t(step)}`, margin + 10, y);
            y += 4;
          });
        }

        // Risks
        if (traj.risks?.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(180, 80, 80);
          pdf.text(t('lifeTrajectory.risks', 'Risks') + ':', margin + 5, y);
          y += 4;
          pdf.setFont('helvetica', 'normal');
          traj.risks.slice(0, 2).forEach(risk => {
            pdf.text(`⚠ ${t(risk)}`, margin + 10, y);
            y += 4;
          });
        }

        y += 8;
      });

      // Disclaimer
      if (y > pageHeight - 30) {
        pdf.addPage();
        y = margin;
      }
      y = pageHeight - 25;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(150, 150, 150);
      const disclaimer = t('intelligence.disclaimer', 'Analysis tool: not advice. Simulation ≠ prediction.');
      pdf.text(disclaimer, pageWidth / 2, y, { align: 'center' });

      // Save
      pdf.save(`life-trajectory-${profile.toLowerCase()}-${Date.now()}.pdf`);
      toast.success(t('lifeTrajectory.exportSuccess', 'PDF exported successfully'));
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(t('lifeTrajectory.exportError', 'Failed to export PDF'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting || trajectories.length === 0}
      className="gap-2"
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      <FileText className="w-4 h-4" />
      {t('lifeTrajectory.exportPdf', 'Export PDF')}
    </Button>
  );
}
