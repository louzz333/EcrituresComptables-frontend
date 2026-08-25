import { Component, OnInit } from '@angular/core';
import { EcritureService } from '../ecriture.service';
import { AuditSuppression } from '../audit-suppression';
import * as ExcelJS from 'exceljs';

@Component({
  selector: 'app-historique',
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.css']
})
export class HistoriqueComponent implements OnInit {
  // Données
  historique: AuditSuppression[] = [];
  totalCount = 0;
  Math = Math;

  // Filtres
  rechercheAvanceeOuverte = true;
  filtreLibelle = '';
  filtreRefPiece = '';
  filtreDevise = '';
  filtreCompteComptable = '';
  filtreJournal = '';
  filtreDateDebut = '';
  filtreDateFin = '';

  // Pagination
  page = 1;
  pageSize = 10;

  // Autocomplétion Compte comptable
  comptesComptables: string[] = [];
  suggestionsCompte: string[] = [];
  suggestionsOuvertes: boolean = false;

  // Autocomplétion Journal
  journaux: string[] = [];
  suggestionsJournal: string[] = [];
  suggestionsJournalOuvertes: boolean = false;

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

  async exporterExcel() {
    this.service.getHistorique(
      this.filtreLibelle, this.filtreJournal, this.filtreDateDebut, this.filtreDateFin,
      this.filtreCompteComptable, this.filtreRefPiece, this.filtreDevise,
      1, 999999
    ).subscribe(async data => {
      const classeur = new ExcelJS.Workbook();
      const feuille = classeur.addWorksheet('Historique');
      feuille.columns = [
        { header: 'N° Écriture', key: 'necriture', width: 14 },
        { header: 'Date écriture', key: 'date', width: 16 },
        { header: 'Journal', key: 'journal', width: 12 },
        { header: 'Compte', key: 'compte', width: 16 },
        { header: 'Débit', key: 'debit', width: 14 },
        { header: 'Crédit', key: 'credit', width: 14 },
        { header: 'Référence', key: 'reference', width: 22 },
        { header: 'Devise', key: 'devise', width: 10 },
        { header: 'Libellé', key: 'libelle', width: 40 },
        { header: 'Date suppression', key: 'datesup', width: 18 },
        { header: 'Motif', key: 'motif', width: 30 }
      ];

      feuille.getRow(1).eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0078D4' }
        };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      // petite fonction pour reformatter une date en M/d/yyyy
      const formatDate = (valeur: any): string => {
        if (!valeur) return '';
        const d = new Date(valeur);
        if (isNaN(d.getTime())) return valeur; // si ce n'est pas une date valide, on la laisse telle quelle
        return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
      };

      data.items.forEach((h: AuditSuppression, index: number) => {
        const ligne = feuille.addRow({
          necriture: h.numeroEcriture,
          date: formatDate(h.dateEcriture),
          journal: h.journalEcriture,
          compte: h.compteEcriture,
          debit: h.sensEcriture === 'D' ? h.montantEcriture : '',
          credit: h.sensEcriture === 'C' ? h.montantEcriture : '',
          reference: h.referenceEcriture,
          devise: h.deviseEcriture,
          libelle: h.libelle,
          datesup: formatDate(h.dateSuppression),
          motif: h.motif
        });

        const couleur = index % 2 === 0 ? 'FFEFF7EF' : 'FFF7FBF7';
        ligne.eachCell(cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: couleur }
          };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
      });

      const buffer = await classeur.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const lien = document.createElement('a');
      lien.href = url;
      lien.download = 'historique_suppressions.xlsx';
      lien.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
