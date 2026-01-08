/**
 * PURCHASING POWER CALCULATOR
 * 
 * Calculates relative purchasing power for vacation destinations
 * based on user's salary and destination's cost of living
 */

import { countries } from './countries-data';
import { getEstimatedSalary, getProfession } from './profession-data';
import { getNationalityAdvantages, REGIONAL_BLOCS, COUNTRY_NAMES, DestinationRecommendation, NATIONALITY_PROFILES } from './nationality-advantages';

export interface VacationDestination {
  countryId: string;
  countryName: string;
  flag: string;
  // Purchasing power metrics
  purchasingPowerIndex: number; // Higher = better value for money
  dailyBudgetLocal: number; // Estimated daily budget in EUR
  stayDurationAffordable: number; // Days affordable with 1 month salary
  // Access
  accessType: 'visa_free' | 'visa_on_arrival' | 'easy_visa' | 'requires_visa';
  accessNote?: string;
  // Quality indicators
  tourismScore: number; // 0-100
  safetyScore: number; // 0-100
  bestTimeToVisit?: string;
  // Reasons
  reasons: string[];
  warnings: string[];
}

export interface DomesticDestination {
  region: string;
  city: string;
  purchasingPowerIndex: number;
  dailyBudget: number;
  reasons: string[];
}

