/**
 * PROFESSION & EDUCATION DATA
 * 
 * Defines education levels, professions, and their compatibility with exit keys
 */

export type EducationLevel = 
  | 'no_diploma'
  | 'high_school'
  | 'vocational'      // CAP/BEP/Bac Pro
  | 'associate'       // BTS/DUT/Bac+2
  | 'bachelor'        // Licence/Bac+3
  | 'master'          // Master/Bac+5
  | 'doctorate'       // PhD/Doctorat
  | 'medical_degree'  // Médecine/Pharmacie/Dentaire
  | 'law_degree'      // Droit
  | 'engineering';    // Ingénieur

export type ProfessionCategory = 
  | 'healthcare'
  | 'tech'
  | 'finance'
  | 'legal'
  | 'education'
  | 'creative'
  | 'manual_trade'
  | 'business'
  | 'science'
  | 'hospitality'
  | 'retail'
  | 'public_sector'
  | 'student'
  | 'unemployed'
  | 'retired'
  | 'exploring'  // Post-bac / career exploration
  | 'other';

export interface Profession {
  id: string;
  name: string;
  category: ProfessionCategory;
  requiredEducation: EducationLevel[];
  averageSalaryMultiplier: number; // Multiplier of country's average salary
  remoteWorkPossible: boolean;
  internationalDemand: 'low' | 'medium' | 'high' | 'very_high';
  compatibleExitKeys: string[]; // Exit key IDs this profession can do
}

export interface EducationLevelInfo {
  id: EducationLevel;
  label: string;
  yearsOfStudy: string;
  icon: string;
}

export const EDUCATION_LEVELS: EducationLevelInfo[] = [
  { id: 'no_diploma', label: 'Sans diplôme', yearsOfStudy: '-', icon: '📝' },
  { id: 'high_school', label: 'Baccalauréat', yearsOfStudy: 'Bac', icon: '🎓' },
  { id: 'vocational', label: 'CAP / BEP / Bac Pro', yearsOfStudy: 'CAP-Bac Pro', icon: '🔧' },
  { id: 'associate', label: 'BTS / DUT / Bac+2', yearsOfStudy: 'Bac+2', icon: '📚' },
  { id: 'bachelor', label: 'Licence / Bachelor', yearsOfStudy: 'Bac+3', icon: '🎯' },
  { id: 'master', label: 'Master / Grandes Écoles', yearsOfStudy: 'Bac+5', icon: '🏆' },
  { id: 'doctorate', label: 'Doctorat / PhD', yearsOfStudy: 'Bac+8', icon: '🔬' },
  { id: 'medical_degree', label: 'Médecine / Santé', yearsOfStudy: 'Bac+6 à +11', icon: '⚕️' },
  { id: 'law_degree', label: 'Droit', yearsOfStudy: 'Bac+5+', icon: '⚖️' },
  { id: 'engineering', label: 'Ingénieur', yearsOfStudy: 'Bac+5', icon: '⚙️' },
];

