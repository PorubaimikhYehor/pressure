import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { MaterialModule } from '../material.module';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, MaterialModule],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  constructor(private auth: AuthService) { }

  login() {
    this.auth.loginWithGoogle();
  }
}
