
import React, { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ButtonGroup } from "@/components/ui/button-group"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ThemeProvider } from './theme-provider'
import { TagsList } from "./tags-list"
import MultiSelect from "@/components/ui/multiselect"


interface CaptureModalProps {
  saveButtonRef?: HTMLButtonElement
  onConfirm?: (text: string, action: string, mood: string) => void
  items?: string[]
}

interface Mood {
  id: "sunny" | "cloudy" | "rainy";
  label: string;
  emoji: string;
}

export function CaptureModal({ saveButtonRef, onConfirm, items }: CaptureModalProps) {
  const [text, setText] = useState("")
  const [action, setAction] = useState("create-note")
  const [mood, setMood] = useState<Mood | undefined>(undefined);
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [candidates, setCandidates] = useState<string[]>([])

  const moods: Mood[] = [
    { id: "sunny", label: "Sunny", emoji: "☀️" },
    { id: "cloudy", label: "Cloudy", emoji: "☁️" },
    { id: "rainy", label: "Rainy", emoji: "🌧️" },
  ]

  const handleConfirm = () => {
    if (onConfirm && mood) {
      onConfirm(text, action, mood.id)
    }
    setText("")
    setMood(undefined)
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
    <ThemeProvider defaultTheme="light">
      <div className="flex h-full flex-col gap-2">
        {/* Content */}
        {/* Mood Selector */}
        <ButtonGroup orientation="horizontal" className="flex w-full items-center justify-center gap-2">
          {moods.map((m) => (
            <Button
              key={m.id}
              onClick={() => setMood(m)}
              className={"flex-1 " + (m.id === mood?.id ? "activated-button" : "")}
              variant={"default"}
            >
              {m.emoji}{m.label}
            </Button>
          ))}
        </ButtonGroup>
        <MultiSelect items={items ?? []} />
        <TagsList tags={selectedTags} />
        <div className="flex items-center space-x-2">
          <Label className="uppercase tracking-wider">
            Next Action
          </Label>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="">
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
          className="min-h-64 h-full w-full resize-y border border-purple-500/30  placeholder:text-neutral-500 focus:border-purple-500 focus:ring-0 "
        />

      </div>

    </ThemeProvider>
  )
}

//       {/* Next Action */}
//       <div className="space-y-2">
//         <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
//           Next Action
//         </label>
//         <Select value={action} onValueChange={setAction}>
//           <SelectTrigger className="border-0 border-b border-neutral-600 bg-transparent text-white placeholder:text-neutral-500 focus:border-purple-500 focus:ring-0">
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent className="border-neutral-600 bg-neutral-800">
//             <SelectItem value="create-note">Create Note</SelectItem>
//             <SelectItem value="add-daily">Add to Daily Note</SelectItem>
//             <SelectItem value="add-inbox">Add to Inbox</SelectItem>
//           </SelectContent>
//         </Select>
// 
//         {/* Text Input */}
//         <Textarea
//           placeholder="What's on your mind? Quickly jot down a new thought or idea..."
//           value={text}
//           onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
//             setText(e.target.value)
//           }
//           className="min-h-32 w-full resize-none border border-purple-500/30 bg-neutral-800 text-sm text-white placeholder:text-neutral-500 focus:border-purple-500 focus:ring-0 "
//         />
//       </div>
// 
