import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ ConnectButton, logo }) => {
  return (
    <nav className='navbar navbar-expand-lg navbar-expand-md navbar-light'>
        <div className='container-fluid'>
          <a className='navbar-brand' href='#'>
            DAO
          </a>
          <button
            className='navbar-toggler'
            type='button'
            data-bs-toggle='collapse'
            data-bs-target='#navbarSupportedContent'
            aria-controls='navbarSupportedContent'
            aria-expanded='false'
            aria-label='Toggle navigation'
          >
            <span className='navbar-toggler-icon'></span>
          </button>
          <div className='collapse navbar-collapse' id='navbarSupportedContent'>
            <ul className='navbar-nav me-auto mb-2 mb-lg-0'>
              <li className='nav-item'>
                <Link className='nav-link' aria-current='page' to='/'>
                  Join
                </Link>
              </li>
              <li className='nav-item'>
                <Link className='nav-link' aria-current='page' to='/create-proposal'>
                  Create Proposal
                </Link>
              </li>
              <li className='nav-item'>
                <Link className='nav-link' aria-current='page' to='/vote'>
                  Vote
                </Link>
              </li>
              <li className='nav-item'>
                <Link className='nav-link' aria-current='page' to='/execute'>
                  Queue/Execute
                </Link>
              </li>
              <li className='nav-item'>
                <Link className='nav-link' aria-current='page' to='/claim'>
                  Claim Rewards
                </Link>
              </li>
            </ul>
           
<ConnectButton></ConnectButton>           
          </div>
        </div>
      </nav>
  );
};

export default Navbar;

<ul className='navbar-nav me-auto mb-2 mb-lg-0'></ul>;
