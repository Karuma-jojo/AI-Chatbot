import { useState } from "react";
import { SearchFilters } from "@/components/SearchFilters";
import { InternshipCard } from "@/components/InternshipCard";
import { useMatchInternships } from "@/hooks/use-internships";
import { SearchParams } from "@shared/schema";
import { AlertCircle, Download, ListFilter } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Matcher() {
  const [results, setResults] = useState<any[] | null>(null);
  const { mutate: matchInternships, isPending, error } = useMatchInternships();

  const handleSearch = (params: SearchParams) => {
    matchInternships(params, {
      onSuccess: (data) => {
        setResults(data);
      },
    });
  };

  const handleDownloadCSV = () => {
    if (!results || results.length === 0) return;
    
    // Simple CSV export logic
    const headers = ["Profile", "Company", "Location", "Stipend", "Duration", "Match Score", "Skills Matched"];
    const rows = results.map(r => [
      `"${r.profile}"`,
      `"${r.company}"`,
      `"${r.location}"`,
      `"${r.stipend}"`,
      `"${r.duration}"`,
      `${(r.match_score * 100).toFixed(1)}%`,
      `"${r.matched_skills.join(', ')}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "internship_matches.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-12">
      {/* Left Sidebar: Filters */}
      <aside className="w-full lg:w-80 flex-shrink-0">
        <SearchFilters onSearch={handleSearch} isLoading={isPending} />
      </aside>

      {/* Main Content: Results */}
      <main className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-display font-bold text-foreground">Matches</h2>
            <p className="text-muted-foreground mt-1">
              {results ? `Found ${results.length} recommended internships based on your profile.` : "Enter your skills to find the perfect internship match."}
            </p>
          </div>
          
          {results && results.length > 0 && (
            <Button variant="outline" onClick={handleDownloadCSV} className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {(error as Error).message || "Something went wrong while fetching recommendations."}
            </AlertDescription>
          </Alert>
        )}

        {isPending && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl border border-border p-4 space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-12 w-12 rounded-md" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <div className="space-y-2 mt-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isPending && results && results.length === 0 && (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
            <ListFilter className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold text-foreground">No matches found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              Try adjusting your filters, adding more skills, or lowering the minimum stipend requirement.
            </p>
          </div>
        )}

        {!isPending && results && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            {results.map((internship, index) => (
              <InternshipCard 
                key={internship.internship_id} 
                internship={internship} 
                index={index} 
              />
            ))}
          </div>
        )}
        
        {!isPending && !results && !error && (
          <div className="text-center py-32 opacity-50">
            <h3 className="text-xl font-medium text-muted-foreground">
              Configure filters and click "Find Internships" to start
            </h3>
          </div>
        )}
      </main>
    </div>
  );
}
