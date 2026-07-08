import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { api } from '@economy-tracker/convex/api'
import type { Id } from '@economy-tracker/convex/dataModel'
import { Button } from '@/components/ui/button'
import {
  CategoryEditModal,
  type CategoryFormValues,
} from '@/components/taxonomy/CategoryEditModal'
import { TagEditModal, type TagFormValues, type TagKind } from '@/components/taxonomy/TagEditModal'
import { useAppendBudgetEvents } from '@/hooks/use-append-budget-events'
import {
  categorySpendingAmount,
  categoryTransactionCount,
  tagSpendingAmount,
  tagTransactionCount,
} from '@/lib/entity-ledger-stats'
import { getLedgerTransactions } from '@/lib/budget-types'
import { formatMoney } from '@/lib/format-money'
import { generateEntityId } from '@/lib/taxonomy'

type CategoriesTagsManagerProps = {
  budgetId: Id<'budgets'>
}

type Category = { id: string; name: string; color: string }
type LifestyleTag = { id: string; name: string; color: string }
type EventTag = { id: string; name: string; color: string; archived: boolean }

type UnifiedTag = {
  id: string
  name: string
  color: string
  kind: TagKind
  archived: boolean
}

function ColorSwatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-5 rounded-full border border-[var(--border)]"
      style={{ backgroundColor: color }}
      title={color}
    />
  )
}

