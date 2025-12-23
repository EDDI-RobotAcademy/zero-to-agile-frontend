import { ownerContactsMock } from '@/mocks/owner/contacts.mock';
import { finderContactsMock } from '@/mocks/finder/contacts.mock';
import { ContactRequest, ContactStatus } from '@/types/contact';

let contactStore: ContactRequest[] = [
  ...finderContactsMock,
  ...ownerContactsMock.filter((c) => !finderContactsMock.find((t) => t.id === c.id)),
];

export function addContact(contact: ContactRequest): ContactRequest {
  contactStore = [contact, ...contactStore];
  return contact;
}

export function getContactsByFinder(finderId: string): ContactRequest[] {
  return contactStore.filter((c) => c.finderId === finderId);
}

export function getContactsByOwner(ownerId: string): ContactRequest[] {
  return contactStore.filter((c) => c.ownerId === ownerId);
}

export function updateContactStatus(
  contactId: string,
  status: ContactStatus,
): ContactRequest | null {
  contactStore = contactStore.map((c) => (c.id === contactId ? { ...c, status } : c));
  return contactStore.find((c) => c.id === contactId) ?? null;
}
