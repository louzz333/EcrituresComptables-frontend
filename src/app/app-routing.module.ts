import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EcrituresComponent } from './ecritures/ecritures.component';
import { HistoriqueComponent } from './historique/historique.component';

const routes: Routes = [
  { path: '', component: EcrituresComponent },
  { path: 'historique', component: HistoriqueComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }