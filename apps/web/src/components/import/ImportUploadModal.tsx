import { useEffect, useState } from 'react'
import CsvDropzone from '@/components/CsvDropzone'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { inputClassName } from '@/components/taxonomy/form-styles'
import type { CsvParsePreview } from '@/lib/import-review'

type AccountOption = { id: string; name: string }

type ImportUploadModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  accounts: AccountOption[]
  selectedAccountId: string
  fileName: string | null
  parsePreview: CsvParsePreview | null
  parseError: string | null
  isParsing?: boolean
  isPreviewing?: boolean
  hasExistingBatches?: boolean
  disabled?: boolean
  onAccountChange: (accountId: string) => void
  onFile: (file: File) => void
  onContinue: () => void
}

export function ImportUploadModal({
  open,
  onOpenChange,
  accounts,
  selectedAccountId,
  fileName,
  parsePreview,
  parseError,
  isParsing = false,
  isPreviewing = false,
  hasExistingBatches = false,
  disabled = false,
  onAccountChange,
  onFile,
  onContinue,
}: ImportUploadModalProps) {
  const [accountId, setAccountId] = useState(selectedAccountId)

  useEffect(() => {
    if (!open) {
      return
    }
    setAccountId(selectedAccountId)
  }, [open, selectedAccountId])

  function handleAccountChange(value: string) {
    setAccountId(value)
    onAccountChange(value)
  }

  const canContinue =
    accountId.length > 0 && fileName !== null && parsePreview !== null && !parseError

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Import CSV"
      description="Choose an account and upload a bank export. Add multiple files to review transfers across accounts."
      className="w-[min(36rem,calc(100vw-2rem))]"
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
          Target account
          <select
            className={inputClassName}
            value={accountId}
            onChange={(event) => handleAccountChange(event.target.value)}
            disabled={disabled}
          >
            <option value="">Select an account…</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>

        {accounts.length === 0 ? (
          <p className="m-0 text-sm text-[var(--text-muted)]">
            No accounts yet. Create an account under Accounts before importing.
          </p>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <p className="m-0 text-sm font-semibold text-[var(--text)]">CSV file</p>
          <CsvDropzone onFile={onFile} disabled={disabled} fileName={fileName} />
        </div>

        {parseError ? (
          <p className="demo-alert demo-alert-danger m-0 text-sm">{parseError}</p>
        ) : null}

        {isPreviewing ? (
          <p className="m-0 text-sm text-[var(--text-muted)]">Reading CSV…</p>
        ) : null}

        {parsePreview && !parseError ? (
          <div className="flex flex-wrap gap-2">
            <span className="demo-pill">{parsePreview.rowCount} rows</span>
            {parsePreview.skippedRowCount > 0 ? (
              <span className="demo-pill">{parsePreview.skippedRowCount} skipped</span>
            ) : null}
            <span className="demo-pill">Delimiter: {parsePreview.delimiter}</span>
          </div>
        ) : null}

        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={disabled}
          >
            Cancel
          </Button>
          <Button type="button" disabled={!canContinue || disabled} onClick={onContinue}>
            {isParsing
              ? 'Adding…'
              : hasExistingBatches
                ? 'Add to review'
                : 'Review transactions'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
