import axios from 'axios';
import config from '../config';
import jwt from "jsonwebtoken";
import { toast } from 'react-toastify';
import { push } from 'connected-react-router';
import Errors from '../components/FormItems/error/errors';
import { mockUser } from './mock';
import Cookies from 'js-cookie';

export const AUTH_FAILURE = 'AUTH_FAILURE';
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const RESET_REQUEST = 'RESET_REQUEST';
export const RESET_SUCCESS = 'RESET_SUCCESS';
export const PASSWORD_RESET_EMAIL_REQUEST = 'PASSWORD_RESET_EMAIL_REQUEST';
export const PASSWORD_RESET_EMAIL_SUCCESS = 'PASSWORD_RESET_EMAIL_SUCCESS';
export const AUTH_INIT_SUCCESS = 'AUTH_INIT_SUCCESS';
export const AUTH_INIT_ERROR = 'AUTH_INIT_ERROR';
export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';

// Helper to get the correct API URL
const getApiUrl = (endpoint) => {
  // Make sure the endpoint doesn't start with a slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  if (process.env.NODE_ENV === 'production') {
    // For production with Amplify proxy
    return `/api/${cleanEndpoint}`; 
  } else {
    // For local development - MAKE SURE to include the full correct path
    return `${config.baseURLApi}/api/v1/${cleanEndpoint}`;
  }
};

// This function creates a minimal user object from token if the /me endpoint is not available
function createUserFromToken(token) {
  try {
    const decoded = jwt.decode(token);
    console.log("Creating user from token:", decoded);
    
    // Create a basic user object with information from the token
    return {
      id: decoded.sub || decoded.username || 'user',
      username: decoded.sub || decoded.username || 'user',
      email: decoded.email || 'user@example.com',
      role: decoded.role || 'user',
      role_name: decoded.role_name || 'User'
    };
  } catch (error) {
    console.error("Error decoding token for user creation:", error);
    // Return a default user
    return {
      id: 'user',
      username: 'user',
      email: 'user@example.com',
      role: 'user',
      role_name: 'User'
    };
  }
}

async function findMe() {
  if (config.isBackend) {
    try {
      // Try to get user data from the /me endpoint
      const response = await axios.get(getApiUrl('auth/me'), {
        headers: {
          Authorization: `Bearer ${Cookies.get('access_token') || localStorage.getItem('token')}`
        }
      });
      return response.data;    
    } catch (error) {
      // If the endpoint is not found (404) or other error, create user from token
      console.log("Error accessing /me endpoint. Using token data instead:", error.message);
      const token = Cookies.get('access_token') || localStorage.getItem('token');
      
      // We already have user info in cookies or localStorage from login
      const userInfoStr = Cookies.get('user_info') || localStorage.getItem('user');
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          console.log("Using stored user info:", userInfo);
          return userInfo;
        } catch (parseError) {
          console.error("Error parsing stored user info:", parseError);
        }
      }
      
      // If no stored user info, create from token
      if (token) {
        return createUserFromToken(token);
      }
      
      throw error;
    }
  } else {
    return mockUser;
  }
}

export function authError(payload) {
  return {
    type: AUTH_FAILURE,
    payload,
  };
}

export function doInit() {
  return async (dispatch) => {
    let currentUser = null;
    if (!config.isBackend) {
      currentUser = mockUser;
      dispatch({
        type: AUTH_INIT_SUCCESS,
        payload: {
          currentUser,
        },
      });
    } else {
      try {
        let token = Cookies.get('access_token') || localStorage.getItem('token');
        if (token) {
          // Try to get user data, with fallback to token data if endpoint fails
          try {
            currentUser = await findMe();
          } catch (error) {
            console.error('Could not retrieve user data, proceeding with limited info', error);
            
            // If we couldn't get user data but have a token, still consider authenticated
            // with limited user info
            currentUser = createUserFromToken(token);
          }
        }
        
        dispatch({
          type: AUTH_INIT_SUCCESS,
          payload: {
            currentUser,
          },
        });
      } catch (error) {
        console.error('Error initializing authentication:', error);
        
        // Only show error to user if it's not just a missing endpoint
        if (error.response && error.response.status !== 404) {
          Errors.handle(error);
        }

        dispatch({
          type: AUTH_INIT_ERROR,
          payload: error,
        });
      }
    }
  }
}

export function logoutUser() {
    return (dispatch) => {
        dispatch({
          type: LOGOUT_REQUEST,
        });
        Cookies.remove('access_token');
        Cookies.remove('user_info');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        axios.defaults.headers.common['Authorization'] = "";
        dispatch({
          type: LOGOUT_SUCCESS,
        });
        dispatch(push('/login'));
    };
}

export function receiveToken(token, userInfo = null) {
    return (dispatch) => {
        // Store token in cookies and localStorage
        console.log("Storing token:", token);
        Cookies.set('access_token', token, { expires: 7, path: '/' }); // Expires in 7 days, accessible from all paths
        localStorage.setItem('token', token);
        
        // If user info is provided, store it in cookies
        if (userInfo) {
          console.log("User info to store:", userInfo);
          Cookies.set('user_info', JSON.stringify(userInfo), { expires: 7, path: '/' });
          localStorage.setItem('user', JSON.stringify(userInfo));
        }
        
        axios.defaults.headers.common['Authorization'] = "Bearer " + token;
        
        // Dispatch login success action
        dispatch({
          type: LOGIN_SUCCESS
        });
        
        console.log("Login successful, redirecting to /app/main/dashboard");
        
        // Try both methods for redirection to ensure it works
        dispatch(push('/app/main/dashboard'));
        
        // As a fallback, use direct navigation after a short delay
        setTimeout(() => {
          if (window.location.href.includes('/login')) {
            console.log("Fallback redirect triggered");
            const baseUrl = window.location.origin + window.location.pathname;
            const hashUrl = baseUrl + '#/app/main/dashboard';
            window.location.href = hashUrl;
          }
        }, 500);
    }
}

