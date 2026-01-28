import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
    private registerUrl = 'https://83dfyyrjz6.execute-api.eu-north-1.amazonaws.com/prod/auth/register';

    constructor(private http: HttpClient) { }

    registerUser(email: string): Observable<any> {
      return this.http.post(this.registerUrl, { email });
    }

}