export const PROFESSIONS: Profession[] = [
  // Healthcare
  { id: 'doctor', name: 'Médecin', category: 'healthcare', requiredEducation: ['medical_degree'], averageSalaryMultiplier: 2.5, remoteWorkPossible: false, internationalDemand: 'very_high', compatibleExitKeys: ['medical_ch_trajectory', 'education_arbitrage', 'corporate_ladder_jump'] },
  { id: 'nurse', name: 'Infirmier(e)', category: 'healthcare', requiredEducation: ['bachelor', 'medical_degree'], averageSalaryMultiplier: 1.2, remoteWorkPossible: false, internationalDemand: 'very_high', compatibleExitKeys: ['medical_ch_trajectory', 'education_arbitrage'] },
  { id: 'pharmacist', name: 'Pharmacien(ne)', category: 'healthcare', requiredEducation: ['medical_degree'], averageSalaryMultiplier: 2.0, remoteWorkPossible: false, internationalDemand: 'high', compatibleExitKeys: ['medical_ch_trajectory', 'education_arbitrage'] },
  { id: 'dentist', name: 'Dentiste', category: 'healthcare', requiredEducation: ['medical_degree'], averageSalaryMultiplier: 2.8, remoteWorkPossible: false, internationalDemand: 'very_high', compatibleExitKeys: ['medical_ch_trajectory', 'education_arbitrage'] },
  { id: 'physiotherapist', name: 'Kinésithérapeute', category: 'healthcare', requiredEducation: ['bachelor', 'medical_degree'], averageSalaryMultiplier: 1.5, remoteWorkPossible: false, internationalDemand: 'high', compatibleExitKeys: ['medical_ch_trajectory', 'education_arbitrage'] },
  { id: 'veterinarian', name: 'Vétérinaire', category: 'healthcare', requiredEducation: ['medical_degree'], averageSalaryMultiplier: 1.8, remoteWorkPossible: false, internationalDemand: 'medium', compatibleExitKeys: ['education_arbitrage'] },
  { id: 'caregiver', name: 'Aide-soignant(e)', category: 'healthcare', requiredEducation: ['vocational', 'high_school'], averageSalaryMultiplier: 0.8, remoteWorkPossible: false, internationalDemand: 'high', compatibleExitKeys: ['manual_trade_pivot'] },
  
  // Tech
  { id: 'software_engineer', name: 'Développeur / Ingénieur logiciel', category: 'tech', requiredEducation: ['bachelor', 'master', 'engineering'], averageSalaryMultiplier: 1.8, remoteWorkPossible: true, internationalDemand: 'very_high', compatibleExitKeys: ['digital_nomad_escape', 'freelance_tech', 'corporate_ladder_jump', 'education_arbitrage'] },
  { id: 'data_scientist', name: 'Data Scientist', category: 'tech', requiredEducation: ['master', 'doctorate', 'engineering'], averageSalaryMultiplier: 2.0, remoteWorkPossible: true, internationalDemand: 'very_high', compatibleExitKeys: ['digital_nomad_escape', 'freelance_tech', 'corporate_ladder_jump'] },
  { id: 'devops', name: 'DevOps / SRE', category: 'tech', requiredEducation: ['bachelor', 'master', 'engineering'], averageSalaryMultiplier: 1.9, remoteWorkPossible: true, internationalDemand: 'very_high', compatibleExitKeys: ['digital_nomad_escape', 'freelance_tech', 'corporate_ladder_jump'] },
  { id: 'designer_ux', name: 'UX/UI Designer', category: 'tech', requiredEducation: ['bachelor', 'master'], averageSalaryMultiplier: 1.5, remoteWorkPossible: true, internationalDemand: 'high', compatibleExitKeys: ['digital_nomad_escape', 'freelance_tech', 'content_creator_path'] },
  { id: 'product_manager', name: 'Product Manager', category: 'tech', requiredEducation: ['bachelor', 'master', 'engineering'], averageSalaryMultiplier: 1.8, remoteWorkPossible: true, internationalDemand: 'high', compatibleExitKeys: ['digital_nomad_escape', 'corporate_ladder_jump'] },
  { id: 'it_support', name: 'Support IT / Technicien', category: 'tech', requiredEducation: ['vocational', 'associate', 'bachelor'], averageSalaryMultiplier: 1.0, remoteWorkPossible: true, internationalDemand: 'medium', compatibleExitKeys: ['freelance_tech', 'education_arbitrage'] },
  { id: 'cybersecurity', name: 'Cybersécurité', category: 'tech', requiredEducation: ['bachelor', 'master', 'engineering'], averageSalaryMultiplier: 2.0, remoteWorkPossible: true, internationalDemand: 'very_high', compatibleExitKeys: ['digital_nomad_escape', 'freelance_tech', 'corporate_ladder_jump'] },
  
  // Finance
  { id: 'accountant', name: 'Comptable', category: 'finance', requiredEducation: ['associate', 'bachelor', 'master'], averageSalaryMultiplier: 1.3, remoteWorkPossible: true, internationalDemand: 'medium', compatibleExitKeys: ['corporate_ladder_jump', 'freelance_tech'] },
  { id: 'financial_analyst', name: 'Analyste financier', category: 'finance', requiredEducation: ['master'], averageSalaryMultiplier: 1.8, remoteWorkPossible: true, internationalDemand: 'high', compatibleExitKeys: ['corporate_ladder_jump', 'education_arbitrage'] },
  { id: 'banker', name: 'Banquier / Conseiller financier', category: 'finance', requiredEducation: ['bachelor', 'master'], averageSalaryMultiplier: 1.5, remoteWorkPossible: false, internationalDemand: 'medium', compatibleExitKeys: ['corporate_ladder_jump'] },
  { id: 'trader', name: 'Trader / Quant', category: 'finance', requiredEducation: ['master', 'engineering', 'doctorate'], averageSalaryMultiplier: 3.0, remoteWorkPossible: true, internationalDemand: 'high', compatibleExitKeys: ['corporate_ladder_jump', 'digital_nomad_escape'] },
  { id: 'auditor', name: 'Auditeur', category: 'finance', requiredEducation: ['master'], averageSalaryMultiplier: 1.6, remoteWorkPossible: true, internationalDemand: 'high', compatibleExitKeys: ['corporate_ladder_jump', 'education_arbitrage'] },
  
  // Legal
  { id: 'lawyer', name: 'Avocat', category: 'legal', requiredEducation: ['law_degree'], averageSalaryMultiplier: 2.0, remoteWorkPossible: true, internationalDemand: 'low', compatibleExitKeys: ['corporate_ladder_jump', 'education_arbitrage'] },
  { id: 'notary', name: 'Notaire', category: 'legal', requiredEducation: ['law_degree'], averageSalaryMultiplier: 2.5, remoteWorkPossible: false, internationalDemand: 'low', compatibleExitKeys: [] },
  { id: 'legal_counsel', name: 'Juriste d\'entreprise', category: 'legal', requiredEducation: ['law_degree', 'master'], averageSalaryMultiplier: 1.7, remoteWorkPossible: true, internationalDemand: 'medium', compatibleExitKeys: ['corporate_ladder_jump'] },
  
  // Creative
  { id: 'graphic_designer', name: 'Graphiste / Designer', category: 'creative', requiredEducation: ['associate', 'bachelor', 'master'], averageSalaryMultiplier: 1.1, remoteWorkPossible: true, internationalDemand: 'medium', compatibleExitKeys: ['digital_nomad_escape', 'freelance_tech', 'content_creator_path'] },
  { id: 'video_producer', name: 'Vidéaste / Monteur', category: 'creative', requiredEducation: ['vocational', 'associate', 'bachelor'], averageSalaryMultiplier: 1.0, remoteWorkPossible: true, internationalDemand: 'medium', compatibleExitKeys: ['digital_nomad_escape', 'content_creator_path'] },
  { id: 'photographer', name: 'Photographe', category: 'creative', requiredEducation: ['no_diploma', 'vocational', 'bachelor'], averageSalaryMultiplier: 0.9, remoteWorkPossible: true, internationalDemand: 'low', compatibleExitKeys: ['content_creator_path', 'digital_nomad_escape'] },
  { id: 'writer', name: 'Rédacteur / Écrivain', category: 'creative', requiredEducation: ['bachelor', 'master'], averageSalaryMultiplier: 0.9, remoteWorkPossible: true, internationalDemand: 'low', compatibleExitKeys: ['content_creator_path', 'digital_nomad_escape'] },
  { id: 'musician', name: 'Musicien / Compositeur', category: 'creative', requiredEducation: ['no_diploma', 'vocational', 'bachelor'], averageSalaryMultiplier: 0.7, remoteWorkPossible: true, internationalDemand: 'low', compatibleExitKeys: ['content_creator_path'] },
  { id: 'marketing', name: 'Marketing / Communication', category: 'creative', requiredEducation: ['bachelor', 'master'], averageSalaryMultiplier: 1.3, remoteWorkPossible: true, internationalDemand: 'medium', compatibleExitKeys: ['digital_nomad_escape', 'freelance_tech', 'content_creator_path', 'corporate_ladder_jump'] },
  
  // Manual trades
  { id: 'electrician', name: 'Électricien', category: 'manual_trade', requiredEducation: ['vocational'], averageSalaryMultiplier: 1.2, remoteWorkPossible: false, internationalDemand: 'high', compatibleExitKeys: ['manual_trade_pivot'] },
  { id: 'plumber', name: 'Plombier', category: 'manual_trade', requiredEducation: ['vocational'], averageSalaryMultiplier: 1.2, remoteWorkPossible: false, internationalDemand: 'high', compatibleExitKeys: ['manual_trade_pivot'] },
  { id: 'carpenter', name: 'Menuisier / Charpentier', category: 'manual_trade', requiredEducation: ['vocational'], averageSalaryMultiplier: 1.1, remoteWorkPossible: false, internationalDemand: 'medium', compatibleExitKeys: ['manual_trade_pivot'] },
  { id: 'mechanic', name: 'Mécanicien', category: 'manual_trade', requiredEducation: ['vocational'], averageSalaryMultiplier: 1.0, remoteWorkPossible: false, internationalDemand: 'medium', compatibleExitKeys: ['manual_trade_pivot'] },
  { id: 'hvac_tech', name: 'Technicien CVC / Frigoriste', category: 'manual_trade', requiredEducation: ['vocational', 'associate'], averageSalaryMultiplier: 1.3, remoteWorkPossible: false, internationalDemand: 'very_high', compatibleExitKeys: ['manual_trade_pivot'] },
  { id: 'chef', name: 'Chef cuisinier', category: 'manual_trade', requiredEducation: ['vocational'], averageSalaryMultiplier: 1.1, remoteWorkPossible: false, internationalDemand: 'high', compatibleExitKeys: ['manual_trade_pivot', 'diaspora_leverage'] },
  { id: 'construction', name: 'Ouvrier BTP', category: 'manual_trade', requiredEducation: ['no_diploma', 'vocational'], averageSalaryMultiplier: 0.9, remoteWorkPossible: false, internationalDemand: 'medium', compatibleExitKeys: ['manual_trade_pivot'] },
  
  // Business
  { id: 'sales', name: 'Commercial / Ventes', category: 'business', requiredEducation: ['high_school', 'associate', 'bachelor'], averageSalaryMultiplier: 1.3, remoteWorkPossible: true, internationalDemand: 'medium', compatibleExitKeys: ['corporate_ladder_jump', 'diaspora_leverage'] },
  { id: 'entrepreneur', name: 'Entrepreneur / Chef d\'entreprise', category: 'business', requiredEducation: ['no_diploma', 'bachelor', 'master'], averageSalaryMultiplier: 2.0, remoteWorkPossible: true, internationalDemand: 'high', compatibleExitKeys: ['digital_nomad_escape', 'diaspora_leverage', 'real_estate_investor'] },
  { id: 'consultant', name: 'Consultant', category: 'business', requiredEducation: ['master', 'engineering'], averageSalaryMultiplier: 1.8, remoteWorkPossible: true, internationalDemand: 'high', compatibleExitKeys: ['digital_nomad_escape', 'freelance_tech', 'corporate_ladder_jump'] },
  { id: 'hr_manager', name: 'RH / Recrutement', category: 'business', requiredEducation: ['bachelor', 'master'], averageSalaryMultiplier: 1.3, remoteWorkPossible: true, internationalDemand: 'medium', compatibleExitKeys: ['corporate_ladder_jump'] },
  { id: 'project_manager', name: 'Chef de projet', category: 'business', requiredEducation: ['bachelor', 'master', 'engineering'], averageSalaryMultiplier: 1.5, remoteWorkPossible: true, internationalDemand: 'high', compatibleExitKeys: ['corporate_ladder_jump', 'freelance_tech'] },
  
  // Education
  { id: 'teacher', name: 'Enseignant', category: 'education', requiredEducation: ['bachelor', 'master'], averageSalaryMultiplier: 1.0, remoteWorkPossible: true, internationalDemand: 'medium', compatibleExitKeys: ['content_creator_path', 'education_arbitrage'] },
  { id: 'professor', name: 'Professeur universitaire', category: 'education', requiredEducation: ['doctorate'], averageSalaryMultiplier: 1.4, remoteWorkPossible: true, internationalDemand: 'high', compatibleExitKeys: ['education_arbitrage'] },
  { id: 'researcher', name: 'Chercheur', category: 'education', requiredEducation: ['doctorate'], averageSalaryMultiplier: 1.3, remoteWorkPossible: true, internationalDemand: 'high', compatibleExitKeys: ['education_arbitrage'] },
  { id: 'tutor', name: 'Formateur / Coach', category: 'education', requiredEducation: ['bachelor', 'master'], averageSalaryMultiplier: 1.2, remoteWorkPossible: true, internationalDemand: 'medium', compatibleExitKeys: ['content_creator_path', 'digital_nomad_escape'] },
  
  // Science
  { id: 'engineer_civil', name: 'Ingénieur civil / BTP', category: 'science', requiredEducation: ['engineering', 'master'], averageSalaryMultiplier: 1.6, remoteWorkPossible: false, internationalDemand: 'high', compatibleExitKeys: ['corporate_ladder_jump', 'education_arbitrage'] },
  { id: 'engineer_mech', name: 'Ingénieur mécanique', category: 'science', requiredEducation: ['engineering', 'master'], averageSalaryMultiplier: 1.5, remoteWorkPossible: false, internationalDemand: 'high', compatibleExitKeys: ['corporate_ladder_jump', 'education_arbitrage'] },
  { id: 'engineer_elec', name: 'Ingénieur électrique', category: 'science', requiredEducation: ['engineering', 'master'], averageSalaryMultiplier: 1.5, remoteWorkPossible: false, internationalDemand: 'high', compatibleExitKeys: ['corporate_ladder_jump', 'education_arbitrage'] },
  { id: 'architect', name: 'Architecte', category: 'science', requiredEducation: ['master'], averageSalaryMultiplier: 1.4, remoteWorkPossible: true, internationalDemand: 'medium', compatibleExitKeys: ['freelance_tech', 'education_arbitrage'] },
  { id: 'lab_technician', name: 'Technicien de laboratoire', category: 'science', requiredEducation: ['associate', 'bachelor'], averageSalaryMultiplier: 1.1, remoteWorkPossible: false, internationalDemand: 'medium', compatibleExitKeys: ['education_arbitrage'] },
  
  // Hospitality / Retail
  { id: 'hotel_manager', name: 'Directeur d\'hôtel', category: 'hospitality', requiredEducation: ['bachelor', 'master'], averageSalaryMultiplier: 1.4, remoteWorkPossible: false, internationalDemand: 'high', compatibleExitKeys: ['diaspora_leverage'] },
  { id: 'waiter', name: 'Serveur / Barman', category: 'hospitality', requiredEducation: ['no_diploma', 'vocational'], averageSalaryMultiplier: 0.7, remoteWorkPossible: false, internationalDemand: 'medium', compatibleExitKeys: [] },
  { id: 'retail_manager', name: 'Responsable de magasin', category: 'retail', requiredEducation: ['high_school', 'associate'], averageSalaryMultiplier: 1.0, remoteWorkPossible: false, internationalDemand: 'low', compatibleExitKeys: [] },
  { id: 'retail_worker', name: 'Vendeur / Caissier', category: 'retail', requiredEducation: ['no_diploma', 'high_school'], averageSalaryMultiplier: 0.6, remoteWorkPossible: false, internationalDemand: 'low', compatibleExitKeys: [] },
  
  // Public sector
  { id: 'civil_servant', name: 'Fonctionnaire', category: 'public_sector', requiredEducation: ['high_school', 'bachelor', 'master'], averageSalaryMultiplier: 1.0, remoteWorkPossible: false, internationalDemand: 'low', compatibleExitKeys: [] },
  { id: 'police', name: 'Police / Gendarmerie', category: 'public_sector', requiredEducation: ['high_school', 'bachelor'], averageSalaryMultiplier: 1.1, remoteWorkPossible: false, internationalDemand: 'low', compatibleExitKeys: [] },
  { id: 'military', name: 'Militaire', category: 'public_sector', requiredEducation: ['no_diploma', 'high_school', 'bachelor'], averageSalaryMultiplier: 1.0, remoteWorkPossible: false, internationalDemand: 'low', compatibleExitKeys: ['manual_trade_pivot'] },
  
  // Other
  { id: 'student', name: 'Étudiant', category: 'student', requiredEducation: ['high_school'], averageSalaryMultiplier: 0.3, remoteWorkPossible: true, internationalDemand: 'medium', compatibleExitKeys: ['education_arbitrage', 'content_creator_path', 'freelance_tech'] },
  { id: 'unemployed', name: 'En recherche d\'emploi', category: 'unemployed', requiredEducation: ['no_diploma'], averageSalaryMultiplier: 0.0, remoteWorkPossible: true, internationalDemand: 'low', compatibleExitKeys: ['manual_trade_pivot', 'content_creator_path'] },
  { id: 'retired', name: 'Retraité', category: 'retired', requiredEducation: ['no_diploma'], averageSalaryMultiplier: 0.5, remoteWorkPossible: false, internationalDemand: 'low', compatibleExitKeys: ['real_estate_investor'] },
  
  // Exploring / Post-bac - for people who don't know what they want to do
  { id: 'exploring_general', name: 'Je ne sais pas encore (exploration)', category: 'exploring', requiredEducation: ['high_school'], averageSalaryMultiplier: 0.5, remoteWorkPossible: true, internationalDemand: 'medium', compatibleExitKeys: ['education_arbitrage', 'content_creator_path', 'digital_nomad_escape'] },
  { id: 'exploring_tech', name: 'Intéressé par la tech', category: 'exploring', requiredEducation: ['high_school'], averageSalaryMultiplier: 0.5, remoteWorkPossible: true, internationalDemand: 'high', compatibleExitKeys: ['education_arbitrage', 'freelance_tech', 'digital_nomad_escape'] },
  { id: 'exploring_creative', name: 'Intéressé par le créatif', category: 'exploring', requiredEducation: ['high_school'], averageSalaryMultiplier: 0.4, remoteWorkPossible: true, internationalDemand: 'medium', compatibleExitKeys: ['content_creator_path', 'digital_nomad_escape'] },
  { id: 'exploring_business', name: 'Intéressé par le business', category: 'exploring', requiredEducation: ['high_school'], averageSalaryMultiplier: 0.5, remoteWorkPossible: true, internationalDemand: 'medium', compatibleExitKeys: ['diaspora_leverage', 'corporate_ladder_jump'] },
  { id: 'exploring_healthcare', name: 'Intéressé par la santé', category: 'exploring', requiredEducation: ['high_school'], averageSalaryMultiplier: 0.5, remoteWorkPossible: false, internationalDemand: 'very_high', compatibleExitKeys: ['education_arbitrage'] },
  { id: 'exploring_manual', name: 'Intéressé par un métier manuel', category: 'exploring', requiredEducation: ['high_school'], averageSalaryMultiplier: 0.5, remoteWorkPossible: false, internationalDemand: 'high', compatibleExitKeys: ['manual_trade_pivot'] },
  
  { id: 'other', name: 'Autre', category: 'other', requiredEducation: ['no_diploma'], averageSalaryMultiplier: 1.0, remoteWorkPossible: true, internationalDemand: 'medium', compatibleExitKeys: ['digital_nomad_escape', 'content_creator_path', 'diaspora_leverage'] },
];

