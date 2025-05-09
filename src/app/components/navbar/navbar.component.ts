import { Component, OnInit, ElementRef } from '@angular/core';
import { ALL_ROUTES as ROUTES } from '../sidebar/sidebar.component';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import { Router , NavigationEnd} from '@angular/router';
import { SearchService } from 'app/services/search.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private listTitles: any[];
  location: Location;
  mobile_menu_visible: any = 0;
  private toggleButton: any;
  private sidebarVisible: boolean;
  isFormPage: boolean = false;
  isFormOpen = false;

  isNavbarCollapsed = true;
  

  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  openForm() {
    this.isFormOpen = true;
    document.body.classList.add('form-page');
  }

  closeForm() {
    this.isFormOpen = false;
    document.body.classList.remove('form-page');
  }


  constructor(
      location: Location,
      private element: ElementRef,
      private router: Router,
      private searchService: SearchService
  ) {
      this.location = location;
      this.sidebarVisible = false;
      
      this.router.events.subscribe((event) => {
          if (event instanceof NavigationEnd) {
              this.checkIfFormPage(event.url);
          }
      });
  }

  onSearchChange(event: any) {
    this.searchService.updateSearch(event.target.value);
}

    checkIfFormPage(url: string) {
      const formRoutes = ['/new-request', '/edit-request', '/request-leave'];
      this.isFormPage = formRoutes.some(route => url.includes(route));
      this.updateBodyClass();
  }

  updateBodyClass() {
    const body = document.getElementsByTagName('body')[0];
    if (this.isFormPage) {
        body.classList.add('form-page');
    } else {
        body.classList.remove('form-page');
    }
}

    ngOnInit() {
      this.listTitles = ROUTES.filter(listTitle => listTitle);
      const navbar: HTMLElement = this.element.nativeElement;
      this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];
      this.checkIfFormPage(this.location.path());
      
      this.router.events.subscribe((event) => {
          this.sidebarClose();
          const layer = document.getElementsByClassName('close-layer')[0];
          if (layer) {
              layer.remove();
              this.mobile_menu_visible = 0;
          }
      });
  }

    sidebarOpen() {
        const toggleButton = this.toggleButton;
        const body = document.getElementsByTagName('body')[0];
        setTimeout(function(){
            toggleButton.classList.add('toggled');
        }, 500);

        body.classList.add('nav-open');
        this.sidebarVisible = true;
    };

    sidebarClose() {
        const body = document.getElementsByTagName('body')[0];
        this.toggleButton.classList.remove('toggled');
        this.sidebarVisible = false;
        body.classList.remove('nav-open');
    };

    sidebarToggle() {
        var $toggle = document.getElementsByClassName('navbar-toggler')[0];

        if (this.sidebarVisible === false) {
            this.sidebarOpen();
        } else {
            this.sidebarClose();
        }
        const body = document.getElementsByTagName('body')[0];

        if (this.mobile_menu_visible == 1) {
            body.classList.remove('nav-open');
            if ($layer) {
                $layer.remove();
            }
            setTimeout(function() {
                $toggle.classList.remove('toggled');
            }, 400);

            this.mobile_menu_visible = 0;
        } else {
            setTimeout(function() {
                $toggle.classList.add('toggled');
            }, 430);

            var $layer = document.createElement('div');
            $layer.setAttribute('class', 'close-layer');

            if (body.querySelectorAll('.main-panel')) {
                document.getElementsByClassName('main-panel')[0].appendChild($layer);
            } else if (body.classList.contains('off-canvas-sidebar')) {
                document.getElementsByClassName('wrapper-full-page')[0].appendChild($layer);
            }

            setTimeout(function() {
                $layer.classList.add('visible');
            }, 100);

            $layer.onclick = function() {
                body.classList.remove('nav-open');
                this.mobile_menu_visible = 0;
                $layer.classList.remove('visible');
                setTimeout(function() {
                    $layer.remove();
                    $toggle.classList.remove('toggled');
                }, 400);
            }.bind(this);

            body.classList.add('nav-open');
            this.mobile_menu_visible = 1;
        }
    };

    getTitle() {
        let path = this.location.prepareExternalUrl(this.location.path());
        if (path.charAt(0) === '#') {
            path = path.slice(1);
        }
        
        const found = this.listTitles.find(route =>
            path.startsWith(`/${route.path}`)
        );
        
        return found ? found.title : '';
    }
}