import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { applyMiddleware, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import 'typeface-roboto';
import App from './feature/app/App';
import './index.css';
import reducer from './shared/reducers/index';
import registerServiceWorker from './feature/app/registerServiceWorker';

const LOGGING = false;
const CACHING = false;

const middlewares = [];
middlewares.push(thunk);
if (LOGGING) {
    middlewares.push(createLogger({
        diff: true
    }));
}

const store = createStore(
    reducer,
    applyMiddleware(...middlewares)
);

ReactDOM.render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>,
    document.getElementById('root')
);

if (CACHING) {
  registerServiceWorker();
}
