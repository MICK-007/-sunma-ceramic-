import { Request } from 'express';
import { getDbClient } from '../db';

export async function logSecurityEvent(
  eventType: string,
  userId: string | null,
  req: Request,
  details?: Record<string, any>
) {
  const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  // Sanitize details to ensure 0 passwords, tokens, or credentials are logged
  const sanitizedDetails: Record<string, any> = {};
  if (details) {
    for (const [key, value] of Object.entries(details)) {
      if (
        key.toLowerCase().includes('password') ||
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('secret') ||
        key.toLowerCase().includes('credential')
      ) {
        continue; // Exclude sensitive keys
      }
      sanitizedDetails[key] = value;
    }
  }

  const sql = getDbClient();
  if (sql) {
    try {
      await sql`
        INSERT INTO security_events (user_id, event_type, details, ip_address, user_agent)
        VALUES (${userId}, ${eventType}, ${sql.json(sanitizedDetails)}, ${ipAddress}, ${userAgent});
      `;
      await sql.end();
    } catch (err) {
      console.error('Error logging security event:', err);
      if (sql) await sql.end().catch(() => {});
    }
  }
}
