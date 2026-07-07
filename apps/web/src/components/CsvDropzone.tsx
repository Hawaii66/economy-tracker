import { FileUp } from 'lucide-react'
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type CsvDropzoneProps = {
  onFile: (file: File) => void
  disabled?: boolean
  fileName?: string | null
}

export default function CsvDropzone({ onFile, disabled = false, fileName }: CsvDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleFiles(fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) {
      return
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return
    }

    onFile(file)
  }

  return (
    <div
      className={cn(
        'flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-8 text-center transition',
        isDragging
          ? 'border-[rgba(94,174,255,0.55)] bg-[rgba(94,174,255,0.08)]'
          : 'border-[var(--border)] bg-[rgba(27,24,23,0.72)] hover:border-[rgba(94,174,255,0.35)]',
        disabled && 'pointer-events-none opacity-55',
      )}
      onClick={() => inputRef.current?.click()}
      onDragEnter={(event) => {
        event.preventDefault()
        if (!disabled) {
          setIsDragging(true)
        }
      }}
      onDragOver={(event) => {
        event.preventDefault()
        if (!disabled) {
          setIsDragging(true)
        }
      }}
      onDragLeave={(event) => {
        event.preventDefault()
        setIsDragging(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragging(false)
        if (!disabled) {
          handleFiles(event.dataTransfer.files)
        }
      }}
    >
      <span className="flex size-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
        <FileUp className="size-5" />
      </span>
      <div>
        <p className="m-0 text-sm font-semibold text-[var(--text)]">
          Drop a CSV file here, or click to browse
        </p>
        <p className="m-0 mt-1 text-xs text-[var(--text-muted)]">
          Semicolon or comma delimiters. Swedish number formats supported.
        </p>
      </div>
      {fileName ? (
        <p className="m-0 text-xs font-semibold tracking-wide text-[var(--accent)] uppercase">
          {fileName}
        </p>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          handleFiles(event.target.files)
          event.target.value = ''
        }}
      />
    </div>
  )
}
