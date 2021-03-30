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

import Booking from './Booking'
import Home from './Home'

function App() {
  return (
    <Router>
      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Navbar.Brand href="/">Restaurant Reservation App</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <Link to="/booking">Booking</Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Switch>
        <Route path="/booking">
          <Booking />
        </Route>
        
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}


export default App;
