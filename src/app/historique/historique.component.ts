import { Component, OnInit } from '@angular/core';
import { EcritureService } from '../ecriture.service';
import { AuditSuppression } from '../audit-suppression';
import * as XLSX from 'xlsx';

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

  comptesComptables: string[] = [];
suggestionsCompte: string[] = [];
suggestionsOuvertes: boolean = false;

journaux: string[] = [];
suggestionsJournal: string[] = [];
suggestionsJournalOuvertes: boolean = false;

filtrerJournaux() {
  const saisie = this.filtreJournal?.toLowerCase() || '';
  if (!saisie) {
    this.suggestionsJournal = this.journaux;
    this.suggestionsJournalOuvertes = this.journaux.length > 0;
    return;
  }
  this.suggestionsJournal = this.journaux.filter(j =>
    j.toLowerCase().startsWith(saisie)
  );
  this.suggestionsJournalOuvertes = this.suggestionsJournal.length > 0;
}

choisirJournal(journal: string) {
  this.filtreJournal = journal;
  this.suggestionsJournalOuvertes = false;
}

fermerSuggestionsJournal() {
  setTimeout(() => this.suggestionsJournalOuvertes = false, 150);
}

filtrerComptes() {
  const saisie = this.filtreCompteComptable?.toLowerCase() || '';
  if (!saisie) {
    this.suggestionsCompte = [];
    this.suggestionsOuvertes = false;
    return;
  }
  this.suggestionsCompte = this.comptesComptables.filter(c =>
    c.toLowerCase().startsWith(saisie)
  );
  this.suggestionsOuvertes = this.suggestionsCompte.length > 0;
}

choisirCompte(compte: string) {
  this.filtreCompteComptable = compte;
  this.suggestionsOuvertes = false;
}

fermerSuggestions() {
  setTimeout(() => this.suggestionsOuvertes = false, 150);
}

  constructor(private service: EcritureService) {}

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  ngOnInit(): void {
  this.service.getComptesComptablesHistorique().subscribe(data => {
    this.comptesComptables = data;
  });

  this.service.getJournaux().subscribe(data => {
    this.journaux = data;
  });

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

  exporterExcel() {
  this.service.getHistorique(
    this.filtreLibelle, this.filtreJournal, this.filtreDateDebut, this.filtreDateFin,
    this.filtreCompteComptable, this.filtreRefPiece, this.filtreDevise,
    1, 999999
  ).subscribe(data => {
    const lignes = data.items.map((h: AuditSuppression) => ({
      'N° Écriture': h.numeroEcriture,
      'Date écriture': h.dateEcriture,
      'Journal': h.journalEcriture,
      'Compte': h.compteEcriture,
      'Débit': h.sensEcriture === 'D' ? h.montantEcriture : '',
      'Crédit': h.sensEcriture === 'C' ? h.montantEcriture : '',
      'Référence': h.referenceEcriture,
      'Devise': h.deviseEcriture,
      'Libellé': h.libelle,
      'Date suppression': h.dateSuppression,
      'Motif': h.motif
    }));

    const feuille = XLSX.utils.json_to_sheet(lignes);
    const classeur = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(classeur, feuille, 'Historique');
    XLSX.writeFile(classeur, 'historique_suppressions.xlsx');
  });
}
}
