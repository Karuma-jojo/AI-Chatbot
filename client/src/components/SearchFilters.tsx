import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { searchParamsSchema, type SearchParams } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, SlidersHorizontal } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface SearchFiltersProps {
  onSearch: (data: SearchParams) => void;
  isLoading: boolean;
}

export function SearchFilters({ onSearch, isLoading }: SearchFiltersProps) {
  const form = useForm<SearchParams>({
    resolver: zodResolver(searchParamsSchema),
    defaultValues: {
      skills: "Python, Data Analysis, React",
      min_stipend: 0,
      duration_months: 6,
      include_unpaid: false,
      sort_mode: "best_match",
      location: "", // Empty string means "Any" in our UI logic
    },
  });

  const onSubmit = (data: SearchParams) => {
    onSearch(data);
  };

  const locationMode = form.watch("location");
  // Simple heuristic for UI state: if empty -> "Any", if "Remote" -> "Remote", else -> "City"
  // But our schema just takes a string. We'll manage the UI state separately if needed, 
  // or just use the input directly. Let's keep it simple: Text input for location, empty = any.

  return (
    <Card className="h-fit sticky top-4 border-none shadow-none bg-transparent lg:bg-card lg:border lg:border-border lg:shadow-sm">
      <CardHeader className="px-0 pt-0 lg:p-6 lg:pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <SlidersHorizontal className="w-5 h-5 text-primary" />
          Filter Criteria
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 lg:p-6 lg:pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-foreground/80">Skills (Required)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g. Python, React, Marketing..." 
                      className="resize-none min-h-[80px] text-sm bg-background"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Comma-separated list of your top skills.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-5">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-foreground/80">Location Preference</FormLabel>
                    <FormControl>
                      <Input placeholder="City name (or leave empty for Any)" {...field} className="bg-background" />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Type "Remote" for work-from-home only.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_stipend"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-foreground/80">Min. Monthly Stipend (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(Number(e.target.value))}
                        className="bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="duration_months"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center mb-2">
                    <FormLabel className="font-semibold text-foreground/80">Max Duration</FormLabel>
                    <span className="text-sm text-primary font-bold">{field.value} months</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={1}
                      max={12}
                      step={1}
                      defaultValue={[field.value || 6]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                      className="py-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sort_mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-foreground/80">Sort Results By</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select sorting" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="best_match">Best Match Score</SelectItem>
                      <SelectItem value="highest_stipend">Highest Stipend</SelectItem>
                      <SelectItem value="closest_deadline">Closest Deadline</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="include_unpaid"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 bg-muted/20">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium cursor-pointer">
                      Include unpaid internships
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full text-base py-6 shadow-md shadow-primary/20" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Finding Matches...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Find Internships
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