// Cost of living index for vacation (daily expenses)
const VACATION_DAILY_COSTS: Record<string, {
  budget: number;      // Backpacker/budget traveler
  midRange: number;    // Comfortable traveler
  luxury: number;      // Luxury traveler
  touristScore: number;
  bestSeason: string;
  warnings: string[];
}> = {
  // Southeast Asia - Best value
  thailand: { budget: 30, midRange: 60, luxury: 150, touristScore: 92, bestSeason: 'Nov-Mar', warnings: [] },
  vietnam: { budget: 25, midRange: 50, luxury: 120, touristScore: 88, bestSeason: 'Mar-Avr, Sep-Nov', warnings: [] },
  indonesia: { budget: 30, midRange: 65, luxury: 180, touristScore: 90, bestSeason: 'Avr-Oct', warnings: [] },
  philippines: { budget: 28, midRange: 55, luxury: 140, touristScore: 85, bestSeason: 'Déc-Mai', warnings: [] },
  cambodia: { budget: 22, midRange: 45, luxury: 100, touristScore: 80, bestSeason: 'Nov-Mar', warnings: ['Infrastructure limitée'] },
  malaysia: { budget: 35, midRange: 70, luxury: 160, touristScore: 86, bestSeason: 'Toute l\'année', warnings: [] },
  
  // South Asia
  india: { budget: 20, midRange: 45, luxury: 100, touristScore: 85, bestSeason: 'Oct-Mar', warnings: ['Adaptation culturelle'] },
  sri_lanka: { budget: 30, midRange: 60, luxury: 130, touristScore: 82, bestSeason: 'Déc-Avr', warnings: [] },
  nepal: { budget: 22, midRange: 50, luxury: 110, touristScore: 80, bestSeason: 'Oct-Nov, Mar-Mai', warnings: ['Infrastructure limitée'] },
  
  // Eastern Europe - Good value
  poland: { budget: 40, midRange: 80, luxury: 180, touristScore: 82, bestSeason: 'Mai-Sep', warnings: [] },
  czech_republic: { budget: 50, midRange: 100, luxury: 220, touristScore: 88, bestSeason: 'Avr-Oct', warnings: [] },
  hungary: { budget: 45, midRange: 85, luxury: 190, touristScore: 85, bestSeason: 'Avr-Oct', warnings: [] },
  romania: { budget: 35, midRange: 70, luxury: 150, touristScore: 78, bestSeason: 'Mai-Sep', warnings: [] },
  croatia: { budget: 55, midRange: 110, luxury: 250, touristScore: 90, bestSeason: 'Mai-Sep', warnings: ['Haute saison très chère'] },
  bulgaria: { budget: 30, midRange: 60, luxury: 130, touristScore: 75, bestSeason: 'Mai-Sep', warnings: [] },
  
  // Latin America
  mexico: { budget: 35, midRange: 75, luxury: 170, touristScore: 90, bestSeason: 'Déc-Avr', warnings: ['Sécurité variable selon régions'] },
  colombia: { budget: 30, midRange: 65, luxury: 150, touristScore: 85, bestSeason: 'Déc-Mar, Juil-Août', warnings: [] },
  peru: { budget: 32, midRange: 70, luxury: 160, touristScore: 88, bestSeason: 'Mai-Sep', warnings: ['Altitude à Lima/Cusco'] },
  argentina: { budget: 28, midRange: 60, luxury: 140, touristScore: 85, bestSeason: 'Oct-Avr', warnings: ['Inflation'] },
  brazil: { budget: 38, midRange: 80, luxury: 190, touristScore: 88, bestSeason: 'Avr-Nov', warnings: ['Sécurité variable'] },
  costa_rica: { budget: 50, midRange: 100, luxury: 220, touristScore: 87, bestSeason: 'Déc-Avr', warnings: [] },
  chile: { budget: 45, midRange: 90, luxury: 200, touristScore: 82, bestSeason: 'Oct-Mar', warnings: [] },
  ecuador: { budget: 30, midRange: 60, luxury: 140, touristScore: 82, bestSeason: 'Toute l\'année', warnings: [] },
  
  // North Africa & Middle East
  morocco: { budget: 35, midRange: 70, luxury: 180, touristScore: 88, bestSeason: 'Mar-Mai, Sep-Nov', warnings: [] },
  egypt: { budget: 30, midRange: 60, luxury: 150, touristScore: 85, bestSeason: 'Oct-Avr', warnings: ['Sécurité variable'] },
  turkey: { budget: 40, midRange: 80, luxury: 180, touristScore: 90, bestSeason: 'Avr-Oct', warnings: [] },
  jordan: { budget: 50, midRange: 100, luxury: 220, touristScore: 82, bestSeason: 'Mar-Mai, Sep-Nov', warnings: [] },
  uae: { budget: 80, midRange: 160, luxury: 400, touristScore: 85, bestSeason: 'Nov-Mar', warnings: ['Très chaud en été'] },
  
  // Sub-Saharan Africa
  south_africa: { budget: 40, midRange: 85, luxury: 200, touristScore: 88, bestSeason: 'Sep-Mai', warnings: ['Sécurité variable'] },
  senegal: { budget: 35, midRange: 70, luxury: 160, touristScore: 75, bestSeason: 'Nov-Mai', warnings: [] },
  kenya: { budget: 50, midRange: 100, luxury: 250, touristScore: 85, bestSeason: 'Juin-Oct', warnings: [] },
  tanzania: { budget: 55, midRange: 110, luxury: 280, touristScore: 88, bestSeason: 'Juin-Oct', warnings: [] },
  mauritius: { budget: 70, midRange: 140, luxury: 350, touristScore: 90, bestSeason: 'Mai-Nov', warnings: [] },
  
  // Western Europe - Expensive
  france: { budget: 80, midRange: 160, luxury: 400, touristScore: 95, bestSeason: 'Mai-Sep', warnings: [] },
  spain: { budget: 60, midRange: 120, luxury: 300, touristScore: 94, bestSeason: 'Avr-Oct', warnings: [] },
  portugal: { budget: 55, midRange: 110, luxury: 280, touristScore: 92, bestSeason: 'Avr-Oct', warnings: [] },
  italy: { budget: 75, midRange: 150, luxury: 380, touristScore: 96, bestSeason: 'Avr-Oct', warnings: [] },
  germany: { budget: 70, midRange: 140, luxury: 350, touristScore: 88, bestSeason: 'Mai-Sep', warnings: [] },
  netherlands: { budget: 80, midRange: 160, luxury: 400, touristScore: 86, bestSeason: 'Avr-Oct', warnings: [] },
  belgium: { budget: 75, midRange: 150, luxury: 380, touristScore: 84, bestSeason: 'Mai-Sep', warnings: [] },
  uk: { budget: 90, midRange: 180, luxury: 450, touristScore: 90, bestSeason: 'Mai-Sep', warnings: [] },
  ireland: { budget: 85, midRange: 170, luxury: 420, touristScore: 88, bestSeason: 'Mai-Sep', warnings: [] },
  switzerland: { budget: 120, midRange: 240, luxury: 600, touristScore: 90, bestSeason: 'Toute l\'année', warnings: ['Très cher'] },
  austria: { budget: 80, midRange: 160, luxury: 400, touristScore: 88, bestSeason: 'Toute l\'année', warnings: [] },
  greece: { budget: 55, midRange: 110, luxury: 280, touristScore: 92, bestSeason: 'Mai-Oct', warnings: [] },
  
  // Nordics
  sweden: { budget: 100, midRange: 200, luxury: 500, touristScore: 85, bestSeason: 'Mai-Sep', warnings: ['Très cher'] },
  norway: { budget: 120, midRange: 240, luxury: 600, touristScore: 88, bestSeason: 'Mai-Sep', warnings: ['Le plus cher d\'Europe'] },
  denmark: { budget: 100, midRange: 200, luxury: 500, touristScore: 85, bestSeason: 'Mai-Sep', warnings: ['Très cher'] },
  finland: { budget: 95, midRange: 190, luxury: 480, touristScore: 82, bestSeason: 'Juin-Août, Déc-Mar', warnings: [] },
  iceland: { budget: 130, midRange: 260, luxury: 650, touristScore: 88, bestSeason: 'Juin-Août', warnings: ['Extrêmement cher'] },
  
  // Asia developed
  japan: { budget: 70, midRange: 140, luxury: 350, touristScore: 95, bestSeason: 'Mar-Mai, Sep-Nov', warnings: [] },
  south_korea: { budget: 60, midRange: 120, luxury: 300, touristScore: 88, bestSeason: 'Avr-Juin, Sep-Nov', warnings: [] },
  singapore: { budget: 80, midRange: 160, luxury: 400, touristScore: 88, bestSeason: 'Toute l\'année', warnings: ['Cher'] },
  taiwan: { budget: 40, midRange: 80, luxury: 200, touristScore: 85, bestSeason: 'Avr-Juin, Sep-Nov', warnings: [] },
  
  // Oceania
  australia: { budget: 90, midRange: 180, luxury: 450, touristScore: 92, bestSeason: 'Sep-Nov, Mar-Mai', warnings: ['Grandes distances'] },
  new_zealand: { budget: 85, midRange: 170, luxury: 420, touristScore: 90, bestSeason: 'Déc-Fév', warnings: [] },
  fiji: { budget: 80, midRange: 160, luxury: 400, touristScore: 85, bestSeason: 'Mai-Nov', warnings: [] },
  
  // North America
  usa: { budget: 90, midRange: 180, luxury: 450, touristScore: 92, bestSeason: 'Variable', warnings: ['Très grand pays'] },
  canada: { budget: 85, midRange: 170, luxury: 420, touristScore: 90, bestSeason: 'Juin-Sep', warnings: ['Grands espaces'] },
};

