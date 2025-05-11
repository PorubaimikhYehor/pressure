import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { LoginComponent } from './login/login.component';
import { AuthService } from './login/auth.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, LoginComponent, MatButtonModule],
  templateUrl:"./app.component.html",
  styleUrl:"./app.component.scss"
})
export class AppComponent {
  auth = inject(AuthService);
}
