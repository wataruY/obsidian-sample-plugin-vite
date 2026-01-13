import React from 'react'

import { AlertCircleIcon, BadgeCheckIcon, CheckIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"

interface TagsListProps {
  tags: string[]
}

export function TagsList(props: TagsListProps = { tags: [] }) {
  return (
    <div className="flex flex-row items-center gap-2">
      {props.tags.map((x) => (<Badge>{x}</Badge>))}
    </div>
  )
}
