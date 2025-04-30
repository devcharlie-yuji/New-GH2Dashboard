import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { Container, Alert, Button, FormGroup, Label, InputGroup, Input, InputGroupText } from 'reactstrap';
import config from '../../../config';
import Widget from '../../../components/Widget';
import { loginUser, receiveToken, doInit } from '../../../actions/auth';
import jwt from "jsonwebtoken";
import Cookies from 'js-cookie';
import microsoft from '../../../images/microsoft.png';

class Login extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
    };

    static isAuthenticated() {
      try {
        // Check token in cookies first, then localStorage
        const token = Cookies.get('access_token') || localStorage.getItem('token');
        
        // For debugging - log the token
        console.log('Auth check - token exists:', !!token);
        
        if (!config.isBackend && token) return true;
        if (!token) return false;
        
        const date = new Date().getTime() / 1000;
        const data = jwt.decode(token);
        
        // For debugging - log the decoded token
        console.log('Auth check - decoded token:', data);
        
        if (!data) return false;
        
        const isValid = date < data.exp;
        console.log('Auth check - token valid:', isValid);
        return isValid;
      } catch (error) {
        console.error('Error in isAuthenticated:', error);
        return false;
      }
    }

    constructor(props) {
        super(props);

        this.state = {
          username: '', // Changed from email to username
          password: '',
        };

        this.doLogin = this.doLogin.bind(this);
        this.googleLogin = this.googleLogin.bind(this);
        this.microsoftLogin = this.microsoftLogin.bind(this);
        this.changeUsername = this.changeUsername.bind(this);
        this.changePassword = this.changePassword.bind(this);
        this.signUp = this.signUp.bind(this);
    }

    changeUsername(event) {
        this.setState({ username: event.target.value });
    }

    changePassword(event) {
        this.setState({ password: event.target.value });
    }

    doLogin(e) {
        e.preventDefault();
        console.log('Login attempt with:', { username: this.state.username });
        this.props.dispatch(loginUser({ username: this.state.username, password: this.state.password }));
    }

    googleLogin() {
        this.props.dispatch(loginUser({social: "google"}));
    }

    microsoftLogin() {
        this.props.dispatch(loginUser({social: "microsoft"}));
    }

    componentDidMount() {
        const params = new URLSearchParams(this.props.location.search);
        const token = params.get('token');
        if (token) {
            console.log('Token found in URL, processing...');
            this.props.dispatch(receiveToken(token));
            this.props.dispatch(doInit());
        }
    }

    signUp() {
      this.props.dispatch(push('/register'));
    }

    render() {
        return (
            <div className="auth-page">
                <Container>
                    <Widget className="widget-auth mx-auto" title={<h3 className="mt-0">Login to Yunify Platform</h3>}>
                        <p className="widget-auth-info">
                            Use your username and password to sign in.
                        </p>
                        <Alert className="alert-sm text-center mt-2 widget-middle-overflow rounded-0" color="default">
                        Empowering your industrial operations with seamless connectivity,
                            <br/>
                            <span className="font-weight-bold">real-time data insights, and adaptable integration</span>
                            <br/>
                            to login!
                        </Alert>
                        <form onSubmit={this.doLogin}>
                            {
                                this.props.errorMessage && (
                                    <Alert className="alert-sm widget-middle-overflow rounded-0" color="danger">
                                        {typeof this.props.errorMessage === 'object' ? 
                                          JSON.stringify(this.props.errorMessage) : 
                                          this.props.errorMessage}
                                    </Alert>
                                )
                            }
                            <FormGroup className="mt">
                                <Label for="username">Username</Label>
                                <InputGroup className="input-group-no-border">
                                    <InputGroupText>
                                        <i className="la la-user text-white"/>
                                    </InputGroupText>
                                    <Input id="username" className="input-transparent ps-3" value={this.state.username} onChange={this.changeUsername} type="text"
                                           required name="username" placeholder="Username"/>
                                </InputGroup>
                            </FormGroup>
                            <FormGroup>
                                <Label for="password">Password</Label>
                                <InputGroup className="input-group-no-border">
                                    <InputGroupText>
                                        <i className="la la-lock text-white"/>
                                    </InputGroupText>
                                    <Input id="password" className="input-transparent ps-3" value={this.state.password}
                                           onChange={this.changePassword} type="password"
                                           required name="password" placeholder="Password"/>
                                </InputGroup>
                            </FormGroup>
                            <div className="bg-widget auth-widget-footer">
                                <Button type="submit" color="danger" className="auth-btn"
                                        size="sm">
                                  <span className="auth-btn-circle">
                                    <i className="la la-caret-right"/>
                                  </span>
                                  {this.props.isFetching ? 'Loading...' : 'Login'}
                                </Button>
                                <p className="widget-auth-info mt-4">
                                    
                                </p>
                                <Link className="d-block text-center mb-4" ></Link>
                                <div className="social-buttons">
                                </div>
                            </div>
                        </form>
                    </Widget>
                </Container>
                <footer className="auth-footer">
                    {new Date().getFullYear()} &copy; Yuji Labs Private Limited. All rights reserved. <a href="https://www.yuji.co.in/" rel="noopener noreferrer" target="_blank">Yuji Labs</a>
                </footer>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        isFetching: state.auth.isFetching,
        isAuthenticated: state.auth.isAuthenticated,
        errorMessage: state.auth.errorMessage,
    };
}

