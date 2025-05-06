// auth-sdk/providers/auth0-provider.js
import AuthProvider from './auth-provider.js';
import { Auth0Client } from '@auth0/auth0-spa-js';

class Auth0Provider extends AuthProvider {
  constructor(config) {
    super(config);
    this.client = new Auth0Client({
      domain: config.domain,
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      cacheLocation: 'localstorage',
      useRefreshTokens: true,
      ...config.options
    });
    
    // Handle the authentication callback if applicable
    this._handleAuthCallback();
  }

  async _handleAuthCallback() {
    // Check if we're in a callback URL scenario
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
      try {
        // Process the login
        await this.client.handleRedirectCallback();
        // Clear the URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error("Error handling redirect callback:", error);
      }
    }
  }

  async login() {
    try {
      await this.client.loginWithRedirect({
        authorizationParams: {
          redirect_uri: this.config.redirectUri,
          ...this.config.authParams
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async logout() {
    try {
      await this.client.logout({
        logoutParams: {
          returnTo: this.config.logoutRedirectUri || window.location.origin
        }
      });
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  async getUser() {
    try {
      const user = await this.client.getUser();
      return user;
    } catch (error) {
      console.error("Get user error:", error);
      return null;
    }
  }

  async isAuthenticated() {
    try {
      return await this.client.isAuthenticated();
    } catch (error) {
      console.error("Authentication check error:", error);
      return false;
    }
  }

  async getToken() {
    try {
      return await this.client.getTokenSilently();
    } catch (error) {
      console.error("Token retrieval error:", error);
      throw error;
    }
  }
}

export default Auth0Provider;
