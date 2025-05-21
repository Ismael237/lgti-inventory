import { directus } from "./directus/client";
import {
  login,
  logout,
  readMe,
  updateMe,
} from "@directus/sdk";

/**
 * API class for user management operations
 */
export class UserAPI {
  /**
   * Login a user with email and password
   * @param {Object} params - Login parameters
   * @param {string} params.email - User email
   * @param {string} params.password - User password
   * @returns {Promise<Object>} Login response
   */
  async loginUserWithCredentials({ email, password }: { email: string; password: string; }): Promise<object> {
    return await directus.request(login(email, password, { mode: "session" }));
  }

  /**
   * Logout current user
   * @returns {Promise<void>}
   */
  async logoutUser(): Promise<void> {
    return await directus.request(logout("", "session"));
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} Current user data
   */
  async getCurrentUser(): Promise<object> {
    return await directus.request(readMe());
  }

  /**
   * Update current user profile
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user data
   */
  async updateCurrentUser(userData: object): Promise<object> {
    return await directus.request(updateMe(userData));
  }

  /**
   * Check if the user is authenticated
   * @returns {Promise<boolean>} Authentication status
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
}

export const userAPI = new UserAPI();