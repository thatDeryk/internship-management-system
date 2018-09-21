import { NgModule } from '@angular/core';
import {
  MdButtonModule,
  MdCardModule,
  MdCheckboxModule,
  MdChipsModule,
  MdDatepickerModule,
  MdDialogModule,
  MdGridListModule,
  MdIconModule,
  MdInputModule,
  MdListModule,
  MdNativeDateModule,
  MdPaginatorModule,
  MdProgressSpinnerModule,
  MdRadioModule,
  MdSelectModule,
  MdSidenavModule,
  MdTableModule,
  MdTabsModule,
  MdToolbarModule,
  MdTooltipModule
} from '@angular/material';

@NgModule( {
             imports: [
               MdButtonModule, MdCheckboxModule,
               MdToolbarModule, MdGridListModule,
               MdInputModule, MdSidenavModule,
               MdListModule, MdDatepickerModule,
               MdNativeDateModule, MdPaginatorModule,
               MdTableModule, MdCardModule,
               MdDialogModule, MdChipsModule,
               MdIconModule, MdProgressSpinnerModule,
               MdTooltipModule, MdRadioModule,
               MdTabsModule, MdSelectModule
  
             ],
             exports: [
               MdButtonModule, MdCheckboxModule,
               MdToolbarModule, MdGridListModule,
               MdInputModule, MdSidenavModule,
               MdListModule, MdDatepickerModule,
               MdNativeDateModule, MdPaginatorModule,
               MdTableModule, MdCardModule,
               MdDialogModule, MdChipsModule,
               MdIconModule, MdProgressSpinnerModule,
               MdTooltipModule, MdRadioModule,
               MdTabsModule, MdSelectModule
             ]
  
           } )
export class MaterialCustomModule {
}
