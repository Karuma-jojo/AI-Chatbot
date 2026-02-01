import { useQuery, useMutation } from "@tanstack/react-query";
import { api, type SearchParams, type RecommendationResult, type InsightStats } from "@shared/routes";

// POST /api/internships/match
export function useMatchInternships() {
  return useMutation({
    mutationFn: async (params: SearchParams) => {
      const res = await fetch(api.internships.match.path, {
        method: api.internships.match.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch recommendations");
      }
      
      // We know the response structure from schema
      return await res.json() as RecommendationResult[];
    }
  });
}

// GET /api/insights
export function useInsights() {
  return useQuery({
    queryKey: [api.insights.get.path],
    queryFn: async () => {
      const res = await fetch(api.insights.get.path, { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to fetch insights");
      }
      return await res.json() as InsightStats;
    }
  });
}

// GET /api/internships (Standard list)
export function useInternshipsList() {
  return useQuery({
    queryKey: [api.internships.list.path],
    queryFn: async () => {
      const res = await fetch(api.internships.list.path, { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to fetch internship list");
      }
      return await res.json();
    }
  });
}