export function loginUser(creds) {
    return (dispatch) => {
      if (!config.isBackend) {
        dispatch(receiveToken('token'));
        dispatch(doInit());
        dispatch(push('/app/main/dashboard'));
      } else {
        dispatch({
          type: LOGIN_REQUEST,
        });
        
        // Check if it's social login
        if (creds.social) {
          const socialPath = getApiUrl(`auth/signin/${creds.social}`);
          window.location.href = `${socialPath}?app=${config.redirectUrl}`;
        } 
        // Handle username/password login
        else if (creds.username && creds.password) {
          // Create form data
          const formData = new URLSearchParams();
          formData.append('username', creds.username);
          formData.append('password', creds.password);
          
          // Get correct API path
          const loginUrl = getApiUrl('auth/login');
          
          console.log('Attempting login with URL:', loginUrl);
          
      // In your loginUser function in auth.js, update the axios.post section:

axios.post(loginUrl, formData, {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  }
}).then(res => {
  console.log('Login response:', res.data);
  
  // Check for HTML response (proxy misconfiguration)
  if (typeof res.data === 'string' && res.data.includes('<!doctype html>')) {
    console.error('Received HTML instead of JSON. Proxy misconfiguration detected.');
    dispatch(authError('Server configuration error. Please contact support.'));
    return;
  }
  
  // Extract data from response - handle both formats
  const responseData = res.data;
  
  // Make sure we have the access token
  if (!responseData.access_token) {
    console.error('Login response missing access_token:', responseData);
    dispatch(authError('Invalid response from server. Missing access token.'));
    return;
  }
  
  // Create user info object with defaults in case fields are missing
  const userInfo = {
    username: responseData.username || creds.username,
    role: responseData.role || 'user',
    role_name: responseData.role_name || 'User'
  };
  
  console.log('Extracted user info:', userInfo);
  console.log('Access token:', responseData.access_token);
  
  dispatch(receiveToken(responseData.access_token, userInfo));
  dispatch(doInit());
}).catch(err => {
  console.error('Login error response:', err.response?.data);
  console.error('Login error message:', err.message);
  
  // Check if the error response is HTML
  if (typeof err.response?.data === 'string' && err.response.data.includes('<!doctype html>')) {
    console.error('Received HTML in error response. Proxy misconfiguration.');
    dispatch(authError('Server configuration error. Please contact support.'));
    return;
  }
  
  // Format error message properly for display
  let errorMessage = 'Login failed. Please check your credentials.';
  if (err.response?.data?.detail) {
    if (Array.isArray(err.response.data.detail)) {
      errorMessage = err.response.data.detail.map(e => e.msg).join(', ');
    } else {
      errorMessage = err.response.data.detail;
    }
  }
  
  dispatch(authError(errorMessage));
});
        } else {
          dispatch(authError('Username and password are required'));
        }
      }
    };
}

export function verifyEmail(token) {
  return(dispatch) => {
    if (!config.isBackend) {
      dispatch(push('/login'));
    } else {
      axios.put(getApiUrl('auth/verify-email'), {token}).then(verified => {
        if (verified) {
          toast.success("Your email was verified");
        }
      }).catch(err => {
        toast.error(err.response?.data || 'Email verification failed');
      }).finally(() => {
        dispatch(push('/login'));
      })
    }
  }
}


// import axios from 'axios';
// import config from '../config';
// import jwt from "jsonwebtoken";
// import { toast } from 'react-toastify';
// import { push } from 'connected-react-router';
// import Errors from '../components/FormItems/error/errors';
// import { mockUser } from './mock';
// import Cookies from 'js-cookie';

// export const AUTH_FAILURE = 'AUTH_FAILURE';
// export const LOGIN_REQUEST = 'LOGIN_REQUEST';
// export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
// export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
// export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
// export const RESET_REQUEST = 'RESET_REQUEST';
// export const RESET_SUCCESS = 'RESET_SUCCESS';
// export const PASSWORD_RESET_EMAIL_REQUEST = 'PASSWORD_RESET_EMAIL_REQUEST';
// export const PASSWORD_RESET_EMAIL_SUCCESS = 'PASSWORD_RESET_EMAIL_SUCCESS';
// export const AUTH_INIT_SUCCESS = 'AUTH_INIT_SUCCESS';
// export const AUTH_INIT_ERROR = 'AUTH_INIT_ERROR';
// export const REGISTER_REQUEST = 'REGISTER_REQUEST';
// export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';

// // Helper to get the correct API URL
// const getApiUrl = (endpoint) => {
//   // Make sure the endpoint doesn't start with a slash
//   const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
//   if (process.env.NODE_ENV === 'production') {
//     // For production with Amplify proxy
//     return `/api/${cleanEndpoint}`; 
//   } else {
//     // For local development - MAKE SURE to include the full correct path
//     return `${config.baseURLApi}/api/v1/${cleanEndpoint}`;
//   }
// };

// async function findMe() {
//   if (config.isBackend) {
//     try {
//       const response = await axios.get(getApiUrl('auth/me'));
//       return response.data;
//     } catch (error) {
//       console.error('Error finding user:', error);
//       throw error;
//     }
//   } else {
//     return mockUser;
//   }
// }

// export function authError(payload) {
//   return {
//     type: AUTH_FAILURE,
//     payload,
//   };
// }

// export function doInit() {
//   return async (dispatch) => {
//     let currentUser = null;
//     if (!config.isBackend) {
//       currentUser = mockUser;
//       dispatch({
//         type: AUTH_INIT_SUCCESS,
//         payload: {
//           currentUser,
//         },
//       });
//     } else {
//       try {
//         let token = Cookies.get('access_token') || localStorage.getItem('token');
//         if (token) {
//           currentUser = await findMe();
//         }
//         dispatch({
//           type: AUTH_INIT_SUCCESS,
//           payload: {
//             currentUser,
//           },
//         });
//       } catch (error) {
//         Errors.handle(error);

//         dispatch({
//           type: AUTH_INIT_ERROR,
//           payload: error,
//         });
//       }
//     }
//   }
// }

