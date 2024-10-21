import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  // Check if the user is logged in
  isLoggedIn(): boolean {
    return this.getAccessToken() !== null;
  }

  // Retrieve the logged-in user’s access token
  getLoggedUser() {
    const accessToken = this.getAccessToken();
    return accessToken ? accessToken : null;
  }

  // Helper method to safely access sessionStorage
  private getAccessToken(): string | null {
    // Ensure this runs only in the browser
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('accessToken');
    }
    return null; // Return null if not in a browser
  }

  // Save user details to session storage
  saveLoggedUserDetails(data: any): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined') { // Ensure this runs only in the browser
        sessionStorage.setItem('accessToken', data.token); // Save the token
        sessionStorage.setItem('email', data.email); // Save the email
      }
      resolve(true);
    });
  }

  // Clear session storage on logout
  clearUserDetails() {
    if (typeof window !== 'undefined') { // Ensure this runs only in the browser
      sessionStorage.clear();
    }
  }
}
