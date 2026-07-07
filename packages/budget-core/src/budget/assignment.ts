export type LedgerAssignment = {
  categoryId: string | null;
  sinkId: string | null;
  lifestyleTagIds: string[];
  eventTagIds: string[];
};

export function isFullyUnassignedAssignment(
  assignment: LedgerAssignment,
): boolean {
  return (
    assignment.categoryId === null &&
    assignment.sinkId === null &&
    assignment.lifestyleTagIds.length === 0 &&
    assignment.eventTagIds.length === 0
  );
}

export function assignmentHasSink(assignment: LedgerAssignment): boolean {
  return assignment.sinkId !== null;
}

export function assignmentsHaveSinks(
  assignments: readonly LedgerAssignment[],
): boolean {
  return assignments.every((assignment) => assignmentHasSink(assignment));
}
