import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from './login/auth.service';

@Injectable({
  providedIn: 'root'
})
export class GoogleTableService {
  private SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHeFN2RoFI1XCNLPAVBOvzEi8OzttxmsRdEkX6_RGwPSmKUWsotAZJTY_cs9snKET7/exec';

  private http = inject(HttpClient);
  private auth = inject(AuthService);

  // http.get<Config>('/api/config').subscribe(config => { });

  constructor() { }

  sendData(data: any) {
    console.log(data);
    this.auth.user().subscribe(user => {
      data.email = user?.email;
      this.http.post<any>(this.SCRIPT_URL, JSON.stringify(data)).subscribe(r => { console.log(r) });
    });
  }
}
