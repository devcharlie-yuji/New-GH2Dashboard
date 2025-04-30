import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Navbar,
  Nav,
  NavItem,
  NavLink,
  InputGroupAddon,
  InputGroup,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Form,
  FormGroup,
} from 'reactstrap';
import cx from 'classnames';
import { logoutUser } from '../../actions/auth';
import { openSidebar, closeSidebar, changeSidebarPosition, changeSidebarVisibility } from '../../actions/navigation';

// import adminDefault from '../../images/chat/chat2.png';
// import search from '../../images/search.svg';
// import notify from '../../images/notify.svg';
import s from './Header.module.scss';
import 'animate.css';

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.toggleMenu = this.toggleMenu.bind(this);
    this.toggleNotifications = this.toggleNotifications.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.toggleSearchOpen = this.toggleSearchOpen.bind(this);

    this.state = {
      menuOpen: false,
      notificationsOpen: false,
      searchFocused: false,
      searchOpen: false,
      notificationsTabSelected: 1,
    };
  }

  toggleNotifications() {
    this.setState({
      notificationsOpen: !this.state.notificationsOpen,
    });
  }

  toggleMenu() {
    this.setState({
      menuOpen: !this.state.menuOpen,
    });
  }

  toggleSidebar() {
    if (this.props.sidebarOpened) {
      this.props.dispatch(closeSidebar());
    } else {
      const paths = this.props.location.pathname.split('/');
      paths.pop();
      this.props.dispatch(openSidebar());
    }
  }

  moveSidebar(position) {
    this.props.dispatch(changeSidebarPosition(position));
  }

  toggleVisibilitySidebar(visibility) {
    this.props.dispatch(changeSidebarVisibility(visibility));
  }

  toggleSearchOpen() {
    this.setState({
      searchOpen: !this.state.searchOpen,
    });
  }

  render() {
    // Add defensive checks for currentUser and its properties
    const user = this.props.currentUser || {};
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const username = user.username || 'User';
    const role = user.role || '';
    
    // Safely extract the first character of the username for the avatar
    const avatarText = username && username.length > 0 ? username[0].toUpperCase() : 'U';
    
    return (
      <Navbar className={`${s.root} d-print-none`}>
        <Nav>
          <NavItem>
            <NavLink className={cx(s.navbarBrand)} href="/">
              <span className={s.logoStyle}>YUNIFY</span>
            </NavLink>
          </NavItem>
        </Nav>
        
        <Nav className="ml-auto">
          <NavItem className="d-sm-none mr-4">
            <NavLink
              className=""
              href="#"
              onClick={(e) => {
                e.preventDefault();
                this.toggleSearchOpen();
              }}
            >
              {/* <img src={search} alt="search" /> */}
            </NavLink>
          </NavItem>
          <Dropdown
            nav
            isOpen={this.state.menuOpen}
            toggle={this.toggleMenu}
            className="me-2"
            id="basic-nav-dropdown"
          >
            <DropdownToggle nav caret className="text-white">
              <span className={`${s.avatar} rounded-circle float-left me-2`}>
                {avatarText}
              </span>
              <span className="small d-none d-sm-block">{username}</span>
            </DropdownToggle>
            <DropdownMenu right className={`${s.dropdownMenu} super-colors py-0`}>
              <DropdownItem className="ps-3">
                Signed in as
              </DropdownItem>
              <DropdownItem divider />
              {/* Show profile link only if it's defined and the user has appropriate access */}
              {role === 'admin' && (
                <DropdownItem>
                  <Link to="/app/profile" className="text-link">Profile</Link>
                </DropdownItem>
              )}
              {/* Add password change option */}
              <DropdownItem>
                <Link to="/app/password" className="text-link">Change Password</Link>
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={() => this.doLogout()}>
                <a className="text-link">Sign Out</a>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Nav>
      </Navbar>
    );
  }

  doLogout() {
    this.props.dispatch(logoutUser());
  }
}

