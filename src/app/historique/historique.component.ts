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

  constructor(private service: EcritureService) {}

  ngOnInit(): void {
    this.service.getHistorique().subscribe(data => {
      this.historique = data;
    });
  }
}
