export type RuleAssignment = {
  categoryId: string | null;
  sinkId: string | null;
  lifestyleTagIds: string[];
  eventTagIds: string[];
};

export type MatchableRule = {
  id: string;
  keywords: string[];
  categoryId: string | null;
  sinkId: string | null;
  lifestyleTagIds: string[];
  eventTagIds: string[];
};

export function ruleMatchesDescription(
  description: string,
  rule: MatchableRule,
): boolean {
  const haystack = description.toLowerCase();
  return rule.keywords.some((keyword) =>
    haystack.includes(keyword.toLowerCase()),
  );
}

export function findMatchingRule(
  description: string,
  rules: readonly MatchableRule[],
): MatchableRule | null {
  for (const rule of rules) {
    if (ruleMatchesDescription(description, rule)) {
      return rule;
    }
  }
  return null;
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
