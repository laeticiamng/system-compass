import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tag as TagIcon, Plus, X, Check, Palette } from 'lucide-react';
import { useTraceOSTags, Tag } from '@/hooks/useTraceOSTags';

const TAG_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
];

interface TagManagerProps {
  decisionId?: string;
  selectedTags?: Tag[];
  onTagsChange?: (tags: Tag[]) => void;
  compact?: boolean;
}

export function TagManager({ decisionId, selectedTags = [], onTagsChange, compact }: TagManagerProps) {
  const { t } = useTranslation();
  const { tags, createTag, addTagToDecision, removeTagFromDecision } = useTraceOSTags();
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    const tag = await createTag(newTagName.trim(), newTagColor);
    if (tag) {
      setNewTagName('');
      setNewTagColor(TAG_COLORS[0]);
      setIsCreating(false);
    }
  };

  const handleToggleTag = async (tag: Tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    
    if (decisionId) {
      if (isSelected) {
        await removeTagFromDecision(decisionId, tag.id);
        onTagsChange?.(selectedTags.filter(t => t.id !== tag.id));
      } else {
        await addTagToDecision(decisionId, tag.id);
        onTagsChange?.([...selectedTags, tag]);
      }
    } else {
      if (isSelected) {
        onTagsChange?.(selectedTags.filter(t => t.id !== tag.id));
      } else {
        onTagsChange?.([...selectedTags, tag]);
      }
    }
  };

  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <TagIcon className="h-4 w-4" />
            {t('traceos.tags.manage', 'Tags')}
            {selectedTags.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5">
                {selectedTags.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{t('traceos.tags.title', 'Tags')}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreating(true)}
                className="h-7 px-2"
              >
                <Plus className="h-3 w-3 mr-1" />
                {t('traceos.tags.new', 'Nouveau')}
              </Button>
            </div>

            {isCreating && (
              <div className="space-y-2 p-2 bg-muted/50 rounded-lg">
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder={t('traceos.tags.namePlaceholder', 'Nom du tag')}
                  className="h-8"
                />
                <div className="flex items-center gap-1 flex-wrap">
                  {TAG_COLORS.map(color => (
                    <button
                      key={color}
                      className={`w-5 h-5 rounded-full border-2 ${
                        newTagColor === color ? 'border-foreground' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewTagColor(color)}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreateTag} disabled={!newTagName.trim()}>
                    <Check className="h-3 w-3 mr-1" />
                    {t('common.save', 'Créer')}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)}>
                    {t('common.cancel', 'Annuler')}
                  </Button>
                </div>
              </div>
            )}

            <ScrollArea className="max-h-48">
              <div className="space-y-1">
                {tags.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {t('traceos.tags.empty', 'Aucun tag créé')}
                  </p>
                ) : (
                  tags.map(tag => {
                    const isSelected = selectedTags.some(t => t.id === tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => handleToggleTag(tag)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-sm transition-colors ${
                          isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="flex-1 truncate">{tag.name}</span>
                        {isSelected && <Check className="h-3 w-3 text-primary" />}
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <TagIcon className="h-4 w-4" />
            {t('traceos.tags.title', 'Tags')}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreating(!isCreating)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCreating && (
          <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder={t('traceos.tags.namePlaceholder', 'Nom du tag')}
            />
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-1 flex-wrap">
                {TAG_COLORS.map(color => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      newTagColor === color ? 'border-foreground scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTagColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateTag} disabled={!newTagName.trim()}>
                {t('traceos.tags.create', 'Créer le tag')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)}>
                {t('common.cancel', 'Annuler')}
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {tags.map(tag => {
            const isSelected = selectedTags.some(t => t.id === tag.id);
            return (
              <Badge
                key={tag.id}
                variant={isSelected ? 'default' : 'outline'}
                className="cursor-pointer transition-all hover:scale-105"
                style={{
                  backgroundColor: isSelected ? tag.color : 'transparent',
                  borderColor: tag.color,
                  color: isSelected ? 'white' : tag.color
                }}
                onClick={() => handleToggleTag(tag)}
              >
                {tag.name}
                {isSelected && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            );
          })}
          {tags.length === 0 && !isCreating && (
            <p className="text-sm text-muted-foreground">
              {t('traceos.tags.empty', 'Aucun tag créé')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface TagBadgesProps {
  tags: Tag[];
  size?: 'sm' | 'default';
}

export function TagBadges({ tags, size = 'default' }: TagBadgesProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map(tag => (
        <Badge
          key={tag.id}
          variant="outline"
          className={size === 'sm' ? 'text-[10px] px-1.5 py-0' : ''}
          style={{
            borderColor: tag.color,
            color: tag.color,
            backgroundColor: `${tag.color}10`
          }}
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  );
}
