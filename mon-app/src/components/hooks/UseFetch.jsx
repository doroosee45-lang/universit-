import { useState, useEffect, useCallback } from 'react';

export const useFetch = (fetchFn, deps = [], immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn(...args);
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    if (immediate) execute();
  }, [execute, immediate]);

  return { data, loading, error, refetch: execute };
};

export const usePagination = (fetchFn, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const load = useCallback(async (p = page, extra = params) => {
    setLoading(true);
    try {
      const res = await fetchFn({ page: p, limit, ...extra });
      setData(res.data?.data || res.data || []);
      setTotal(res.data?.pagination?.total || res.data?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, limit, params]);

  useEffect(() => { load(); }, [page]);

  const search = (newParams) => {
    setParams(newParams);
    setPage(1);
    load(1, newParams);
  };

  return { data, total, page, limit, loading, setPage, search, refetch: load };
};