/**
 * Get vacation recommendations based on purchasing power
 */
export function getVacationRecommendations(
  currentCountryId: string,
  nationalityIds: string[],
  professionId: string,
  budgetLevel: 'budget' | 'midRange' | 'luxury' = 'midRange'
): VacationDestination[] {
  const monthlySalary = getEstimatedSalary(currentCountryId, professionId);
  if (monthlySalary === 0) return [];
  
  // Get nationality advantages for visa access
  const { combinedBlocs, strongestPassport } = getNationalityAdvantages(nationalityIds);
  
  const destinations: VacationDestination[] = [];
  
  for (const [destId, costData] of Object.entries(VACATION_DAILY_COSTS)) {
    // Skip current country for international
    if (destId === currentCountryId) continue;
    
    const countryInfo = COUNTRY_NAMES[destId];
    if (!countryInfo) continue;
    
    const dailyCost = costData[budgetLevel];
    
    // Calculate purchasing power index
    // Higher salary + lower destination cost = higher index
    const purchasingPowerIndex = Math.round((monthlySalary / dailyCost) * 10);
    
    // How many days can you afford with 1 month salary
    const stayDurationAffordable = Math.round(monthlySalary / dailyCost);
    
    // Determine access type based on nationality
    let accessType: VacationDestination['accessType'] = 'requires_visa';
    let accessNote: string | undefined;
    
    // Check bloc access
    for (const bloc of combinedBlocs) {
      const blocData = REGIONAL_BLOCS[bloc];
      if (blocData && blocData.members.includes(destId)) {
        accessType = 'visa_free';
        accessNote = `Accès ${blocData.name}`;
        break;
      }
    }
    
    // Check if strong passport gives easy access
    if (accessType === 'requires_visa' && strongestPassport) {
      if (strongestPassport.visaFreeCount >= 180) {
        accessType = 'visa_on_arrival';
        accessNote = 'Visa à l\'arrivée probable';
      } else if (strongestPassport.visaFreeCount >= 120) {
        accessType = 'easy_visa';
        accessNote = 'Visa électronique disponible';
      }
    }
    
    // Check specific nationality profile advantages
    for (const natId of nationalityIds) {
      const natProfile = NATIONALITY_PROFILES[natId];
      if (!natProfile) continue;
      
      // Same regional bloc
      for (const bloc of natProfile.regionalBlocs) {
        const blocData = REGIONAL_BLOCS[bloc];
        if (blocData && blocData.members.includes(destId)) {
          accessType = 'visa_free';
          accessNote = `Libre circulation ${blocData.name}`;
          break;
        }
      }
    }
    
    // Build reasons
    const reasons: string[] = [];
    
    if (purchasingPowerIndex >= 50) {
      reasons.push(`Excellent rapport qualité/prix`);
    } else if (purchasingPowerIndex >= 30) {
      reasons.push(`Bon rapport qualité/prix`);
    }
    
    if (stayDurationAffordable >= 30) {
      reasons.push(`${stayDurationAffordable} jours possibles avec 1 mois de salaire`);
    } else if (stayDurationAffordable >= 14) {
      reasons.push(`2 semaines accessibles`);
    }
    
    if (costData.touristScore >= 90) {
      reasons.push('Destination touristique majeure');
    }
    
    if (accessType === 'visa_free') {
      reasons.push('Sans visa');
    }
    
    reasons.push(`Meilleure période: ${costData.bestSeason}`);
    
    // Find country safety data
    const countryData = countries.find(c => c.id === destId);
    const safetyScore = countryData?.qualityOfLife?.safetyIndex || 50;
    
    destinations.push({
      countryId: destId,
      countryName: countryInfo.name,
      flag: countryInfo.flag,
      purchasingPowerIndex,
      dailyBudgetLocal: dailyCost,
      stayDurationAffordable,
      accessType,
      accessNote,
      tourismScore: costData.touristScore,
      safetyScore,
      bestTimeToVisit: costData.bestSeason,
      reasons,
      warnings: costData.warnings,
    });
  }
  
  // Sort by purchasing power index (best value first)
  return destinations.sort((a, b) => b.purchasingPowerIndex - a.purchasingPowerIndex);
}