// Get profession by ID
export function getProfession(id: string): Profession | undefined {
  return PROFESSIONS.find(p => p.id === id);
}

// Get professions by category
export function getProfessionsByCategory(category: ProfessionCategory): Profession[] {
  return PROFESSIONS.filter(p => p.category === category);
}

// Get professions compatible with an education level
export function getProfessionsForEducation(education: EducationLevel): Profession[] {
  return PROFESSIONS.filter(p => p.requiredEducation.includes(education));
}

// Get education level info
export function getEducationLevelInfo(id: EducationLevel): EducationLevelInfo | undefined {
  return EDUCATION_LEVELS.find(e => e.id === id);
}

// Get estimated monthly salary based on country and profession
export function getEstimatedSalary(countryId: string, professionId: string): number {
  const profession = getProfession(professionId);
  if (!profession) return 0;
  
  // Base salaries by country (net monthly in EUR)
  const BASE_SALARIES: Record<string, number> = {
    france: 2300,
    germany: 2800,
    switzerland: 5500,
    usa: 3500,
    uk: 2600,
    canada: 2800,
    australia: 3200,
    belgium: 2500,
    netherlands: 2700,
    spain: 1800,
    portugal: 1200,
    italy: 1900,
    ireland: 2800,
    japan: 2500,
    south_korea: 2200,
    singapore: 3800,
    uae: 3500,
    china: 1200,
    india: 500,
    brazil: 600,
    mexico: 700,
    morocco: 500,
    senegal: 350,
    cameroon: 300,
    nigeria: 350,
    south_africa: 800,
    turkey: 600,
    thailand: 600,
    vietnam: 400,
    indonesia: 350,
    philippines: 400,
    malaysia: 700,
    new_zealand: 2800,
    argentina: 400,
    chile: 900,
    colombia: 450,
    poland: 1200,
    czech_republic: 1400,
    hungary: 1000,
    romania: 900,
    russia: 700,
    israel: 2500,
    egypt: 300,
  };
  
  const baseSalary = BASE_SALARIES[countryId] || 1500;
  return Math.round(baseSalary * profession.averageSalaryMultiplier);
}