export default withRouter(connect(mapStateToProps)(Login));


// import React from 'react';
// import PropTypes from 'prop-types';
// import { withRouter, Redirect, Link } from 'react-router-dom';
// import { connect } from 'react-redux';
// import { Container, Alert, Button, FormGroup, Label, InputGroup, Input, InputGroupText } from 'reactstrap';
// import Widget from '../../components/Widget';
// import { loginUser, receiveToken } from '../../actions/auth';
// import jwt from "jsonwebtoken";

// import config from "../../config";

// class Login extends React.Component {
//     static propTypes = {
//         dispatch: PropTypes.func.isRequired,
//     };

//     static isAuthenticated(token) {
//         // We check if app runs with backend mode
//         if (!config.isBackend && token) return true;
//         if (!token) return;
//         const date = new Date().getTime() / 1000;
//         const data = jwt.decode(token);
//         return date < data.exp;
//     }

//     constructor(props) {
//         super(props);

//         this.state = {
//             username: '', // Changed from email to username
//             password: '',
//         };

//         this.doLogin = this.doLogin.bind(this);
//         this.googleLogin = this.googleLogin.bind(this);
//         this.microsoftLogin = this.microsoftLogin.bind(this);
//         this.changeUsername = this.changeUsername.bind(this); // Changed from changeEmail
//         this.changePassword = this.changePassword.bind(this);
//         this.signUp = this.signUp.bind(this);
//     }

//     changeUsername(event) { // Changed from changeEmail
//         this.setState({ username: event.target.value });
//     }

//     changePassword(event) {
//         this.setState({ password: event.target.value });
//     }

//     doLogin(e) {
//         e.preventDefault();
//         this.props.dispatch(loginUser({ username: this.state.username, password: this.state.password }));
//     }

//     googleLogin() {
//         this.props.dispatch(loginUser({social: "google"}));
//     }

//     microsoftLogin() {
//         this.props.dispatch(loginUser({social: "microsoft"}));
//     }

//     componentDidMount() {
//         const params = new URLSearchParams(this.props.location.search);
//         const token = params.get('token');
//         if (token) {
//             this.props.dispatch(receiveToken(token));
//         }
//     }

//     signUp() {
//         this.props.history.push('/register');
//     }

//     render() {
//         const { from } = this.props.location.state || { from: { pathname: '/app' } }; // eslint-disable-line

//         // cant access login page while logged in
//         if (Login.isAuthenticated(localStorage.getItem('token'))) {
//             return (
//                 <Redirect to={from} />
//             );
//         }

//         return (
//             <div className="auth-page">
//                 <Container>
//                     <Widget className="widget-auth mx-auto" title={<h3 className="mt-0">Login to your Web App</h3>}>
//                         <p className="widget-auth-info">
//                             Use your username to sign in.
//                         </p>
//                         <Alert className="alert-sm text-center mt-2 widget-middle-overflow rounded-0" color="secondary">
//                         Empowering your industrial operations with seamless connectivity,
//                             <br/>
//                             <span className="font-weight-bold">real-time data insights, and adaptable integration</span>
//                             <br/>
//                             to login!
//                         </Alert>
//                         <form onSubmit={this.doLogin}>
//                             {
//                                 this.props.errorMessage && (
//                                     <Alert className="alert-sm widget-middle-overflow rounded-0" color="danger">
//                                         {this.props.errorMessage}
//                                     </Alert>
//                                 )
//                             }
//                             <FormGroup className="mt">
//                                 <Label for="username">Username</Label>
//                                 <InputGroup className="input-group-no-border">
//                                     <InputGroupText>
//                                         <i className="la la-user text-white"/>
//                                     </InputGroupText>
//                                     <Input id="username" className="input-transparent ps-3" value={this.state.username} onChange={this.changeUsername} type="text"
//                                            required name="username" placeholder="Username"/>
//                                 </InputGroup>
//                             </FormGroup>
//                             <FormGroup>
//                                 <Label for="password">Password</Label>
//                                 <InputGroup className="input-group-no-border">

//                                     <InputGroupText>
//                                         <i className="la la-lock text-white"/>
//                                     </InputGroupText>

//                                     <Input id="password" className="input-transparent ps-3" value={this.state.password}
//                                            onChange={this.changePassword} type="password"
//                                            required name="password" placeholder="Password"/>
//                                 </InputGroup>
//                             </FormGroup>
//                             <div className="bg-widget auth-widget-footer">
//                                 <Button type="submit" color="danger" className="auth-btn"
//                                         size="sm">
//                                   <span className="auth-btn-circle">
//                                     <i className="la la-caret-right"/>
//                                   </span>
//                                   {this.props.isFetching ? 'Loading...' : 'Login'}
//                                 </Button>
//                                                         </div>
//                         </form>
//                     </Widget>
//                 </Container>
//                 <footer className="auth-footer">
//                     {new Date().getFullYear()} &copy; Yuji Labs Private Limited. All rights reserved. <a href="https://www.yuji.co.in/" rel="noopener noreferrer" target="_blank">Yuji Labs</a>
//                 </footer>
//             </div>
//         );
//     }
// }

// function mapStateToProps(state) {
//     return {
//         isFetching: state.auth.isFetching,
//         isAuthenticated: state.auth.isAuthenticated,
//         errorMessage: state.auth.errorMessage,
//     };
// }

// export default withRouter(connect(mapStateToProps)(Login));


// import React from 'react';
// import PropTypes from 'prop-types';
// import { withRouter, Redirect, Link } from 'react-router-dom';
// import { connect } from 'react-redux';
// import { Container, Alert, Button, FormGroup, Label, InputGroup, Input, InputGroupText } from 'reactstrap';
// import Widget from '../../components/Widget';
// import { loginUser, receiveToken } from '../../actions/auth';
// import jwt from "jsonwebtoken";

// import config from "../../config";

// class Login extends React.Component {
//     static propTypes = {
//         dispatch: PropTypes.func.isRequired,
//     };

//     static isAuthenticated(token) {
//         // We check if app runs with backend mode
//         if (!config.isBackend && token) return true;
//         if (!token) return;
//         const date = new Date().getTime() / 1000;
//         const data = jwt.decode(token);
//         return date < data.exp;
//     }

//     constructor(props) {
//         super(props);

//         this.state = {
//             username: '', // Changed from email to username
//             password: '',
//         };