/**
 * Get top vacation destinations with different strategies
 */
export function getSmartVacationRecommendations(
  currentCountryId: string,
  nationalityIds: string[],
  professionId: string,
  preferences?: {
    prioritizeSafety?: boolean;
    prioritizeTourism?: boolean;
    maxBudgetPerDay?: number;
    preferVisaFree?: boolean;
  }
): {
  bestValue: VacationDestination[];
  safestOptions: VacationDestination[];
  visaFreeOptions: VacationDestination[];
  hiddenGems: VacationDestination[];
} {
  const all = getVacationRecommendations(currentCountryId, nationalityIds, professionId, 'midRange');
  
  // Best value - highest purchasing power
  const bestValue = [...all]
    .filter(d => d.accessType !== 'requires_visa')
    .slice(0, 5);
  
  // Safest options - high safety + good value
  const safestOptions = [...all]
    .filter(d => d.safetyScore >= 60 && d.accessType !== 'requires_visa')
    .sort((a, b) => (b.safetyScore + b.purchasingPowerIndex) - (a.safetyScore + a.purchasingPowerIndex))
    .slice(0, 5);
  
  // Visa-free only
  const visaFreeOptions = [...all]
    .filter(d => d.accessType === 'visa_free')
    .slice(0, 5);
  
  // Hidden gems - good value + less touristy
  const hiddenGems = [...all]
    .filter(d => d.tourismScore < 85 && d.purchasingPowerIndex >= 30 && d.safetyScore >= 50)
    .slice(0, 5);
  
  return {
    bestValue,
    safestOptions,
    visaFreeOptions,
    hiddenGems,
  };
}

/**
 * Get domestic vacation options (within same country)
 */
