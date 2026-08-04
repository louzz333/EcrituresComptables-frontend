import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  menuOuvert: boolean = false;

  toggleMenu() {
    this.menuOuvert = !this.menuOuvert;
  }

  fermerMenu() {
    this.menuOuvert = false;
  }
}