// export function logoutUser() {
//     return (dispatch) => {
//         dispatch({
//           type: LOGOUT_REQUEST,
//         });
//         Cookies.remove('access_token');
//         Cookies.remove('user_info');
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         axios.defaults.headers.common['Authorization'] = "";
//         dispatch({
//           type: LOGOUT_SUCCESS,
//         });
//       dispatch(push('/login'));
//     };
// }

// export function receiveToken(token, userInfo = null) {
//     return (dispatch) => {
//         let user;

//         if (config.isBackend) {
//           user = jwt.decode(token)
//         } else {
//           user = {
//             email: config.auth.email,
//             user: {
//               id: 'default_no_connection_id_444'
//             }
//           }
//         }

//         // Store token in cookies and localStorage
//         Cookies.set('access_token', token, { expires: 7 }); // Expires in 7 days
//         localStorage.setItem('token', token);
        
//         // If user info is provided, store it in cookies
//         if (userInfo) {
//           Cookies.set('user_info', JSON.stringify(userInfo), { expires: 7 });
//           localStorage.setItem('user', JSON.stringify(userInfo));
//         } else {
//           localStorage.setItem('user', JSON.stringify(user));
//         }
        
//         axios.defaults.headers.common['Authorization'] = "Bearer " + token;
//         dispatch({
//           type: LOGIN_SUCCESS
//         });
//         dispatch(push('/app'));
//     }
// }

// export function loginUser(creds) {
//     return (dispatch) => {
//       if (!config.isBackend) {
//         dispatch(receiveToken('token'));
//         dispatch(doInit());
//         dispatch(push('/app'));
//       } else {
//         dispatch({
//           type: LOGIN_REQUEST,
//         });
        
//         // Check if it's social login
//         if (creds.social) {
//           const socialPath = getApiUrl(`auth/signin/${creds.social}`);
//           window.location.href = `${socialPath}?app=${config.redirectUrl}`;
//         } 
//         // Handle username/password login
//         else if (creds.username && creds.password) {
//           // Create form data
//           const formData = new URLSearchParams();
//           formData.append('username', creds.username);
//           formData.append('password', creds.password);
          
//           // Get correct API path
//           const loginUrl = getApiUrl('auth/login');
          
//           console.log('Logging in with URL:', loginUrl);
          
//           axios.post(loginUrl, formData, {
//             headers: {
//               'Content-Type': 'application/x-www-form-urlencoded'
//             }
//           }).then(res => {
//             console.log('Login response:', res.data);
//             const { access_token, username, role, role_name } = res.data;
            
//             // Create user info object
//             const userInfo = {
//               username,
//               role,
//               role_name
//             };
            
//             dispatch(receiveToken(access_token, userInfo));
//             dispatch(doInit());
//           }).catch(err => {
//             console.error('Login error:', err.response?.data || err.message);
            
//             // Format error message properly for display
//             let errorMessage = 'Login failed. Please check your credentials.';
//             if (err.response?.data?.detail) {
//               if (Array.isArray(err.response.data.detail)) {
//                 errorMessage = err.response.data.detail.map(e => e.msg).join(', ');
//               } else {
//                 errorMessage = err.response.data.detail;
//               }
//             }
            
//             dispatch(authError(errorMessage));
//           });
//         } else {
//           dispatch(authError('Username and password are required'));
//         }
//       }
//     };
// }

// export function verifyEmail(token) {
//   return(dispatch) => {
//     if (!config.isBackend) {
//       dispatch(push('/login'));
//     } else {
//       axios.put(getApiUrl('auth/verify-email'), {token}).then(verified => {
//         if (verified) {
//           toast.success("Your email was verified");
//         }
//       }).catch(err => {
//         toast.error(err.response?.data || 'Email verification failed');
//       }).finally(() => {
//         dispatch(push('/login'));
//       })
//     }
//   }
// } 

// https : 

// import axios from 'axios';
// import config from '../config';
// import jwt from "jsonwebtoken";
// import { toast } from 'react-toastify';
// import { push } from 'connected-react-router';
// import Errors from '../components/FormItems/error/errors';
// import { mockUser } from './mock';
// import Cookies from 'js-cookie'; // You'll need to install this: npm install js-cookie

// export const AUTH_FAILURE = 'AUTH_FAILURE';
// export const LOGIN_REQUEST = 'LOGIN_REQUEST';
// export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
// export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
// export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
// export const RESET_REQUEST = 'RESET_REQUEST';
// export const RESET_SUCCESS = 'RESET_SUCCESS';
// export const PASSWORD_RESET_EMAIL_REQUEST = 'PASSWORD_RESET_EMAIL_REQUEST';
// export const PASSWORD_RESET_EMAIL_SUCCESS = 'PASSWORD_RESET_EMAIL_SUCCESS';
// export const AUTH_INIT_SUCCESS = 'AUTH_INIT_SUCCESS';
// export const AUTH_INIT_ERROR = 'AUTH_INIT_ERROR';
// export const REGISTER_REQUEST = 'REGISTER_REQUEST';
// export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';

// async function findMe() {
//   if (config.isBackend) {
//     const response = await axios.get('/auth/me');
//     return response.data;    
//   } else {
//     return mockUser;
//   }
// }

// export function authError(payload) {
//   return {
//     type: AUTH_FAILURE,
//     payload,
//   };
// }

// export function doInit() {
//   return async (dispatch) => {
//     let currentUser = null;
//     if (!config.isBackend) {
//       currentUser = mockUser;
//       dispatch({
//         type: AUTH_INIT_SUCCESS,
//         payload: {
//           currentUser,
//         },
//       });
//     } else {
//       try {
//         // Check for token in cookies first, then localStorage
//         let token = Cookies.get('access_token') || localStorage.getItem('token');
//         if (token) {
//           currentUser = await findMe();
//         }
//         dispatch({
//           type: AUTH_INIT_SUCCESS,
//           payload: {
//             currentUser,
//           },
//         });
//       } catch (error) {
//         Errors.handle(error);

//         dispatch({
//           type: AUTH_INIT_ERROR,
//           payload: error,
//         });
//       }
//     }
//   }
// }

