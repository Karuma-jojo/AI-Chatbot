
import { db } from "../db";
import { internships, type InsertInternship } from "@shared/schema";
import { preprocessInternship } from "./preprocess";

const MOCK_DATA = [
  {
    profile: "Software Engineer Intern",
    company: "Tech Corp",
    location: "Bangalore",
    stipend: "25,000 /month",
    duration: "6 Months",
    skills: "React, Node.js, TypeScript",
    start_date: "Immediate",
    apply_by_date: "2025-04-01",
    offer: "PPO Available",
    perks: "Flexible hours, Free food",
    education: "B.Tech",
    date_time: "2025-02-01",
    internship_id: "101"
  },
  {
    profile: "Data Science Intern",
    company: "DataViz Inc",
    location: "Work From Home",
    stipend: "15,000-20,000 /month",
    duration: "3 Months",
    skills: "Python, Pandas, SQL, Machine Learning",
    start_date: "Immediate",
    apply_by_date: "2025-03-15",
    offer: "Certificate",
    perks: "Remote",
    education: "Any Degree",
    date_time: "2025-02-02",
    internship_id: "102"
  },
  {
    profile: "Marketing Intern",
    company: "Growth Hacking LLC",
    location: "Delhi",
    stipend: "Unpaid",
    duration: "2 Months",
    skills: "Social Media, Content Writing, SEO",
    start_date: "20 Feb 2025",
    apply_by_date: "2025-02-15",
    offer: "Letter of Recommendation",
    perks: "Certificate",
    education: "BBA/MBA",
    date_time: "2025-02-03",
    internship_id: "103"
  },
  {
    profile: "Full Stack Developer",
    company: "Startup Hub",
    location: "Mumbai",
    stipend: "30,000 /month",
    duration: "6 Months",
    skills: "MERN Stack, AWS, Docker",
    start_date: "Immediate",
    apply_by_date: "2025-04-10",
    offer: "Job Offer",
    perks: "Equity options",
    education: "Computer Science",
    date_time: "2025-02-04",
    internship_id: "104"
  },
  {
    profile: "UI/UX Designer",
    company: "Creative Studio",
    location: "Remote",
    stipend: "10,000 /month",
    duration: "3 Months",
    skills: "Figma, Adobe XD, Prototyping",
    start_date: "Immediate",
    apply_by_date: "2025-03-01",
    offer: "Certificate",
    perks: "Flexible hours",
    education: "Design Degree",
    date_time: "2025-02-05",
    internship_id: "105"
  }
];

// Generate 100 variations
function generateMockData(): any[] {
  const titles = ["Frontend", "Backend", "Full Stack", "Data Analyst", "Product Manager", "Graphic Designer", "Content Writer", "HR Intern", "Sales Intern", "Cybersecurity"];
  const companies = ["Google", "Microsoft", "Amazon", "Flipkart", "Swiggy", "Zomato", "Cred", "Paytm", "Razorpay", "Zoho"];
  const locs = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune", "Remote", "Work From Home", "Chennai", "Gurgaon", "Noida"];
  const skillsList = ["Python", "Java", "C++", "React", "Angular", "Vue", "SQL", "NoSQL", "AWS", "Azure", "Excel", "PowerBI", "Figma", "Photoshop", "SEO", "Marketing"];
  
  const data = [...MOCK_DATA];
  
  for (let i = 0; i < 200; i++) {
    const title = titles[Math.floor(Math.random() * titles.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const location = locs[Math.floor(Math.random() * locs.length)];
    const stipendVal = Math.floor(Math.random() * 40) * 1000;
    const isUnpaid = Math.random() > 0.8;
    const stipend = isUnpaid ? "Unpaid" : `${stipendVal} /month`;
    
    // Pick 3 random skills
    const skillSet = [];
    for(let j=0; j<3; j++) skillSet.push(skillsList[Math.floor(Math.random() * skillsList.length)]);
    
    data.push({
      profile: `${title} Intern`,
      company: `${company} ${Math.floor(Math.random()*100)}`,
      location: location,
      stipend: stipend,
      duration: `${Math.floor(Math.random() * 6 + 1)} Months`,
      skills: skillSet.join(", "),
      start_date: "Immediate",
      apply_by_date: "2025-05-01",
      offer: Math.random() > 0.5 ? "PPO" : "Certificate",
      perks: "None",
      education: "Any",
      date_time: new Date().toISOString(),
      internship_id: `mock-${i}`
    });
  }
  return data;
}

export async function seedDatabase() {
  const existing = await db.select().from(internships).limit(1);
  if (existing.length > 0) return;

  console.log("Seeding database with mock data...");
  const rawData = generateMockData();
  
  const processedData: InsertInternship[] = rawData.map(row => {
    const processed = preprocessInternship(row);
    return {
      ...row,
      ...processed
    };
  });
  
  // Insert in chunks
  const chunkSize = 50;
  for (let i = 0; i < processedData.length; i += chunkSize) {
    await db.insert(internships).values(processedData.slice(i, i + chunkSize));
  }
  console.log("Seeding complete.");
}
