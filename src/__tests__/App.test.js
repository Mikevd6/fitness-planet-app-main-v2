/* eslint-disable no-undef */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';

// Mock the localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: jest.fn(key => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('App Component', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
    // Ensure missing global 'av' exists as an identifier and global property for modules that reference it directly
    globalThis.av = globalThis.av || {};
    
    // Define av as a global variable
    global.av = globalThis.av;
    
    if (typeof window !== 'undefined') {
      window.av = globalThis.av;
    }
    // Manually clear only the App and store modules to avoid loading a second React instance
    delete require.cache[require.resolve('../redux/store')];
    delete require.cache[require.resolve('../App')];
  });
  
  test('renders login when user is not logged in', () => {
    const { store } = require('../redux/store');
    const App = require('../App').default;
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    expect(screen.getByText(/log in/i)).toBeInTheDocument();
  });
  
  test('renders dashboard when user is logged in', async () => {
    localStorage.setItem('user', JSON.stringify({ email: 'demo@fitnessplanet.com' }));
    // Ensure token is present if the app checks for it to restore auth
    localStorage.setItem('token', 'fake-token');

    const { store } = require('../redux/store');
    // Dispatch an action to set the user in the Redux store before rendering
    store.dispatch({ 
      type: 'LOGIN_SUCCESS', 
      payload: { email: 'demo@fitnessplanet.com' } 
    });
    
    const App = require('../App').default;

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(await screen.findByText(/dashboard/i)).toBeInTheDocument();
  });
});

// In your App component file
// import { useSelector } from 'react-redux';
// import { RootState } from './redux/store';

// const App = () => {
//   const user = useSelector((state: RootState) => state.user);

//   return (
//     <div>
//       {user ? <Dashboard /> : <Login />}
//     </div>
//   );
// };

// export default App;

/*
<a
            class="link"
            href="/register"
          >
            Registreer hier
          </a>
        </p>
        <p>
          <a
            class="link"
            href="/password-reset"
          >
            Wachtwoord vergeten?
          </a>
        </p>
      </div>
      <div
        class="demo-credentials"
      >
        <h3>
          Demo Account
        </h3>
        <p>
          Email: demo@fitnessplanet.com
        </p>
        <p>
          Password: demo123
        </p>
      </div>
    </div>
  </div>
</div>
*/