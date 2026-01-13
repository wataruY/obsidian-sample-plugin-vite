import React, { useState, useRef, useEffect } from 'react'

import { XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"

interface TagsListProps {
  tags: string[]
  setSelectedTags: (selected: string[]) => void
}

function fuzzyMatch(query: string, target: string): boolean {
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

function findClosestBadgeInDirection(
  badgeRefs: React.RefObject<(HTMLSpanElement | null)[]>,
  selectedTags: string[],
  currentIndex: number,
  direction: 'up' | 'down'
): number | null {
  const currentBadge = badgeRefs.current?.[currentIndex]
  if (!currentBadge) return null

  const currentRect = currentBadge.getBoundingClientRect()
  const currentY = currentRect.top
  const currentX = currentRect.left + currentRect.width / 2

  let closestIndex: number | null = null
  let closestDistance = Infinity

  for (let i = 0; i < selectedTags.length; i++) {
    if (i === currentIndex) continue

    const badge = badgeRefs.current?.[i]
    if (!badge) continue

    const rect = badge.getBoundingClientRect()
    const badgeY = rect.top
    const badgeX = rect.left + rect.width / 2

    if (direction === 'up' && badgeY >= currentY) continue
    if (direction === 'down' && badgeY <= currentY) continue

    const distance = Math.sqrt(Math.pow(badgeX - currentX, 2) + Math.pow(badgeY - currentY, 2))

    if (distance < closestDistance) {
      closestDistance = distance
      closestIndex = i
    }
  }

  return closestIndex
}

export function TagsList({ tags, setSelectedTags: onSelectedTagsChange }: TagsListProps): React.ReactElement {
  const [inputValue, setInputValue] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [filteredTags, setFilteredTags] = useState<string[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [focusedBadgeIndex, setFocusedBadgeIndex] = useState<number | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const badgeRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    if (!inputValue) {
      setFilteredTags([])
      setShowSuggestions(false)
      return
    }

    const filtered = tags.filter(tag =>
      !selectedTags.includes(tag) && fuzzyMatch(inputValue, tag)
    )
    setFilteredTags(filtered)
    setHighlightedIndex(0)
    setShowSuggestions(filtered.length > 0)
  }, [inputValue, tags, selectedTags])

  useEffect(() => {
    badgeRefs.current = badgeRefs.current.slice(0, selectedTags.length)
  }, [selectedTags])

  useEffect(() => {
    if (!suggestionsRef.current || !showSuggestions) return

    const highlightedElement = suggestionsRef.current.children[highlightedIndex] as HTMLElement | undefined
    highlightedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [highlightedIndex, showSuggestions])

  function updateSelectedTags(newSelected: string[]): void {
    setSelectedTags(newSelected)
    onSelectedTagsChange(newSelected)
  }

  function selectTag(tag: string): void {
    updateSelectedTags([...selectedTags, tag])
    setInputValue('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  function removeTag(tagToRemove: string): void {
    updateSelectedTags(selectedTags.filter(tag => tag !== tagToRemove))
    setFocusedBadgeIndex(null)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setInputValue(e.target.value)
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'ArrowLeft' && inputValue === '' && e.currentTarget.selectionStart === 0 && selectedTags.length > 0) {
      e.preventDefault()
      const lastIndex = selectedTags.length - 1
      setFocusedBadgeIndex(lastIndex)
      badgeRefs.current[lastIndex]?.focus()
      return
    }

    if (!showSuggestions || filteredTags.length === 0) {
      if (e.key === 'Backspace' && inputValue === '' && selectedTags.length > 0) {
        const lastTag = selectedTags[selectedTags.length - 1]
        if (lastTag) {
          removeTag(lastTag)
        }
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => Math.min(prev + 1, filteredTags.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => Math.max(prev - 1, 0))
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

  function handleBadgeKeyDown(e: React.KeyboardEvent<HTMLSpanElement>, index: number): void {
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
          setFocusedBadgeIndex(null)
          inputRef.current?.focus()
        }
        break
      case 'ArrowUp': {
        e.preventDefault()
        const upIndex = findClosestBadgeInDirection(badgeRefs, selectedTags, index, 'up')
        if (upIndex !== null) {
          setFocusedBadgeIndex(upIndex)
          badgeRefs.current[upIndex]?.focus()
        }
        break
      }
      case 'ArrowDown': {
        e.preventDefault()
        const downIndex = findClosestBadgeInDirection(badgeRefs, selectedTags, index, 'down')
        if (downIndex !== null) {
          setFocusedBadgeIndex(downIndex)
          badgeRefs.current[downIndex]?.focus()
        }
        break
      }
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (selectedTags[index]) {
          removeTag(selectedTags[index])
        }
        inputRef.current?.focus()
        break
      case 'Tab':
        if (e.shiftKey) {
          setFocusedBadgeIndex(null)
        } else {
          e.preventDefault()
          setFocusedBadgeIndex(null)
          inputRef.current?.focus()
        }
        break
      case 'Escape':
        e.preventDefault()
        setFocusedBadgeIndex(null)
        inputRef.current?.focus()
        break
    }
  }

  function handleInputFocus(): void {
    if (inputValue && filteredTags.length > 0) {
      setShowSuggestions(true)
    }
  }

  function handleInputBlur(): void {
    setTimeout(() => setShowSuggestions(false), 200)
  }

  return (
    <div className="relative w-full">
      <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md focus-within:ring-2 focus-within:ring-ring">
        {selectedTags.map((tag, index) => (
          <Badge
            key={tag}
            ref={(el) => { badgeRefs.current[index] = el }}
            variant="secondary"
            tabIndex={-1}
            className={`flex items-center gap-1 cursor-pointer hover:bg-secondary/80 ${focusedBadgeIndex === index ? 'ring-2 ring-ring' : ''
              }`}
            onClick={() => removeTag(tag)}
            onKeyDown={(e) => handleBadgeKeyDown(e, index)}
          >
            {tag}
            <XIcon className="h-3 w-3" />
          </Badge>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="flex-1 min-w-[120px] outline-none bg-transparent"
          placeholder={selectedTags.length === 0 ? "Type to search tags..." : ""}
        />
      </div>

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
              className={`px-3 py-2 cursor-pointer text-sm hover:bg-accent hover:text-accent-foreground ${index === highlightedIndex ? 'bg-accent text-accent-foreground' : ''
                }`}
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
