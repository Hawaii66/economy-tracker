import { describe, expect, it } from "vitest";
import {
  assignmentFromRule,
  findMatchingCategorizeRule,
  findMatchingInternalTransferRule,
  findMatchingRule,
  ruleMatchesDescription,
} from "budget-core";

describe("import rule matching", () => {
  const rules = [
    {
      id: "rule-ica",
      keywords: ["ICA"],
      ruleType: "categorize" as const,
      categoryId: "cat-groceries",
      sinkId: null,
      lifestyleTagIds: ["tag-food"],
      eventTagIds: [],
    },
    {
      id: "rule-netflix",
      keywords: ["netflix"],
      ruleType: "categorize" as const,
      categoryId: "cat-entertainment",
      sinkId: null,
      lifestyleTagIds: [],
      eventTagIds: ["tag-vacation"],
    },
    {
      id: "rule-transfer",
      keywords: ["överföring"],
      ruleType: "internal_transfer" as const,
      categoryId: null,
      sinkId: null,
      lifestyleTagIds: [],
      eventTagIds: [],
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
        ruleType: "categorize" as const,
        categoryId: "cat-a",
        sinkId: null,
        lifestyleTagIds: [],
        eventTagIds: [],
      },
      {
        id: "rule-b",
        keywords: ["shop"],
        ruleType: "categorize" as const,
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
    expect(assignmentFromRule(findMatchingCategorizeRule("Salary", rules))).toEqual({
      categoryId: null,
      sinkId: null,
      lifestyleTagIds: [],
      eventTagIds: [],
    });
  });

  it("matches internal transfer rules separately from categorize rules", () => {
    expect(
      findMatchingInternalTransferRule("Intern överföring till sparkonto", rules)?.id,
    ).toBe("rule-transfer");
    expect(findMatchingCategorizeRule("Intern överföring till sparkonto", rules)).toBeNull();
    expect(findMatchingRule("Intern överföring till sparkonto", rules)).toBeNull();
  });

  it("does not match internal transfer rules via categorize matching", () => {
    expect(findMatchingCategorizeRule("ICA KVITTO", rules)?.id).toBe("rule-ica");
    expect(findMatchingInternalTransferRule("ICA KVITTO", rules)).toBeNull();
  });
});
