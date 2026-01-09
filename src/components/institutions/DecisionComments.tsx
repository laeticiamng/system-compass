import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Trash2, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Comment {
  id: string;
  decision_id: string;
  user_id: string;
  content: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

interface DecisionCommentsProps {
  decisionId: string;
  decisionTitle: string;
}

export function DecisionComments({ decisionId, decisionTitle }: DecisionCommentsProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, [decisionId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('traceos_comments')
        .select('*')
        .eq('decision_id', decisionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('traceos_comments')
        .insert({
          decision_id: decisionId,
          user_id: user.id,
          content: newComment.trim(),
          author_name: user.email?.split('@')[0] || 'Utilisateur'
        });

      if (error) throw error;

      setNewComment('');
      await fetchComments();
      toast.success(t('traceos.comments.added', 'Commentaire ajouté'));
    } catch (err) {
      console.error('Error adding comment:', err);
      toast.error(t('traceos.comments.error', 'Erreur lors de l\'ajout'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('traceos_comments')
        .update({ content: editContent.trim(), updated_at: new Date().toISOString() })
        .eq('id', commentId);

      if (error) throw error;

      setEditingId(null);
      await fetchComments();
      toast.success(t('traceos.comments.updated', 'Commentaire modifié'));
    } catch (err) {
      console.error('Error updating comment:', err);
      toast.error(t('traceos.comments.error', 'Erreur lors de la modification'));
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('traceos_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      await fetchComments();
      toast.success(t('traceos.comments.deleted', 'Commentaire supprimé'));
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error(t('traceos.comments.error', 'Erreur lors de la suppression'));
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          {t('traceos.comments.title', 'Commentaires')}
          <span className="text-muted-foreground">({comments.length})</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground truncate">{decisionTitle}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-64 pr-4">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">
              {t('common.loading', 'Chargement...')}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {t('traceos.comments.empty', 'Aucun commentaire')}
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10">
                      {comment.author_name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{comment.author_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), 'dd MMM HH:mm', { locale: fr })}
                      </span>
                    </div>
                    {editingId === comment.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-16 text-sm"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleEdit(comment.id)}>
                            <Check className="h-3 w-3 mr-1" />
                            {t('common.save', 'Sauver')}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelEditing}>
                            <X className="h-3 w-3 mr-1" />
                            {t('common.cancel', 'Annuler')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">{comment.content}</p>
                        {user?.id === comment.user_id && (
                          <div className="flex gap-1 pt-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                              onClick={() => startEditing(comment)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(comment.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {user && (
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t('traceos.comments.placeholder', 'Ajouter un commentaire...')}
              className="min-h-16 text-sm"
            />
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={!newComment.trim() || submitting}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
