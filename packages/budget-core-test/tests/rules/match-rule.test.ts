import { describe, expect, it } from "vitest";
import {
  assignmentFromRule,
  findMatchingRule,
  ruleMatchesDescription,
} from "budget-core";

describe("import rule matching", () => {
  const rules = [
    {
      id: "rule-ica",
      keywords: ["ICA"],
      categoryId: "cat-groceries",
      sinkId: null,
      lifestyleTagIds: ["tag-food"],
      eventTagIds: [],
    },
    {
      id: "rule-netflix",
      keywords: ["netflix"],
      categoryId: "cat-entertainment",
      sinkId: null,
      lifestyleTagIds: [],
      eventTagIds: ["tag-vacation"],
    },
  ] as const;

  it("matches keywords case-insensitively as substrings", () => {
    expect(ruleMatchesDescription("Purchase at ica maxi", rules[0])).toBe(true);
    expect(ruleMatchesDescription("NETFLIX.COM", rules[1])).toBe(true);
    expect(ruleMatchesDescription("Salary", rules[0])).toBe(false);
  });

  it("returns the first matching rule in list order", () => {
    const overlappingRules = [
      {
        id: "rule-a",
        keywords: ["shop"],
        categoryId: "cat-a",
        sinkId: null,
        lifestyleTagIds: [],
        eventTagIds: [],
      },
      {
        id: "rule-b",
        keywords: ["shop"],
        categoryId: "cat-b",
        sinkId: null,
        lifestyleTagIds: [],
        eventTagIds: [],
      },
    ];

    expect(findMatchingRule("Online shop payment", overlappingRules)?.id).toBe(
      "rule-a",
    );
  });

  it("maps a matched rule to an assignment", () => {
    const matchedRule = findMatchingRule("ICA KVITTO", rules);
    expect(assignmentFromRule(matchedRule)).toEqual({
      categoryId: "cat-groceries",
      sinkId: null,
      lifestyleTagIds: ["tag-food"],
      eventTagIds: [],
    });
  });

  it("returns empty assignment when no rule matches", () => {
    expect(assignmentFromRule(findMatchingRule("Salary", rules))).toEqual({
      categoryId: null,
      sinkId: null,
      lifestyleTagIds: [],
      eventTagIds: [],
    });
  });
});
