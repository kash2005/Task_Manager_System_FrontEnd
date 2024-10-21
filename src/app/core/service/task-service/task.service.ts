import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { StorageService } from '../storage-service/storage.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = `${environment.baseUrl}`; // Base URL for your API

  constructor(private httpClient: HttpClient, private storageService: StorageService) {}

  private getHeaders() {
    const token = this.storageService.getLoggedUser();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  /**
   * Create a new task.
   * @param listId The ID of the list to which the task belongs.
   * @param title The title of the task.
   * @param priority The priority of the task.
   * @returns An Observable that emits the created task.
   */
  createTask(listId: string, title: string, priority: string): Observable<any> {
    const data = { list: listId, title, priority };
    return this.httpClient.post(`${this.apiUrl}/task`, data, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error creating task:', error);
        return throwError(() => new Error('Failed to create task'));
      })
    );
  }

  /**
   * Update an existing task.
   * @param taskId The ID of the task to update.
   * @param title The new title for the task.
   * @param priority The new priority for the task.
   * @param completed The completion status of the task.
   * @returns An Observable that emits the updated task.
   */
  updateTask(taskId: string, title: string, priority: string, completed: boolean): Observable<any> {
    const data = { title, priority, completed };
    return this.httpClient.put(`${this.apiUrl}/task/${taskId}`, data, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error updating task:', error);
        return throwError(() => new Error('Failed to update task'));
      })
    );
  }

  /**
   * Delete a task.
   * @param taskId The ID of the task to delete.
   * @returns An Observable that emits the deleted task details.
   */
  deleteTask(taskId: string): Observable<any> {
    return this.httpClient.delete(`${this.apiUrl}/task/${taskId}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error deleting task:', error);
        return throwError(() => new Error('Failed to delete task'));
      })
    );
  }

  /**
   * Fetch a task by its ID.
   * @param taskId The ID of the task to fetch.
   * @returns An Observable that emits the requested task.
   */
  getTaskById(taskId: string): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/task/${taskId}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error fetching task:', error);
        return throwError(() => new Error('Failed to fetch task'));
      })
    );
  }

  /**
   * Fetch all tasks for a specific list ID.
   * @param listId The ID of the list to fetch tasks from.
   * @returns An Observable that emits the tasks for the specified list.
   */
  getTasksByListId(listId: string): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/tasks/list/${listId}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error fetching tasks:', error);
        return throwError(() => new Error('Failed to fetch tasks'));
      })
    );
  }
}
