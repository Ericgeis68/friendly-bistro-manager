import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="mb-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher..."
          className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 text-gray-800"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
      </div>
    </div>
  );
};

export default SearchBar;