// export function logoutUser() {
//     return (dispatch) => {
//         dispatch({
//           type: LOGOUT_REQUEST,
//         });
//         // Clear cookies and localStorage
//         Cookies.remove('access_token');
//         Cookies.remove('user_info');
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         axios.defaults.headers.common['Authorization'] = "";
//         dispatch({
//           type: LOGOUT_SUCCESS,
//         });
//       dispatch(push('/login'));
//     };
// }

// export function receiveToken(token, userInfo = null) {
//     return (dispatch) => {
//         let user;

//         if (config.isBackend) {
//           user = jwt.decode(token)
//         } else {
//           user = {
//             email: config.auth.email,
//             user: {
//               id: 'default_no_connection_id_444'
//             }
//           }
//         }

//         // Store token in cookies and localStorage
//         Cookies.set('access_token', token, { expires: 7 }); // Expires in 7 days
//         localStorage.setItem('token', token);
        
//         // If user info is provided, store it in cookies
//         if (userInfo) {
//           Cookies.set('user_info', JSON.stringify(userInfo), { expires: 7 });
//           localStorage.setItem('user', JSON.stringify(userInfo));
//         } else {
//           localStorage.setItem('user', JSON.stringify(user));
//         }
        
//         axios.defaults.headers.common['Authorization'] = "Bearer " + token;
//         dispatch({
//           type: LOGIN_SUCCESS
//         });
//         dispatch(push('/app'));
//     }
// }

// export function loginUser(creds) {
//     return (dispatch) => {
//       if (!config.isBackend) {
//         dispatch(receiveToken('token'));
//         dispatch(doInit());
//         dispatch(push('/app'));
//       } else {
//         dispatch({
//           type: LOGIN_REQUEST,
//         });
        
//         // Check if it's social login
//         if (creds.social) {
//           window.location.href = config.baseURLApi + "/auth/signin/" + creds.social + '?app=' + config.redirectUrl;
//         } 
//         // Handle username/password login
//         else if (creds.username && creds.password) {
//           // Try with form-urlencoded format
//           const formData = new URLSearchParams();
//           formData.append('username', creds.username);
//           formData.append('password', creds.password);
          
//           axios.post("http://106.51.158.49:7777/api/v1/auth/login", formData, {
//             headers: {
//               'Content-Type': 'application/x-www-form-urlencoded'
//             }
//           }).then(res => {
//             const { access_token, username, role, role_name } = res.data;
            
//             // Create user info object
//             const userInfo = {
//               username,
//               role,
//               role_name
//             };
            
//             dispatch(receiveToken(access_token, userInfo));
//             dispatch(doInit());
//           }).catch(err => {
//             console.error('Login error:', err.response?.data || err.message);
            
//             // Format error message properly for display
//             let errorMessage = 'Login failed. Please check your credentials.';
//             if (err.response?.data?.detail) {
//               if (Array.isArray(err.response.data.detail)) {
//                 errorMessage = err.response.data.detail.map(e => e.msg).join(', ');
//               } else {
//                 errorMessage = err.response.data.detail;
//               }
//             }
            
//             dispatch(authError(errorMessage));
//           });
//         } else {
//           dispatch(authError('Username and password are required'));
//         }
//       }
//     };
// }

// export function verifyEmail(token) {
//   return(dispatch) => {
//     if (!config.isBackend) {
//       dispatch(push('/login'));
//     } else {
//       axios.put("/auth/verify-email", {token}).then(verified => {
//         if (verified) {
//           toast.success("Your email was verified");
//         }
//       }).catch(err => {
//         toast.error(err.response.data);
//       }).finally(() => {
//         dispatch(push('/login'));
//       })
//     }
//   }
// }


// import axios from 'axios';
// import config from '../config';
// import jwt from "jsonwebtoken";
// import { toast } from 'react-toastify';
// import { push } from 'connected-react-router';
// import Errors from '../components/FormItems/error/errors';
// import { mockUser } from './mock';
// import Cookies from 'js-cookie'; // You'll need to install this: npm install js-cookie

// export const AUTH_FAILURE = 'AUTH_FAILURE';
// export const LOGIN_REQUEST = 'LOGIN_REQUEST';
// export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
// export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
// export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
// export const RESET_REQUEST = 'RESET_REQUEST';
// export const RESET_SUCCESS = 'RESET_SUCCESS';
// export const PASSWORD_RESET_EMAIL_REQUEST = 'PASSWORD_RESET_EMAIL_REQUEST';
// export const PASSWORD_RESET_EMAIL_SUCCESS = 'PASSWORD_RESET_EMAIL_SUCCESS';
// export const AUTH_INIT_SUCCESS = 'AUTH_INIT_SUCCESS';
// export const AUTH_INIT_ERROR = 'AUTH_INIT_ERROR';
// export const REGISTER_REQUEST = 'REGISTER_REQUEST';
// export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';

// async function findMe() {
//   if (config.isBackend) {
//     const response = await axios.get('/auth/me');
//     return response.data;    
//   } else {
//     return mockUser;
//   }
// }

// export function authError(payload) {
//   return {
//     type: AUTH_FAILURE,
//     payload,
//   };
// }

// export function doInit() {
//   return async (dispatch) => {
//     let currentUser = null;
//     if (!config.isBackend) {
//       currentUser = mockUser;
//       dispatch({
//         type: AUTH_INIT_SUCCESS,
//         payload: {
//           currentUser,
//         },
//       });
//     } else {
//       try {
//         // Check for token in cookies first, then localStorage
//         let token = Cookies.get('access_token') || localStorage.getItem('token');
//         if (token) {
//           currentUser = await findMe();
//         }
//         dispatch({
//           type: AUTH_INIT_SUCCESS,
//           payload: {
//             currentUser,
//           },
//         });
//       } catch (error) {
//         Errors.handle(error);

//         dispatch({
//           type: AUTH_INIT_ERROR,
//           payload: error,
//         });
//       }
//     }
//   }
// }