function mapStateToProps(store) {
  return {
    sidebarOpened: store.navigation.sidebarOpened,
    sidebarPosition: store.navigation.sidebarPosition,
    sidebarVisibility: store.navigation.sidebarVisibility,
    currentUser: store.auth.currentUser,
  };
}

export default connect(mapStateToProps)(Header);


// import { connect } from 'react-redux';
// import React from 'react';
// import PropTypes from 'prop-types';
// import { withRouter } from 'react-router';
// import {
//   Navbar,
//   Nav,
//   NavItem,
//   NavLink,
//   InputGroupText,
//   InputGroup,
//   Input,
//   UncontrolledAlert,
//   Dropdown,
//   Collapse,
//   DropdownToggle,
//   DropdownMenu,
//   DropdownItem,
//   Badge,
//   ButtonGroup,
//   Button,
//   Form
// } from 'reactstrap';
// import Notifications from '../Notifications';
// import PowerIcon from "../Icons/HeaderIcons/PowerIcon";
// import BellIcon from "../Icons/HeaderIcons/BellIcon";
// import SettingsIcon from "../Icons/HeaderIcons/SettingsIcon";
// import MessageIcon from "../Icons/HeaderIcons/MessageIcon";
// import BurgerIcon from "../Icons/HeaderIcons/BurgerIcon";
// import SearchIcon from "../Icons/HeaderIcons/SearchIcon";
// import ArrowIcon from "../Icons/HeaderIcons/ArrowIcon";


// import { logoutUser } from '../../actions/auth';
// import { openSidebar, closeSidebar, changeSidebarPosition, changeSidebarVisibility } from '../../actions/navigation';

// import sender1 from '../../images/people/a1.jpg';
// import sender2 from '../../images/people/a5.jpg';
// import sender3 from '../../images/people/a4.jpg';

// import adminDefault from '../../images/chat/chat2.png';

// import s from './Header.module.scss';

// class Header extends React.Component {
//   static propTypes = {
//     dispatch: PropTypes.func.isRequired,
//     sidebarPosition: PropTypes.string.isRequired,
//   };

//   constructor(props) {
//     super(props);

//     this.doLogout = this.doLogout.bind(this);
//     this.onDismiss = this.onDismiss.bind(this);
//     this.toggleMessagesDropdown = this.toggleMessagesDropdown.bind(this);
//     this.toggleSupportDropdown = this.toggleSupportDropdown.bind(this);
//     this.toggleSettingsDropdown = this.toggleSettingsDropdown.bind(this);
//     this.toggleAccountDropdown = this.toggleAccountDropdown.bind(this);
//     this.toggleSidebar = this.toggleSidebar.bind(this);
//     this.toggleSearchOpen = this.toggleSearchOpen.bind(this);

//     this.state = {
//       visible: true,
//       messagesOpen: false,
//       supportOpen: false,
//       settingsOpen: false,
//       searchFocused: false,
//       searchOpen: false,
//       notificationsOpen: false
//     };
//   }

//   toggleNotifications = () => {
//     this.setState({
//       notificationsOpen: !this.state.notificationsOpen,
//     });
//   }

//   onDismiss() {
//     this.setState({ visible: false });
//   }

//   doLogout() {
//     this.props
//       .dispatch(logoutUser());
//   }

//   toggleMessagesDropdown() {
//     this.setState({
//       messagesOpen: !this.state.messagesOpen,
//     });
//   }

//   toggleSupportDropdown() {
//     this.setState({
//       supportOpen: !this.state.supportOpen,
//     });
//   }

//   toggleSettingsDropdown() {
//     this.setState({
//       settingsOpen: !this.state.settingsOpen,
//     });
//   }

//   toggleAccountDropdown() {
//     this.setState({
//       accountOpen: !this.state.accountOpen,
//     });
//   }

//   toggleSearchOpen() {
//     this.setState({
//       searchOpen: !this.state.searchOpen,
//     });
//   }

