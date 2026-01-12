import React, { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CaptureModalProps {
  saveButtonRef?: HTMLButtonElement
  onConfirm?: (text: string, action: string, mood: string) => void
}

export function CaptureModal({ saveButtonRef, onConfirm }: CaptureModalProps) {
  const [text, setText] = useState("")
  const [action, setAction] = useState("create-note")
  const [mood, setMood] = useState("")

  const moods = [
    { id: "sunny", label: "☀️", emoji: "☀️" },
    { id: "cloudy", label: "☁️", emoji: "☁️" },
    { id: "rainy", label: "🌧️", emoji: "🌧️" },
  ]

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(text, action, mood)
    }
    setText("")
    setMood("")
  }

  // Link external save button to handleConfirm
  useEffect(() => {
    if (!saveButtonRef) return

    saveButtonRef.addEventListener('click', handleConfirm)
    return () => {
      saveButtonRef.removeEventListener('click', handleConfirm)
    }
  }, [saveButtonRef, text, action, mood, onConfirm])

  return (
    <div className="flex h-full flex-col bg-neutral-900">
      {/* Header */}
      <div className="flex items-center justify-center border-b border-neutral-700 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">Confirm</h2>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        {/* Mood Selector */}
        <div className="flex justify-center gap-3">
          {moods.map((m) => (
            <button
              key={m.id}
              onClick={() => setMood(m.id)}
              className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-all ${mood === m.id
                ? "border-2 border-purple-500 bg-purple-500/10"
                : "border border-neutral-600 hover:border-purple-500"
                }`}
            >
              {m.emoji}
            </button>
          ))}
        </div>

        {/* Next Action */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Next Action
          </label>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="border-0 border-b border-neutral-600 bg-transparent text-white placeholder:text-neutral-500 focus:border-purple-500 focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-neutral-600 bg-neutral-800">
              <SelectItem value="create-note">Create Note</SelectItem>
              <SelectItem value="add-daily">Add to Daily Note</SelectItem>
              <SelectItem value="add-inbox">Add to Inbox</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Text Input */}
        <Textarea
          placeholder="What's on your mind? Quickly jot down a new thought or idea..."
          value={text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setText(e.target.value)
          }
          className="min-h-32 w-full resize-none border border-purple-500/30 bg-neutral-800 text-sm text-white placeholder:text-neutral-500 focus:border-purple-500 focus:ring-0 "
        />
      </div>
    </div>
  )
}
