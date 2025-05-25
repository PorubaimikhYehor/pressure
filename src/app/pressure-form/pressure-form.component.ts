import { Component, inject } from '@angular/core';
import { MaterialModule } from '../material.module';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core'
import { Validators } from '@angular/forms';
import { GoogleTableService } from '../google-table.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-pressure-form',
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './pressure-form.component.html',
  styleUrl: './pressure-form.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class PressureFormComponent {
  private googleTable = inject(GoogleTableService);
  private _snackBar = inject(MatSnackBar);

  pressureForm = new FormGroup({
    // email: currentUserEmail,
    systolic: new FormControl('', [Validators.required, Validators.maxLength(3), Validators.minLength(2)]),
    diastolic: new FormControl('', [Validators.required, Validators.maxLength(3), Validators.minLength(2)]),
    pulse: new FormControl('', [Validators.required, Validators.maxLength(3), Validators.minLength(2)]),
    comment: new FormControl(''),
    timestamp: new FormControl(this.getCurrentLocalDateTimeString()),
    hand: new FormControl('Left'),
    feeling: new FormControl(10),
  });

  submitForm = () => {
    this.googleTable.sendData(this.pressureForm.value).subscribe({
      next: message => {
        this._snackBar.open(message, 'Close', { panelClass: ['success-snack-bar'], verticalPosition: 'top' });
      },
      error: err => {
        this._snackBar.open(err.message, 'Close', { panelClass: ['error-snack-bar'], verticalPosition: 'top' });
      }
    });;
  }
  getCurrentLocalDateTimeString() {
    const d = new Date();
    return new Date(d.setMinutes(d.getMinutes() - d.getTimezoneOffset())).toJSON().substring(0, 16);
  }
}
