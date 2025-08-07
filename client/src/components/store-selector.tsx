import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Store, X } from 'lucide-react';

interface StoreData {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
}

interface StoreSelectorProps {
  selectedStores: number[];
  onStoreChange: (storeIds: number[]) => void;
  className?: string;
  multiSelect?: boolean;
}

export function StoreSelector({ 
  selectedStores, 
  onStoreChange, 
  className,
  multiSelect = true 
}: StoreSelectorProps) {
  const { data: stores = [] } = useQuery<StoreData[]>({
    queryKey: ['/api/stores'],
  });

  const handleStoreSelect = (storeId: string) => {
    const id = parseInt(storeId);
    
    if (multiSelect) {
      if (selectedStores.includes(id)) {
        onStoreChange(selectedStores.filter(s => s !== id));
      } else {
        onStoreChange([...selectedStores, id]);
      }
    } else {
      onStoreChange([id]);
    }
  };

  const removeStore = (storeId: number) => {
    onStoreChange(selectedStores.filter(s => s !== storeId));
  };

  const clearAll = () => {
    onStoreChange([]);
  };

  const selectAll = () => {
    onStoreChange(stores.map(store => store.id));
  };

  const getStoreName = (storeId: number) => {
    const store = stores.find(s => s.id === storeId);
    return store?.name || `Loja ${storeId}`;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Filtrar por Lojas</span>
        </div>
        
        {multiSelect && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              disabled={selectedStores.length === stores.length}
            >
              Todas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={selectedStores.length === 0}
            >
              Limpar
            </Button>
          </div>
        )}
      </div>

      <Select onValueChange={handleStoreSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione uma loja..." />
        </SelectTrigger>
        <SelectContent>
          {stores.map((store) => (
            <SelectItem 
              key={store.id} 
              value={store.id.toString()}
              disabled={multiSelect && selectedStores.includes(store.id)}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{store.name}</span>
                <span className="text-muted-foreground">- {store.address}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Selected stores display */}
      {selectedStores.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Lojas selecionadas ({selectedStores.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedStores.map((storeId) => (
              <Badge
                key={storeId}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1"
              >
                <span className="text-xs">{getStoreName(storeId)}</span>
                {multiSelect && (
                  <button
                    onClick={() => removeStore(storeId)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}