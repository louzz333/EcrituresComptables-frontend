import { Component, OnInit } from '@angular/core';
import { EcritureService } from '../ecriture.service';
import { Ecriture } from '../ecriture';
import { Kpis } from '../kpis';
import * as ExcelJS from 'exceljs';

@Component({
  selector: 'app-ecritures',
  templateUrl: './ecritures.component.html',
  styleUrls: ['./ecritures.component.css']
})
export class EcrituresComponent implements OnInit {
  // Données
  ecritures: Ecriture[] = [];
  totalCount: number = 0;
  kpis: Kpis = { totalDebit: 0, totalCredit: 0, enAttente: 0, supprimeesCeMois: 0 };
  Math = Math;

  // Filtres
  filtreLibelle: string = '';
  filtreJournal: string = '';
  filtreDateDebut?: Date | string;
  filtreDateFin?: Date | string;
  filtreCompteComptable: string = '';
  filtreRefPiece: string = '';
  filtreDevise: string = '';
  rechercheAvanceeOuverte: boolean = true;

  // Pagination
  pageActuelle: number = 1;
  pageSize: number = 10;

  // Sélection & suppression
  selectedIds: number[] = [];
  motifSuppression?: string = '';
  confirmationOuverte: boolean = false;

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

  get pages(): number[] {
    const result = [];
    for (let i = 1; i <= this.totalPages; i++) {
      result.push(i);
    }
    return result;
  }

  ngOnInit(): void {
    this.service.getJournaux().subscribe(data => {
      this.journaux = data;
    });
    this.service.getComptesComptables().subscribe(data => {
      this.comptesComptables = data;
    });
    this.service.getAll(this.filtreLibelle, this.filtreJournal, this.filtreDateDebut, this.filtreDateFin, this.filtreCompteComptable, this.filtreRefPiece, this.filtreDevise, this.pageActuelle, this.pageSize).subscribe(data => {
      this.ecritures = data.items;
      this.totalCount = data.totalCount;
    });
    this.service.getKpis().subscribe(data => {
      this.kpis = data;
    });
  }

  rechercher() {
    this.pageActuelle = 1;
    this.service.getAll(this.filtreLibelle, this.filtreJournal, this.filtreDateDebut, this.filtreDateFin, this.filtreCompteComptable, this.filtreRefPiece, this.filtreDevise, this.pageActuelle, this.pageSize).subscribe(data => {
      this.ecritures = data.items;
      this.totalCount = data.totalCount;
    });
  }

  reinitialiser() {
    this.filtreLibelle = '';
    this.filtreJournal = '';
    this.filtreDateDebut = undefined;
    this.filtreDateFin = undefined;
    this.filtreCompteComptable = '';
    this.filtreRefPiece = '';
    this.filtreDevise = '';
    this.rechercher();
  }

  allerAPage(page: number) {
    this.pageActuelle = page;
    this.service.getAll(this.filtreLibelle, this.filtreJournal, this.filtreDateDebut, this.filtreDateFin, this.filtreCompteComptable, this.filtreRefPiece, this.filtreDevise, this.pageActuelle, this.pageSize).subscribe(data => {
      this.ecritures = data.items;
      this.totalCount = data.totalCount;
    });
  }

  pagePrecedente() {
    if (this.pageActuelle > 1) {
      this.allerAPage(this.pageActuelle - 1);
    }
  }

  pageSuivante() {
    if (this.pageActuelle < this.totalPages) {
      this.allerAPage(this.pageActuelle + 1);
    }
  }

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.service.getAllIds(
        this.filtreLibelle,
        this.filtreJournal,
        this.filtreDateDebut,
        this.filtreDateFin,
        this.filtreCompteComptable,
        this.filtreRefPiece,
        this.filtreDevise
      ).subscribe(ids => {
        this.selectedIds = ids;
      });
    } else {
      this.selectedIds = [];
    }
  }

  isAllSelected(): boolean {
    return this.totalCount > 0 && this.selectedIds.length === this.totalCount;
  }

  toggleSelection(id: number) {
    const index = this.selectedIds.indexOf(id);
    if (index === -1) {
      this.selectedIds.push(id);
    } else {
      this.selectedIds.splice(index, 1);
    }
  }

  isSelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  ouvrirConfirmationSuppression() {
    this.confirmationOuverte = true;
  }

  confirmerSuppression() {
    if (!this.motifSuppression || this.motifSuppression.trim() === '') {
      alert('Le motif est obligatoire.');
      return;
    }

    this.service.supprimerEcritures(this.selectedIds, this.motifSuppression).subscribe(() => {
      this.confirmationOuverte = false;
      this.motifSuppression = '';
      this.selectedIds = [];
      this.rechercher();
    });
  }

  annulerSuppression() {
    this.confirmationOuverte = false;
    this.motifSuppression = '';
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
    this.service.getAll(
      this.filtreLibelle, this.filtreJournal, this.filtreDateDebut, this.filtreDateFin,
      this.filtreCompteComptable, this.filtreRefPiece, this.filtreDevise,
      1, 999999
    ).subscribe(async data => {
      const classeur = new ExcelJS.Workbook();
      const feuille = classeur.addWorksheet('Écritures');

      // Définition des colonnes : titre + largeur
      feuille.columns = [
        { header: 'N° Pièce', key: 'npiece', width: 14 },
        { header: 'Date', key: 'date', width: 14 },
        { header: 'Journal', key: 'journal', width: 12 },
        { header: 'Compte', key: 'compte', width: 16 },
        { header: 'Débit', key: 'debit', width: 14 },
        { header: 'Crédit', key: 'credit', width: 14 },
        { header: 'Référence', key: 'reference', width: 22 },
        { header: 'Devise', key: 'devise', width: 10 },
        { header: 'Libellé', key: 'libelle', width: 40 },
        { header: 'Statut', key: 'statut', width: 16 }
      ];

      // Style de l'en-tête : bleu Involys, texte blanc, gras
      feuille.getRow(1).eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0078D4' }   // bleu Involys
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

      // Remplissage des lignes de données
      data.items.forEach((e, index) => {
        const ligne = feuille.addRow({
          npiece: e.n_Ecriture,
          date: formatDate(e.date),
          journal: e.journal,
          compte: e.compte_comptable,
          debit: e.sens === 'D' ? e.montant : '',
          credit: e.sens === 'C' ? e.montant : '',
          reference: e.reference_Piece,
          devise: e.devise,
          libelle: e.libelle_Ecriture,
          statut: e.etatComptabilisation === 0 ? 'En attente' : 'Envoyé à Sage'
        });

        // Alternance de vert clair / plus clair
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

      // Génération et téléchargement du fichier
      const buffer = await classeur.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const lien = document.createElement('a');
      lien.href = url;
      lien.download = 'ecritures_comptables.xlsx';
      lien.click();
      window.URL.revokeObjectURL(url);
    });
  }
}



