import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { GameComponent } from './components/game/game.component';
import { GameOverComponent } from './components/game-over/game-over.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { GameWinComponent } from './components/game-win/game-win.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { GameListComponent } from './components/game-list/game-list.component';
import { LobbyComponent } from './components/lobby/lobby.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    GameComponent,
    GameOverComponent,
    NotFoundComponent,
    GameWinComponent,
    MainMenuComponent,
    GameListComponent,
    LobbyComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
