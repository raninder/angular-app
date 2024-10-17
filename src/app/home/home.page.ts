import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, InfiniteScrollCustomEvent, IonAlert, IonSkeletonText, IonAvatar, IonLabel, IonBadge, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
import { MovieService } from '../services/movie.service';
import { catchError, finalize } from 'rxjs';
import { MovieResult } from '../services/interfaces';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';




@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonAlert, IonItem, IonSkeletonText, IonAvatar, IonLabel, DatePipe, RouterModule, IonBadge, IonInfiniteScroll, IonInfiniteScrollContent],
})
export class HomePage {
  private movieService = inject(MovieService);

  private currentPage = 1;
  public movies: any[] = [];
  public imageBaseUrl = 'https://image.tmdb.org/t/p';
  public isLoading = true;
  public error = null;
  public dummyArray = new Array(5);

  constructor() {
    this.loadMovies();
  }

  // loadMovies(){
  //   // this.movieService.getTopRatedMovies().subscribe((movies) =>
  //   // console.log(movies)
  //   this.movieService.getMovieDetails('424').subscribe((movies) =>
  //     console.log(movies)
  // )
  // }

  loadMovies(event?: InfiniteScrollCustomEvent) {
    this.error = null;

    // Only show loading indicator on initial load
    if (!event) {
      this.isLoading = true;
    }
    // Get the next page of movies from the MovieService
    this.movieService
      .getTopRatedMovies(this.currentPage)

      .pipe(
        // Ensures that the loading indicator is turned off when the request is complete, whether it succeeded or failed.
        finalize(() => {
          this.isLoading = false;
        }),

        // Catches any errors during the HTTP request. It sets the error message and returns an empty array to allow the observable to complete.
        catchError((err: any) => {
          this.error = err.error.status_message;
          return [];
        })
      )

      // This function is executed when the request is successful
      .subscribe({
        next: (res) => {
          // Append the results to our movies array
          this.movies.push(...res.results);

          // Resolve the infinite scroll promise to tell Ionic that we are done
          event?.target.complete();

          // Disable the infinite scroll when we reach the end of the list
          if (event) {
            event.target.disabled = res.total_pages === this.currentPage;
          }
        },
      });
      
  }

  loadMore(event: InfiniteScrollCustomEvent){
    this.currentPage++;
    this.loadMovies(event);
  }
}
