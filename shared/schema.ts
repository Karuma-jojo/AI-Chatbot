
import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const internships = pgTable("internships", {
  id: serial("id").primaryKey(),
  
  // Raw columns from CSV
  internship_id: text("internship_id").unique(),
  date_time: text("date_time"),
  profile: text("profile"),
  company: text("company"),
  location: text("location"),
  start_date: text("start_date"),
  stipend: text("stipend"),
  duration: text("duration"),
  apply_by_date: text("apply_by_date"),
  offer: text("offer"),
  education: text("education"),
  skills: text("skills"),
  perks: text("perks"),

  // Processed columns
  stipend_min: numeric("stipend_min"),
  stipend_max: numeric("stipend_max"),
  stipend_type: text("stipend_type"), // fixed, range, unpaid, performance_based, unknown
  stipend_period: text("stipend_period"), // month, week, lump_sum, unknown
  
  duration_months: numeric("duration_months"),
  
  apply_by_dt: timestamp("apply_by_dt"),
  posted_dt: timestamp("posted_dt"),
  start_dt: timestamp("start_dt"),
  start_immediate: boolean("start_immediate"),
  
  is_remote: boolean("is_remote"),
  city: text("city"),
  is_multi_city: boolean("is_multi_city"),
  
  skills_tokens: text("skills_tokens").array(), // Array of strings
  text_blob: text("text_blob"), // For TF-IDF
});

export const insertInternshipSchema = createInsertSchema(internships).omit({ 
  id: true 
});

export type Internship = typeof internships.$inferSelect;
export type InsertInternship = z.infer<typeof insertInternshipSchema>;

// Input for the recommender
export const searchParamsSchema = z.object({
  skills: z.string(), // comma-separated
  location: z.string().optional(),
  min_stipend: z.number().default(0),
  duration_months: z.number().optional(), // max duration
  include_unpaid: z.boolean().default(false),
  sort_mode: z.enum(["best_match", "highest_stipend", "closest_deadline"]).default("best_match"),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

export interface RecommendationResult extends Internship {
  match_score: number;
  similarity_score: number;
  stipend_score: number;
  deadline_score: number;
  matched_skills: string[];
  explanation: string;
}

export interface InsightStats {
  top_cities: { name: string; count: number }[];
  remote_vs_onsite: { name: string; count: number }[];
  top_profiles: { name: string; count: number }[];
  top_skills: { name: string; count: number }[];
  stipend_distribution: { name: string; count: number }[];
  duration_distribution: { name: string; count: number }[];
  bullet_points: string[];
}
