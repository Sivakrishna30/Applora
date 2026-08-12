// =============================================================================
// AppLora — Frontend API Client
// Full CRUD operations for all Phase 1 collections
// =============================================================================

import type {
  UserProfile,
  HomeProperty,
  Appliance,
  AppliancePopulated,
  WarrantyInfo,
  ApplianceDocument,
  ServiceRecord,
  OwnershipRecord,
  DashboardSummary,
  OCRScanResult,
} from '../types';

// ---------------------------------------------------------------------------
// Base fetch helper
// ---------------------------------------------------------------------------
async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const result = await res.json();
    return result;
  } catch (err: any) {
    return { success: false, error: err.message || 'Network request failed' };
  }
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export async function getUser(userId: string) {
  return apiFetch<UserProfile>(`/api/users/${userId}`);
}

export async function createUser(data: Partial<UserProfile>) {
  return apiFetch<UserProfile>('/api/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUser(userId: string, data: Partial<UserProfile>) {
  return apiFetch<UserProfile>(`/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Homes
// ---------------------------------------------------------------------------
export async function getHomes(userId?: string) {
  const query = userId ? `?userId=${userId}` : '';
  return apiFetch<HomeProperty[]>(`/api/homes${query}`);
}

export async function getHome(homeId: string) {
  return apiFetch<HomeProperty>(`/api/homes/${homeId}`);
}

export async function createHome(data: Partial<HomeProperty>) {
  return apiFetch<HomeProperty>('/api/homes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateHome(homeId: string, data: Partial<HomeProperty>) {
  return apiFetch<HomeProperty>(`/api/homes/${homeId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteHome(homeId: string) {
  return apiFetch<{ deleted: string }>(`/api/homes/${homeId}`, {
    method: 'DELETE',
  });
}

// ---------------------------------------------------------------------------
// Appliances
// ---------------------------------------------------------------------------
export async function getAppliances(homeId?: string) {
  const query = homeId ? `?homeId=${homeId}` : '';
  return apiFetch<AppliancePopulated[]>(`/api/appliances${query}`);
}

export async function getAppliance(applianceId: string) {
  return apiFetch<AppliancePopulated>(`/api/appliances/${applianceId}`);
}

export async function createAppliance(data: Partial<Appliance> & { warranty?: Partial<WarrantyInfo> }) {
  return apiFetch<AppliancePopulated>('/api/appliances', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAppliance(applianceId: string, data: Partial<Appliance>) {
  return apiFetch<AppliancePopulated>(`/api/appliances/${applianceId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAppliance(applianceId: string) {
  return apiFetch<{ deleted: string }>(`/api/appliances/${applianceId}`, {
    method: 'DELETE',
  });
}

// ---------------------------------------------------------------------------
// Warranties
// ---------------------------------------------------------------------------
export async function getWarranties(applianceId?: string) {
  const query = applianceId ? `?applianceId=${applianceId}` : '';
  return apiFetch<WarrantyInfo[]>(`/api/warranties${query}`);
}

export async function getWarranty(warrantyId: string) {
  return apiFetch<WarrantyInfo>(`/api/warranties/${warrantyId}`);
}

export async function createWarranty(data: Partial<WarrantyInfo>) {
  return apiFetch<WarrantyInfo>('/api/warranties', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateWarranty(warrantyId: string, data: Partial<WarrantyInfo>) {
  return apiFetch<WarrantyInfo>(`/api/warranties/${warrantyId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteWarranty(warrantyId: string) {
  return apiFetch<{ deleted: string }>(`/api/warranties/${warrantyId}`, {
    method: 'DELETE',
  });
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------
export async function getDocuments(applianceId?: string) {
  const query = applianceId ? `?applianceId=${applianceId}` : '';
  return apiFetch<ApplianceDocument[]>(`/api/documents${query}`);
}

export async function getDocument(documentId: string) {
  return apiFetch<ApplianceDocument>(`/api/documents/${documentId}`);
}

export async function createDocument(data: Partial<ApplianceDocument>) {
  return apiFetch<ApplianceDocument>('/api/documents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createDocumentsBulk(data: { documents: Partial<ApplianceDocument>[] }) {
  return apiFetch<ApplianceDocument[]>('/api/documents/bulk', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}



export async function updateDocument(documentId: string, data: Partial<ApplianceDocument>) {
  return apiFetch<ApplianceDocument>(`/api/documents/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteDocument(documentId: string) {
  return apiFetch<{ deleted: string }>(`/api/documents/${documentId}`, {
    method: 'DELETE',
  });
}

// ---------------------------------------------------------------------------
// Service Records
// ---------------------------------------------------------------------------
export async function getServiceRecords(applianceId?: string) {
  const query = applianceId ? `?applianceId=${applianceId}` : '';
  return apiFetch<ServiceRecord[]>(`/api/service-records${query}`);
}

export async function getServiceRecord(recordId: string) {
  return apiFetch<ServiceRecord>(`/api/service-records/${recordId}`);
}

export async function createServiceRecord(data: Partial<ServiceRecord>) {
  return apiFetch<ServiceRecord>('/api/service-records', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateServiceRecord(recordId: string, data: Partial<ServiceRecord>) {
  return apiFetch<ServiceRecord>(`/api/service-records/${recordId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteServiceRecord(recordId: string) {
  return apiFetch<{ deleted: string }>(`/api/service-records/${recordId}`, {
    method: 'DELETE',
  });
}

// ---------------------------------------------------------------------------
// Ownership Records
// ---------------------------------------------------------------------------
export async function getOwnershipRecords(applianceId?: string) {
  const query = applianceId ? `?applianceId=${applianceId}` : '';
  return apiFetch<OwnershipRecord[]>(`/api/ownership-records${query}`);
}

export async function createOwnershipRecord(data: Partial<OwnershipRecord>) {
  return apiFetch<OwnershipRecord>('/api/ownership-records', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export async function getDashboard(userId?: string) {
  const query = userId ? `?userId=${userId}` : '';
  return apiFetch<DashboardSummary>(`/api/dashboard${query}`);
}

// ---------------------------------------------------------------------------
// AI Routes (optional — kept from original)
// ---------------------------------------------------------------------------
export async function scanBillApi(payload: {
  imageBase64?: string;
  textContent?: string;
  mimeType?: string;
}): Promise<{ success: boolean; data?: OCRScanResult; error?: string }> {
  try {
    const res = await fetch('/api/scan-bill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    if (!text) {
      return { success: false, error: 'Empty response from server' };
    }

    try {
      const result = JSON.parse(text);
      return result;
    } catch (parseError) {
      console.error('Failed to parse JSON:', text);
      return { success: false, error: 'Invalid response format from server' };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Network request failed' };
  }
}

export async function sendAiChatApi(payload: {
  userMessage: string;
  applianceContext?: any;
  chatHistory?: any[];
}): Promise<{ success: boolean; reply: string }> {
  try {
    const res = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    if (!text) {
      return { success: false, reply: 'Empty response from server' };
    }

    try {
      const result = JSON.parse(text);
      return result;
    } catch (parseError) {
      console.error('Failed to parse AI chat JSON:', text);
      return { success: false, reply: 'Invalid response format from server' };
    }
  } catch (err: any) {
    return { success: false, reply: 'AI is currently unavailable.' };
  }
}

// Legacy exports for backward compatibility
export async function explainWarrantyApi(payload: any) {
  try {
    const res = await fetch('/api/ai-warranty-explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getRepairAdviceApi(payload: any) {
  try {
    const res = await fetch('/api/ai-repair-advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
