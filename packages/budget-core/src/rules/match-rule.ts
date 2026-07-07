import type { RuleType } from "../budget/entities.ts";

export type RuleAssignment = {
  categoryId: string | null;
  sinkId: string | null;
  lifestyleTagIds: string[];
  eventTagIds: string[];
};

export type MatchableRule = {
  id: string;
  keywords: string[];
  ruleType?: RuleType;
  categoryId: string | null;
  sinkId: string | null;
  lifestyleTagIds: string[];
  eventTagIds: string[];
};

function ruleTypeOf(rule: MatchableRule): RuleType {
  return rule.ruleType ?? "categorize";
}

export function ruleMatchesDescription(
  description: string,
  rule: MatchableRule,
): boolean {
  const haystack = description.toLowerCase();
  return rule.keywords.some((keyword) =>
    haystack.includes(keyword.toLowerCase()),
  );
}

export function findMatchingCategorizeRule(
  description: string,
  rules: readonly MatchableRule[],
): MatchableRule | null {
  for (const rule of rules) {
    if (ruleTypeOf(rule) !== "categorize") {
      continue;
    }
    if (ruleMatchesDescription(description, rule)) {
      return rule;
    }
  }
  return null;
}

export function findMatchingInternalTransferRule(
  description: string,
  rules: readonly MatchableRule[],
): MatchableRule | null {
  for (const rule of rules) {
    if (ruleTypeOf(rule) !== "internal_transfer") {
      continue;
    }
    if (ruleMatchesDescription(description, rule)) {
      return rule;
    }
  }
  return null;
}

/** @deprecated Use findMatchingCategorizeRule for clarity. */
export function findMatchingRule(
  description: string,
  rules: readonly MatchableRule[],
): MatchableRule | null {
  return findMatchingCategorizeRule(description, rules);
}

export function assignmentFromRule(rule: MatchableRule | null): RuleAssignment {
  if (!rule) {
    return {
      categoryId: null,
      sinkId: null,
      lifestyleTagIds: [],
      eventTagIds: [],
    };
  }

  return {
    categoryId: rule.categoryId,
    sinkId: rule.sinkId,
    lifestyleTagIds: [...rule.lifestyleTagIds],
    eventTagIds: [...rule.eventTagIds],
  };
}
