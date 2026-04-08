import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

// Internal API base (avoids circular import with api.js)
const API_URL = import.meta.env.VITE_API_URL || 'https://gym-tracker-14iz.onrender.com/api';

const getToken = () => {
  try {
    const u = JSON.parse(localStorage.getItem('user'));
    return u?.token || null;
  } catch { return null; }
};

/**
 * Fetch latest weight log from DB and return the weight value.
 * Returns null if no logs or request fails.
 */
const fetchLatestWeight = async () => {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/weight`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const logs = await res.json();
    return Array.isArray(logs) && logs.length > 0 ? logs[0].weight : null;
  } catch { return null; }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper: update user in state AND localStorage atomically
  const persistUser = useCallback((u) => {
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  }, []);

  // On app boot: restore session then hydrate current weight from DB
  useEffect(() => {
    const init = async () => {
      const storedRaw = localStorage.getItem('user');
      if (storedRaw) {
        const stored = JSON.parse(storedRaw);
        setUser(stored); // Show UI immediately
        // Then refresh current weight from the weight log DB
        const latestWeight = await fetchLatestWeight();
        if (latestWeight !== null && latestWeight !== stored.weight) {
          const enriched = { ...stored, weight: latestWeight };
          persistUser(enriched);
        }
      }
      setLoading(false);
    };
    init();
  }, [persistUser]);

  const loginUser = async (userData) => {
    persistUser(userData);
    // Hydrate weight immediately after login
    const latestWeight = await fetchLatestWeight();
    if (latestWeight !== null && latestWeight !== userData.weight) {
      persistUser({ ...userData, weight: latestWeight });
    }
    if (!userData.name || !userData.age) {
      navigate('/onboarding');
    } else {
      navigate('/');
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const updateUserProfile = (userData) => {
    const updatedUser = { ...user, ...userData };
    persistUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, updateUserProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
