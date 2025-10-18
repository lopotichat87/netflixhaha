'use client';

import { useEffect } from 'react';

export default function PopupBlocker() {
  useEffect(() => {
    // Bloquer les pop-ups et fermer automatiquement les fenêtres ouvertes
    const originalWindowOpen = window.open;
    const openedWindows: Window[] = [];

    // Override window.open pour intercepter et fermer les pop-ups
    window.open = function(...args: any[]): Window | null {
      const newWindow = originalWindowOpen.apply(window, args as any);
      
      if (newWindow) {
        // Ajouter la fenêtre à la liste
        openedWindows.push(newWindow);
        
        // Fermer immédiatement la fenêtre
        setTimeout(() => {
          try {
            if (newWindow && !newWindow.closed) {
              newWindow.close();
            }
          } catch (e) {
            console.log('Pop-up bloquée');
          }
        }, 100);
      }
      
      return null; // Retourner null pour empêcher l'accès à la fenêtre
    };

    // Bloquer les événements qui ouvrent des pop-ups
    const blockPopup = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Vérifier si c'est un lien externe ou une pub
      if (target.tagName === 'A') {
        const href = (target as HTMLAnchorElement).href;
        const currentDomain = window.location.hostname;
        
        try {
          const linkDomain = new URL(href).hostname;
          
          // Bloquer les liens externes qui ne sont pas des domaines de confiance
          if (linkDomain !== currentDomain && 
              !href.includes('themoviedb.org') && 
              !href.includes('supabase.co')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Lien externe bloqué:', href);
          }
        } catch (err) {
          // Ignorer les erreurs de parsing d'URL
        }
      }
    };

    // Ajouter les écouteurs d'événements
    document.addEventListener('click', blockPopup, true);
    document.addEventListener('auxclick', blockPopup, true); // Clic molette
    document.addEventListener('contextmenu', blockPopup, true);

    // Bloquer les redirections automatiques
    let lastUrl = window.location.href;
    const observer = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
      }
    });

    observer.observe(document, { subtree: true, childList: true });

    // Fermer toutes les fenêtres ouvertes toutes les secondes
    const closeInterval = setInterval(() => {
      openedWindows.forEach((win, index) => {
        try {
          if (win && !win.closed) {
            win.close();
            openedWindows.splice(index, 1);
          }
        } catch (e) {
          // Ignorer les erreurs
        }
      });
    }, 1000);

    // Note: Vérification des iframes désactivée pour éviter les conflits avec les lecteurs vidéo

    // Cleanup
    return () => {
      window.open = originalWindowOpen;
      document.removeEventListener('click', blockPopup, true);
      document.removeEventListener('auxclick', blockPopup, true);
      document.removeEventListener('contextmenu', blockPopup, true);
      observer.disconnect();
      clearInterval(closeInterval);
      
      // Fermer toutes les fenêtres ouvertes
      openedWindows.forEach((win) => {
        try {
          if (win && !win.closed) {
            win.close();
          }
        } catch (e) {
          // Ignorer les erreurs
        }
      });
    };
  }, []);

  return null;
}