//         this.doLogin = this.doLogin.bind(this);
//         this.googleLogin = this.googleLogin.bind(this);
//         this.microsoftLogin = this.microsoftLogin.bind(this);
//         this.changeUsername = this.changeUsername.bind(this); // Changed from changeEmail
//         this.changePassword = this.changePassword.bind(this);
//         this.signUp = this.signUp.bind(this);
//     }

//     changeUsername(event) { // Changed from changeEmail
//         this.setState({ username: event.target.value });
//     }

//     changePassword(event) {
//         this.setState({ password: event.target.value });
//     }

//     doLogin(e) {
//         e.preventDefault();
//         this.props.dispatch(loginUser({ username: this.state.username, password: this.state.password }));
//     }

//     googleLogin() {
//         this.props.dispatch(loginUser({social: "google"}));
//     }

//     microsoftLogin() {
//         this.props.dispatch(loginUser({social: "microsoft"}));
//     }

//     componentDidMount() {
//         const params = new URLSearchParams(this.props.location.search);
//         const token = params.get('token');
//         if (token) {
//             this.props.dispatch(receiveToken(token));
//         }
//     }

//     signUp() {
//         this.props.history.push('/register');
//     }

//     render() {
//         const { from } = this.props.location.state || { from: { pathname: '/app' } }; // eslint-disable-line

//         // cant access login page while logged in
//         if (Login.isAuthenticated(localStorage.getItem('token'))) {
//             return (
//                 <Redirect to={from} />
//             );
//         }

//         return (
//             <div className="auth-page">
//                 <Container>
//                     <Widget className="widget-auth mx-auto" title={<h3 className="mt-0">Login to your Web App</h3>}>
//                         <p className="widget-auth-info">
//                             Use your username to sign in.
//                         </p>
//                         <Alert className="alert-sm text-center mt-2 widget-middle-overflow rounded-0" color="secondary">
//                         Empowering your industrial operations with seamless connectivity,
//                             <br/>
//                             <span className="font-weight-bold">real-time data insights, and adaptable integration</span>
//                             <br/>
//                             to login!
//                         </Alert>
//                         <form onSubmit={this.doLogin}>
//                             {
//                                 this.props.errorMessage && (
//                                     <Alert className="alert-sm widget-middle-overflow rounded-0" color="danger">
//                                         {this.props.errorMessage}
//                                     </Alert>
//                                 )
//                             }
//                             <FormGroup className="mt">
//                                 <Label for="username">Username</Label>
//                                 <InputGroup className="input-group-no-border">
//                                     <InputGroupText>
//                                         <i className="la la-user text-white"/>
//                                     </InputGroupText>
//                                     <Input id="username" className="input-transparent ps-3" value={this.state.username} onChange={this.changeUsername} type="text"
//                                            required name="username" placeholder="Username"/>
//                                 </InputGroup>
//                             </FormGroup>
//                             <FormGroup>
//                                 <Label for="password">Password</Label>
//                                 <InputGroup className="input-group-no-border">

//                                     <InputGroupText>
//                                         <i className="la la-lock text-white"/>
//                                     </InputGroupText>

//                                     <Input id="password" className="input-transparent ps-3" value={this.state.password}
//                                            onChange={this.changePassword} type="password"
//                                            required name="password" placeholder="Password"/>
//                                 </InputGroup>
//                             </FormGroup>
//                             <div className="bg-widget auth-widget-footer">
//                                 <Button type="submit" color="danger" className="auth-btn"
//                                         size="sm">
//                                   <span className="auth-btn-circle">
//                                     <i className="la la-caret-right"/>
//                                   </span>
//                                   {this.props.isFetching ? 'Loading...' : 'Login'}
//                                 </Button>
//                                                         </div>
//                         </form>
//                     </Widget>
//                 </Container>
//                 <footer className="auth-footer">
//                     {new Date().getFullYear()} &copy; Yuji Labs Private Limited. All rights reserved. <a href="https://www.yuji.co.in/" rel="noopener noreferrer" target="_blank">Yuji Labs</a>
//                 </footer>
//             </div>
//         );
//     }
// }

