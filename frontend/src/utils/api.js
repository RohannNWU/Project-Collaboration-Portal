// src\utils\api.js
export const makeAuthenticatedRequest = async (url, options = {}, refreshToken) => {
  const accessToken = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
    ...options.headers,
  };

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Token expired, try to refresh
    if (!refreshToken) {
      throw new Error('Refresh token function not provided');
    }
    const refreshed = await refreshToken();
    if (refreshed) {
      const newAccessToken = localStorage.getItem('access_token');
      headers.Authorization = `Bearer ${newAccessToken}`;
      response = await fetch(url, { ...options, headers });
    } else {
      throw new Error('Unable to refresh token');
    }
  }

  return response;
};