// export function logoutUser() {
//     return (dispatch) => {
//         dispatch({
//           type: LOGOUT_REQUEST,
//         });
//         // Clear cookies and localStorage
//         Cookies.remove('access_token');
//         Cookies.remove('user_info');
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         axios.defaults.headers.common['Authorization'] = "";
//         dispatch({
//           type: LOGOUT_SUCCESS,
//         });
//       dispatch(push('/login'));
//     };
// }

// export function receiveToken(token, userInfo = null) {
//     return (dispatch) => {
//         let user;

//         if (config.isBackend) {
//           user = jwt.decode(token)
//         } else {
//           user = {
//             email: config.auth.email,
//             user: {
//               id: 'default_no_connection_id_444'
//             }
//           }
//         }

//         // Store token in cookies and localStorage
//         Cookies.set('access_token', token, { expires: 7 }); // Expires in 7 days
//         localStorage.setItem('token', token);
        
//         // If user info is provided, store it in cookies
//         if (userInfo) {
//           Cookies.set('user_info', JSON.stringify(userInfo), { expires: 7 });
//           localStorage.setItem('user', JSON.stringify(userInfo));
//         } else {
//           localStorage.setItem('user', JSON.stringify(user));
//         }
        
//         axios.defaults.headers.common['Authorization'] = "Bearer " + token;
//         dispatch({
//           type: LOGIN_SUCCESS
//         });
//         dispatch(push('/app'));
//     }
// }

// export function loginUser(creds) {
//     return (dispatch) => {
//       if (!config.isBackend) {
//         dispatch(receiveToken('token'));
//         dispatch(doInit());
//         dispatch(push('/app'));
//       } else {
//         dispatch({
//           type: LOGIN_REQUEST,
//         });
        
//         // Check if it's social login
//         if (creds.social) {
//           window.location.href = config.baseURLApi + "/auth/signin/" + creds.social + '?app=' + config.redirectUrl;
//         } 
//         // Handle username/password login
//         else if (creds.username && creds.password) {
//           // Use your API endpoint
//           axios.get("http://106.51.158.49:7777/api/v1/auth/login", {
//             params: {
//               username: creds.username,
//               password: creds.password
//             }
//           }).then(res => {
//             const { access_token, username, role, role_name } = res.data;
            
//             // Create user info object
//             const userInfo = {
//               username,
//               role,
//               role_name
//             };
            
//             dispatch(receiveToken(access_token, userInfo));
//             dispatch(doInit());
//           }).catch(err => {
//             dispatch(authError(err.response?.data?.message || 'Login failed. Please check your credentials.'));
//           });
//         } else {
//           dispatch(authError('Username and password are required'));
//         }
//       }
//     };
// }

// export function verifyEmail(token) {
//   return(dispatch) => {
//     if (!config.isBackend) {
//       dispatch(push('/login'));
//     } else {
//       axios.put("/auth/verify-email", {token}).then(verified => {
//         if (verified) {
//           toast.success("Your email was verified");
//         }
//       }).catch(err => {
//         toast.error(err.response.data);
//       }).finally(() => {
//         dispatch(push('/login'));
//       })
//     }
//   }
// }


// // import axios from 'axios';
// import config from '../config';
// import jwt from "jsonwebtoken";
// import { toast } from 'react-toastify';
// import { push } from 'connected-react-router';
// import Errors from '../components/FormItems/error/errors';
// import { mockUser } from './mock';
// import Cookies from 'js-cookie'; // You'll need to install this: npm install js-cookie

// import axios from '../services/axios'; // Make sure path matches your project structure
// export const AUTH_FAILURE = 'AUTH_FAILURE';
// export const LOGIN_REQUEST = 'LOGIN_REQUEST';
// export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'; 
// export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
// export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
// export const RESET_REQUEST = 'RESET_REQUEST';
// export const RESET_SUCCESS = 'RESET_SUCCESS';
// export const PASSWORD_RESET_EMAIL_REQUEST = 'PASSWORD_RESET_EMAIL_REQUEST';
// export const PASSWORD_RESET_EMAIL_SUCCESS = 'PASSWORD_RESET_EMAIL_SUCCESS';
// export const AUTH_INIT_SUCCESS = 'AUTH_INIT_SUCCESS';
// export const AUTH_INIT_ERROR = 'AUTH_INIT_ERROR';
// export const REGISTER_REQUEST = 'REGISTER_REQUEST';
// export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';

// async function findMe() {
//   if (config.isBackend) {
//     const response = await axios.get('/auth/me');
//     return response.data;    
//   } else {
//     return mockUser;
//   }
// }

// export function authError(payload) {
//   return {
//     type: AUTH_FAILURE,
//     payload,
//   };
// }

// export function doInit() {
//   return async (dispatch) => {
//     let currentUser = null;
//     if (!config.isBackend) {
//       currentUser = mockUser;
//       dispatch({
//         type: AUTH_INIT_SUCCESS,
//         payload: {
//           currentUser,
//         },
//       });
//     } else {
//       try {
//         // Check for token in cookies first, then localStorage
//         let token = Cookies.get('access_token') || localStorage.getItem('token');
//         if (token) {
//           currentUser = await findMe();
//         }
//         dispatch({
//           type: AUTH_INIT_SUCCESS,
//           payload: {
//             currentUser,
//           },
//         });
//       } catch (error) {
//         Errors.handle(error);

//         dispatch({
//           type: AUTH_INIT_ERROR,
//           payload: error,
//         });
//       }
//     }
//   }
// }

// export function logoutUser() {
//     return (dispatch) => {
//         dispatch({
//           type: LOGOUT_REQUEST,
//         });
//         // Clear cookies and localStorage
//         Cookies.remove('access_token');
//         Cookies.remove('user_info');
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         axios.defaults.headers.common['Authorization'] = "";
//         dispatch({
//           type: LOGOUT_SUCCESS,
//         });
//       dispatch(push('/login'));
//     };
// }

// export function receiveToken(token, userInfo = null) {
//     return (dispatch) => {
//         let user;

//         if (config.isBackend) {
//           user = jwt.decode(token)
//         } else {
//           user = {
//             email: config.auth.email,
//             user: {
//               id: 'default_no_connection_id_444'
//             }
//           }
//         }