// function mapStateToProps(state) {
//     return {
//         isFetching: state.auth.isFetching,
//         isAuthenticated: state.auth.isAuthenticated,
//         errorMessage: state.auth.errorMessage,
//     };
// }

// export default withRouter(connect(mapStateToProps)(Login));


// import React from 'react';
// import PropTypes from 'prop-types';
// import { withRouter, Redirect, Link } from 'react-router-dom';
// import { connect } from 'react-redux';
// import { Container, Alert, Button, FormGroup, Label, InputGroup, Input, InputGroupText } from 'reactstrap';
// import Widget from '../../components/Widget';
// import { loginUser, receiveToken } from '../../actions/auth';
// import jwt from "jsonwebtoken";

// import config from "../../config";

// class Login extends React.Component {
//     static propTypes = {
//         dispatch: PropTypes.func.isRequired,
//     };

//     static isAuthenticated(token) {
//         // We check if app runs with backend mode
//         if (!config.isBackend && token) return true;
//         if (!token) return;
//         const date = new Date().getTime() / 1000;
//         const data = jwt.decode(token);
//         return date < data.exp;
//     }

//     constructor(props) {
//         super(props);

//         this.state = {
//             email: 'admin@flatlogic.com',
//             password: 'password',
//         };

//         this.doLogin = this.doLogin.bind(this);
//         this.googleLogin = this.googleLogin.bind(this);
//         this.microsoftLogin = this.microsoftLogin.bind(this);
//         this.changeEmail = this.changeEmail.bind(this);
//         this.changePassword = this.changePassword.bind(this);
//         this.signUp = this.signUp.bind(this);
//     }

//     changeEmail(event) {
//         this.setState({ email: event.target.value });
//     }

//     changePassword(event) {
//         this.setState({ password: event.target.value });
//     }

//     doLogin(e) {
//         e.preventDefault();
//         this.props.dispatch(loginUser({ email: this.state.email, password: this.state.password }));
//     }

//     googleLogin() {
//         this.props.dispatch(loginUser({social: "google"}));
//     }

//     microsoftLogin() {
//         this.props.dispatch(loginUser({social: "microsoft"}));
//     }

//     componentDidMount() {
//         const params = new URLSearchParams(this.props.location.search);
//         const token = params.get('token');
//         if (token) {
//             this.props.dispatch(receiveToken(token));
//         }
//     }

//     signUp() {
//         this.props.history.push('/register');
//     }

//     render() {
//         const { from } = this.props.location.state || { from: { pathname: '/app' } }; // eslint-disable-line

//         // cant access login page while logged in
//         if (Login.isAuthenticated(localStorage.getItem('token'))) {
//             return (
//                 <Redirect to={from} />
//             );
//         }

//         return (
//             <div className="auth-page">
//                 <Container>
//                     <Widget className="widget-auth mx-auto" title={<h3 className="mt-0">Login to your Web App</h3>}>
//                         <p className="widget-auth-info">
//                             Use your email to sign in.
//                         </p>
//                         <Alert className="alert-sm text-center mt-2 widget-middle-overflow rounded-0" color="secondary">
//                         Empowering your industrial operations with seamless connectivity,
//                             <br/>
//                             <span className="font-weight-bold">real-time data insights, and adaptable integration</span>
//                             <br/>
//                             to login!
//                         </Alert>
//                         <form onSubmit={this.doLogin}>
//                             {
//                                 this.props.errorMessage && (
//                                     <Alert className="alert-sm widget-middle-overflow rounded-0" color="danger">
//                                         {this.props.errorMessage}
//                                     </Alert>
//                                 )
//                             }
//                             <FormGroup className="mt">
//                                 <Label for="email">Email</Label>
//                                 <InputGroup className="input-group-no-border">
//                                     <InputGroupText>
//                                         <i className="la la-user text-white"/>
//                                     </InputGroupText>
//                                     <Input id="email" className="input-transparent ps-3" value={this.state.email} onChange={this.changeEmail} type="email"
//                                            required name="email" placeholder="Email"/>
//                                 </InputGroup>
//                             </FormGroup>
//                             <FormGroup>
//                                 <Label for="password">Password</Label>
//                                 <InputGroup className="input-group-no-border">

