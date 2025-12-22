import { landlordContactsMock } from '@/mocks/landlord/contacts.mock';
import { tenantContactsMock } from '@/mocks/tenant/contacts.mock';
import { ContactRequest, ContactStatus } from '@/types/contact';

let contactStore: ContactRequest[] = [
  ...tenantContactsMock,
  ...landlordContactsMock.filter((c) => !tenantContactsMock.find((t) => t.id === c.id)),
];

export function addContact(contact: ContactRequest): ContactRequest {
  contactStore = [contact, ...contactStore];
  return contact;
}

export function getContactsByTenant(tenantId: string): ContactRequest[] {
  return contactStore.filter((c) => c.tenantId === tenantId);
}

export function getContactsByLandlord(landlordId: string): ContactRequest[] {
  return contactStore.filter((c) => c.landlordId === landlordId);
}

export function updateContactStatus(
  contactId: string,
  status: ContactStatus,
): ContactRequest | null {
  contactStore = contactStore.map((c) => (c.id === contactId ? { ...c, status } : c));
  return contactStore.find((c) => c.id === contactId) ?? null;
}
