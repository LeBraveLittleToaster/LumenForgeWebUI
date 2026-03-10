import { HttpParams } from '@angular/common/http';

export type Primitive = string | number | boolean;

export function toHttpParams(
  obj: Record<string, Primitive | null | undefined>
): HttpParams {
  let params = new HttpParams();

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    params = params.set(key, String(value));
  }

  return params;
}