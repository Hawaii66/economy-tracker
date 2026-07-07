import type { LucideIcon } from 'lucide-react'

type BudgetSectionPlaceholderProps = {
  title: string
  description: string
  icon: LucideIcon
}

export default function BudgetSectionPlaceholder({
  title,
  description,
  icon: Icon,
}: BudgetSectionPlaceholderProps) {
  return (
    <div className="budget-page">
      <header className="budget-page-header">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
            <Icon className="size-5" />
          </span>
          <div>
            <p className="kicker mb-1">Coming soon</p>
            <h1 className="display-title m-0 text-2xl text-[var(--text)] sm:text-3xl">
              {title}
            </h1>
          </div>
        </div>
      </header>
      <section className="budget-panel">
        <p className="m-0 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
          {description}
        </p>
      </section>
    </div>
  )
}
