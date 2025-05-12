import { Component, inject } from '@angular/core';
import { MaterialModule } from '../material.module';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core'
import { Validators } from '@angular/forms';
import { GoogleTableService } from '../google-table.service';

@Component({
  selector: 'app-pressure-form',
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './pressure-form.component.html',
  styleUrl: './pressure-form.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class PressureFormComponent {
private googleTable = inject(GoogleTableService);

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
    console.log(this.pressureForm.value);
    this.googleTable.sendData(this.pressureForm.value);
  }
  getCurrentLocalDateTimeString() {
    const d = new Date();
    return new Date(d.setMinutes(d.getMinutes() - d.getTimezoneOffset())).toJSON().substring(0, 16);
  }
}
