import {
  InsurancePolicyStatus,
  InsuranceRequirement,
  type Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { InsuranceDashboard, InsurancePolicy } from "@/types";

export class InsuranceValidationError extends Error {}

const requirements = Object.values(InsuranceRequirement);
const statuses = Object.values(InsurancePolicyStatus);

export type InsuranceFilters = {
  category?: string;
  requirement?: InsuranceRequirement;
  status?: InsurancePolicyStatus;
};

function clean(value: string | null) {
  const normalized = value?.trim();
  return normalized || undefined;
}

export function parseInsuranceFilters(search: URLSearchParams): InsuranceFilters {
  const category = clean(search.get("category"));
  const requirementValue = clean(search.get("requirement"));
  const statusValue = clean(search.get("status"));

  if (category && category.length > 80) throw new InsuranceValidationError("Category is too long.");
  if (requirementValue && !requirements.includes(requirementValue as InsuranceRequirement)) {
    throw new InsuranceValidationError("Invalid insurance requirement.");
  }
  if (statusValue && !statuses.includes(statusValue as InsurancePolicyStatus)) {
    throw new InsuranceValidationError("Invalid policy status.");
  }

  return {
    category,
    requirement: requirementValue as InsuranceRequirement | undefined,
    status: statusValue as InsurancePolicyStatus | undefined,
  };
}

const asNumber = (value: Prisma.Decimal) => Number(value);

export async function getInsuranceDashboard(filters: InsuranceFilters): Promise<InsuranceDashboard> {
  const where: Prisma.InsurancePolicyWhereInput = {
    ...(filters.category ? { category: { equals: filters.category, mode: "insensitive" } } : {}),
    ...(filters.requirement ? { requirement: filters.requirement } : {}),
    ...(filters.status ? { status: filters.status } : {}),
  };

  const [rows, categoryRows] = await Promise.all([
    prisma.insurancePolicy.findMany({ where, orderBy: [{ status: "asc" }, { expirationDate: "asc" }] }),
    prisma.insurancePolicy.findMany({ select: { category: true }, distinct: ["category"], orderBy: { category: "asc" } }),
  ]);

  const policies: InsurancePolicy[] = rows.map(({ createdAt: _createdAt, updatedAt: _updatedAt, ...row }) => ({
    ...row,
    coverageLimit: asNumber(row.coverageLimit),
    retainedAmount: asNumber(row.retainedAmount),
    annualPremium: asNumber(row.annualPremium),
    effectiveDate: row.effectiveDate.toISOString(),
    expirationDate: row.expirationDate.toISOString(),
  }));

  const byCategory = new Map<string, { name: string; policies: number; coverageLimit: number; annualPremium: number }>();
  const byRequirement = new Map<InsuranceRequirement, { name: InsuranceRequirement; policies: number; coverageLimit: number; annualPremium: number }>();

  for (const policy of policies) {
    const category = byCategory.get(policy.category) ?? { name: policy.category, policies: 0, coverageLimit: 0, annualPremium: 0 };
    category.policies += 1;
    category.coverageLimit += policy.coverageLimit;
    category.annualPremium += policy.annualPremium;
    byCategory.set(policy.category, category);

    const requirement = byRequirement.get(policy.requirement) ?? { name: policy.requirement, policies: 0, coverageLimit: 0, annualPremium: 0 };
    requirement.policies += 1;
    requirement.coverageLimit += policy.coverageLimit;
    requirement.annualPremium += policy.annualPremium;
    byRequirement.set(policy.requirement, requirement);
  }

  return {
    filters: {
      category: filters.category ?? null,
      requirement: filters.requirement ?? null,
      status: filters.status ?? null,
    },
    options: {
      categories: categoryRows.map((row) => row.category),
      requirements,
      statuses,
    },
    summary: {
      policyCount: policies.length,
      activePolicies: policies.filter((policy) => policy.status === "ACTIVE").length,
      renewalDue: policies.filter((policy) => policy.status === "RENEWAL_DUE").length,
      totalCoverageLimit: policies.reduce((sum, policy) => sum + policy.coverageLimit, 0),
      totalRetainedAmount: policies.reduce((sum, policy) => sum + policy.retainedAmount, 0),
      totalAnnualPremium: policies.reduce((sum, policy) => sum + policy.annualPremium, 0),
    },
    byCategory: [...byCategory.values()].sort((a, b) => b.coverageLimit - a.coverageLimit),
    byRequirement: [...byRequirement.values()].sort((a, b) => b.coverageLimit - a.coverageLimit),
    policies,
  };
}
