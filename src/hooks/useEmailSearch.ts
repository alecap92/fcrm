import { useState, useCallback, useMemo, useRef } from "react";
import { useEmail } from "../contexts/EmailContext";
import { EmailSearchQuery, EmailFilters, Email } from "../types/email";

// Función debounce simple para evitar dependencia de lodash
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout;

  const debouncedFunction = ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T & { cancel: () => void };

  debouncedFunction.cancel = () => {
    clearTimeout(timeoutId);
  };

  return debouncedFunction;
}

/**
 * Hook personalizado para búsqueda avanzada de correos
 */
export function useEmailSearch() {
  const { state, searchEmails, setSearchQuery, loadEmails } = useEmail();
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Email[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Búsqueda con debounce para evitar demasiadas llamadas
  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: EmailSearchQuery) => {
        if (!query.text && !query.from && !query.to && !query.subject) {
          setSearchResults([]);
          setHasSearched(false);
          return;
        }

        setIsSearching(true);
        try {
          await searchEmails(query);
          // Los resultados se actualizan automáticamente a través del contexto
          setHasSearched(true);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300),
    [searchEmails]
  );

  // Búsqueda simple por texto
  const handleSimpleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);

      if (text.trim()) {
        debouncedSearch({ text: text.trim() });
      } else {
        clearSearch();
      }
    },
    [setSearchQuery, debouncedSearch]
  );

  // Búsqueda avanzada
  const handleAdvancedSearch = useCallback(
    (query: EmailSearchQuery) => {
      debouncedSearch(query);
    },
    [debouncedSearch]
  );

  // Limpiar búsqueda
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setIsSearching(false);
    debouncedSearch.cancel();

    // Recargar correos de la carpeta actual
    loadEmails();
  }, [setSearchQuery, loadEmails, debouncedSearch]);

  // Filtros predefinidos
  const searchUnreadEmails = useCallback(() => {
    handleAdvancedSearch({
      folder: state.currentFolder,
      isRead: false,
    });
  }, [handleAdvancedSearch, state.currentFolder]);

  const searchStarredEmails = useCallback(() => {
    handleAdvancedSearch({
      folder: state.currentFolder,
      isStarred: true,
    });
  }, [handleAdvancedSearch, state.currentFolder]);

  const searchEmailsWithAttachments = useCallback(() => {
    handleAdvancedSearch({
      folder: state.currentFolder,
      hasAttachments: true,
    });
  }, [handleAdvancedSearch, state.currentFolder]);

  const searchEmailsByPriority = useCallback(
    (priority: "low" | "normal" | "high") => {
      handleAdvancedSearch({
        folder: state.currentFolder,
        priority,
      });
    },
    [handleAdvancedSearch, state.currentFolder]
  );

  const searchEmailsByDateRange = useCallback(
    (start: string, end: string) => {
      handleAdvancedSearch({
        folder: state.currentFolder,
        dateRange: { start, end },
      });
    },
    [handleAdvancedSearch, state.currentFolder]
  );

  const searchEmailsByLabel = useCallback(
    (labels: string[]) => {
      handleAdvancedSearch({
        folder: state.currentFolder,
        labels,
      });
    },
    [handleAdvancedSearch, state.currentFolder]
  );

  // Búsquedas rápidas por remitente
  const searchEmailsFromSender = useCallback(
    (from: string) => {
      handleAdvancedSearch({
        folder: state.currentFolder,
        from,
      });
    },
    [handleAdvancedSearch, state.currentFolder]
  );

  // Búsquedas por palabras clave en asunto
  const searchEmailsBySubject = useCallback(
    (subject: string) => {
      handleAdvancedSearch({
        folder: state.currentFolder,
        subject,
      });
    },
    [handleAdvancedSearch, state.currentFolder]
  );

  // Obtener sugerencias de búsqueda basadas en correos existentes
  const getSearchSuggestions = useCallback(
    (query: string): string[] => {
      if (!query || query.length < 2) return [];

      const suggestions = new Set<string>();
      const lowerQuery = query.toLowerCase();

      state.emails.forEach((email) => {
        // Sugerencias de remitentes
        if (email.from.toLowerCase().includes(lowerQuery)) {
          suggestions.add(email.from);
        }

        // Sugerencias de asuntos
        if (email.subject.toLowerCase().includes(lowerQuery)) {
          const words = email.subject
            .split(" ")
            .filter(
              (word) =>
                word.toLowerCase().includes(lowerQuery) && word.length > 2
            );
          words.forEach((word) => suggestions.add(word));
        }

        // Sugerencias de etiquetas
        email.labels.forEach((label) => {
          if (label.toLowerCase().includes(lowerQuery)) {
            suggestions.add(label);
          }
        });
      });

      return Array.from(suggestions).slice(0, 10);
    },
    [state.emails]
  );

  // Estadísticas de búsqueda
  const searchStats = useMemo(() => {
    if (!hasSearched) return null;

    return {
      totalResults: searchResults.length,
      unreadResults: searchResults.filter((email) => !email.isRead).length,
      starredResults: searchResults.filter((email) => email.isStarred).length,
      withAttachments: searchResults.filter((email) => email.hasAttachments)
        .length,
    };
  }, [searchResults, hasSearched]);

  return {
    // Estado
    isSearching,
    searchResults: hasSearched ? searchResults : state.emails,
    hasSearched,
    searchQuery: state.searchQuery,
    searchStats,

    // Funciones de búsqueda
    simpleSearch: handleSimpleSearch,
    advancedSearch: handleAdvancedSearch,
    clearSearch,

    // Filtros predefinidos
    searchUnread: searchUnreadEmails,
    searchStarred: searchStarredEmails,
    searchWithAttachments: searchEmailsWithAttachments,
    searchByPriority: searchEmailsByPriority,
    searchByDateRange: searchEmailsByDateRange,
    searchByLabel: searchEmailsByLabel,
    searchFromSender: searchEmailsFromSender,
    searchBySubject: searchEmailsBySubject,

    // Utilidades
    getSuggestions: getSearchSuggestions,
  };
}
