// components/JobList.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { Briefcase } from 'lucide-react-native';
import { authorizedFetch } from '../utils/authorizedFetch';
import { API_ENDPOINTS, buildUrl } from '../utils/api-config';

interface Job {
  id: string;
  title: string;
  company_name?: string | null;
  location?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  description?: string | null;
}

interface JobListProps {
  jobs?: Job[]; // optional - if provided we will use these and not fetch
  onJobPress?: (job: Job) => void;
  q?: string; // text query
  location?: string; // location filter
  minQueryLength?: number; // minimum characters to hit search
  onResults?: (count: number, total?: number) => void; // callback with current and total
}

export const JobList: React.FC<JobListProps> = ({ jobs: initialJobs, onJobPress, q, location, minQueryLength = 3, onResults }) => {
  const [jobs, setJobs] = useState<Job[]>(initialJobs || []);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(!initialJobs || initialJobs.length === 0);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const abortRef = React.useRef<AbortController | null>(null);

  const buildQueryUrl = (p: number) => {
    const params = new URLSearchParams();
    params.append('page', String(p));
    params.append('limit', String(limit));
    if (q) params.append('q', q);
    if (location) params.append('location', location);
    return buildUrl(`${API_ENDPOINTS.GET_JOBS}?${params.toString()}`);
  }; 

  const fetchJobs = useCallback(async (p = 1, append = false) => {
    try {
      if (p === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      // If a query is provided but shorter than the minimum length, short-circuit and show no results
      if (q && q.length < minQueryLength && p === 1) {
        setJobs([]);
        setHasMore(false);
        onResults?.(0, 0);
        setLoading(false);
        return;
      }

      // Abort previous in-flight request to avoid race conditions
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      const url = buildQueryUrl(p);
      const res = await authorizedFetch(url, { signal: controller.signal });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || 'Failed to fetch jobs');
      }

      const json = await res.json();
      const fetched: any[] = json?.data?.jobs || [];
      const pagination = json?.data?.pagination;

      // Normalize jobs
      const normalized: Job[] = fetched.map((j: any) => ({
        id: j._id || j.id || j.job_id || String(Math.random()),
        title: j.title || j.job_role || 'Untitled',
        company_name: j.company_name || null,
        location: j.location || j.city || null,
        salary_min: j.salary_min ?? null,
        salary_max: j.salary_max ?? null,
        description: j.description || null,
      }));

      setJobs(prev => (append ? [...prev, ...normalized] : normalized));

      // Pagination handling
      if (pagination) {
        const currentPage = Number(pagination.page) || p;
        const pages = Number(pagination.pages) || 1;
        setHasMore(currentPage < pages);
        onResults?.(append ? (jobs.length + normalized.length) : normalized.length, Number(pagination.total) || undefined);
        setPage(currentPage);
      } else {
        // Fallback: if no pagination provided, stop loading more
        setHasMore(false);
        onResults?.(append ? (jobs.length + normalized.length) : normalized.length, undefined);
      }
    } catch (err: any) {
      // Ignore abort errors
      if (err && err.name === 'AbortError') return;
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
      // Clear abort controller when done
      if (abortRef.current) {
        abortRef.current = null;
      }
    }
  }, [q, location, limit, onResults, jobs.length]);

  useEffect(() => {
    if (!initialJobs) {
      fetchJobs(1, false);
    } else {
      setHasMore(false);
      setJobs(initialJobs);
    }
    // reset to first page on filter change
    setPage(1);
  }, [initialJobs, q, location, fetchJobs]);

  const loadMore = () => {
    if (loadingMore || loading || !hasMore) return;
    fetchJobs(page + 1, true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchJobs(1, false);
  };

  const handlePress = (job: Job) => {
    if (onJobPress) onJobPress(job);
    else console.log('Job pressed', job);
  };

  const renderItem = ({ item }: { item: Job }) => (
    <TouchableOpacity key={item.id} style={styles.jobItem} onPress={() => handlePress(item)}>
      <View style={[styles.jobItemIcon, { backgroundColor: '#E6F6FF' }]}>
        <Briefcase size={20} color="#0EA5E9" />
      </View>
      <View style={styles.jobItemContent}>
        <Text style={styles.jobItemTitle}>{item.title}</Text>
        <Text style={styles.jobItemTime}>{item.company_name ? `${item.company_name}${item.location ? ' • ' + item.location : ''}` : item.location}</Text>
        {(item.salary_min || item.salary_max) && (
          <Text style={styles.jobBudget}>Salary: {item.salary_min ?? '-'} - {item.salary_max ?? '-'}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.jobsContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading jobs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.jobsContainer}>
        <Text style={{ color: '#DC2626' }}>Error: {error}</Text>
      </View>
    );
  }

  if (!jobs.length) {
    if (q && q.length < minQueryLength) {
      return (
        <View style={[styles.jobsContainer, { justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }]}>
          <Text style={styles.searchHint}>Type {minQueryLength}+ characters to search</Text>
        </View>
      );
    }

    return (
      <View style={[styles.jobsContainer, { justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }]}>
        <Text style={{ color: '#6B7280' }}>No jobs found.</Text>
        <Text style={{ color: '#9CA3AF', marginTop: 6 }}>Try adjusting your filters</Text>
      </View>
    );
  }

  return (
    <View style={styles.jobsContainer}>
      <FlatList
        data={jobs}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListFooterComponent={() => loadingMore ? <ActivityIndicator style={{ marginVertical: 12 }} /> : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  jobsContainer: {
    paddingHorizontal: 20,
  },
  jobItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  jobItemIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  jobItemContent: {
    flex: 1,
  },
  jobItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  jobItemTime: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  jobBudget: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
  },
  searchHint: {
    fontSize: 13,
    color: '#6B7280',
  },
});