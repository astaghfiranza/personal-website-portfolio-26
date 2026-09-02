/**
 * Helper to construct formatted mailto URLs with customizable subject and body
 */
export function buildMailtoUrl(
  email: string,
  subject?: string,
  body?: string,
  variables?: Record<string, string>
): string {
  if (!email) return '#';

  let finalSubject = subject || '';
  let finalBody = body || '';

  if (variables) {
    Object.entries(variables).forEach(([key, val]) => {
      finalSubject = finalSubject.replace(new RegExp(`{{${key}}}`, 'g'), val);
      finalBody = finalBody.replace(new RegExp(`{{${key}}}`, 'g'), val);
    });
  }

  const params = new URLSearchParams();
  if (finalSubject) params.set('subject', finalSubject);
  if (finalBody) params.set('body', finalBody);

  const queryString = params.toString().replace(/\+/g, '%20');
  return `mailto:${email}${queryString ? `?${queryString}` : ''}`;
}