//         // Store token in cookies and localStorage
//         Cookies.set('access_token', token, { expires: 7 }); // Expires in 7 days
//         localStorage.setItem('token', token);
        
//         // If user info is provided, store it in cookies
//         if (userInfo) {
//           Cookies.set('user_info', JSON.stringify(userInfo), { expires: 7 });
//           localStorage.setItem('user', JSON.stringify(userInfo));
//         } else {
//           localStorage.setItem('user', JSON.stringify(user));
//         }
        
//         axios.defaults.headers.common['Authorization'] = "Bearer " + token;
//         dispatch({
//           type: LOGIN_SUCCESS
//         });
//         dispatch(push('/app'));
//     }
// }



// export function loginUser(creds) {
//   return (dispatch) => {
//     if (!config.isBackend) {
//       dispatch(receiveToken('token'));
//       dispatch(doInit());
//       dispatch(push('/app'));
//     } else {
//       dispatch({
//         type: LOGIN_REQUEST,
//       });

//       if (creds.social) {
//         window.location.href = config.baseURLApi + "/auth/signin/" + creds.social + '?app=' + config.redirectUrl;
//       } else if (creds.username && creds.password) {
//         axios.post('/auth/login', {
//           username: creds.username,
//           password: creds.password
//         })
//         .then(res => {
//           const { access_token, username, role, role_name } = res.data;
//           const userInfo = { username, role, role_name };
//           dispatch(receiveToken(access_token, userInfo));
//           dispatch(doInit());
//         })
//         .catch(err => {
//           dispatch(authError(err.response?.data?.message || 'Login failed. Please check your credentials.'));
//         });
//       } else {
//         dispatch(authError('Username and password are required'));
//       }
//     }
//   };
// }


// export function verifyEmail(token) {
//   return(dispatch) => {
//     if (!config.isBackend) {
//       dispatch(push('/login'));
//     } else {
//       axios.put("/auth/verify-email", {token}).then(verified => {
//         if (verified) {
//           toast.success("Your email was verified");
//         }
//       }).catch(err => {
//         toast.error(err.response.data);
//       }).finally(() => {
//         dispatch(push('/login'));
//       })
//     }
//   }
// }


// import axios from 'axios';
// import config from '../config';
// import jwt from "jsonwebtoken";
// import { toast } from 'react-toastify';
// import { push } from 'connected-react-router';
// import Errors from '../components/FormItems/error/errors';
// import { mockUser } from './mock';
// import Cookies from 'js-cookie'; // You'll need to install this: npm install js-cookie

// export const AUTH_FAILURE = 'AUTH_FAILURE';
// export const LOGIN_REQUEST = 'LOGIN_REQUEST';
// export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'; 
// export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
// export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
// export const RESET_REQUEST = 'RESET_REQUEST';
// export const RESET_SUCCESS = 'RESET_SUCCESS';
// export const PASSWORD_RESET_EMAIL_REQUEST = 'PASSWORD_RESET_EMAIL_REQUEST';
// export const PASSWORD_RESET_EMAIL_SUCCESS = 'PASSWORD_RESET_EMAIL_SUCCESS';
// export const AUTH_INIT_SUCCESS = 'AUTH_INIT_SUCCESS';
// export const AUTH_INIT_ERROR = 'AUTH_INIT_ERROR';
// export const REGISTER_REQUEST = 'REGISTER_REQUEST';
// export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';

// async function findMe() {
//   if (config.isBackend) {
//     const response = await axios.get('/auth/me');
//     return response.data;    
//   } else {
//     return mockUser;
//   }
// }

// export function authError(payload) {
//   return {
//     type: AUTH_FAILURE,
//     payload,
//   };
// }

// export function doInit() {
//   return async (dispatch) => {
//     let currentUser = null;
//     if (!config.isBackend) {
//       currentUser = mockUser;
//       dispatch({
//         type: AUTH_INIT_SUCCESS,
//         payload: {
//           currentUser,
//         },
//       });
//     } else {
//       try {
//         // Check for token in cookies first, then localStorage
//         let token = Cookies.get('access_token') || localStorage.getItem('token');
//         if (token) {
//           currentUser = await findMe();
//         }
//         dispatch({
//           type: AUTH_INIT_SUCCESS,
//           payload: {
//             currentUser,
//           },
//         });
//       } catch (error) {
//         Errors.handle(error);

//         dispatch({
//           type: AUTH_INIT_ERROR,
//           payload: error,
//         });
//       }
//     }
//   }
// }

// export function logoutUser() {
//     return (dispatch) => {
//         dispatch({
//           type: LOGOUT_REQUEST,
//         });
//         // Clear cookies and localStorage
//         Cookies.remove('access_token');
//         Cookies.remove('user_info');
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         axios.defaults.headers.common['Authorization'] = "";
//         dispatch({
//           type: LOGOUT_SUCCESS,
//         });
//       dispatch(push('/login'));
//     };
// }

// export function receiveToken(token, userInfo = null) {
//     return (dispatch) => {
//         let user;

//         if (config.isBackend) {
//           user = jwt.decode(token)
//         } else {
//           user = {
//             email: config.auth.email,
//             user: {
//               id: 'default_no_connection_id_444'
//             }
//           }
//         }

//         // Store token in cookies and localStorage
//         Cookies.set('access_token', token, { expires: 7 }); // Expires in 7 days
//         localStorage.setItem('token', token);
        
//         // If user info is provided, store it in cookies
//         if (userInfo) {
//           Cookies.set('user_info', JSON.stringify(userInfo), { expires: 7 });
//           localStorage.setItem('user', JSON.stringify(userInfo));
//         } else {
//           localStorage.setItem('user', JSON.stringify(user));
//         }
        
//         axios.defaults.headers.common['Authorization'] = "Bearer " + token;
//         dispatch({
//           type: LOGIN_SUCCESS
//         });
//         dispatch(push('/app'));
//     }
// }

// export function loginUser(creds) {
//     return (dispatch) => {
//       if (!config.isBackend) {
//         dispatch(receiveToken('token'));
//         dispatch(doInit());
//         dispatch(push('/app'));
//       } else {
//         dispatch({
//           type: LOGIN_REQUEST,
//         });
        
