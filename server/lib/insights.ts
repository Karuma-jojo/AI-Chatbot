
import { db } from "../db";
import { internships, type InsightStats } from "@shared/schema";
import { sql, desc, eq, isNotNull } from "drizzle-orm";

export async function getInsights(): Promise<InsightStats> {
  const allData = await db.select().from(internships);
  
  // Helpers
  const countBy = (arr: any[], key: string) => {
    const map = new Map<string, number>();
    arr.forEach(item => {
      const val = item[key];
      if (val) {
        const k = String(val);
        map.set(k, (map.get(k) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  };

  const top_cities = countBy(allData, 'city').slice(0, 10);
  
  const remoteCount = allData.filter(i => i.is_remote).length;
  const onsiteCount = allData.length - remoteCount;
  const remote_vs_onsite = [
    { name: 'Remote', count: remoteCount },
    { name: 'On-site', count: onsiteCount }
  ];

  const top_profiles = countBy(allData, 'profile').slice(0, 10);
  
  // Flatten skills
  const skillCounts = new Map<string, number>();
  allData.forEach(item => {
    (item.skills_tokens || []).forEach((s: string) => {
      if (s) skillCounts.set(s, (skillCounts.get(s) || 0) + 1);
    });
  });
  const top_skills = Array.from(skillCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const stipend_distribution = countBy(allData, 'stipend_type');
  
  // Duration bins
  const durationMap = new Map<string, number>();
  allData.forEach(item => {
    const d = Number(item.duration_months || 0);
    const k = d > 0 ? `${Math.round(d)} Months` : 'Unknown';
    durationMap.set(k, (durationMap.get(k) || 0) + 1);
  });
  const duration_distribution = Array.from(durationMap.entries())
    .map(([name, count]) => ({ name, count }));

  // Generate bullets
  const bullet_points = [
    `Total internships analyzed: ${allData.length}`,
    `Most popular role: ${top_profiles[0]?.name || 'N/A'}`,
    `Top skill in demand: ${top_skills[0]?.name || 'N/A'}`,
    `${((remoteCount / allData.length) * 100).toFixed(1)}% of internships offer remote work.`,
    `Most common duration is ${duration_distribution.sort((a,b)=>b.count-a.count)[0]?.name}.`,
    `Top city for internships: ${top_cities[0]?.name}.`
  ];

  return {
    top_cities,
    remote_vs_onsite,
    top_profiles,
    top_skills,
    stipend_distribution,
    duration_distribution,
    bullet_points
  };
}
