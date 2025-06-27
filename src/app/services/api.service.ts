import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

// Generic response interface
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
  error?: string;
}

// Common HTTP options interface
export interface HttpOptions {
  headers?: HttpHeaders;
  params?: HttpParams;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  private readonly defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  constructor(private http: HttpClient) { }

  /**
   * Make a GET request
   * @param endpoint - The API endpoint (without base URL)
   * @param options - Optional HTTP options
   * @returns Observable of the response
   */
  get(endpoint: string, options?: HttpOptions): Observable<any> {
    const url = `${endpoint}`;
    const httpOptions = this.buildHttpOptions(options);
    
    return this.http.get(url, httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Make a POST request
   * @param endpoint - The API endpoint (without base URL)
   * @param body - The request body
   * @param options - Optional HTTP options
   * @returns Observable of the response
   */
  post(endpoint: string, body: any, options?: HttpOptions): Observable<any> {
    const url = `${endpoint}`;
    const httpOptions = this.buildHttpOptions(options);
    
    return this.http.post(url, body, httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Make a PUT request
   * @param endpoint - The API endpoint (without base URL)
   * @param body - The request body
   * @param options - Optional HTTP options
   * @returns Observable of the response
   */
  put(endpoint: string, body: any, options?: HttpOptions): Observable<any> {
    const url = `${endpoint}`;
    const httpOptions = this.buildHttpOptions(options);
    
    return this.http.put(url, body, httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Make a DELETE request
   * @param endpoint - The API endpoint (without base URL)
   * @param options - Optional HTTP options
   * @returns Observable of the response
   */
  delete(endpoint: string, options?: HttpOptions): Observable<any> {
    const url = `${endpoint}`;
    const httpOptions = this.buildHttpOptions(options);
    
    return this.http.delete(url, httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Make a PATCH request
   * @param endpoint - The API endpoint (without base URL)
   * @param body - The request body
   * @param options - Optional HTTP options
   * @returns Observable of the response
   */
  patch(endpoint: string, body: any, options?: HttpOptions): Observable<any> {
    const url = `${endpoint}`;
    const httpOptions = this.buildHttpOptions(options);
    
    return this.http.patch(url, body, httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Build HTTP options with default headers
   * @param options - Optional HTTP options
   * @returns Complete HTTP options
   */
  private buildHttpOptions(options?: HttpOptions): any {
    const httpOptions: any = {};
    
    // Merge headers
    if (options?.headers) {
      httpOptions.headers = this.defaultHeaders;
      options.headers.keys().forEach(key => {
        httpOptions.headers = httpOptions.headers.set(key, options.headers!.get(key));
      });
    } else {
      httpOptions.headers = this.defaultHeaders;
    }
    
    // Add other options
    if (options?.params) {
      httpOptions.params = options.params;
    }
    
    if (options?.responseType) {
      httpOptions.responseType = options.responseType;
    }
    
    return httpOptions;
  }

  /**
   * Handle HTTP errors
   * @param error - The HTTP error response
   * @returns Observable that throws the error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
      if (error.error?.message) {
        errorMessage += ` - ${error.error.message}`;
      }
    }
    
    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Set authorization header
   * @param token - The authorization token
   */
  setAuthToken(token: string): void {
    this.defaultHeaders.set('Authorization', `Bearer ${token}`);
  }

  /**
   * Remove authorization header
   */
  removeAuthToken(): void {
    this.defaultHeaders.delete('Authorization');
  }

  /**
   * Add custom header
   * @param key - Header key
   * @param value - Header value
   */
  addHeader(key: string, value: string): void {
    this.defaultHeaders.set(key, value);
  }

  /**
   * Remove custom header
   * @param key - Header key
   */
  removeHeader(key: string): void {
    this.defaultHeaders.delete(key);
  }
} 