export default function CategoriesTagsManager({ budgetId }: CategoriesTagsManagerProps) {
  const submitEvents = useAppendBudgetEvents(budgetId)
  const { data, isPending } = useQuery(
    convexQuery(api.budgets.getBudgetState, { budgetId }),
  )

  const [isSaving, setIsSaving] = useState(false)
  const [showArchivedTags, setShowArchivedTags] = useState(false)

  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>()

  const [tagModalOpen, setTagModalOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<UnifiedTag | undefined>()

  if (isPending || !data) {
    return (
      <section className="budget-panel">
        <p className="m-0 text-sm text-[var(--text-muted)]">Loading categories and tags…</p>
      </section>
    )
  }

  const categories = (
    Object.values(data.state.categories ?? {}) as Category[]
  ).sort((left, right) => left.name.localeCompare(right.name))
  const ledger = getLedgerTransactions(data.state.ledgerTransactions)

  const permanentTags = (
    Object.values(data.state.lifestyleTags ?? {}) as LifestyleTag[]
  ).sort((left, right) => left.name.localeCompare(right.name))

  const temporaryTags = (Object.values(data.state.eventTags ?? {}) as EventTag[])
    .filter((tag) => showArchivedTags || !tag.archived)
    .sort((left, right) => left.name.localeCompare(right.name))

  const unifiedTags: UnifiedTag[] = [
    ...permanentTags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      kind: 'permanent' as const,
      archived: false,
    })),
    ...temporaryTags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      kind: 'temporary' as const,
      archived: tag.archived,
    })),
  ]

  async function runMutation(task: () => Promise<void>) {
    setIsSaving(true)
    try {
      await task()
    } finally {
      setIsSaving(false)
    }
  }

  function openCreateCategory() {
    setEditingCategory(undefined)
    setCategoryModalOpen(true)
  }

  function openEditCategory(category: Category) {
    setEditingCategory(category)
    setCategoryModalOpen(true)
  }

  function openCreateTag() {
    setEditingTag(undefined)
    setTagModalOpen(true)
  }

  function openEditTag(tag: UnifiedTag) {
    setEditingTag(tag)
    setTagModalOpen(true)
  }

  async function handleSaveCategory(values: CategoryFormValues) {
    if (editingCategory) {
      await runMutation(() =>
        submitEvents([
          {
            eventType: 'CATEGORY_UPDATED',
            payload: {
              categoryId: editingCategory.id,
              name: values.name,
              color: values.color,
            },
          },
        ]),
      )
      return
    }

    const categoryId = generateEntityId()
    await runMutation(() =>
      submitEvents([
        {
          eventType: 'CATEGORY_CREATED',
          payload: { categoryId, name: values.name, color: values.color },
        },
      ]),
    )
  }

  async function handleSaveTag(values: TagFormValues) {
    if (editingTag) {
      if (editingTag.kind === 'permanent') {
        await runMutation(() =>
          submitEvents([
            {
              eventType: 'LIFESTYLE_TAG_UPDATED',
              payload: {
                tagId: editingTag.id,
                name: values.name,
                color: values.color,
              },
            },
          ]),
        )
        return
      }

      await runMutation(() =>
        submitEvents([
          {
            eventType: 'EVENT_TAG_UPDATED',
            payload: {
              tagId: editingTag.id,
              name: values.name,
              color: values.color,
              archived: values.archived,
            },
          },
        ]),
      )
      return
    }

    const tagId = generateEntityId()
    const eventType =
      values.kind === 'permanent' ? 'LIFESTYLE_TAG_CREATED' : 'EVENT_TAG_CREATED'

    await runMutation(() =>
      submitEvents([
        {
          eventType,
          payload: { tagId, name: values.name, color: values.color },
        },
      ]),
    )
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <section className="budget-panel">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="m-0 text-lg font-semibold text-[var(--text)]">Categories</h2>
              <p className="mt-1 mb-0 text-sm text-[var(--text-muted)]">
                One category per transaction. Each has a name and color.
              </p>
            </div>
            <Button onClick={openCreateCategory}>
              <Plus />
              Add category
            </Button>
          </div>

          {categories.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
              <table className="w-full min-w-[24rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[rgba(27,24,23,0.9)] text-left text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
                    <th className="px-3 py-2">Color</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Transactions</th>
                    <th className="px-3 py-2">Spent</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-[var(--border)] last:border-b-0"
                    >
                      <td className="px-3 py-2.5 align-middle">
                        <ColorSwatch color={category.color} />
                      </td>
                      <td className="px-3 py-2.5 align-middle font-medium text-[var(--text)]">
                        <Link
                          to="/dashboard/budgets/$budgetId/categories/$categoryId"
                          params={{ budgetId, categoryId: category.id }}
                          className="text-[var(--text)] no-underline hover:text-[var(--accent)]"
                        >
                          {category.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 align-middle text-[var(--text-muted)]">
                        {categoryTransactionCount(ledger, category.id)}
                      </td>
                      <td className="px-3 py-2.5 align-middle text-[var(--text-muted)]">
                        {formatMoney(categorySpendingAmount(ledger, category.id))}
                      </td>
                      <td className="px-3 py-2.5 align-middle text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to="/dashboard/budgets/$budgetId/categories/$categoryId"
                            params={{ budgetId, categoryId: category.id }}
                            className="inline-flex h-8 items-center rounded-lg border border-[var(--border)] px-3 text-sm font-medium text-[var(--text)] no-underline hover:bg-[rgba(27,24,23,0.75)]"
                          >
                            View activity
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditCategory(category)}
                          >
                            <Pencil />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="m-0 text-sm text-[var(--text-muted)]">No categories yet.</p>
          )}
        </section>

        <section className="budget-panel">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="m-0 text-lg font-semibold text-[var(--text)]">Tags</h2>
              <p className="mt-1 mb-0 text-sm text-[var(--text-muted)]">
                Permanent tags track ongoing behavior. Temporary tags can be archived when a
                project ends.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <input
                  type="checkbox"
                  checked={showArchivedTags}
                  onChange={(event) => setShowArchivedTags(event.target.checked)}
                />
                Show archived
              </label>
              <Button onClick={openCreateTag}>
                <Plus />
                Add tag
              </Button>
            </div>
          </div>

          {unifiedTags.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
              <table className="w-full min-w-[32rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[rgba(27,24,23,0.9)] text-left text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
                    <th className="px-3 py-2">Color</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Transactions</th>
                    <th className="px-3 py-2">Spent</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {unifiedTags.map((tag) => (
                    <tr
                      key={`${tag.kind}-${tag.id}`}
                      className={`border-b border-[var(--border)] last:border-b-0 ${tag.archived ? 'bg-[rgba(27,24,23,0.35)]' : ''}`}
                    >
                      <td className="px-3 py-2.5 align-middle">
                        <ColorSwatch color={tag.color} />
                      </td>
                      <td
                        className={`px-3 py-2.5 align-middle font-medium ${tag.archived ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text)]'}`}
                      >
                        <Link
                          to="/dashboard/budgets/$budgetId/tags/$tagId"
                          params={{ budgetId, tagId: tag.id }}
                          className={`no-underline hover:text-[var(--accent)] ${tag.archived ? 'text-[var(--text-muted)]' : 'text-[var(--text)]'}`}
                        >
                          {tag.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 align-middle">
                        <span className="inline-flex rounded-full border border-[var(--border)] px-2 py-0.5 text-xs font-semibold text-[var(--text-muted)]">
                          {tag.kind === 'permanent' ? 'Permanent' : 'Temporary'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 align-middle">
                        {tag.kind === 'temporary' ? (
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${
                              tag.archived
                                ? 'border-[rgba(140,132,126,0.45)] bg-[rgba(27,24,23,0.45)] text-[var(--text-muted)]'
                                : 'border-[rgba(94,174,255,0.25)] bg-[rgba(94,174,255,0.08)] text-[var(--accent)]'
                            }`}
                          >
                            {tag.archived ? 'Archived' : 'Active'}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)]">Always active</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 align-middle text-[var(--text-muted)]">
                        {tagTransactionCount(ledger, tag.id)}
                      </td>
                      <td className="px-3 py-2.5 align-middle text-[var(--text-muted)]">
                        {formatMoney(tagSpendingAmount(ledger, tag.id))}
                      </td>
                      <td className="px-3 py-2.5 align-middle text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to="/dashboard/budgets/$budgetId/tags/$tagId"
                            params={{ budgetId, tagId: tag.id }}
                            className="inline-flex h-8 items-center rounded-lg border border-[var(--border)] px-3 text-sm font-medium text-[var(--text)] no-underline hover:bg-[rgba(27,24,23,0.75)]"
                          >
                            View activity
                          </Link>
                          <Button size="sm" variant="outline" onClick={() => openEditTag(tag)}>
                            <Pencil />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="m-0 text-sm text-[var(--text-muted)]">No tags yet.</p>
          )}
        </section>
      </div>

      <CategoryEditModal
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
        category={editingCategory}
        onSave={handleSaveCategory}
        isSaving={isSaving}
      />

      <TagEditModal
        open={tagModalOpen}
        onOpenChange={setTagModalOpen}
        tag={editingTag}
        onSave={handleSaveTag}
        isSaving={isSaving}
      />
    </>
  )
}
