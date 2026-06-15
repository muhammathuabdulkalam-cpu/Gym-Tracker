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
 * Fetch latest user profile from DB.
 * Returns null if no profile or request fails.
 */
const fetchUserProfile = async () => {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
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
      // Then refresh full profile from the DB to sync goals, weights, etc.
      const freshProfile = await fetchUserProfile();
      if (freshProfile) {
        const enriched = { 
          ...stored, 
          ...freshProfile,
          goalWeight: freshProfile.goalWeight !== undefined ? freshProfile.goalWeight : stored.goalWeight,
          goalType: freshProfile.goalType || stored.goalType
        };
        persistUser(enriched);
      }
    }
    setLoading(false);
  };
  init();
  }, [persistUser]);

  const loginUser = async (userData) => {
    persistUser(userData);
    // Hydrate profile immediately after login
    const freshProfile = await fetchUserProfile();
    if (freshProfile) {
      persistUser({ ...userData, ...freshProfile });
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
