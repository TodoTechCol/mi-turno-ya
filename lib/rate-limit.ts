// Rate limiting simple en memoria, por instancia serverless. No es perfecto
// (cada instancia de Vercel tiene su propio contador, y se resetea en un
// cold start), pero es gratis, sin dependencias externas, y frena el abuso
// más obvio (scripts golpeando signup/booking en loop) sin agregar otra
// cuenta/servicio a mantener. Si en el futuro hay abuso real que esto no
// alcance a frenar, el siguiente paso es Upstash Redis (@upstash/ratelimit),
// que sí comparte estado entre instancias.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;

  bucket.count++;
  return true;
}

/**
 * IP del cliente a partir de los headers que agrega Vercel/el proxy.
 * "unknown" (todos comparten el mismo balde) es un fallback aceptable: peor
 * caso, en un entorno sin esos headers el límite se vuelve un poco más
 * estricto para todos en vez de no aplicar ninguno.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
