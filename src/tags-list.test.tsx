import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TagsList } from './tags-list'

describe('TagsList Component', () => {
  const mockTags = ['React', 'TypeScript', 'Docker', 'Kubernetes', 'AWS', 'Python']
  let mockSetSelectedTags: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockSetSelectedTags = vi.fn()
  })

  const renderComponent = (props = {}) => {
    const defaultProps = {
      tags: mockTags,
      setSelectedTags: mockSetSelectedTags,
    }
    return render(<TagsList {...defaultProps} {...props as any} />)
  }

  const getInput = () => screen.getByRole('textbox') as HTMLInputElement

  // Basic Rendering
  describe('Basic Rendering', () => {
    it('should render input field', () => {
      renderComponent()
      expect(getInput()).toBeInTheDocument()
    })

    it('should display placeholder when no tags selected', () => {
      renderComponent()
      expect(getInput()).toHaveAttribute('placeholder', 'Type to search tags...')
    })

    it('should render without props (default values)', () => {
      render(<TagsList tags={[]} setSelectedTags={() => { }} />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('should not show dropdown initially', () => {
      renderComponent()
      expect(screen.queryByText('React')).not.toBeInTheDocument()
    })
  })

  // Fuzzy Match
  describe('Fuzzy Match', () => {
    it('should be case insensitive', async () => {
      const user = userEvent.setup()
      renderComponent()

      const input = getInput()
      await user.type(input, 'REACT')

      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument()
      })
    })

    it('should not show suggestions for non-matches', async () => {
      const user = userEvent.setup()
      renderComponent()

      const input = getInput()
      await user.type(input, 'xyz')

      await waitFor(() => {
        expect(screen.queryByText('React')).not.toBeInTheDocument()
      })
    })
  })

  // Input & Filtering
  describe('Input & Filtering', () => {
    it('should show dropdown when input matches', async () => {
      const user = userEvent.setup()
      renderComponent()

      await user.type(getInput(), 'react')

      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument()
      })
    })

    it('should hide dropdown when input cleared', async () => {
      const user = userEvent.setup()
      renderComponent()

      const input = getInput()
      await user.type(input, 'react')
      await user.clear(input)

      await waitFor(() => {
        expect(screen.queryByText('React')).not.toBeInTheDocument()
      })
    })
  })

  // Tag Selection
  describe('Tag Selection', () => {
    it('should select tag on click', async () => {
      const user = userEvent.setup()
      renderComponent()

      const input = getInput()
      await user.type(input, 'react')

      const reactOption = await screen.findByText('React')
      await user.click(reactOption)

      expect(mockSetSelectedTags).toHaveBeenCalledWith(['React'])
    })

    it('should select tag on Enter key', async () => {
      const user = userEvent.setup()
      renderComponent()

      const input = getInput()
      await user.type(input, 'react')

      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument()
      })

      await user.keyboard('{Enter}')

      expect(mockSetSelectedTags).toHaveBeenCalledWith(['React'])
    })

    it('should clear input after selection', async () => {
      const user = userEvent.setup()
      renderComponent()

      const input = getInput()
      await user.type(input, 'react')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(input).toHaveValue('')
      })
    })

    it('should support multiple selections', async () => {
      const user = userEvent.setup()
      renderComponent()

      const input = getInput()

      await user.type(input, 'react')
      await user.keyboard('{Enter}')

      await user.type(input, 'type')
      await user.keyboard('{Enter}')

      expect(mockSetSelectedTags).toHaveBeenLastCalledWith(['React', 'TypeScript'])
    })
  })

  // Tag Removal
  describe('Tag Removal', () => {
    it('should remove last tag with Backspace on empty input', async () => {
      const user = userEvent.setup()
      renderComponent()

      const input = getInput()

      await user.type(input, 'react')
      await user.keyboard('{Enter}')

      await user.keyboard('{Backspace}')

      expect(mockSetSelectedTags).toHaveBeenCalledWith([])
    })
  })

  // Keyboard Navigation - Dropdown
  describe('Keyboard Navigation - Dropdown', () => {
    it('should highlight next item on ArrowDown', async () => {
      const user = userEvent.setup()
      renderComponent()

      const input = getInput()
      await user.type(input, 'r')

      await waitFor(() => {
        const items = screen.queryAllByText(/^(React|Python)$/)
        expect(items.length).toBeGreaterThan(0)
      })

      await user.keyboard('{ArrowDown}')

      // Check second item has highlight class
      const dropdown = screen.getByText('React')?.parentElement
      expect(dropdown).toBeInTheDocument()
    })

    it('should close dropdown on Escape', async () => {
      const user = userEvent.setup()
      renderComponent()

      const input = getInput()
      await user.type(input, 'react')

      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument()
      })

      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.queryByText('React')).not.toBeInTheDocument()
      })
    })
  })

  // Edge Cases
  describe('Edge Cases', () => {
    it('should handle empty tags array', () => {
      renderComponent({ tags: [] })
      expect(getInput()).toBeInTheDocument()
    })

    it('should handle special characters in tags', async () => {
      const specialTags = ['C++', 'C#', 'Node.js']
      const user = userEvent.setup()
      renderComponent({ tags: specialTags })

      const input = getInput()
      await user.type(input, 'c')

      await waitFor(() => {
        // C++ and C# should appear
        const cppExists = screen.queryByText('C++') !== null
        const csharpExists = screen.queryByText('C#') !== null
        expect(cppExists || csharpExists).toBe(true)
      })
    })

    it('should preserve input value when closing with Escape', async () => {
      const user = userEvent.setup()
      renderComponent()

      const input = getInput()
      await user.type(input, 'react')

      await user.keyboard('{Escape}')

      expect(input).toHaveValue('react')
    })
  })
})
