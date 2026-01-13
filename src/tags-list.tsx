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
  const [focusedBadgeIndex, setFocusedBadgeIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const badgeRefs = useRef<(HTMLSpanElement | null)[]>([])

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
    setFocusedBadgeIndex(null)
  }

  // Update badge refs array when selectedTags changes
  useEffect(() => {
    badgeRefs.current = badgeRefs.current.slice(0, selectedTags.length)
  }, [selectedTags])

  // Handle keyboard navigation in input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move focus to last badge when pressing left at the beginning of input
    if (e.key === 'ArrowLeft' && inputValue === '' && e.currentTarget.selectionStart === 0 && selectedTags.length > 0) {
      e.preventDefault()
      setFocusedBadgeIndex(selectedTags.length - 1)
      badgeRefs.current[selectedTags.length - 1]?.focus()
      return
    }

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

  // Find closest badge in the direction (up or down)
  const findClosestBadgeInDirection = (currentIndex: number, direction: 'up' | 'down'): number | null => {
    const currentBadge = badgeRefs.current[currentIndex]
    if (!currentBadge) return null

    const currentRect = currentBadge.getBoundingClientRect()
    const currentY = currentRect.top
    const currentX = currentRect.left + currentRect.width / 2

    let closestIndex: number | null = null
    let closestDistance = Infinity

    for (let i = 0; i < selectedTags.length; i++) {
      if (i === currentIndex) continue
      
      const badge = badgeRefs.current[i]
      if (!badge) continue

      const rect = badge.getBoundingClientRect()
      const badgeY = rect.top
      const badgeX = rect.left + rect.width / 2

      // Check if badge is in the desired direction
      if (direction === 'up' && badgeY >= currentY) continue
      if (direction === 'down' && badgeY <= currentY) continue

      // Calculate distance
      const distance = Math.sqrt(Math.pow(badgeX - currentX, 2) + Math.pow(badgeY - currentY, 2))

      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = i
      }
    }

    return closestIndex
  }

  // Handle keyboard navigation on badges
  const handleBadgeKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>, index: number) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        if (index > 0) {
          setFocusedBadgeIndex(index - 1)
          badgeRefs.current[index - 1]?.focus()
        }
        break
      case 'ArrowRight':
        e.preventDefault()
        if (index < selectedTags.length - 1) {
          setFocusedBadgeIndex(index + 1)
          badgeRefs.current[index + 1]?.focus()
        } else {
          // Move focus back to input when at the last badge
          setFocusedBadgeIndex(null)
          inputRef.current?.focus()
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        const upIndex = findClosestBadgeInDirection(index, 'up')
        if (upIndex !== null) {
          setFocusedBadgeIndex(upIndex)
          badgeRefs.current[upIndex]?.focus()
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        const downIndex = findClosestBadgeInDirection(index, 'down')
        if (downIndex !== null) {
          setFocusedBadgeIndex(downIndex)
          badgeRefs.current[downIndex]?.focus()
        }
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        const tagToRemove = selectedTags[index]
        if (tagToRemove) {
          removeTag(tagToRemove)
        }
        // Focus input after removal
        inputRef.current?.focus()
        break
      case 'Tab':
        if (!e.shiftKey) {
          // Tab without Shift: move to input
          e.preventDefault()
          setFocusedBadgeIndex(null)
          inputRef.current?.focus()
        } else {
          // Shift+Tab: allow default behavior to move to previous element
          setFocusedBadgeIndex(null)
        }
        break
      case 'Escape':
        e.preventDefault()
        setFocusedBadgeIndex(null)
        inputRef.current?.focus()
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
        {selectedTags.map((tag, index) => (
          <Badge 
            key={tag}
            ref={(el) => { badgeRefs.current[index] = el }}
            variant="secondary"
            tabIndex={-1}
            className={`flex items-center gap-1 cursor-pointer hover:bg-secondary/80 ${
              focusedBadgeIndex === index ? 'ring-2 ring-ring' : ''
            }`}
            onClick={() => removeTag(tag)}
            onKeyDown={(e) => handleBadgeKeyDown(e, index)}
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