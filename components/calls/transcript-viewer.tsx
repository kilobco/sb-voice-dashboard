import { CallTranscriptEntry } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Wrench } from 'lucide-react'

export function TranscriptViewer({ entries }: { entries: CallTranscriptEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-muted-foreground text-sm text-center py-8">No transcript available</p>
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        if (entry.tool_name) {
          return (
            <details key={entry.id} className="rounded-lg border bg-muted/30 text-sm">
              <summary className="flex cursor-pointer items-center gap-2 px-4 py-2 font-medium select-none">
                <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Tool:</span>
                <span className="font-mono">{entry.tool_name}</span>
              </summary>
              <div className="border-t px-4 py-3 space-y-2">
                {entry.tool_args && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Arguments</div>
                    <pre className="bg-muted rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(entry.tool_args, null, 2)}
                    </pre>
                  </div>
                )}
                {entry.tool_result && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Result</div>
                    <pre className="bg-muted rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(entry.tool_result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )
        }

        const isUser = entry.role === 'user'
        return (
          <div key={entry.id} className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                isUser
                  ? 'rounded-tr-sm bg-gray-100 text-gray-800'
                  : 'rounded-tl-sm bg-primary text-primary-foreground'
              )}
            >
              {entry.content ?? <span className="italic opacity-60">empty</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