//         // Check if it's social login
//         if (creds.social) {
//           window.location.href = config.baseURLApi + "/auth/signin/" + creds.social + '?app=' + config.redirectUrl;
//         } 
//         // Handle username/password login
//         else if (creds.username && creds.password) {
//           // Use your API endpoint
//           axios.get("http://106.51.158.49:7777/api/v1/auth/login", {
//             params: {
//               username: creds.username,
//               password: creds.password
//             }
//           }).then(res => {
//             const { access_token, username, role, role_name } = res.data;
            
//             // Create user info object
//             const userInfo = {
//               username,
//               role,
//               role_name
//             };
            
//             dispatch(receiveToken(access_token, userInfo));
//             dispatch(doInit());
//           }).catch(err => {
//             dispatch(authError(err.response?.data?.message || 'Login failed. Please check your credentials.'));
//           });
//         } else {
//           dispatch(authError('Username and password are required'));
//         }
//       }
//     };
// }

// export function verifyEmail(token) {
//   return(dispatch) => {
//     if (!config.isBackend) {
//       dispatch(push('/login'));
//     } else {
//       axios.put("/auth/verify-email", {token}).then(verified => {
//         if (verified) {
//           toast.success("Your email was verified");
//         }
//       }).catch(err => {
//         toast.error(err.response.data);
//       }).finally(() => {
//         dispatch(push('/login'));
//       })
//     }
//   }
// }


// import axios from 'axios';
// import config from '../config';
// import jwt from "jsonwebtoken";
// import { toast } from 'react-toastify';
// import { push } from 'connected-react-router';
// import Errors from '../components/FormItems/error/errors';
// import { mockUser } from './mock';

// export const AUTH_FAILURE = 'AUTH_FAILURE';
// export const LOGIN_REQUEST = 'LOGIN_REQUEST';
// export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
// export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
// export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
// export const RESET_REQUEST = 'RESET_REQUEST';
// export const RESET_SUCCESS = 'RESET_SUCCESS';
// export const PASSWORD_RESET_EMAIL_REQUEST = 'PASSWORD_RESET_EMAIL_REQUEST';
// export const PASSWORD_RESET_EMAIL_SUCCESS = 'PASSWORD_RESET_EMAIL_SUCCESS';
// export const AUTH_INIT_SUCCESS = 'AUTH_INIT_SUCCESS';
// export const AUTH_INIT_ERROR = 'AUTH_INIT_ERROR';
// export const REGISTER_REQUEST = 'REGISTER_REQUEST';
// export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';

// async function findMe() {
//   if (config.isBackend) {
//     const response = await axios.get('/auth/me');
//     return response.data;    
//   } else {
//     return mockUser;
//   }
// }

// export function authError(payload) {
//   return {
//     type: AUTH_FAILURE,
//     payload,
//   };
// }

// export function doInit() {
//   return async (dispatch) => {
//     let currentUser = null;
//     if (!config.isBackend) {
//       currentUser = mockUser;
//       dispatch({
//         type: AUTH_INIT_SUCCESS,
//         payload: {
//           currentUser,
//         },
//       });
//     } else {
//       try {
//         let token = localStorage.getItem('token');
//         if (token) {
//           currentUser = await findMe();
//         }
//         dispatch({
//           type: AUTH_INIT_SUCCESS,
//           payload: {
//             currentUser,
//           },
//         });
//       } catch (error) {
//         Errors.handle(error);

//         dispatch({
//           type: AUTH_INIT_ERROR,
//           payload: error,
//         });
//       }
//     }
//   }
// }

// export function logoutUser() {
//     return (dispatch) => {
//         dispatch({
//           type: LOGOUT_REQUEST,
//         });
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         axios.defaults.headers.common['Authorization'] = "";
//         dispatch({
//           type: LOGOUT_SUCCESS,
//         });
//       dispatch(push('/login'));
//     };
// }

// export function receiveToken(token) {
//     return (dispatch) => {
//         let user;

//         if (config.isBackend) {
//           user = jwt.decode(token)
//         } else {
//           user = {
//             email: config.auth.email,
//             user: {
//               id: 'default_no_connection_id_444'
//             }
//           }
//         }

//         localStorage.setItem('token', token);
//         localStorage.setItem('user', JSON.stringify(user));
//         axios.defaults.headers.common['Authorization'] = "Bearer " + token;
//         dispatch({
//           type: LOGIN_SUCCESS
//         });
//         dispatch(push('/app'));
//     }
// }

// export function loginUser(creds) {
//     return (dispatch) => {
//       if (!config.isBackend) {
//         dispatch(receiveToken('token'));
//         dispatch(doInit());
//         dispatch(push('/app'));
//       } else {
//         dispatch({
//           type: LOGIN_REQUEST,
//         });
//         if (creds.social) {
//           window.location.href = config.baseURLApi + "/auth/signin/" + creds.social + '?app=' + config.redirectUrl;
//         } else if (creds.email.length > 0 && creds.password.length > 0) {
//           axios.post("/auth/signin/local", creds).then(res => {
//             const token = res.data;
//             dispatch(receiveToken(token));
//             dispatch(doInit());
//             dispatch(push('/app'));
//           }).catch(err => {
//             dispatch(authError(err.response.data));
//           })
//         } else {
//           dispatch(authError('Something was wrong. Try again'));
//         }
//       }
//     };
// }

// export function verifyEmail(token) {
//   return(dispatch) => {
//     if (!config.isBackend) {
//       dispatch(push('/login'));
//     } else {
//       axios.put("/auth/verify-email", {token}).then(verified => {
//         if (verified) {
//           toast.success("Your email was verified");
//         }
//       }).catch(err => {
//         toast.error(err.response.data);
//       }).finally(() => {
//         dispatch(push('/login'));
//       })
//     }
//   }
// }









// import axios from 'axios';
// import config from '../config';
// import jwt from "jsonwebtoken";
// import { toast } from 'react-toastify';
// import { push } from 'connected-react-router';
// import Errors from '../components/FormItems/error/errors';
// import { mockUser } from './mock';

