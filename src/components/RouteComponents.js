import Login from '../pages/auth/login';
import { logoutUser } from '../actions/auth';
import { Redirect, Route } from 'react-router';
import React from 'react';
import Cookies from 'js-cookie';

// Helper function to check authentication status
const checkAuthentication = () => {
  console.log("RouteComponents: Checking authentication status");
  
  // First check if the Login component's isAuthenticated method exists
  if (typeof Login.isAuthenticated === 'function') {
    try {
      const isAuthResult = Login.isAuthenticated();
      console.log("RouteComponents: Login.isAuthenticated() result:", isAuthResult);
      
      // If it returns a valid boolean, use it
      if (typeof isAuthResult === 'boolean') {
        return isAuthResult;
      }
    } catch (error) {
      console.error("Error calling Login.isAuthenticated:", error);
      // Continue to fallback
    }
  }
  
  // Fallback to a direct token check
  const token = Cookies.get('access_token') || localStorage.getItem('token');
  console.log("RouteComponents: Fallback token check - token exists:", !!token);
  return !!token; // Convert to boolean
};

export const AdminRoute = ({currentUser, dispatch, component, ...rest}) => {
  const isAuth = checkAuthentication();
  console.log("AdminRoute - isAuth:", isAuth, "currentUser:", currentUser);
  
  if (!isAuth || !currentUser || currentUser.role !== 'admin') {
    console.log("AdminRoute: Authentication or role check failed, redirecting to /app/main");
    return (<Redirect to="/app/main"/>);
  } else if (currentUser && currentUser.role === 'admin') {
    console.log("AdminRoute: User is admin, allowing access");
    return (
      <Route {...rest} render={props => (React.createElement(component, props))}/>
    );
  }
  
  // Fallback - shouldn't reach here
  return (<Redirect to="/app/main"/>);
};

export const UserRoute = ({dispatch, component, ...rest}) => {
  const isAuth = checkAuthentication();
  console.log("UserRoute - isAuth:", isAuth);
  
  if (!isAuth) {
    console.log("UserRoute: Not authenticated, logging out and redirecting to /login");
    // Prevent potential loops by checking if we're already on login page
    if (!window.location.href.includes('/login')) {
      dispatch(logoutUser());
    }
    return (<Redirect to="/login"/>);
  } else {
    console.log("UserRoute: User is authenticated, allowing access");
    return (
      <Route {...rest} render={props => (React.createElement(component, props))}/>
    );
  }
};

export const AuthRoute = ({dispatch, component, ...rest}) => {
  // Changed default redirect target to dashboard
  const {from} = rest.location.state || {from: {pathname: '/app/main/dashboard'}};
  const isAuth = checkAuthentication();
  console.log("AuthRoute - isAuth:", isAuth, "redirecting to:", from);

  if (isAuth) {
    console.log("AuthRoute: User is authenticated, redirecting to:", from);
    return (
      <Redirect to={from}/>
    );
  } else {
    console.log("AuthRoute: User is not authenticated, showing component");
    return (
      <Route {...rest} render={props => (React.createElement(component, props))}/>
    );
  }
};

// import Login from '../pages/auth/login';
// import { logoutUser } from '../actions/auth';
// import { Redirect, Route } from 'react-router';
// import React from 'react';

// export const AdminRoute = ({currentUser, dispatch, component, ...rest}) => {
//   if (!currentUser || currentUser.role !== 'admin' || !Login.isAuthenticated(localStorage.getItem('token'))) {
//     return (<Redirect to="/app/main"/>)
//   } else if (currentUser && currentUser.role === 'admin') {
//     return (
//       <Route {...rest} render={props => (React.createElement(component, props))}/>
//     );
//   }
// };

// export const UserRoute = ({dispatch, component, ...rest}) => {
//   if (!Login.isAuthenticated()) {
//     dispatch(logoutUser());
//     return (<Redirect to="/login"/>)
//   } else {
//     return ( // eslint-disable-line
//       <Route {...rest} render={props => (React.createElement(component, props))}/>
//     );
//   }
// };

// export const AuthRoute = ({dispatch, component, ...rest}) => {
//   const {from} = rest.location.state || {from: {pathname: '/app'}};

//   if (Login.isAuthenticated()) {
//     return (
//       <Redirect to={from}/>
//     );
//   } else {
//     return (
//       <Route {...rest} render={props => (React.createElement(component, props))}/>
//     );
//   }
// };
