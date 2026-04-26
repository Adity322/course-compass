'use client';

import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Compass, Search, SlidersHorizontal, Sparkles, Loader2 } from 'lucide-react';
import { fetchCourses, type CourseFromDB } from '@/lib/api';

const CACHE_KEY = 'coursesCache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Client-side caching with sessionStorage:
 * - Avoids redundant API calls when the user navigates back to the home page.
 * - TTL of 5 minutes ensures data stays reasonably fresh without hitting the server constantly.
 * - sessionStorage is scoped to the tab, so it doesn't persist stale data across sessions.
 */
function getCachedCourses(): CourseFromDB[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCachedCourses(courses: CourseFromDB[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: courses, timestamp: Date.now() }));
  } catch {
    // sessionStorage might be full or unavailable — fail silently
  }
}

export default function Home() {
  const [courses, setCourses] = useState<CourseFromDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('all');
  const [tuitionRange, setTuitionRange] = useState([0, 50000]);
  const [courseLevel, setCourseLevel] = useState('all');

  useEffect(() => {
    async function loadCourses() {
      // Check cache first
      const cached = getCachedCourses();
      if (cached) {
        setCourses(cached);
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchCourses();
        setCachedCourses(data);
        setCourses(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load courses';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, []);

  // Derive unique filter options from live data
  const universityOptions = useMemo(() => {
    const seen = new Set<string>();
    return courses
      .filter(c => {
        const name = c.universityName || '';
        if (seen.has(name)) return false;
        seen.add(name);
        return !!name;
      })
      .map(c => ({ value: c.universityName!, label: c.universityName! }));
  }, [courses]);

  const courseLevels = useMemo(() => {
    const levels = new Set(courses.map(c => c.courseLevel).filter(Boolean));
    return ['all', ...Array.from(levels)] as string[];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const name = course.courseName || course.title || '';
      const desc = course.overviewDescription || course.description || '';
      const fee = course.firstYearTuitionFee ?? 0;
      const uni = course.universityName || '';
      const level = course.courseLevel || '';

      return (
        (name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          desc.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedUniversity === 'all' || uni === selectedUniversity) &&
        fee <= tuitionRange[1] &&
        (courseLevel === 'all' || level === courseLevel)
      );
    });
  }, [courses, searchTerm, selectedUniversity, tuitionRange, courseLevel]);

  return (
    <div className="bg-background text-foreground">
      <section className="text-center py-20 px-4 bg-card border-b">
        <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tight text-primary">
          Find Your Perfect Course
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Navigate the world of education with Course Compass. Search thousands of courses from top universities.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="#search">
              <Compass className="mr-2" /> Start Exploring
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/course-match">
              <Sparkles className="mr-2" /> AI Course Match
            </Link>
          </Button>
        </div>
      </section>

      <section id="search" className="container mx-auto py-12 px-4">
        {isLoading && (
          <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading courses...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-destructive bg-destructive/10 rounded-lg p-8">
            <p className="font-semibold text-lg">Could not load courses</p>
            <p className="text-sm mt-2">{error}</p>
            <p className="text-sm mt-1 text-muted-foreground">Make sure your backend is running on port 8000.</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <div className="p-6 rounded-lg bg-card shadow-sm sticky top-24">
                <h3 className="font-headline text-2xl font-semibold mb-6 flex items-center gap-2 text-primary">
                  <SlidersHorizontal />
                  Filters
                </h3>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="search-term" className="text-sm font-medium">Search by Keyword</label>
                    <div className="relative mt-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="search-term"
                        type="text"
                        placeholder="e.g. Computer Science"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {universityOptions.length > 0 && (
                    <div>
                      <label htmlFor="university" className="text-sm font-medium">University</label>
                      <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                        <SelectTrigger id="university" className="w-full mt-2">
                          <SelectValue placeholder="Select University" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Universities</SelectItem>
                          {universityOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {courseLevels.length > 1 && (
                    <div>
                      <label htmlFor="course-level" className="text-sm font-medium">Course Level</label>
                      <Select value={courseLevel} onValueChange={setCourseLevel}>
                        <SelectTrigger id="course-level" className="w-full mt-2">
                          <SelectValue placeholder="Select Level" />
                        </SelectTrigger>
                        <SelectContent>
                          {courseLevels.map((level) => (
                            <SelectItem key={level} value={level} className="capitalize">{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium">Max. 1st Year Tuition (USD)</label>
                    <div className="flex items-center gap-4 mt-2">
                      <Slider
                        min={0}
                        max={50000}
                        step={1000}
                        value={[tuitionRange[1]]}
                        onValueChange={(value) => setTuitionRange([0, value[0]])}
                      />
                    </div>
                    <div className="text-right text-sm text-muted-foreground mt-1">
                      Up to ${tuitionRange[1].toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <main className="lg:col-span-3">
              <h2 className="font-headline text-3xl font-bold mb-6 text-primary">
                {filteredCourses.length} Courses Found
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <div key={course._id} className="rounded-lg border bg-card p-5 shadow-sm flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                      {course.courseLevel || course.category || 'Course'}
                    </span>
                    <h3 className="font-headline font-bold text-lg text-primary leading-snug">
                      {course.courseName || course.title}
                    </h3>
                    {course.universityName && (
                      <p className="text-sm text-muted-foreground">{course.universityName}</p>
                    )}
                    <p className="text-sm text-foreground/80 line-clamp-3">
                      {course.overviewDescription || course.description}
                    </p>
                    <div className="mt-auto pt-2 flex items-center justify-between text-xs text-muted-foreground">
                      {course.firstYearTuitionFee && (
                        <span>${course.firstYearTuitionFee.toLocaleString()} / yr</span>
                      )}
                      {(course.durationMonths || course.duration) && (
                        <span>{course.durationMonths ? `${course.durationMonths} months` : course.duration}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {filteredCourses.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center bg-card rounded-lg p-12">
                  <Search className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold text-primary">No Courses Found</h3>
                  <p className="text-muted-foreground mt-2">
                    Try adjusting your filters, or upload course data from the admin dashboard.
                  </p>
                </div>
              )}
            </main>
          </div>
        )}
      </section>
    </div>
  );
}