export function getDomesticVacationOptions(countryId: string): DomesticDestination[] {
  const DOMESTIC_DESTINATIONS: Record<string, DomesticDestination[]> = {
    france: [
      { region: 'Bretagne', city: 'Saint-Malo', purchasingPowerIndex: 75, dailyBudget: 80, reasons: ['Côte sauvage', 'Gastronomie', 'Prix modérés'] },
      { region: 'Occitanie', city: 'Toulouse', purchasingPowerIndex: 80, dailyBudget: 70, reasons: ['Ville rose', 'Sud-Ouest', 'Prix attractifs'] },
      { region: 'Auvergne', city: 'Clermont-Ferrand', purchasingPowerIndex: 90, dailyBudget: 55, reasons: ['Nature', 'Volcans', 'Très abordable'] },
      { region: 'Alsace', city: 'Strasbourg', purchasingPowerIndex: 70, dailyBudget: 90, reasons: ['Charme', 'Marchés de Noël', 'Culture'] },
      { region: 'Corse', city: 'Ajaccio', purchasingPowerIndex: 50, dailyBudget: 120, reasons: ['Plages', 'Montagne', 'Dépaysement'] },
    ],
    germany: [
      { region: 'Saxe', city: 'Dresden', purchasingPowerIndex: 85, dailyBudget: 70, reasons: ['Architecture', 'Culture', 'Prix modérés'] },
      { region: 'Bavière', city: 'Munich', purchasingPowerIndex: 60, dailyBudget: 110, reasons: ['Culture bavaroise', 'Bière', 'Nature'] },
      { region: 'Thuringe', city: 'Weimar', purchasingPowerIndex: 90, dailyBudget: 55, reasons: ['Histoire', 'Culture', 'Très abordable'] },
    ],
    usa: [
      { region: 'Midwest', city: 'Chicago', purchasingPowerIndex: 70, dailyBudget: 130, reasons: ['Architecture', 'Culture', 'Prix moyens'] },
      { region: 'Southwest', city: 'Santa Fe', purchasingPowerIndex: 80, dailyBudget: 100, reasons: ['Art', 'Nature', 'Prix modérés'] },
      { region: 'South', city: 'New Orleans', purchasingPowerIndex: 75, dailyBudget: 110, reasons: ['Musique', 'Gastronomie', 'Culture unique'] },
    ],
    uk: [
      { region: 'Écosse', city: 'Edinburgh', purchasingPowerIndex: 65, dailyBudget: 120, reasons: ['Histoire', 'Nature', 'Festivals'] },
      { region: 'Wales', city: 'Cardiff', purchasingPowerIndex: 80, dailyBudget: 90, reasons: ['Châteaux', 'Nature', 'Prix modérés'] },
      { region: 'Yorkshire', city: 'York', purchasingPowerIndex: 75, dailyBudget: 100, reasons: ['Histoire médiévale', 'Thé', 'Charme'] },
    ],
  };
  
  return DOMESTIC_DESTINATIONS[countryId] || [];
}

/**
 * Compare two destinations for vacation
 */
export function compareVacationDestinations(
  dest1: VacationDestination,
  dest2: VacationDestination
): {
  winner: 'dest1' | 'dest2' | 'tie';
  valueWinner: 'dest1' | 'dest2' | 'tie';
  safetyWinner: 'dest1' | 'dest2' | 'tie';
  accessWinner: 'dest1' | 'dest2' | 'tie';
  summary: string;
} {
  const valueDiff = dest1.purchasingPowerIndex - dest2.purchasingPowerIndex;
  const safetyDiff = dest1.safetyScore - dest2.safetyScore;
  
  const accessRank = { 'visa_free': 4, 'visa_on_arrival': 3, 'easy_visa': 2, 'requires_visa': 1 };
  const accessDiff = accessRank[dest1.accessType] - accessRank[dest2.accessType];
  
  let score1 = 0, score2 = 0;
  
  const valueWinner = valueDiff > 5 ? 'dest1' : valueDiff < -5 ? 'dest2' : 'tie';
  const safetyWinner = safetyDiff > 5 ? 'dest1' : safetyDiff < -5 ? 'dest2' : 'tie';
  const accessWinner = accessDiff > 0 ? 'dest1' : accessDiff < 0 ? 'dest2' : 'tie';
  
  if (valueWinner === 'dest1') score1++;
  if (valueWinner === 'dest2') score2++;
  if (safetyWinner === 'dest1') score1++;
  if (safetyWinner === 'dest2') score2++;
  if (accessWinner === 'dest1') score1++;
  if (accessWinner === 'dest2') score2++;
  
  const winner = score1 > score2 ? 'dest1' : score2 > score1 ? 'dest2' : 'tie';
  
  const summary = winner === 'tie' 
    ? `${dest1.countryName} et ${dest2.countryName} sont équivalents selon vos critères`
    : winner === 'dest1'
      ? `${dest1.countryName} offre un meilleur rapport global pour votre situation`
      : `${dest2.countryName} offre un meilleur rapport global pour votre situation`;
  
  return { winner, valueWinner, safetyWinner, accessWinner, summary };
}
