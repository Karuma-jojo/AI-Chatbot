
import { internships, type Internship, type RecommendationResult, type SearchParams } from "@shared/schema";
import { db } from "../db";
import natural from "natural";
import { sql, desc, eq } from "drizzle-orm";

let tfidf = new natural.TfIdf();
let cachedInternships: Internship[] = [];
let lastCacheTime = 0;

async function refreshCache() {
  const now = Date.now();
  if (now - lastCacheTime < 1000 * 60 * 5 && cachedInternships.length > 0) return; // 5 min cache

  cachedInternships = await db.select().from(internships);
  
  tfidf = new natural.TfIdf();
  cachedInternships.forEach(item => {
    tfidf.addDocument(item.text_blob || "");
  });
  
  lastCacheTime = now;
}

export async function matchInternships(params: SearchParams): Promise<RecommendationResult[]> {
  await refreshCache();
  
  // 1. Filter (Hard constraints)
  let filtered = cachedInternships.filter(item => {
    // Location
    if (params.location === "Remote/WFH only") {
      if (!item.is_remote) return false;
    } else if (params.location && params.location !== "Any") {
      if (!item.city?.toLowerCase().includes(params.location.toLowerCase())) return false;
    }

    // Unpaid
    if (!params.include_unpaid && item.stipend_type === 'unpaid') return false;

    // Min Stipend
    if (params.min_stipend > 0) {
      const max = Number(item.stipend_max || 0);
      if (item.stipend_type !== 'unknown' && max < params.min_stipend) return false;
    }

    // Duration
    if (params.duration_months) {
      const dur = Number(item.duration_months || 0);
      if (dur > 0 && dur > params.duration_months) return false;
    }

    return true;
  });

  if (filtered.length === 0) return [];

  // 2. Score
  const userSkillsTokens = params.skills.toLowerCase().split(/[,|]/).map(s => s.trim()).filter(Boolean);
  const queryText = params.skills; // Used for TF-IDF

  // Pre-calculate max values for normalization
  const maxStipend = Math.max(...filtered.map(i => Number(i.stipend_max || 0)));
  const now = new Date().getTime();

  const results: RecommendationResult[] = filtered.map((item, index) => {
    // 2.1 Similarity Score (TF-IDF + Jaccard for explicit skills)
    // We use TF-IDF for the blob, but also boost if explicit skills match
    let similarity = 0;
    
    // TF-IDF measure (simulated by using the index since we built it in order)
    // Ideally we'd look up by ID but natural's TfIdf is array-based. 
    // We need to match the filtered item back to the cachedInternships index or re-run TF-IDF on filtered set.
    // Re-running for query on the document:
    tfidf.tfidfs(queryText, (i, measure) => {
      if (cachedInternships[i].id === item.id) {
        similarity = measure;
      }
    });

    // Normalize similarity roughly (TF-IDF is unbounded, but usually < 5-10 for short text)
    similarity = Math.min(similarity / 5, 1);

    // 2.2 Stipend Score
    let stipendScore = 0;
    const sMax = Number(item.stipend_max || 0);
    if (item.stipend_type === 'unknown') stipendScore = 0.5; // median assumption
    else if (maxStipend > 0) stipendScore = sMax / maxStipend;

    // 2.3 Deadline Score
    let deadlineScore = 0.5;
    if (item.apply_by_dt) {
      const diffDays = (item.apply_by_dt.getTime() - now) / (1000 * 3600 * 24);
      if (diffDays > 0 && diffDays < 30) deadlineScore = 1 - (diffDays / 60); // closer is better but not too close? 
      // Actually prompt says: "nearer future deadlines slightly higher"
      if (diffDays > 0) deadlineScore = 1 / (Math.log(diffDays + 2)); // decay
    }

    // Final Score
    const finalScore = (0.75 * similarity) + (0.15 * stipendScore) + (0.10 * deadlineScore);

    // Explanation
    const matchedSkills = userSkillsTokens.filter(t => 
      (item.skills_tokens || []).some(s => s?.toLowerCase().includes(t))
    );

    const explanation = `Matches ${matchedSkills.length} skills (${matchedSkills.join(', ')}). ` +
      `${item.is_remote ? 'Remote work available.' : ''} ` +
      `${item.stipend ? `Stipend: ${item.stipend}.` : ''}`;

    return {
      ...item,
      match_score: finalScore,
      similarity_score: similarity,
      stipend_score: stipendScore,
      deadline_score: deadlineScore,
      matched_skills: matchedSkills,
      explanation
    };
  });

  // 3. Sort
  if (params.sort_mode === 'highest_stipend') {
    results.sort((a, b) => Number(b.stipend_max || 0) - Number(a.stipend_max || 0));
  } else if (params.sort_mode === 'closest_deadline') {
    results.sort((a, b) => {
      const da = a.apply_by_dt?.getTime() || Infinity;
      const db = b.apply_by_dt?.getTime() || Infinity;
      return da - db;
    });
  } else {
    // Best Match
    results.sort((a, b) => b.match_score - a.match_score);
  }

  return results.slice(0, 50); // Top 50
}
