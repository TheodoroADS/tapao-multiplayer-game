import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameOverComponent } from './components/game-over/game-over.component';
import { GameWinComponent } from './components/game-win/game-win.component';
import { GameComponent } from './components/game/game.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { LobbyComponent } from './components/lobby/lobby.component';

const routes: Routes = [
  
  {path: "main-menu", component : MainMenuComponent},
  {path:"game/:gameMode" , component : GameComponent},
  {path : "lobby", component : LobbyComponent},
  {path:"game" , component : GameComponent},
  {path:"gameOver", component: GameOverComponent},
  {path:"gameWin", component: GameWinComponent},
  {path:"notFound", component: NotFoundComponent},
  {path:"", redirectTo : "main-menu", pathMatch : "full"},
  {path : "**", redirectTo : "notFound", pathMatch : "full"}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
