import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from './login/auth.service';
import { catchError, map, mergeMap, Observable, of, switchMap, take, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleTableService {
  private SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx2W9rPJbAF1d8DUaWoCOewlAVKMXPOFGMf1sYuY5n9SwpBFR74RcEl7kplW9ABUNiv/exec';

  private http = inject(HttpClient);
  private auth = inject(AuthService);

  constructor() { }

  sendData(data: any): Observable<string> {
    return this.auth.user().pipe(
      take(1),
      switchMap(user => {
        data.email = user?.email || 'unknown@example.com';
        return this.http.post<any>(this.SCRIPT_URL, JSON.stringify(data));
      }),
      mergeMap(response => {
        if (response?.status === "error") {
          return throwError(() => new Error(response.message || 'Failed to send data. Please try again.'));
        }
        return of(response.message || 'Data sent successfully.');
      }),
      catchError(err => {
        return throwError(() => err instanceof Error ? err : new Error('Failed to send data. Please try again.'));
      })
    );
  }

}
