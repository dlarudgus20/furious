import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import reportWebVitals from './reportWebVitals'
import { Provider as ThemeProvider } from './contexts/Theme'
import { Provider as AuthProvider } from './contexts/Auth'
import Layout from './components/Layout'
import AppPage from './pages/App'
import SignInPage from './pages/SignIn'
import DevicePage from './pages/Device'
import NewDevicePage from './pages/NewDevice'
import NotFoundPage from './pages/NotFound'
import './index.css'

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Layout>
            <Switch>
              <Route exact path='/' component={AppPage} />
              <Route path='/signin' component={SignInPage} />
              <Route path='/device/:id' component={DevicePage} />
              <Route path='/new-device' component={NewDevicePage} />
              <Route path='*' component={NotFoundPage} />
            </Switch>
          </Layout>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
