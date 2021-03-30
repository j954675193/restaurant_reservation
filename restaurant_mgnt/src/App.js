import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Navbar, Nav,
} from 'react-bootstrap';
import {
  // BrowserRouter as Router,
  HashRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import Desk from './Desk'
import Customer from './Customer'
import Date from './Date'
import Home from './Home'

function App() {
  return (
    <Router>
      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Navbar.Brand href="/">Reservation  Management</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <Link to="/desk">Table_Info &nbsp;&nbsp;</Link>
            <Link to="/customer">Customer_Info &nbsp;&nbsp;</Link>
            <Link to="/date">Date &nbsp;&nbsp;</Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Switch>
        <Route path="/desk">
          <Desk />
        </Route>

        <Route path="/customer">
          <Customer />
        </Route>

        <Route path="/date">
          <Date />

        </Route>

        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}


export default App;
