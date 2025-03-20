import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '../../ui/button';

type FilterType = 'all' | 'drinks' | 'meals';

interface FilterBarProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filter, setFilter }) => {
  return (
    <div className="mb-4 grid grid-cols-3 gap-2">
      <Button
        variant={filter === 'all' ? 'default' : 'outline'}
        onClick={() => setFilter('all')}
      >
        <Filter size={16} className="mr-2" />
        Tout
      </Button>
      <Button
        variant={filter === 'drinks' ? 'default' : 'outline'}
        onClick={() => setFilter('drinks')}
        className="bg-blue-100 text-blue-800 hover:bg-blue-200"
      >
        <Filter size={16} className="mr-2" />
        Boissons
      </Button>
      <Button
        variant={filter === 'meals' ? 'default' : 'outline'}
        onClick={() => setFilter('meals')}
        className="bg-orange-100 text-orange-800 hover:bg-orange-200"
      >
        <Filter size={16} className="mr-2" />
        Repas
      </Button>
    </div>
  );
};

export default FilterBar;
