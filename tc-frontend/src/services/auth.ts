export class AuthService {
    static isAuthenticated(): boolean {
      return !!localStorage.getItem('token');
    }
  
    static getCurrentUser() {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
  
    static setAuth(token: string, user: any) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  
    static logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login.html';
    }
  }