//   toggleSidebar() {
//     this.props.isSidebarOpened
//       ? this.props.dispatch(closeSidebar())
//       : this.props.dispatch(openSidebar())
//   }

//   moveSidebar(position) {
//     this.props.dispatch(changeSidebarPosition(position));
//   }

//   toggleVisibilitySidebar(visibility) {
//     this.props.dispatch(changeSidebarVisibility(visibility));
//   }

//   render() {
//     const user = this.props.currentUser;
//     const avatar = user && user.avatar && user.avatar.length && user.avatar[0].publicUrl;

//     const firstUserLetter = user && (user.firstName|| user.email)[0].toUpperCase();
//     return (
//       <Navbar className="d-print-none">
//         <div className={s.burger}>
//           <NavLink onClick={this.toggleSidebar} className={`d-md-none ${s.navItem} text-white`} href="#">
//             <BurgerIcon className={s.headerIcon} />
//           </NavLink>
//         </div>

//         <div className={`d-print-none ${s.root}`}>
//           <UncontrolledAlert className="me-3 d-lg-down-none animate__animated animate__bounceIn animate__delay-1s">
//             Check out Light Blue
//             <button
//               className="btn-link"
//               onClick={() => this.setState({ settingsOpen: true })}
//             >
//               <SettingsIcon className={`${s.settingsIcon} btn-link`} />
//             </button>
//             on the right!
//           </UncontrolledAlert>

//           <Collapse className={`${s.searchCollapse} ms-lg-0 me-md-3`} isOpen={this.state.searchOpen}>
//             <InputGroup className={`${s.navbarForm} ${this.state.searchFocused ? s.navbarFormFocused : ''}`}>
//               <InputGroupText className={s.inputAddon}>
//                 <i className="fa fa-search" />
//               </InputGroupText>
//               <Input
//                 id="search-input-2"
//                 placeholder="Search..."
//                 className="input-transparent"
//                 onFocus={() => this.setState({ searchFocused: true })}
//                 onBlur={() => this.setState({ searchFocused: false })}
//               />
//             </InputGroup>
//           </Collapse>

//           <Form className="d-md-down-none mx-3 my-auto">
//             <InputGroup className={`input-group-no-border ${s.searchForm}`}>
//               <InputGroupText className={s.inputGroupText}>
//                 <SearchIcon className={s.headerIcon} />
//               </InputGroupText>
//               <Input id="search-input" className="input-transparent" placeholder="Search Dashboard" />
//             </InputGroup>
//           </Form>

//           <Nav className="ms-md-0">
//             <Dropdown nav isOpen={this.state.notificationsOpen} toggle={this.toggleNotifications}>
//               <DropdownToggle nav caret style={{ color: "#C1C3CF", padding: 0 }}>
//                 <span className={`small d-sm-down-none ${s.adminEmail}`}>{user ? (user.firstName || user.email) : "User"}</span>
//                 <Badge className={`d-sm-down-none ${s.badge}`} color="danger">9</Badge>
//               </DropdownToggle>
//               <DropdownMenu className={`${s.notificationsWrapper} py-0`}>
//                 <Notifications />
//               </DropdownMenu>
//             </Dropdown>

//             <Dropdown nav isOpen={this.state.messagesOpen} toggle={this.toggleMessagesDropdown}>
//               <DropdownToggle nav className={`d-sm-down-none ${s.navItem} text-white`}>
//                 <MessageIcon className={s.headerIcon} />
//               </DropdownToggle>
//               <DropdownMenu className={`${s.dropdownMenu} ${s.messages}`}>
//                 <DropdownItem>Messages loading...</DropdownItem>
//               </DropdownMenu>
//             </Dropdown>

