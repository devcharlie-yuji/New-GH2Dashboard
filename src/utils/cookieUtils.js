// utils/cookieUtils.js
import Cookies from 'js-cookie';

export const COOKIE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_INFO: 'user_info'
};

export const CookieUtils = {
  setAccessToken: (token, expires = 7) => {
    Cookies.set(COOKIE_KEYS.ACCESS_TOKEN, token, { expires });
  },

  getAccessToken: () => {
    return Cookies.get(COOKIE_KEYS.ACCESS_TOKEN);
  },

  removeAccessToken: () => {
    Cookies.remove(COOKIE_KEYS.ACCESS_TOKEN);
  },

  setUserInfo: (userInfo, expires = 7) => {
    Cookies.set(COOKIE_KEYS.USER_INFO, JSON.stringify(userInfo), { expires });
  },

  getUserInfo: () => {
    const userInfo = Cookies.get(COOKIE_KEYS.USER_INFO);
    return userInfo ? JSON.parse(userInfo) : null;
  },

  removeUserInfo: () => {
    Cookies.remove(COOKIE_KEYS.USER_INFO);
  },

  clearAllCookies: () => {
    Cookies.remove(COOKIE_KEYS.ACCESS_TOKEN);
    Cookies.remove(COOKIE_KEYS.USER_INFO);
  }
};

export default CookieUtils;


// // utils/cookieUtils.js
// import Cookies from 'js-cookie';

// export const COOKIE_KEYS = {
//   ACCESS_TOKEN: 'access_token',
//   USER_INFO: 'user_info'
// };

// export const CookieUtils = {
//   setAccessToken: (token, expires = 7) => {
//     Cookies.set(COOKIE_KEYS.ACCESS_TOKEN, token, { expires });
//   },

//   getAccessToken: () => {
//     return Cookies.get(COOKIE_KEYS.ACCESS_TOKEN);
//   },

//   removeAccessToken: () => {
//     Cookies.remove(COOKIE_KEYS.ACCESS_TOKEN);
//   },

//   setUserInfo: (userInfo, expires = 7) => {
//     Cookies.set(COOKIE_KEYS.USER_INFO, JSON.stringify(userInfo), { expires });
//   },

//   getUserInfo: () => {
//     const userInfo = Cookies.get(COOKIE_KEYS.USER_INFO);
//     return userInfo ? JSON.parse(userInfo) : null;
//   },

//   removeUserInfo: () => {
//     Cookies.remove(COOKIE_KEYS.USER_INFO);  
//   },

//   clearAllCookies: () => {
//     Cookies.remove(COOKIE_KEYS.ACCESS_TOKEN);
//     Cookies.remove(COOKIE_KEYS.USER_INFO);
//   }
// };

// export default CookieUtils;