import { Component, OnInit } from '@angular/core';
import { EcritureService } from '../ecriture.service';
import { AuditSuppression } from '../audit-suppression';

@Component({
  selector: 'app-historique',
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.css']
})
export class HistoriqueComponent implements OnInit {
  historique: AuditSuppression[] = [];
  totalCount = 0;

  rechercheAvanceeOuverte = true;

  filtreLibelle = '';
  filtreRefPiece = '';
  filtreDevise = '';
  filtreCompteComptable = '';
  filtreJournal = '';
  filtreDateDebut = '';
  filtreDateFin = '';

  page = 1;
  pageSize = 10;

  constructor(private service: EcritureService) {}

  ngOnInit(): void {
    this.chargerHistorique();
  }

  chargerHistorique(): void {
  this.service.getHistorique(
    this.filtreLibelle,
    this.filtreJournal,
    this.filtreDateDebut,
    this.filtreDateFin,
    this.filtreCompteComptable,
    this.filtreRefPiece,
    this.filtreDevise,
    this.page,
    this.pageSize
  ).subscribe({
    next: (res: any) => {
      console.log('Réponse historique:', res);
      this.historique = res.items;
      this.totalCount = res.totalCount;
    },
    error: (err) => {
      console.error('Erreur historique:', err);
    }
  });
}

  rechercher(): void {
    this.page = 1;
    this.chargerHistorique();
  }

  reinitialiser(): void {
    this.filtreLibelle = '';
    this.filtreRefPiece = '';
    this.filtreDevise = '';
    this.filtreCompteComptable = '';
    this.filtreJournal = '';
    this.filtreDateDebut = '';
    this.filtreDateFin = '';
    this.page = 1;
    this.chargerHistorique();
  }
  
}
