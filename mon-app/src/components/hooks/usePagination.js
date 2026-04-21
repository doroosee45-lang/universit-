import { useState, useEffect } from 'react';

export const usePagination = (fetchFunction) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadData = async (params = {}) => {
    setLoading(true);
    try {
      const res = await fetchFunction({
        page,
        limit,
        ...params,
      });

      setData(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const search = (params) => {
    setPage(1);
    loadData(params);
  };

  return {
    data,
    total,
    page,
    limit,
    loading,
    setPage,
    search,
  };
};