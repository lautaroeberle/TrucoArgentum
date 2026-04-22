import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RankingService, Jugador } from "../../ranking.service";

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css']
})
export class RankingComponent implements OnInit {
  jugadores: Jugador[] = [];

  constructor(private rankingService: RankingService) {}

  ngOnInit(): void {
    this.rankingService.cargarDatos();
    this.rankingService.jugadores$.subscribe(data => {
      this.jugadores = data;
    });
  }

  getMedalla(pos: number): string {
    if (pos === 1) return '🥇';
    if (pos === 2) return '🥈';
    if (pos === 3) return '🥉';
    return `${pos}°`;
  }

  getRowClass(pos: number): string {
    if (pos === 1) return 'row-gold';
    if (pos === 2) return 'row-silver';
    if (pos === 3) return 'row-bronze';
    return 'row-normal';
  }
}