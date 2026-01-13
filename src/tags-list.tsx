import React, { useState, useRef, useEffect } from 'react'

import { XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"

/*
 * @property tags - 親コンポーネントから与えられた補完対象のリスト
 */
interface TagsListProps {
  tags: string[]
  setSelectedTags(selected: string[]): void
}

/**
 * タグの補完入力を行うコンポーネント
 * 親からプロパティとして与えられた文字列の配列を対象にinputの入力をクエリとしてfuzzy matchを行う
 * 候補はツールチップとして表示しinputにフォーカスがある状態のままカーソルキーなどで選択が可能
 * 確定した候補はバッジとして横並べflexで並べて表示
 * 確定したアイテムのバッジはクリックで除去
 */
export function TagsList(props: TagsListProps = {
  tags: [],
  setSelectedTags: () => { }
}) {
  const [inputValue, setInputValue] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [filteredTags, setFilteredTags] = useState<string[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Fuzzy match implementation
  const fuzzyMatch = (query: string, target: string): boolean => {
    if (!query) return true
    
    const lowerQuery = query.toLowerCase()
    const lowerTarget = target.toLowerCase()
    
    let queryIndex = 0
    for (let i = 0; i < lowerTarget.length && queryIndex < lowerQuery.length; i++) {
      if (lowerTarget[i] === lowerQuery[queryIndex]) {
        queryIndex++
      }
    }
    
    return queryIndex === lowerQuery.length
  }

  // Filter tags based on input
  useEffect(() => {
    if (inputValue) {
      const filtered = props.tags.filter(tag => 
        !selectedTags.includes(tag) && fuzzyMatch(inputValue, tag)
      )
      setFilteredTags(filtered)
      setHighlightedIndex(0)
      setShowSuggestions(filtered.length > 0)
    } else {
      setFilteredTags([])
      setShowSuggestions(false)
    }
  }, [inputValue, props.tags, selectedTags])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  // Handle tag selection
  const selectTag = (tag: string) => {
    const newSelected = [...selectedTags, tag]
    setSelectedTags(newSelected)
    props.setSelectedTags(newSelected)
    setInputValue('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  // Handle tag removal
  const removeTag = (tagToRemove: string) => {
    const newSelected = selectedTags.filter(tag => tag !== tagToRemove)
    setSelectedTags(newSelected)
    props.setSelectedTags(newSelected)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredTags.length === 0) {
      if (e.key === 'Backspace' && inputValue === '' && selectedTags.length > 0) {
        // Remove last tag on backspace when input is empty
        const x = selectedTags[selectedTags.length - 1]
        if (x)        {
removeTag(x)
        }
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredTags.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredTags[highlightedIndex]) {
          selectTag(filteredTags[highlightedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowSuggestions(false)
        break
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (suggestionsRef.current && showSuggestions) {
      const highlightedElement = suggestionsRef.current.children[highlightedIndex] as HTMLElement
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [highlightedIndex, showSuggestions])

  return (
    <div className="relative w-full">
      <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md focus-within:ring-2 focus-within:ring-ring">
        {/* Selected tags as badges */}
        {selectedTags.map((tag) => (
          <Badge 
            key={tag}
            variant="secondary"
            className="flex items-center gap-1 cursor-pointer hover:bg-secondary/80"
            onClick={() => removeTag(tag)}
          >
            {tag}
            <XIcon className="h-3 w-3" />
          </Badge>
        ))}

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue && setShowSuggestions(filteredTags.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="flex-1 min-w-[120px] outline-none bg-transparent"
          placeholder={selectedTags.length === 0 ? "Type to search tags..." : ""}
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredTags.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md"
        >
          {filteredTags.map((tag, index) => (
            <div
              key={tag}
              onClick={() => selectTag(tag)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`
                px-3 py-2 cursor-pointer text-sm
                ${index === highlightedIndex ? 'bg-accent text-accent-foreground' : ''}
                hover:bg-accent hover:text-accent-foreground
              `}
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
