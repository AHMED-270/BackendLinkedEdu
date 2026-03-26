import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const initialUser = {
    id: 1,
    name: 'Prof. Ahmed Benali',
    email: 'professeur@linkedu.ma',
    role: 'professeur',
    avatar: null,
    initials: 'AB',
    matieres: ['Physique Chimie', 'Mathématiques', 'SVT'],
    etablissement: 'Lycée Al Khawarizmi — Casablanca'
  };

  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Session is hardcoded for Demo/Dev purposes bypassing login
    localStorage.setItem('linkedu_user', JSON.stringify(initialUser));
  }, []);

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const userData = {
            id: 1,
            name: 'Prof. Ahmed Benali',
            email: email,
            role: 'professeur',
            avatar: null,
            initials: 'AB',
            matieres: ['Physique Chimie', 'Mathématiques', 'SVT'],
            etablissement: 'Lycée Al Khawarizmi — Casablanca'
          };
          setUser(userData);
          localStorage.setItem('linkedu_user', JSON.stringify(userData));
          resolve(userData);
        } else {
          reject(new Error('Email et mot de passe requis'));
        }
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('linkedu_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
