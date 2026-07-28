import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ecriture } from './ecriture';
import { EcriturePagineeResult } from './ecriture-paginee-result';
import { Kpis } from './kpis';
import { AuditSuppression } from './audit-suppression'; 
@Injectable({
  providedIn: 'root'
})
export class EcritureService {

  private formatDate(date: Date|string): string {
    if (typeof date === 'string') {
      return date;
    }
    return date.toISOString().split('T')[0];
  }

  constructor(private http: HttpClient) { }

  getAll(libelle?: string, journal?: string, datedebut?: Date|string, datefin?: Date|string, comptecomptable?: string, refpiece?: string, devise?: string, page: number = 1, pageSize: number = 10) {
    let url = 'https://localhost:7181/api/Ecritures';
    let parametres: string[] = [];

    if (libelle) parametres.push('libelle=' + libelle);
    if (journal) parametres.push('journal=' + journal);
    if (datedebut) parametres.push('datedebut=' + this.formatDate(datedebut));
    if (datefin) parametres.push('datefin=' + this.formatDate(datefin));
    if (comptecomptable) parametres.push('comptecomptable=' + comptecomptable);
    if (refpiece) parametres.push('refpiece=' + refpiece);
    if (devise) parametres.push('devise=' + devise);
    parametres.push('page=' + page);
    parametres.push('pageSize=' + pageSize);

    if (parametres.length > 0) {
      url += '?' + parametres.join('&');
    }

    return this.http.get<EcriturePagineeResult>(url);   // ← changé ici
  }

  getKpis() {
  return this.http.get<Kpis>('https://localhost:7181/api/Ecritures/kpis');
}
  supprimerEcritures(ids: number[], motif?: string) {
  return this.http.delete('https://localhost:7181/api/Ecritures', {
    body: { ids: ids, motif: motif }
  });
}

  getHistorique() {
  return this.http.get<AuditSuppression[]>('https://localhost:7181/api/Ecritures/historique');
}
}