//             <Dropdown nav isOpen={this.state.settingsOpen} toggle={this.toggleSettingsDropdown}>
//               <DropdownToggle nav className={`${s.navItem} text-white`}>
//                 <SettingsIcon className={s.headerIcon} />
//               </DropdownToggle>
//               <DropdownMenu className={`${s.dropdownMenu} ${s.settings}`}>
//                 <h6>Sidebar on the</h6>
//                 <ButtonGroup size="sm">
//                   <Button onClick={() => this.moveSidebar('left')} className={this.props.sidebarPosition === 'left' ? 'active' : ''}>Left</Button>
//                   <Button onClick={() => this.moveSidebar('right')} className={this.props.sidebarPosition === 'right' ? 'active' : ''}>Right</Button>
//                 </ButtonGroup>
//                 <h6 className="mt-2">Sidebar</h6>
//                 <ButtonGroup size="sm">
//                   <Button onClick={() => this.toggleVisibilitySidebar('show')} className={this.props.sidebarVisibility === 'show' ? 'active' : ''}>Show</Button>
//                   <Button onClick={() => this.toggleVisibilitySidebar('hide')} className={this.props.sidebarVisibility === 'hide' ? 'active' : ''}>Hide</Button>
//                 </ButtonGroup>
//               </DropdownMenu>
//             </Dropdown>

//             <NavItem>
//               <NavLink onClick={this.doLogout} className={`${s.navItem} text-white`} href="#">
//                 <PowerIcon className={s.headerIcon} />
//               </NavLink>
//             </NavItem>
//           </Nav>
//         </div>
//       </Navbar>
//     );
//   }
// }

// function mapStateToProps(store) {
//   return {
//     isSidebarOpened: store.navigation.sidebarOpened,
//     sidebarVisibility: store.navigation.sidebarVisibility,
//     sidebarPosition: store.navigation.sidebarPosition,
//     currentUser: store.auth.currentUser,
//   };
// }

// export default withRouter(connect(mapStateToProps)(Header));



// // import { connect } from 'react-redux';
// // import React from 'react';
// // import PropTypes from 'prop-types';
// // import { withRouter } from 'react-router';
// // import {
// //   Navbar,
// //   Nav,
// //   NavItem,
// //   NavLink,
// //   InputGroupText,
// //   InputGroup,
// //   Input,
// //   UncontrolledAlert,
// //   Dropdown,
// //   Collapse,
// //   DropdownToggle,
// //   DropdownMenu,
// //   DropdownItem,
// //   Badge,
// //   ButtonGroup,
// //   Button,
// //   Form
// // } from 'reactstrap';
// // import Notifications from '../Notifications';
// // import PowerIcon from "../Icons/HeaderIcons/PowerIcon";
// // import BellIcon from "../Icons/HeaderIcons/BellIcon";
// // import SettingsIcon from "../Icons/HeaderIcons/SettingsIcon";
// // import MessageIcon from "../Icons/HeaderIcons/MessageIcon";
// // import BurgerIcon from "../Icons/HeaderIcons/BurgerIcon";
// // import SearchIcon from "../Icons/HeaderIcons/SearchIcon";
// // import ArrowIcon from "../Icons/HeaderIcons/ArrowIcon";


// // import { logoutUser } from '../../actions/auth';
// // import { openSidebar, closeSidebar, changeSidebarPosition, changeSidebarVisibility } from '../../actions/navigation';

// // import sender1 from '../../images/people/a1.jpg';
// // import sender2 from '../../images/people/a5.jpg';
// // import sender3 from '../../images/people/a4.jpg';

// // import adminDefault from '../../images/chat/chat2.png';

// // import s from './Header.module.scss';

// // class Header extends React.Component {
// //   static propTypes = {
// //     dispatch: PropTypes.func.isRequired,
// //     sidebarPosition: PropTypes.string.isRequired,
// //   };

// //   constructor(props) {
// //     super(props);

// //     this.doLogout = this.doLogout.bind(this);
// //     this.onDismiss = this.onDismiss.bind(this);
// //     this.toggleMessagesDropdown = this.toggleMessagesDropdown.bind(this);
// //     this.toggleSupportDropdown = this.toggleSupportDropdown.bind(this);
// //     this.toggleSettingsDropdown = this.toggleSettingsDropdown.bind(this);
// //     this.toggleAccountDropdown = this.toggleAccountDropdown.bind(this);
// //     this.toggleSidebar = this.toggleSidebar.bind(this);
// //     this.toggleSearchOpen = this.toggleSearchOpen.bind(this);

