import { useRef, useState } from 'react'
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react'
import { cn } from '@/utils'

interface ImageUploadProps {
  label?: string
  value?: string        // existing URL
  onChange: (file: File | null) => void
  previewUrl?: string   // local blob preview
  accept?: string
  className?: string
}

export function ImageUpload({ label, value, onChange, previewUrl, accept = 'image/*', className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const display = previewUrl || value

  function handleFile(file: File) {
    if (!file.type.startsWith('image/') && !file.type.startsWith('application/pdf')) {
      return
    }
    onChange(file)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <span className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</span>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'relative w-full rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden',
          dragging ? 'border-accent bg-accent/10' : 'border-surface-2 hover:border-accent/50 hover:bg-surface-2/50',
          display ? 'h-40' : 'h-28'
        )}
      >
        {display ? (
          <>
            <img
              src={display}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-xs text-white font-medium">Click to replace</span>
            </div>
            <button
              onClick={clear}
              className="absolute top-2 right-2 w-6 h-6 bg-danger rounded-full flex items-center justify-center shadow-lg hover:bg-danger/80 transition-colors"
            >
              <X size={12} className="text-white" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-4">
            <div className="w-10 h-10 bg-surface-2 rounded-xl flex items-center justify-center">
              <ImageIcon size={18} className="text-text-muted" />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-text-primary">Tap to upload</p>
              <p className="text-[10px] text-text-muted mt-0.5">or drag & drop · JPG, PNG, PDF</p>
            </div>
            <Upload size={13} className="text-text-muted" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  )
}

interface ImageViewerProps {
  url: string
  label?: string
  className?: string
}

export function ImageViewer({ url, label, className }: ImageViewerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label && <span className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</span>}
        <div
          onClick={() => setOpen(true)}
          className="w-full h-36 rounded-xl overflow-hidden cursor-pointer relative border border-surface-2 hover:border-accent/40 transition-colors"
        >
          <img src={url} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-xs text-white font-medium bg-black/50 px-2 py-1 rounded-lg">View full</span>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <button onClick={() => setOpen(false)} className="absolute top-4 right-4 w-9 h-9 bg-surface rounded-xl flex items-center justify-center">
            <X size={18} className="text-text-primary" />
          </button>
          <img src={url} alt={label} className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}
    </>
  )
}
