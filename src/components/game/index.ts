// Game components index - v7.0.3
// Core exports for game module

// Already working exports (named)
export { DecisionJournalExport } from './DecisionJournalExport';
export { MultiplayerLobby } from './MultiplayerLobby';
export { GameTutorial } from './GameTutorial';
export { default as GameLeaderboard } from './GameLeaderboard';
export { GameAchievements } from './GameAchievements';

// Default exports re-exported
export { default as TutorialMode } from './TutorialMode';
export { default as GameEndSummary } from './GameEndSummary';
export { default as GameVisualFeedback } from './GameVisualFeedback';
export { default as ArchetypeSelector } from './ArchetypeSelector';
export { default as CharacterCard } from './CharacterCard';
export { default as CharacterDraft } from './CharacterDraft';
export { default as ResourceBar } from './ResourceBar';
export { default as TurnManager } from './TurnManager';
export { default as TurnPhaseHelper } from './TurnPhaseHelper';
export { default as ActionPanel } from './ActionPanel';
export { default as DicePrompt } from './DicePrompt';
export { default as QuestTracker } from './QuestTracker';
export { default as EventCard } from './EventCard';
export { default as EventCardWithChoices } from './EventCardWithChoices';
export { default as RiskEventCard } from './RiskEventCard';
export { default as FamilyEventCard } from './FamilyEventCard';
export { default as ReunionMode } from './ReunionMode';
export { default as ReunionGameBoard } from './ReunionGameBoard';
export { default as SavedGamesDialog } from './SavedGamesDialog';
export { default as RulesDialog } from './RulesDialog';
export { default as CurrentPlayerInfo } from './CurrentPlayerInfo';
export { default as FamilyStatusSelector } from './FamilyStatusSelector';
export { default as LifeAssignment } from './LifeAssignment';
export { default as StrategicChoiceCard } from './StrategicChoiceCard';
export { default as PlayerProfileSetup } from './PlayerProfile';

// Named exports from GameVisualEffects
export { 
  ResultEffect, 
  Dice3D, 
  AnimatedResourceBar, 
  TurnNotification, 
  MilestoneCard, 
  ParticleExplosion 
} from './GameVisualEffects';

// Panel exports
export { AchievementsPanel } from './AchievementsPanel';
export { AchievementUnlockToast } from './AchievementUnlockToast';
export { AdaptiveDifficultyEngine } from './AdaptiveDifficultyEngine';
export { AdaptiveScenarioEngine } from './AdaptiveScenarioEngine';
export { AdvancedGameStats } from './AdvancedGameStats';
export { DecisionJournalViewer } from './DecisionJournalViewer';
export { ReplayMode } from './ReplayMode';
