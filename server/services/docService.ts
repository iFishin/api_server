import type { ApiDocument } from '../../src/types/api'

const apiDocs: Record<string, ApiDocument> = {};

export function registerApiDoc(doc: ApiDocument) {
  const key = `${doc.method.toUpperCase()} ${doc.path}`;
  apiDocs[key] = doc;
}

export function getApiDocs() {
  return Object.values(apiDocs);
}