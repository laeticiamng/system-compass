/**
 * Expert Marketplace Pagination Component
 */
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpertPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export function ExpertPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}: ExpertPaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between pt-6">
      <p className="text-sm text-muted-foreground">
        Affichage de {startItem}-{endItem} sur {totalItems} experts
      </p>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
          Précédent
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            // Show first, last, current, and neighbors
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className={cn(
                    "w-9",
                    currentPage === page && "pointer-events-none"
                  )}
                >
                  {page}
                </Button>
              );
            }
            
            // Show ellipsis
            if (page === currentPage - 2 || page === currentPage + 2) {
              return (
                <span key={page} className="px-2 text-muted-foreground">
                  ...
                </span>
              );
            }
            
            return null;
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Suivant
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
