
import { internships, type InsertInternship, type Internship } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getInternship(id: number): Promise<Internship | undefined>;
  createInternship(internship: InsertInternship): Promise<Internship>;
  getAllInternships(): Promise<Internship[]>;
}

export class DatabaseStorage implements IStorage {
  async getInternship(id: number): Promise<Internship | undefined> {
    const [result] = await db.select().from(internships).where(eq(internships.id, id));
    return result;
  }

  async createInternship(internship: InsertInternship): Promise<Internship> {
    const [result] = await db.insert(internships).values(internship).returning();
    return result;
  }

  async getAllInternships(): Promise<Internship[]> {
    return await db.select().from(internships);
  }
}

export const storage = new DatabaseStorage();
