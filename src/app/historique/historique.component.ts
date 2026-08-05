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
  Math = Math;

  constructor(private service: EcritureService) {}

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

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

  allerAPage(page: number): void {
    this.page = page;
    this.chargerHistorique();
  }

  pagePrecedente(): void {
    if (this.page > 1) {
      this.allerAPage(this.page - 1);
    }
  }

  pageSuivante(): void {
    if (this.page < this.totalPages) {
      this.allerAPage(this.page + 1);
    }
  }
}