// //     this.state = {
// //       visible: true,
// //       messagesOpen: false,
// //       supportOpen: false,
// //       settingsOpen: false,
// //       searchFocused: false,
// //       searchOpen: false,
// //       notificationsOpen: false
// //     };
// //   }

// //   toggleNotifications = () => {
// //     this.setState({
// //       notificationsOpen: !this.state.notificationsOpen,
// //     });
// //   }

// //   onDismiss() {
// //     this.setState({ visible: false });
// //   }

// //   doLogout() {
// //     this.props
// //       .dispatch(logoutUser());
// //   }

// //   toggleMessagesDropdown() {
// //     this.setState({
// //       messagesOpen: !this.state.messagesOpen,
// //     });
// //   }

// //   toggleSupportDropdown() {
// //     this.setState({
// //       supportOpen: !this.state.supportOpen,
// //     });
// //   }

// //   toggleSettingsDropdown() {
// //     this.setState({
// //       settingsOpen: !this.state.settingsOpen,
// //     });
// //   }

// //   toggleAccountDropdown() {
// //     this.setState({
// //       accountOpen: !this.state.accountOpen,
// //     });
// //   }

// //   toggleSearchOpen() {
// //     this.setState({
// //       searchOpen: !this.state.searchOpen,
// //     });
// //   }

// //   toggleSidebar() {
// //     this.props.isSidebarOpened
// //       ? this.props.dispatch(closeSidebar())
// //       : this.props.dispatch(openSidebar())
// //   }

// //   moveSidebar(position) {
// //     this.props.dispatch(changeSidebarPosition(position));
// //   }

// //   toggleVisibilitySidebar(visibility) {
// //     this.props.dispatch(changeSidebarVisibility(visibility));
// //   }

// //   render() {
// //     const user = this.props.currentUser;
// //     const avatar = user && user.avatar && user.avatar.length && user.avatar[0].publicUrl;

// //     const firstUserLetter = user && (user.firstName|| user.email)[0].toUpperCase();
// //     return (
// //       <Navbar className={`d-print-none`}>
// //         <div className={s.burger}>
// //           <NavLink onClick={this.toggleSidebar} className={`d-md-none ${s.navItem} text-white`} href="#">
// //             <BurgerIcon className={s.headerIcon} />
// //           </NavLink>
// //         </div>
// //         <div className={`d-print-none ${s.root}`}>
// //           <UncontrolledAlert className={`me-3 d-lg-down-none animate__animated animate__bounceIn animate__delay-1s`}>
// //                 Check out Light Blue
// //                 <button
// //                   className="btn-link"
// //                   onClick={() => this.setState({ settingsOpen: true })}
// //                 >
// //                   <SettingsIcon className={`${s.settingsIcon} btn-link`} />
// //                 </button> on the right!
// //             </UncontrolledAlert>
// //           <Collapse className={`${s.searchCollapse} ms-lg-0 me-md-3`} isOpen={this.state.searchOpen}>
// //             <InputGroup className={`${s.navbarForm} ${this.state.searchFocused ? s.navbarFormFocused : ''}`}>

// //               <InputGroupText className={s.inputAddon}>
// //                 <i className="fa fa-search" />
// //               </InputGroupText>

// //               <Input
// //                 id="search-input-2" placeholder="Search..." className="input-transparent"
// //                 onFocus={() => this.setState({ searchFocused: true })}
// //                 onBlur={() => this.setState({ searchFocused: false })}
// //               />
// //             </InputGroup>
// //           </Collapse>
// //           <Form className="d-md-down-none mx-3 my-auto">
// //             <InputGroup className={`input-group-no-border ${s.searchForm}`} >
// //               <InputGroupText className={s.inputGroupText}>
// //                 <SearchIcon className={s.headerIcon} />
// //               </InputGroupText>
// //               <Input id="search-input" className="input-transparent" placeholder="Search Dashboard" />
// //             </InputGroup>
// //           </Form>

