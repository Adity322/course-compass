/**
 * Central API service
 * All backend calls go through here.
 * Base URL points to your Express server on port 8000.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ---------- helpers ----------

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data as T;
}

// ---------- Auth ----------

export interface LoginResponse {
  token: string;
  admin: { email: string; id: string };
}

export async function loginAdmin(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// ---------- Courses ----------

export interface CourseFromDB {
  _id: string;
  course_id?: string;
  title?: string;
  courseName?: string;
  description?: string;
  overviewDescription?: string;
  category?: string;
  disciplineMajor?: string;
  instructor?: string;
  professorName?: string;
  duration?: string;
  durationMonths?: number;
  courseLevel?: string;
  universityName?: string;
  firstYearTuitionFee?: number;
  tuitionFeeCurrency?: string;
  [key: string]: unknown;
}

export async function fetchCourses(): Promise<CourseFromDB[]> {
  return request<CourseFromDB[]>('/api/courses');
}

export async function uploadCoursesCSV(file: File): Promise<{ message: string; count: number }> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/api/courses/upload`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Do NOT set Content-Type here — browser sets it with boundary for FormData
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data;
}

// ---------- Recommendations ----------

export interface Recommendation {
  courseName: string;
  universityName: string;
  matchScore: number;
  rationale: string;
}

export interface RecommendationsResponse {
  suggestions: Recommendation[];
}

export async function fetchRecommendations(
  description: string
): Promise<RecommendationsResponse> {
  return request<RecommendationsResponse>('/api/recommendations', {
    method: 'POST',
    body: JSON.stringify({ description }),
  });
}
