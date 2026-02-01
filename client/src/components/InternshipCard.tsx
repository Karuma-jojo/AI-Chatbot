import { type RecommendationResult } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Calendar, 
  DollarSign, 
  ExternalLink, 
  Sparkles 
} from "lucide-react";
import { motion } from "framer-motion";

interface InternshipCardProps {
  internship: RecommendationResult;
  index: number;
}

export function InternshipCard({ internship, index }: InternshipCardProps) {
  // Format match score as percentage
  const matchPercentage = Math.round(internship.match_score * 100);

  // Color coding for match score
  const scoreColor = 
    matchPercentage >= 85 ? "bg-emerald-500 text-white" :
    matchPercentage >= 70 ? "bg-primary text-white" :
    "bg-amber-500 text-white";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border-border/60 group">
        <CardHeader className="p-5 pb-3 space-y-3">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="font-display font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                {internship.profile}
              </h3>
              <p className="text-muted-foreground font-medium text-sm mt-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                {internship.company}
              </p>
            </div>
            
            <div className={`flex flex-col items-center justify-center min-w-[3rem] h-12 rounded-lg ${scoreColor} shadow-sm`}>
              <span className="text-sm font-bold leading-none">{matchPercentage}%</span>
              <span className="text-[10px] opacity-90 font-medium mt-0.5">Match</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-5 pt-2 flex-grow space-y-4">
          <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary/70" />
              <span className="truncate" title={internship.location || "Remote"}>
                {internship.is_remote ? "Remote" : internship.location}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary/70" />
              <span className="truncate" title={internship.stipend || "Unpaid"}>
                {internship.stipend || "Unpaid"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary/70" />
              <span>{internship.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary/70" />
              <span>By {internship.apply_by_date}</span>
            </div>
          </div>

          <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-primary block mb-1">Why Recommended</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {internship.explanation}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {internship.matched_skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-[10px] font-medium px-1.5 py-0.5 h-5 bg-secondary text-secondary-foreground/80 hover:bg-secondary-foreground/10">
                {skill}
              </Badge>
            ))}
            {internship.matched_skills.length > 3 && (
              <span className="text-[10px] text-muted-foreground self-center px-1">
                +{internship.matched_skills.length - 3} more
              </span>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-4 bg-muted/30 border-t border-border/50 flex justify-between items-center gap-3">
          <Button variant="outline" size="sm" className="w-full text-xs font-semibold h-9" asChild>
            <a href={`https://internshala.com/internship/detail/${internship.internship_id}`} target="_blank" rel="noopener noreferrer">
              View Details <ExternalLink className="ml-1.5 w-3 h-3" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
