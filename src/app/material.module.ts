import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
// import {MatGridListModule} from '@angular/material/grid-list';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
// import {MatTimepickerModule} from '@angular/material/timepicker';
// import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSliderModule} from '@angular/material/slider';
const materialModules = [
  MatCardModule,
  MatButtonModule,
  MatToolbarModule,
  MatInputModule,
  MatIconModule,
  // MatGridListModule,
  MatButtonToggleModule,
  // MatTimepickerModule,
  // MatDatepickerModule,
  MatSliderModule
]


@NgModule({
  declarations: [],
  imports: [
    materialModules,
    CommonModule
  ],
  exports: [materialModules]
})
export class MaterialModule { }
