import { Component, OnInit } from '@angular/core';
import { EcritureService } from '../ecriture.service';
import { Ecriture } from '../ecriture';
import { Kpis } from '../kpis';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-ecritures',
  templateUrl: './ecritures.component.html',
  styleUrls: ['./ecritures.component.css']
})
export class EcrituresComponent implements OnInit {
  ecritures: Ecriture[] = [];
  totalCount: number = 0;
  filtreLibelle: string = '';
  filtreJournal: string = '';
  filtreDateDebut?: Date|string;
  filtreDateFin?: Date|string;
  filtreCompteComptable: string = '';
  filtreRefPiece: string = '';
  filtreDevise: string = '';

  pageActuelle: number = 1;
  pageSize: number = 10;
  Math = Math;

  rechercheAvanceeOuverte: boolean = true;

  motifSuppression?: string = '';
  confirmationOuverte: boolean = false;
  selectedIds: number[] = [];

  kpis: Kpis = { totalDebit: 0, totalCredit: 0, enAttente: 0, supprimeesCeMois: 0 };

  comptesComptables: string[] = [];

  suggestionsCompte: string[] = [];
suggestionsOuvertes: boolean = false;

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

  get pages(): number[] {
    const result = [];
    for (let i = 1; i <= this.totalPages; i++) {
      result.push(i);
    }
    return result;
  }

  ngOnInit(): void {
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

 exporterExcel() {
  this.service.getAll(
    this.filtreLibelle, this.filtreJournal, this.filtreDateDebut, this.filtreDateFin,
    this.filtreCompteComptable, this.filtreRefPiece, this.filtreDevise,
    1, 999999
  ).subscribe(data => {
    const lignes = data.items.map(e => ({
      'N° Pièce': e.n_Ecriture,
      'Date': e.date,
      'Journal': e.journal,
      'Compte': e.compte_comptable,
      'Débit': e.sens === 'D' ? e.montant : '',
      'Crédit': e.sens === 'C' ? e.montant : '',
      'Référence': e.reference_Piece,
      'Devise': e.devise,
      'Libellé': e.libelle_Ecriture,
      'Statut': e.etatComptabilisation === 0 ? 'En attente' : 'Envoyé à Sage'
    }));

    const feuille = XLSX.utils.json_to_sheet(lignes);
    const classeur = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(classeur, feuille, 'Écritures');
    XLSX.writeFile(classeur, 'ecritures_comptables.xlsx');
  });
}

}



