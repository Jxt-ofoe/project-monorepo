const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function apiFetch(path: string, options: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`);
  return data;
}

export async function login(email: string, password: string) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(body: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: string;
}) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getAnalytics(token: string) {
  return apiFetch("/api/admin/analytics", {}, token);
}

export async function getShipments(token: string, filters?: Record<string, string>) {
  const qs = filters ? "?" + new URLSearchParams(filters).toString() : "";
  return apiFetch(`/api/shipments${qs}`, {}, token);
}

export async function getAllOrders(token: string, filters?: Record<string, string>) {
  const qs = filters ? "?" + new URLSearchParams(filters).toString() : "";
  return apiFetch(`/api/dispatcher/orders${qs}`, {}, token);
}

export async function createShipment(token: string, body: Record<string, unknown>) {
  return apiFetch("/api/shipments", { method: "POST", body: JSON.stringify(body) }, token);
}

export async function calculateQuote(token: string, body: Record<string, unknown>) {
  return apiFetch("/api/shipments/calculate-quote", { method: "POST", body: JSON.stringify(body) }, token);
}

export async function getShipment(token: string, id: string) {
  return apiFetch(`/api/shipments/${id}`, {}, token);
}

export async function trackShipment(token: string, trackingNumber: string) {
  return apiFetch(`/api/track/${trackingNumber}`, {}, token);
}

export async function updateShipmentStatus(token: string, id: string, body: Record<string, unknown>) {
  return apiFetch(`/api/shipments/${id}/status`, { method: "PATCH", body: JSON.stringify(body) }, token);
}

export async function assignDriver(token: string, id: string, body: Record<string, unknown>) {
  return apiFetch(`/api/shipments/${id}/assign`, { method: "PATCH", body: JSON.stringify(body) }, token);
}

export async function getDrivers(token: string) {
  const data = await apiFetch("/api/admin/drivers", {}, token);
  // Normalize nested {driver, user, vehicle} to flat driver objects
  if (Array.isArray(data)) {
    return data.map((d: Record<string, Record<string, string | number>>) => ({
      id: d.driver?.id,
      fullName: d.user?.fullName,
      email: d.user?.email,
      phone: d.user?.phone,
      status: d.driver?.status,
      licenseNumber: d.driver?.licenseNumber,
      currentLat: d.driver?.currentLat,
      currentLng: d.driver?.currentLng,
      rating: d.driver?.rating,
      totalDeliveries: d.driver?.totalDeliveries,
      vehicleId: d.driver?.vehicleId,
      vehicle: d.vehicle,
    }));
  }
  return data;
}

export async function getVehicles(token: string) {
  return apiFetch("/api/vehicles", {}, token);
}

export async function getDriverJobs(token: string) {
  return apiFetch("/api/driver/jobs", {}, token);
}

export async function cancelShipment(token: string, id: string) {
  return apiFetch(`/api/shipments/${id}/cancel`, { method: "POST" }, token);
}

export async function initializePayment(token: string, body: { email: string, amount: number, metadata: any }) {
  return apiFetch("/api/payments/initialize", { method: "POST", body: JSON.stringify(body) }, token);
}
