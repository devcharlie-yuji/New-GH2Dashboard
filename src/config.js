// http proxy 
const hostApi = process.env.NODE_ENV === "development" ? "http://localhost" : "https://sing-generator-node.herokuapp.com";
const portApi = process.env.NODE_ENV === "development" ? 8080 : "";
const baseURLApi = `${hostApi}${portApi ? `:${portApi}` : ``}/api`;
const redirectUrl = process.env.NODE_ENV === "development" ? "http://localhost:5000/light-blue-react" : "https://demo.flatlogic.com/light-blue-react";

export default {
  // redirectUrl,
  hostApi,
  portApi,
  // baseURLApi,
  remote: "https://sing-generator-node.herokuapp.com",
  // isBackend: process.env.REACT_APP_BACKEND,
  // auth: {
  //   email: 'admin@flatlogic.com',
  //   password: 'password'
  // },
  isBackend: true,
  
  // Base URL for API - no trailing slash and no /api/v1 part
  // (that will be added by the getApiUrl function)
  baseURLApi: process.env.NODE_ENV === 'production' 
    ? ''  // Empty for production as we'll use relative paths with the helper function
    : 'http://106.51.158.49:7777', // Just the host and port, no path segments
  
  redirectUrl: window.location.origin,

  app: {
    colors: {
      dark: "#333964",
      light: "#0A0417",
      sea: "#4A4657",
      sky: "#3A3847",
      rain: "#3846AA",
      middle: "#3390C3"
    },
  }
};

// https 

// const hostApi = process.env.NODE_ENV === "development" ? "http://localhost" : "https://sing-generator-node.herokuapp.com";
// const portApi = process.env.NODE_ENV === "development" ? 8080 : "";
// const baseURLApi = `${hostApi}${portApi ? `:${portApi}` : ``}/api`;
// const redirectUrl = process.env.NODE_ENV === "development" ? "http://localhost:5000/light-blue-react" : "https://demo.flatlogic.com/light-blue-react";

// export default {
//   redirectUrl,
//   hostApi,
//   portApi,
//   // baseURLApi,
//   remote: "https://sing-generator-node.herokuapp.com",
//   // isBackend: process.env.REACT_APP_BACKEND,
//   // auth: {
//   //   email: 'admin@flatlogic.com',
//   //   password: 'password'
//   // },
//   isBackend: true, // Make sure this is true to use the API
//   baseURLApi: 'http://106.51.158.49:7777/api/v1',
//   redirectUrl: window.location.origin,
//   app: {
//     colors: {
//       dark: "#333964",
//       light: "#0A0417",
//       sea: "#4A4657",
//       sky: "#3A3847",
//       rain: "#3846AA",
//       middle: "#3390C3"
//     },
//   }
// };