// //           <Nav className="ms-md-0">
// //             <Dropdown nav isOpen={this.state.notificationsOpen} toggle={this.toggleNotifications} id="basic-nav-dropdown" className={`${s.notificationsMenu}`} >
// //               <DropdownToggle nav caret style={{color: "#C1C3CF", padding: 0}}>
// //               <span className={`${s.avatar} rounded-circle float-start`}>
// //                 {avatar ? (
// //                   <img src={avatar} onError={e => e.target.src = adminDefault} alt="..." title={user && (user.firstName || user.email)} />
// //                 ) : user && user.role === 'admin' ? (
// //                   <img src={adminDefault} onError={e => e.target.src = adminDefault} alt="..." title={user && (user.firstName || user.email)} />
// //                 ) : <span title={user && (user.firstName || user.email)}>{firstUserLetter}</span>
// //                 }
// //               </span>
// //                 <span className={`small d-sm-down-none ${s.adminEmail}`}>{user ? (user.firstName || user.email) : "Philip Smith"}</span>
// //                 <Badge className={`d-sm-down-none ${s.badge}`} color="danger">9</Badge>
// //               </DropdownToggle>
// //               <DropdownMenu className={`${s.notificationsWrapper} py-0 animate__animated animate__faster animate__fadeInUp`}>
// //                 <Notifications />
// //               </DropdownMenu>
// //             </Dropdown>
// //             <NavItem className="d-lg-none">
// //               <NavLink onClick={this.toggleSearchOpen} className={s.navItem} href="#">
// //                 <SearchIcon addId='header-search' className={s.headerIcon} />
// //               </NavLink>
// //             </NavItem>
// //             <Dropdown nav isOpen={this.state.messagesOpen} toggle={this.toggleMessagesDropdown}>
// //               <DropdownToggle nav className={`d-sm-down-none ${s.navItem} text-white`}>
// //                 <MessageIcon className={s.headerIcon} />
// //               </DropdownToggle>
// //               <DropdownMenu className={`${s.dropdownMenu} ${s.messages}`}>
// //                 <DropdownItem>
// //                   <img className={s.image} src={sender1} alt="" />
// //                   <div className={s.details}>
// //                     <div>Jane Hew</div>
// //                     <div className={s.text}>
// //                       Hey, John! How is it going? ...
// //                     </div>
// //                   </div>
// //                 </DropdownItem>
// //                 <DropdownItem>
// //                   <img className={s.image} src={sender2} alt="" />
// //                   <div className={s.details}>
// //                     <div>Alies Rumiancaŭ</div>
// //                     <div className={s.text}>
// //                       I will definitely buy this template
// //                     </div>
// //                   </div>
// //                 </DropdownItem>
// //                 <DropdownItem>
// //                   <img className={s.image} src={sender3} alt="" />
// //                   <div className={s.details}>
// //                     <div>Michał Rumiancaŭ</div>
// //                     <div className={s.text}>
// //                       Is it really Lore ipsum? Lore ...
// //                     </div>
// //                   </div>
// //                 </DropdownItem>
// //                 <DropdownItem>
// //                   {/* eslint-disable-next-line */}
// //                   <a href="#" className="text-white">
// //                     See all messages <ArrowIcon className={s.headerIcon} maskName="messagesArrow" />
// //                   </a>
// //                 </DropdownItem>
// //               </DropdownMenu>
// //             </Dropdown>
// //             <NavItem className={`${s.divider} d-none d-sm-block`} />
// //             <Dropdown className="d-none d-sm-block" nav isOpen={this.state.settingsOpen} toggle={this.toggleSettingsDropdown}>
// //               <DropdownToggle nav className={`${s.navItem} text-white`}>
// //                 <SettingsIcon addId='header-settings' className={s.headerIcon} />
// //               </DropdownToggle>
// //               <DropdownMenu className={`${s.dropdownMenu} ${s.settings}`}>
// //                 <h6>Sidebar on the</h6>
// //                 <ButtonGroup size="sm">
// //                   <Button color="primary" onClick={() => this.moveSidebar('left')} className={this.props.sidebarPosition === 'left' ? 'active' : ''}>Left</Button>
// //                   <Button color="primary" onClick={() => this.moveSidebar('right')} className={this.props.sidebarPosition === 'right' ? 'active' : ''}>Right</Button>
// //                 </ButtonGroup>
// //                 <h6 className="mt-2">Sidebar</h6>
// //                 <ButtonGroup size="sm">
// //                   <Button color="primary" onClick={() => this.toggleVisibilitySidebar('show')} className={this.props.sidebarVisibility === 'show' ? 'active' : ''}>Show</Button>
// //                   <Button color="primary" onClick={() => this.toggleVisibilitySidebar('hide')} className={this.props.sidebarVisibility === 'hide' ? 'active' : ''}>Hide</Button>
// //                 </ButtonGroup>
// //               </DropdownMenu>
// //             </Dropdown>
// //             <Dropdown className="d-none d-sm-block" nav isOpen={this.state.supportOpen} toggle={this.toggleSupportDropdown}>
// //               <DropdownToggle nav className={`${s.navItem} text-white`}>
// //                 <BellIcon className={s.headerIcon} />
// //                 <span className={s.count}></span>
// //               </DropdownToggle>
// //               <DropdownMenu className={`${s.dropdownMenu} ${s.support}`}>
// //                 <DropdownItem>
// //                   <Badge color="danger"><i className="fa fa-bell-o" /></Badge>
// //                   <div className={s.details}>
// //                     Check out this awesome ticket
// //                   </div>
// //                 </DropdownItem>
// //                 <DropdownItem>
// //                   <Badge color="warning"><i className="fa fa-question-circle" /></Badge>
// //                   <div className={s.details}>
// //                     What is the best way to get ...
// //                   </div>
// //                 </DropdownItem>
// //                 <DropdownItem>
// //                   <Badge color="success"><i className="fa fa-info-circle" /></Badge>
// //                   <div className={s.details}>
// //                     This is just a simple notification
// //                   </div>
// //                 </DropdownItem>
// //                 <DropdownItem>
// //                   <Badge color="info"><i className="fa fa-plus" /></Badge>
// //                   <div className={s.details}>
// //                     12 new orders has arrived today
// //                   </div>
// //                 </DropdownItem>
// //                 <DropdownItem>
// //                   <Badge color="danger"><i className="fa fa-tag" /></Badge>
// //                   <div className={s.details}>
// //                     One more thing that just happened
// //                   </div>
// //                 </DropdownItem>
// //                 <DropdownItem>
// //                 {/* eslint-disable-next-line */}
// //                 <a href="#" className="text-white">
// //                     See all tickets <ArrowIcon className={s.headerIcon} maskName="bellArrow" />
// //                 </a>
// //                 </DropdownItem>
// //               </DropdownMenu>
// //             </Dropdown>
// //             <NavItem>
// //               <NavLink onClick={this.doLogout} className={`${s.navItem} text-white`} href="#">
// //                 <PowerIcon className={s.headerIcon} />
// //               </NavLink>
// //             </NavItem>
// //           </Nav>
// //         </div>
// //       </Navbar>
// //     );
// //   }
// // }

// // function mapStateToProps(store) {
// //   return {
// //     isSidebarOpened: store.navigation.sidebarOpened,
// //     sidebarVisibility: store.navigation.sidebarVisibility,
// //     sidebarPosition: store.navigation.sidebarPosition,
// //     currentUser: store.auth.currentUser,
// //   };
// // }

// // export default withRouter(connect(mapStateToProps)(Header));