//                                     <InputGroupText>
//                                         <i className="la la-lock text-white"/>
//                                     </InputGroupText>

//                                     <Input id="password" className="input-transparent ps-3" value={this.state.password}
//                                            onChange={this.changePassword} type="password"
//                                            required name="password" placeholder="Password"/>
//                                 </InputGroup>
//                             </FormGroup>
//                             <div className="bg-widget auth-widget-footer">
//                                 <Button type="submit" color="danger" className="auth-btn"
//                                         size="sm">
//                                   <span className="auth-btn-circle">
//                                     <i className="la la-caret-right"/>
//                                   </span>
//                                   {this.props.isFetching ? 'Loading...' : 'Login'}
//                                 </Button>
//                                                         </div>
//                         </form>
//                     </Widget>
//                 </Container>
//                 <footer className="auth-footer">
//                     {new Date().getFullYear()} &copy; Yuji Labs Private Limited. All rights reserved. <a href="https://www.yuji.co.in/" rel="noopener noreferrer" target="_blank">Yuji Labs</a>
//                 </footer>
//             </div>
//         );
//     }
// }

// function mapStateToProps(state) {
//     return {
//         isFetching: state.auth.isFetching,
//         isAuthenticated: state.auth.isAuthenticated,
//         errorMessage: state.auth.errorMessage,
//     };
// }

// export default withRouter(connect(mapStateToProps)(Login));




// import React from 'react';
// import PropTypes from 'prop-types';
// import { withRouter, Redirect, Link } from 'react-router-dom';
// import { connect } from 'react-redux';
// import { Container, Alert, Button, FormGroup, Label, InputGroup, Input, InputGroupText } from 'reactstrap';
// import Widget from '../../components/Widget';
// import { loginUser, receiveToken } from '../../actions/auth';
// import jwt from "jsonwebtoken";

// import config from "../../config";

// class Login extends React.Component {
//     static propTypes = {
//         dispatch: PropTypes.func.isRequired,
//     };

//     static isAuthenticated(token) {
//         // We check if app runs with backend mode
//         if (!config.isBackend && token) return true;
//         if (!token) return;
//         const date = new Date().getTime() / 1000;
//         const data = jwt.decode(token);
//         return date < data.exp;
//     }

//     constructor(props) {
//         super(props);

//         this.state = {
//             email: 'admin@flatlogic.com',
//             password: 'password',
//         };

//         this.doLogin = this.doLogin.bind(this);
//         this.googleLogin = this.googleLogin.bind(this);
//         this.microsoftLogin = this.microsoftLogin.bind(this);
//         this.changeEmail = this.changeEmail.bind(this);
//         this.changePassword = this.changePassword.bind(this);
//         this.signUp = this.signUp.bind(this);
//     }

//     changeEmail(event) {
//         this.setState({ email: event.target.value });
//     }

//     changePassword(event) {
//         this.setState({ password: event.target.value });
//     }

//     doLogin(e) {
//         e.preventDefault();
//         this.props.dispatch(loginUser({ email: this.state.email, password: this.state.password }));
//     }

//     googleLogin() {
//         this.props.dispatch(loginUser({social: "google"}));
//     }

//     microsoftLogin() {
//         this.props.dispatch(loginUser({social: "microsoft"}));
//     }

//     componentDidMount() {
//         const params = new URLSearchParams(this.props.location.search);
//         const token = params.get('token');
//         if (token) {
//             this.props.dispatch(receiveToken(token));
//         }
//     }

//     signUp() {
//         this.props.history.push('/register');
//     }

