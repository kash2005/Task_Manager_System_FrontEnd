import { Injectable } from '@angular/core';
import { UserDTO } from '../../model/userDTO';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/internal/Observable';

const subUrl = 'user/';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private httpClient: HttpClient) {}

  signUp(userDTO : UserDTO){
    return this.httpClient.post(environment.baseUrl + subUrl + 'signUp', userDTO);
  }
  
  // In user.service.ts
  signIn(email: string, password: string): Observable<any> {
    return this.httpClient.post(environment.baseUrl + subUrl + 'signIn', { email, password });
  }

  
}
