import { createContext, useState, useContext } from "react";


const AuthContext= createContext(null);
export function AuthProvider({children}){
    const [user, setUser] = useState(()=>{
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    
    const login=(userData, access, refresh)=>{
        localStorage.setItem('access',access);
        localStorage.setItem('refresh', refresh);
        localStorage.setItem('user',JSON.stringify(userData));
        setUser(userData);
    };
    const logout=()=>{
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        setUser(null);
    };
    return(
        <AuthContext.Provider value={{user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
    }
export function useAuth(){
    return useContext(AuthContext);
}