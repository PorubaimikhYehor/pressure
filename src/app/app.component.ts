import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { RouterOutlet } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { AuthService } from './login/auth.service';
import { MaterialModule } from './material.module';
import { PressureFormComponent } from "./pressure-form/pressure-form.component";

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, /* RouterOutlet, */ LoginComponent, MaterialModule, PressureFormComponent],
  templateUrl:"./app.component.html",
  styleUrl:"./app.component.scss"
})
export class AppComponent {
  auth = inject(AuthService);
}
