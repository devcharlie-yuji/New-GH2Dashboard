// proxt http 
// services/axios.js
import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with the appropriate base URL
const axiosInstance = axios.create({
  // No base URL needed as we'll use relative URLs that will be proxied
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error
      Cookies.remove('access_token');
      Cookies.remove('user_info');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;


// // services/axios.js
// import axios from 'axios';
// import Cookies from 'js-cookie';

// // Create axios instance
// const axiosInstance = axios.create({
//   baseURL: 'http://106.51.158.49:7777/api/v1', // Your API base URL
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// // Request interceptor
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = Cookies.get('access_token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor
// axiosInstance.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response?.status === 401) {
//       // Handle unauthorized error
//       Cookies.remove('access_token');
//       Cookies.remove('user_info');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;


// // services/axios.js
// import axios from 'axios';
// import Cookies from 'js-cookie';

// // Create axios instance
// const axiosInstance = axios.create({
//   baseURL: 'http://106.51.158.49:7777/api/v1', // Your API base URL
// });

// // Request interceptor
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = Cookies.get('access_token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor
// axiosInstance.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response?.status === 401) {
//       // Handle unauthorized error
//       Cookies.remove('access_token');
//       Cookies.remove('user_info');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;


// // // // services/axios.js
// // // import axios from 'axios';
// // // import Cookies from 'js-cookie';

// // // // Create axios instance
// // // const axiosInstance = axios.create({
// // //   baseURL: 'http://106.51.158.49:7777/api/v1', // Your API base URL
// // // });

// // // // Request interceptor
// // // axiosInstance.interceptors.request.use(
// // //   (config) => {
// // //     const token = Cookies.get('access_token');
// // //     if (token) {
// // //       config.headers.Authorization = `Bearer ${token}`;
// // //     }
// // //     return config;
// // //   },
// // //   (error) => {
// // //     return Promise.reject(error);
// // //   }
// // // );

// // // // Response interceptor
// // // axiosInstance.interceptors.response.use(
// // //   (response) => {
// // //     return response;
// // //   },
// // //   (error) => {
// // //     if (error.response?.status === 401) {
// // //       // Handle unauthorized error
// // //       Cookies.remove('access_token');
// // //       Cookies.remove('user_info');
// // //       window.location.href = '/login';
// // //     }
// // //     return Promise.reject(error);
// // //   }
// // // );

// // // export default axiosInstance;


// // // services/axios.js
// // import axios from 'axios';
// // import Cookies from 'js-cookie';

// // // Create axios instance
// // const axiosInstance = axios.create({
// //   baseURL: 'http://106.51.158.49:7777/api/v1', // Your API base URL
// // });

// // // Request interceptor
// // axiosInstance.interceptors.request.use(
// //   (config) => {
// //     const token = Cookies.get('access_token');
// //     if (token) {
// //       config.headers.Authorization = `Bearer ${token}`;
// //     }
// //     return config;
// //   },
// //   (error) => {
// //     return Promise.reject(error);
// //   }
// // );

// // // Response interceptor
// // axiosInstance.interceptors.response.use(
// //   (response) => {
// //     return response;
// //   },
// //   (error) => {
// //     if (error.response?.status === 401) {
// //       // Handle unauthorized error
// //       Cookies.remove('access_token');
// //       Cookies.remove('user_info');
// //       window.location.href = '/login';
// //     }
// //     return Promise.reject(error);
// //   }
// // );

// // export default axiosInstance;