//     render() {
//         const { from } = this.props.location.state || { from: { pathname: '/app' } }; // eslint-disable-line

//         // cant access login page while logged in
//         if (Login.isAuthenticated(localStorage.getItem('token'))) {
//             return (
//                 <Redirect to={from} />
//             );
//         }

//         return (
//             <div className="auth-page">
//                 <Container>
//                     <Widget className="widget-auth mx-auto" title={<h3 className="mt-0">Login to your Web App</h3>}>
//                         <p className="widget-auth-info">
//                             Use your email to sign in.
//                         </p>
//                         <Alert className="alert-sm text-center mt-2 widget-middle-overflow rounded-0" color="secondary">
//                         Empowering your industrial operations with seamless connectivity,
//                             <br/>
//                             <span className="font-weight-bold">real-time data insights, and adaptable integration</span>
//                             <br/>
//                             to login!
//                         </Alert>
//                         <form onSubmit={this.doLogin}>
//                             {
//                                 this.props.errorMessage && (
//                                     <Alert className="alert-sm widget-middle-overflow rounded-0" color="danger">
//                                         {this.props.errorMessage}
//                                     </Alert>
//                                 )
//                             }
//                             <FormGroup className="mt">
//                                 <Label for="email">Email</Label>
//                                 <InputGroup className="input-group-no-border">
//                                     <InputGroupText>
//                                         <i className="la la-user text-white"/>
//                                     </InputGroupText>
//                                     <Input id="email" className="input-transparent ps-3" value={this.state.email} onChange={this.changeEmail} type="email"
//                                            required name="email" placeholder="Email"/>
//                                 </InputGroup>
//                             </FormGroup>
//                             <FormGroup>
//                                 <Label for="password">Password</Label>
//                                 <InputGroup className="input-group-no-border">

//                                     <InputGroupText>
//                                         <i className="la la-lock text-white"/>
//                                     </InputGroupText>

//                                     <Input id="password" className="input-transparent ps-3" value={this.state.password}
//                                            onChange={this.changePassword} type="password"
//                                            required name="password" placeholder="Password"/>
//                                 </InputGroup>
//                             </FormGroup>
//                             <div className="bg-widget auth-widget-footer">
//                                 <Button type="submit" color="danger" className="auth-btn"
//                                         size="sm">
//                                   <span className="auth-btn-circle">
//                                     <i className="la la-caret-right"/>
//                                   </span>
//                                   {this.props.isFetching ? 'Loading...' : 'Login'}
//                                 </Button>
//                                 {/* <p className="widget-auth-info mt-4">
//                                     Don't have an account? Sign up now!
//                                 </p> */}
//                                 {/* <Link className="d-block text-center mb-4" to="register">Create an Account</Link> */}
//                                 {/* <div className="social-buttons">
//                                     <Button onClick={this.googleLogin} color="primary" className="social-button">
//                                         <i className="social-icon social-google"/>
//                                         <p className="social-text">GOOGLE</p>
//                                     </Button>
//                                     <Button onClick={this.microsoftLogin} color="success" className="social-button">
//                                         <i className="social-icon social-microsoft"
//                                            style={{backgroundImage: `url(${microsoft})`}}/>
//                                         <p className="social-text">MICROSOFT</p>
//                                     </Button>
//                                 </div> */}
//                             </div>
//                         </form>
//                     </Widget>
//                 </Container>
//                 <footer className="auth-footer">
//                     {new Date().getFullYear()} &copy; Yuji Labs Private Limited. All rights reserved. <a href="https://www.yuji.co.in/" rel="noopener noreferrer" target="_blank">Yuji Labs</a>
//                 </footer>
//             </div>
//         );
//     }
// }

// function mapStateToProps(state) {
//     return {
//         isFetching: state.auth.isFetching,
//         isAuthenticated: state.auth.isAuthenticated,
//         errorMessage: state.auth.errorMessage,
//     };
// }

// export default withRouter(connect(mapStateToProps)(Login));

