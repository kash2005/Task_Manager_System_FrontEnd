import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { StorageService } from '../storage-service/storage.service';

@Injectable({
  providedIn: 'root',
})
export class ListService {
  constructor(private httpClient: HttpClient, private storageService: StorageService) {}

  /**
   * Create a new list by sending the list title to the server.
   * @param title The title of the list to create.
   * @returns An Observable that emits the server's response.
   */
  newList(title: string): Observable<Object> {
    const data = { title };  // Create the payload with the title
    const token = this.storageService.getLoggedUser(); // Get the access token

    // Check if token exists before proceeding
    if (!token) {
      console.error('No token found, user may not be logged in');
      return throwError(() => new Error('No token found'));
    }

    // Set up the headers with the Authorization token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    // Send the POST request with headers and data
    return this.httpClient.post(`${environment.baseUrl}/list`, data, { headers }).pipe(
      catchError((error) => {
        console.error('Error creating list:', error);
        return throwError(() => new Error('Error creating list'));
      })
    );
  }

  /**
   * Update an existing list by sending the list ID and new title to the server.
   * @param id The ID of the list to update.
   * @param title The new title for the list.
   * @returns An Observable that emits the server's response.
   */
  updateList(id: string, title: string): Observable<Object> {
    const data = { title };  // Create the payload with the new title
    const token = this.storageService.getLoggedUser();

    if (!token) {
      console.error('No token found, user may not be logged in');
      return throwError(() => new Error('No token found'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.httpClient.put(`${environment.baseUrl}/list/${id}`, data, { headers }).pipe(
      catchError((error) => {
        console.error('Error updating list:', error);
        return throwError(() => new Error('Error updating list'));
      })
    );
  }

  /**
   * Delete an existing list by sending the list ID to the server.
   * @param id The ID of the list to delete.
   * @returns An Observable that emits the server's response.
   */
  deleteList(id: string): Observable<Object> {
    const token = this.storageService.getLoggedUser();

    if (!token) {
      console.error('No token found, user may not be logged in');
      return throwError(() => new Error('No token found'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.httpClient.delete(`${environment.baseUrl}/list/${id}`, { headers }).pipe(
      catchError((error) => {
        console.error('Error deleting list:', error);
        return throwError(() => new Error('Error deleting list'));
      })
    );
  }

  /**
   * Fetch all lists for the logged-in user.
   * @returns An Observable that emits the server's response with the lists.
   */
  getLists(): Observable<Object> {
    const token = this.storageService.getLoggedUser();

    if (!token) {
      console.error('No token found, user may not be logged in');
      return throwError(() => new Error('No token found'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.httpClient.get(`${environment.baseUrl}/lists`, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching lists:', error);
        return throwError(() => new Error('Error fetching lists'));
      })
    );
  }
}
