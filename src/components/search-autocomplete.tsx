'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Search, Clock, TrendingUp, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchSuggestion {
  id: string
  text: string
  type: 'recent' | 'popular' | 'package' | 'travel'
  count?: number
}

interface SearchAutocompleteProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export function SearchAutocomplete({ 
  onSearch, 
  placeholder = 'Cari paket atau travel...', 
  className = '' 
}: SearchAutocompleteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [popularSearches] = useState<SearchSuggestion[]>([
    { id: '1', text: 'Umroh Murah', type: 'popular', count: 245 },
    { id: '2', text: 'Paket Ramadhan', type: 'popular', count: 189 },
    { id: '3', text: 'Umroh Plus Turki', type: 'popular', count: 156 },
    { id: '4', text: 'Umroh Desember', type: 'popular', count: 134 },
    { id: '5', text: 'Umroh Keluarga', type: 'popular', count: 98 }
  ])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update suggestions based on query
  useEffect(() => {
    if (query.trim() === '') {
      // Show recent and popular searches
      const recent: SearchSuggestion[] = recentSearches.slice(0, 3).map((text, index) => ({
        id: `recent-${index}`,
        text,
        type: 'recent'
      }))
      setSuggestions([...recent, ...popularSearches.slice(0, 5)])
    } else {
      // Filter popular searches based on query
      const filtered = popularSearches.filter(s =>
        s.text.toLowerCase().includes(query.toLowerCase())
      )
      setSuggestions(filtered)
    }
  }, [query, recentSearches, popularSearches])

  const saveRecentSearch = (searchText: string) => {
    const updated = [
      searchText,
      ...recentSearches.filter(s => s !== searchText)
    ].slice(0, 10) // Keep only last 10 searches
    
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const handleSearch = (searchText: string) => {
    if (searchText.trim()) {
      saveRecentSearch(searchText)
      onSearch(searchText)
      setIsOpen(false)
      setQuery(searchText)
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    handleSearch(suggestion.text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  const removeRecentSearch = (searchText: string) => {
    const updated = recentSearches.filter(s => s !== searchText)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 md:w-5 md:h-5" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 md:pl-12 pr-10 h-10 md:h-12"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Recent Searches */}
          {query === '' && recentSearches.length > 0 && (
            <div className="border-b border-border">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-xs font-semibold text-muted-foreground">Pencarian Terakhir</span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-primary hover:underline"
                >
                  Hapus Semua
                </button>
              </div>
              {suggestions
                .filter(s => s.type === 'recent')
                .map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left group"
                  >
                    <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="flex-1 text-sm">{suggestion.text}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeRecentSearch(suggestion.text)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </button>
                ))}
            </div>
          )}

          {/* Popular Searches */}
          {suggestions.filter(s => s.type === 'popular').length > 0 && (
            <div>
              <div className="px-4 py-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  {query ? 'Hasil Pencarian' : 'Pencarian Populer'}
                </span>
              </div>
              {suggestions
                .filter(s => s.type === 'popular')
                .map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                  >
                    <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="flex-1 text-sm font-medium">{suggestion.text}</span>
                    {suggestion.count && (
                      <span className="text-xs text-muted-foreground">{suggestion.count} pencarian</span>
                    )}
                  </button>
                ))}
            </div>
          )}

          {/* No Results */}
          {query && suggestions.length === 0 && (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <p className="text-sm">Tidak ada hasil untuk "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
