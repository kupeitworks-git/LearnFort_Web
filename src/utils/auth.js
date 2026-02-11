export const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return true;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const { exp } = JSON.parse(jsonPayload);
        if (!exp) return false;
        return Date.now() >= exp * 1000;
    } catch (error) {
        return true;
    }
};

export const clearSession = () => {
    sessionStorage.removeItem('token');
    localStorage.removeItem('lf_user');
};

export const logout = () => {
    clearSession();
    window.location.href = '#/login';
};
