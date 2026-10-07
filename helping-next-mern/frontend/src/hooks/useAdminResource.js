import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

// Generic list+CRUD hook for an admin API resource, e.g.:
//   const { items, loading, error, create, update, remove } = useAdminResource("/admin/campaigns");
// Handles the paginated response shape ({ data: [...], ...meta })
// as well as plain arrays.
export default function useAdminResource(endpoint) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(endpoint);
      setItems(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load data from the server.");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const create = async (payload) => {
    const { data } = await api.post(endpoint, payload);
    setItems((prev) => [data, ...prev]);
    return data;
  };

  const update = async (id, payload) => {
    const { data } = await api.put(`${endpoint}/${id}`, payload);
    setItems((prev) => prev.map((item) => (item.id === id ? data : item)));
    return data;
  };

  const remove = async (id) => {
    await api.delete(`${endpoint}/${id}`);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return { items, loading, error, refetch: fetchAll, create, update, remove, setItems };
}