// export const AUTH_FAILURE = 'AUTH_FAILURE';
// export const LOGIN_REQUEST = 'LOGIN_REQUEST';
// export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
// export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
// export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
// export const RESET_REQUEST = 'RESET_REQUEST';
// export const RESET_SUCCESS = 'RESET_SUCCESS';
// export const PASSWORD_RESET_EMAIL_REQUEST = 'PASSWORD_RESET_EMAIL_REQUEST';
// export const PASSWORD_RESET_EMAIL_SUCCESS = 'PASSWORD_RESET_EMAIL_SUCCESS';
// export const AUTH_INIT_SUCCESS = 'AUTH_INIT_SUCCESS';
// export const AUTH_INIT_ERROR = 'AUTH_INIT_ERROR';
// export const REGISTER_REQUEST = 'REGISTER_REQUEST';
// export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';

// async function findMe() {
//   if (config.isBackend) {
//     const response = await axios.get('/auth/me');
//     return response.data;    
//   } else {
//     return mockUser;
//   }
// }

// export function authError(payload) {
//   return {
//     type: AUTH_FAILURE,
//     payload,
//   };
// }

// export function doInit() {
//   return async (dispatch) => {
//     let currentUser = null;
//     if (!config.isBackend) {
//       currentUser = mockUser;
//       dispatch({
//         type: AUTH_INIT_SUCCESS,
//         payload: {
//           currentUser,
//         },
//       });
//     } else {
//       try {
//         let token = localStorage.getItem('token');
//         if (token) {
//           currentUser = await findMe();
//         }
//         dispatch({
//           type: AUTH_INIT_SUCCESS,
//           payload: {
//             currentUser,
//           },
//         });
//       } catch (error) {
//         Errors.handle(error);

//         dispatch({
//           type: AUTH_INIT_ERROR,
//           payload: error,
//         });
//       }
//     }
//   }
// }

// export function logoutUser() {
//     return (dispatch) => {
//         dispatch({
//           type: LOGOUT_REQUEST,
//         });
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         axios.defaults.headers.common['Authorization'] = "";
//         dispatch({
//           type: LOGOUT_SUCCESS,
//         });
//       dispatch(push('/login'));
//     };
// }

// export function receiveToken(token) {
//     return (dispatch) => {
//         let user;

//         if (config.isBackend) {
//           user = jwt.decode(token)
//         } else {
//           user = {
//             email: config.auth.email,
//             user: {
//               id: 'default_no_connection_id_444'
//             }
//           }
//         }

//         localStorage.setItem('token', token);
//         localStorage.setItem('user', JSON.stringify(user));
//         axios.defaults.headers.common['Authorization'] = "Bearer " + token;
//         dispatch({
//           type: LOGIN_SUCCESS
//         });
//         dispatch(push('/app'));
//     }
// }

// export function loginUser(creds) {
//     return (dispatch) => {
//       if (!config.isBackend) {
//         dispatch(receiveToken('token'));
//         dispatch(doInit());
//         dispatch(push('/app'));
//       } else {
//         dispatch({
//           type: LOGIN_REQUEST,
//         });
//         if (creds.social) {
//           window.location.href = config.baseURLApi + "/auth/signin/" + creds.social + '?app=' + config.redirectUrl;
//         } else if (creds.email.length > 0 && creds.password.length > 0) {
//           axios.post("/auth/signin/local", creds).then(res => {
//             const token = res.data;
//             dispatch(receiveToken(token));
//             dispatch(doInit());
//             dispatch(push('/app'));
//           }).catch(err => {
//             dispatch(authError(err.response.data));
//           })
//         } else {
//           dispatch(authError('Something was wrong. Try again'));
//         }
//       }
//     };
// }

// export function verifyEmail(token) {
//   return(dispatch) => {
//     if (!config.isBackend) {
//       dispatch(push('/login'));
//     } else {
//       axios.put("/auth/verify-email", {token}).then(verified => {
//         if (verified) {
//           toast.success("Your email was verified");
//         }
//       }).catch(err => {
//         toast.error(err.response.data);
//       }).finally(() => {
//         dispatch(push('/login'));
//       })
//     }
//   }
// }

// export function resetPassword(token, password) {
//   return (dispatch) => {
//     if (!config.isBackend) {
//       dispatch(push('/login'));
//     } else {
//       dispatch({
//         type: RESET_REQUEST,
//       });
//       axios.put("/auth/password-reset", {token, password}).then(res => {
//           dispatch({
//             type: RESET_SUCCESS,
//           });
//           toast.success("Password has been updated");
//         dispatch(push('/login'));
//       }).catch(err => {
//         dispatch(authError(err.response.data));
//       })
//     }
//   }
// }

// export function sendPasswordResetEmail(email) {
//   return (dispatch) => {
//     if (!config.isBackend) {
//       dispatch(push('/login'));
//     } else {
//       dispatch({
//         type: PASSWORD_RESET_EMAIL_REQUEST,
//       });
//       axios.post("/auth/send-password-reset-email", {email}).then(res => {
//         dispatch({
//           type: PASSWORD_RESET_EMAIL_SUCCESS,
//         });
//         toast.success("Email with resetting instructions has been sent");
//         dispatch(push('/login'));
//       }).catch(err => {
//         dispatch(authError(err.response.data));
//       })
//     }
//   }
// }

// export function registerUser(creds) {
//   return (dispatch) => {
//     if (!config.isBackend) {
//       dispatch(push('/login'));
//     } else {
//       dispatch({
//         type: REGISTER_REQUEST,
//       });
  
//       if (creds.email.length > 0 && creds.password.length > 0) {
//         axios.post("/auth/signup", creds).then(res => {
//           dispatch({
//             type: REGISTER_SUCCESS
//           });
//           toast.success("You've been registered successfully. Please check your email for verification link");
//           dispatch(push('/login'));
//         }).catch(err => {
//           dispatch(authError(err.response.data));
//         })
  
//       } else {
//         dispatch(authError('Something was wrong. Try again'));
//       }
//     }
//   };
// }
