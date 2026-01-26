import { jsPDF } from 'jspdf';
import { IrreversaThreshold, IrreversaWitness, IrreversaAuditEntry } from '@/hooks/useIrreversa';

const DOMAIN_LABELS: Record<string, string> = {
  strategic: 'Stratégique',
  financial: 'Financier',
  organizational: 'Organisationnel',
  legal: 'Juridique',
  ethical: 'Éthique'
};

const NATURE_LABELS: Record<string, string> = {
  resource_commitment: 'Engagement de ressources',
  contractual: 'Contractuel',
  reputational: 'Réputationnel',
  structural: 'Structurel',
  temporal: 'Temporel'
};

const STATUS_LABELS: Record<string, string> = {
  detected: 'Détecté',
  marked: 'Marqué',
  validated: 'Validé',
  sealed: 'Scellé'
};

export async function generateIrreversaCertificate(
  threshold: IrreversaThreshold,
  witnesses: IrreversaWitness[],
  auditLog: IrreversaAuditEntry[]
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Generate unique certificate ID
  const certId = `IRV-${threshold.id.slice(0, 8).toUpperCase()}-${new Date().getTime().toString(36).toUpperCase()}`;
  
  // Header with certificate styling
  doc.setFillColor(220, 38, 38); // destructive red
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICAT IRREVERSA', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`ID: ${certId}`, pageWidth / 2, 35, { align: 'center' });
  
  y = 55;
  doc.setTextColor(0, 0, 0);

  // Status badge
  const statusColor = threshold.status === 'sealed' ? [220, 38, 38] : [100, 100, 100];
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(margin, y, 60, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(STATUS_LABELS[threshold.status]?.toUpperCase() || threshold.status.toUpperCase(), margin + 30, y + 7, { align: 'center' });
  
  y += 20;
  doc.setTextColor(0, 0, 0);

  // Title section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(threshold.title, margin, y);
  y += 10;

  // Organization if present
  if (threshold.organization_name) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Organisation: ${threshold.organization_name}`, margin, y);
    y += 8;
  }

  // Domain and Nature
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Domaine: ${DOMAIN_LABELS[threshold.domain] || threshold.domain}`, margin, y);
  doc.text(`Nature: ${NATURE_LABELS[threshold.threshold_nature] || threshold.threshold_nature}`, pageWidth / 2, y);
  y += 12;

  // Separator
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Context section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTEXTE', margin, y);
  y += 7;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const contextLines = doc.splitTextToSize(threshold.context, pageWidth - 2 * margin);
  doc.text(contextLines, margin, y);
  y += contextLines.length * 5 + 8;

  // Irreversibility reason
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RAISON DE L\'IRRÉVERSIBILITÉ', margin, y);
  y += 7;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const reasonLines = doc.splitTextToSize(threshold.irreversibility_reason, pageWidth - 2 * margin);
  doc.text(reasonLines, margin, y);
  y += reasonLines.length * 5 + 8;

  // Alternatives before (frozen)
  if (threshold.alternatives_before && threshold.alternatives_before.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ALTERNATIVES GELÉES (avant le seuil)', margin, y);
    y += 7;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    threshold.alternatives_before.forEach((alt, i) => {
      doc.text(`${i + 1}. ${alt}`, margin + 5, y);
      y += 5;
    });
    y += 5;
  }

  // Check for page break
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  // Validation section
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y, pageWidth - 2 * margin, 40, 'F');
  y += 8;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VALIDATION', margin + 5, y);
  y += 7;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Validateur: ${threshold.validated_by}`, margin + 5, y);
  doc.text(`Rôle: ${threshold.validator_role.toUpperCase()}`, pageWidth / 2, y);
  y += 5;
  
  if (threshold.validation_date) {
    doc.text(`Date de validation: ${new Date(threshold.validation_date).toLocaleDateString('fr-FR', { 
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    })}`, margin + 5, y);
    y += 5;
  }
  
  if (threshold.validation_statement) {
    doc.text(`Déclaration: "${threshold.validation_statement}"`, margin + 5, y);
    y += 5;
  }
  y += 10;

  // Witnesses section
  if (witnesses.length > 0) {
    if (y > 220) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TÉMOINS (${witnesses.length})`, margin, y);
    y += 8;
    
    witnesses.forEach((witness, i) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${i + 1}. ${witness.witness_name} (${witness.witness_role})`, margin + 5, y);
      y += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`   Témoigné le: ${new Date(witness.witnessed_at).toLocaleDateString('fr-FR')}`, margin + 5, y);
      y += 5;
      
      if (witness.witness_statement) {
        const statementLines = doc.splitTextToSize(`   "${witness.witness_statement}"`, pageWidth - 2 * margin - 10);
        doc.text(statementLines, margin + 5, y);
        y += statementLines.length * 5;
      }
      y += 3;
    });
    y += 5;
  }

  // Audit trail
  if (auditLog.length > 0) {
    if (y > 220) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('JOURNAL D\'AUDIT', margin, y);
    y += 8;
    
    auditLog.forEach((entry) => {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const date = new Date(entry.created_at).toLocaleDateString('fr-FR', { 
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
      });
      doc.text(`• ${date} - ${entry.action.toUpperCase()} par ${entry.actor_name} (${entry.actor_role})`, margin + 5, y);
      y += 5;
    });
  }

  // Footer with timestamp
  const currentY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, currentY - 5, pageWidth - margin, currentY - 5);
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  const timestamp = new Date().toISOString();
  doc.text(`Certificat généré le ${new Date().toLocaleDateString('fr-FR', { 
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  })}`, margin, currentY);
  doc.text(`Horodatage: ${timestamp}`, pageWidth - margin, currentY, { align: 'right' });
  
  // Seal notice
  if (threshold.status === 'sealed' && threshold.sealed_at) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text(`⚠ SEUIL SCELLÉ LE ${new Date(threshold.sealed_at).toLocaleDateString('fr-FR').toUpperCase()} - DOCUMENT DÉFINITIF`, pageWidth / 2, currentY + 5, { align: 'center' });
  }

  // Save
  const filename = `irreversa-certificat-${threshold.title.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}-${certId}.pdf`;
  doc.save(filename);
}