// Get seniority multiplier based on age (experience factor)
function getSeniorityMultiplier(age: number): number {
  if (age < 25) return 0.7; // Junior/entry level
  if (age < 30) return 0.85; // Early career
  if (age < 35) return 1.0; // Established
  if (age < 45) return 1.15; // Senior
  if (age < 55) return 1.25; // Expert/management
  if (age < 62) return 1.2; // Late career (slight decrease)
  return 1.1; // Near retirement
}

// Get estimated monthly salary with age/seniority factor
export function getEstimatedSalaryWithAge(countryId: string, professionId: string, age: number): number {
  const baseSalary = getEstimatedSalary(countryId, professionId);
  if (baseSalary === 0) return 0;
  
  const seniorityMultiplier = getSeniorityMultiplier(age);
  return Math.round(baseSalary * seniorityMultiplier);
}

// Get currency symbol for country
export function getCountryCurrency(countryId: string): { symbol: string; code: string } {
  const CURRENCIES: Record<string, { symbol: string; code: string }> = {
    usa: { symbol: '$', code: 'USD' },
    uk: { symbol: '£', code: 'GBP' },
    japan: { symbol: '¥', code: 'JPY' },
    china: { symbol: '¥', code: 'CNY' },
    switzerland: { symbol: 'CHF', code: 'CHF' },
    india: { symbol: '₹', code: 'INR' },
    brazil: { symbol: 'R$', code: 'BRL' },
    mexico: { symbol: '$', code: 'MXN' },
    south_korea: { symbol: '₩', code: 'KRW' },
    thailand: { symbol: '฿', code: 'THB' },
    vietnam: { symbol: '₫', code: 'VND' },
    turkey: { symbol: '₺', code: 'TRY' },
    russia: { symbol: '₽', code: 'RUB' },
    uae: { symbol: 'AED', code: 'AED' },
    singapore: { symbol: 'S$', code: 'SGD' },
    australia: { symbol: 'A$', code: 'AUD' },
    canada: { symbol: 'C$', code: 'CAD' },
    new_zealand: { symbol: 'NZ$', code: 'NZD' },
    israel: { symbol: '₪', code: 'ILS' },
    south_africa: { symbol: 'R', code: 'ZAR' },
    nigeria: { symbol: '₦', code: 'NGN' },
    egypt: { symbol: 'E£', code: 'EGP' },
    morocco: { symbol: 'DH', code: 'MAD' },
    argentina: { symbol: '$', code: 'ARS' },
    chile: { symbol: '$', code: 'CLP' },
    colombia: { symbol: '$', code: 'COP' },
    philippines: { symbol: '₱', code: 'PHP' },
    indonesia: { symbol: 'Rp', code: 'IDR' },
    malaysia: { symbol: 'RM', code: 'MYR' },
    poland: { symbol: 'zł', code: 'PLN' },
    czech_republic: { symbol: 'Kč', code: 'CZK' },
    hungary: { symbol: 'Ft', code: 'HUF' },
    romania: { symbol: 'lei', code: 'RON' },
    senegal: { symbol: 'CFA', code: 'XOF' },
    cameroon: { symbol: 'CFA', code: 'XAF' },
  };
  // Default to EUR for eurozone and unlisted countries
  return CURRENCIES[countryId] || { symbol: '€', code: 'EUR' };
}

