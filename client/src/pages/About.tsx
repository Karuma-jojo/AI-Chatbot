import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Cpu, Database, Search } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-8">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-display font-bold text-foreground">About InternMatch</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          An intelligent recommendation system powered by TF-IDF and Cosine Similarity 
          to connect students with their ideal internship opportunities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <Database className="w-8 h-8 text-primary mb-2" />
            <CardTitle>Data Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We ingest thousands of raw internship listings, cleaning and normalizing text data, locations, and stipend information into a structured PostgreSQL database.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-accent/5 border-accent/20">
          <CardHeader>
            <Cpu className="w-8 h-8 text-accent mb-2" />
            <CardTitle>TF-IDF Engine</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our core engine calculates Term Frequency-Inverse Document Frequency vectors for every internship description and your profile to find semantic matches.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardHeader>
            <Search className="w-8 h-8 text-emerald-500 mb-2" />
            <CardTitle>Smart Scoring</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We don't just keyword match. We compute a weighted composite score based on skill overlap, stipend preferences, location compatibility, and duration.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How the Matching Algorithm Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">1. Vectorization</h3>
            <p className="text-muted-foreground leading-relaxed">
              When you enter your skills, we convert them into a mathematical vector. Simultaneously, every internship in our database has been pre-processed into a vector representing its requirements (skills, description, profile).
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">2. Similarity Calculation</h3>
            <p className="text-muted-foreground leading-relaxed">
              We use <strong>Cosine Similarity</strong> to measure the angle between your skill vector and each internship vector. A smaller angle means a higher similarity score (0 to 1).
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">3. Weighted Ranking</h3>
            <p className="text-muted-foreground leading-relaxed">
              The final "Match Score" is a weighted average of multiple factors:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Badge variant="outline" className="bg-background">50%</Badge>
                <span className="font-medium text-sm">Semantic Skill Match</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Badge variant="outline" className="bg-background">20%</Badge>
                <span className="font-medium text-sm">Location Compatibility</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Badge variant="outline" className="bg-background">20%</Badge>
                <span className="font-medium text-sm">Stipend Value</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Badge variant="outline" className="bg-background">10%</Badge>
                <span className="font-medium text-sm">Application Urgency</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center pt-8 border-t border-border">
        <h4 className="font-medium mb-4">Tech Stack</h4>
        <div className="flex flex-wrap justify-center gap-2">
          {["React", "TypeScript", "Node.js", "PostgreSQL", "Drizzle ORM", "TailwindCSS", "Recharts", "Natural NLP", "TanStack Query"].map(tech => (
            <Badge key={tech} variant="secondary">{tech}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
