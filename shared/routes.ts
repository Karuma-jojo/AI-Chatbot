
import { z } from 'zod';
import { internships, searchParamsSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  internships: {
    match: {
      method: 'POST' as const,
      path: '/api/internships/match',
      input: searchParamsSchema,
      responses: {
        200: z.array(z.custom<any>()), // RecommendationResult
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/internships',
      responses: {
        200: z.array(z.custom<typeof internships.$inferSelect>()),
      },
    }
  },
  insights: {
    get: {
      method: 'GET' as const,
      path: '/api/insights',
      responses: {
        200: z.custom<any>(), // InsightStats
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