// Category labels
export const PROFESSION_CATEGORY_LABELS: Record<ProfessionCategory, { label: string; icon: string }> = {
  healthcare: { label: 'Santé', icon: '⚕️' },
  tech: { label: 'Tech / IT', icon: '💻' },
  finance: { label: 'Finance', icon: '💰' },
  legal: { label: 'Juridique', icon: '⚖️' },
  education: { label: 'Éducation', icon: '📚' },
  creative: { label: 'Créatif / Marketing', icon: '🎨' },
  manual_trade: { label: 'Artisanat / Manuel', icon: '🔧' },
  business: { label: 'Business / Commerce', icon: '💼' },
  science: { label: 'Ingénierie / Science', icon: '🔬' },
  hospitality: { label: 'Hôtellerie / Restauration', icon: '🏨' },
  retail: { label: 'Commerce / Distribution', icon: '🛒' },
  public_sector: { label: 'Secteur public', icon: '🏛️' },
  student: { label: 'Étudiant', icon: '🎓' },
  unemployed: { label: 'Recherche d\'emploi', icon: '🔍' },
  retired: { label: 'Retraité', icon: '🌴' },
  exploring: { label: 'En exploration / Post-bac', icon: '🧭' },
  other: { label: 'Autre', icon: '📝' },
};
