import { writable } from 'svelte/store';

export const policyModalIssueId = writable<string | null>(null);

export function openPolicyModal(issueId: string | null = null) {
  policyModalIssueId.set(issueId ?? null);
}

export function closePolicyModal() {
  policyModalIssueId.set(null);
}
