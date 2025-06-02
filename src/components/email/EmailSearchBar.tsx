import React, { useState } from "react";
import { useEmailSearch } from "../../hooks/useEmailSearch";
import { Search, X, Filter } from "lucide-react";
import { Button } from "../ui/button";

export function EmailSearchBar() {
  const {
    searchQuery,
    simpleSearch,
    clearSearch,
    isSearching,
    hasSearched,
    getSuggestions,
  } = useEmailSearch();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleInputChange = (value: string) => {
    simpleSearch(value);

    if (value.length > 1) {
      const newSuggestions = getSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    simpleSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    clearSearch();
    setShowSuggestions(false);
  };

  return (
    <div className="p-4 border-b bg-white relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar correos..."
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            // Delay para permitir clicks en sugerencias
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          className="w-full pl-10 pr-20 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {isSearching && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          )}

          {hasSearched && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="p-1 h-6 w-6"
            >
              <X className="w-3 h-3" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6"
            title="Filtros avanzados"
          >
            <Filter className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Sugerencias */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
          <div className="py-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700"
              >
                <Search className="w-3 h-3 inline mr-2 text-gray-400" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
