import type { RuleType } from 'budget-core'
import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { api } from '@economy-tracker/convex/api'
import type { Id } from '@economy-tracker/convex/dataModel'
import { RuleEditModal, type RuleFormValues } from '@/components/rules/RuleEditModal'
import { Button } from '@/components/ui/button'
import { useAppendBudgetEvents } from '@/hooks/use-append-budget-events'
import { createEntityId } from '@/lib/entity-id'

type ImportRulesManagerProps = {
  budgetId: Id<'budgets'>
}

type Rule = {
  id: string
  name: string
  keywords: string[]
  ruleType?: RuleType
  categoryId: string | null
  sinkId: string | null
  lifestyleTagIds: string[]
  eventTagIds: string[]
}

type Category = { id: string; name: string; color: string }
type LifestyleTag = { id: string; name: string; color: string }
type EventTag = { id: string; name: string; color: string; archived: boolean }

function ColorSwatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-4 shrink-0 rounded-full border border-[var(--border)]"
      style={{ backgroundColor: color }}
      title={color}
    />
  )
}

function TagChip({ name, color }: { name: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[rgba(27,24,23,0.6)] px-2 py-0.5 text-xs font-medium text-[var(--text)]">
      <ColorSwatch color={color} />
      {name}
    </span>
  )
}

export default function ImportRulesManager({ budgetId }: ImportRulesManagerProps) {
  const submitEvents = useAppendBudgetEvents(budgetId)
  const { data, isPending } = useQuery(
    convexQuery(api.budgets.getBudgetState, { budgetId }),
  )

  const [isSaving, setIsSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<Rule | undefined>()

  if (isPending || !data) {
    return (
      <section className="budget-panel">
        <p className="m-0 text-sm text-[var(--text-muted)]">Loading import rules…</p>
      </section>
    )
  }

  const rules = (Object.values(data.state.rules ?? {}) as Rule[]).sort((left, right) =>
    (left.keywords[0] ?? left.name).localeCompare(right.keywords[0] ?? right.name),
  )

  const categoriesById = new Map(
    (Object.values(data.state.categories ?? {}) as Category[]).map((category) => [
      category.id,
      category,
    ]),
  )

  const lifestyleTagsById = new Map(
    (Object.values(data.state.lifestyleTags ?? {}) as LifestyleTag[]).map((tag) => [
      tag.id,
      tag,
    ]),
  )

  const eventTagsById = new Map(
    (Object.values(data.state.eventTags ?? {}) as EventTag[])
      .filter((tag) => !tag.archived)
      .map((tag) => [tag.id, tag]),
  )

  const categoryOptions = [...categoriesById.values()].sort((left, right) =>
    left.name.localeCompare(right.name),
  )

  const tagOptions = [
    ...[...lifestyleTagsById.values()].map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      kind: 'permanent' as const,
    })),
    ...[...eventTagsById.values()].map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      kind: 'temporary' as const,
    })),
  ].sort((left, right) => left.name.localeCompare(right.name))

  async function runMutation(task: () => Promise<void>) {
    setIsSaving(true)
    try {
      await task()
    } finally {
      setIsSaving(false)
    }
  }

  function openCreateRule() {
    setEditingRule(undefined)
    setModalOpen(true)
  }

  function openEditRule(rule: Rule) {
    setEditingRule(rule)
    setModalOpen(true)
  }

  function buildPayload(values: RuleFormValues, ruleId: string) {
    return {
      ruleId,
      name: values.subtext,
      keywords: [values.subtext],
      ruleType: values.ruleType,
      categoryId: values.categoryId,
      sinkId: null,
      lifestyleTagIds: values.lifestyleTagIds,
      eventTagIds: values.eventTagIds,
    }
  }

  async function handleSaveRule(values: RuleFormValues) {
    if (editingRule) {
      await runMutation(() =>
        submitEvents([
          {
            eventType: 'RULE_UPDATED',
            payload: buildPayload(values, editingRule.id),
          },
        ]),
      )
      return
    }

    const ruleId = createEntityId('rule')
    await runMutation(() =>
      submitEvents([
        {
          eventType: 'RULE_CREATED',
          payload: buildPayload(values, ruleId),
        },
      ]),
    )
  }

  return (
    <>
      <section className="budget-panel">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="m-0 text-lg font-semibold text-[var(--text)]">Import rules</h2>
            <p className="mt-1 mb-0 text-sm text-[var(--text-muted)]">
              Match subtext in imported transactions to auto-categorize, tag, or mark as internal
              transfers.
            </p>
          </div>
          <Button onClick={openCreateRule}>
            <Plus />
            Add rule
          </Button>
        </div>

        {rules.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full min-w-[40rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[rgba(27,24,23,0.9)] text-left text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
                  <th className="px-3 py-2">Matching subtext</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Tags</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => {
                  const isInternalTransfer = (rule.ruleType ?? 'categorize') === 'internal_transfer'
                  const category = rule.categoryId
                    ? categoriesById.get(rule.categoryId)
                    : undefined

                  const lifestyleTags = rule.lifestyleTagIds
                    .map((tagId) => lifestyleTagsById.get(tagId))
                    .filter((tag): tag is LifestyleTag => tag !== undefined)

                  const eventTags = rule.eventTagIds
                    .map((tagId) => eventTagsById.get(tagId))
                    .filter((tag): tag is EventTag => tag !== undefined)

                  const allTags = [...lifestyleTags, ...eventTags]

                  return (
                    <tr
                      key={rule.id}
                      className="border-b border-[var(--border)] last:border-b-0"
                    >
                      <td className="px-3 py-2.5 align-middle font-medium text-[var(--text)]">
                        {rule.keywords.join(', ') || rule.name}
                      </td>
                      <td className="px-3 py-2.5 align-middle text-[var(--text-muted)]">
                        {isInternalTransfer ? 'Internal transfer' : 'Categorize & tag'}
                      </td>
                      <td className="px-3 py-2.5 align-middle">
                        {isInternalTransfer ? (
                          <span className="text-[var(--text-muted)]">—</span>
                        ) : category ? (
                          <span className="inline-flex items-center gap-2 text-[var(--text)]">
                            <ColorSwatch color={category.color} />
                            {category.name}
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 align-middle">
                        {isInternalTransfer ? (
                          <span className="text-[var(--text-muted)]">—</span>
                        ) : allTags.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {allTags.map((tag) => (
                              <TagChip key={tag.id} name={tag.name} color={tag.color} />
                            ))}
                          </div>
                        ) : (
                          <span className="text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 align-middle text-right">
                        <Button size="sm" variant="outline" onClick={() => openEditRule(rule)}>
                          <Pencil />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="m-0 text-sm text-[var(--text-muted)]">
            No import rules yet. Add a rule to auto-categorize and tag matching transactions on
            import.
          </p>
        )}
      </section>

      <RuleEditModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        rule={editingRule}
        categories={categoryOptions}
        tags={tagOptions}
        onSave={handleSaveRule}
        isSaving={isSaving}
      />
    </>
  )
}
