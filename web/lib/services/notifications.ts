export async function notifyUser(userId: string, event: string, payload: any) {
  console.log(`[Notification] To User ${userId}: ${event}`, payload);
  // Future: Implement Pusher/Ably here for Vercel support
}

export async function notifyDriver(driverId: string, event: string, payload: any) {
  console.log(`[Notification] To Driver ${driverId}: ${event}`, payload);
}

export async function notifyAdmins(event: string, payload: any) {
  console.log(`[Notification] To Admins: ${event}`, payload);
}

export async function broadcast(event: string, payload: any) {
  console.log(`[Notification] Broadcast: ${event}`, payload);
}
