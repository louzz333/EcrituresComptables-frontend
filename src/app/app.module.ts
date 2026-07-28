import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';//importer l'outil pour envoyer requete httpclient
import { EcrituresComponent } from './ecritures/ecritures.component';
import { FormsModule } from '@angular/forms';
import { HistoriqueComponent } from './historique/historique.component';
@NgModule({
  declarations: [
    AppComponent,
    EcrituresComponent,
    HistoriqueComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
