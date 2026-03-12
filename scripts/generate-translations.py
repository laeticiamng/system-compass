#!/usr/bin/env python3
"""
Generate missing translations for all supported languages.
Uses French as the reference language and translates to all targets.
"""
import json
import re
import sys
import os

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

LANGS = ['en', 'de', 'es', 'it', 'nl', 'pt', 'zh', 'ar', 'hi', 'bn', 'ru', 'ur']

# ─── Translation dictionaries (FR → target) ───
# These cover common words/phrases found across the app

DICT = {
    'en': {
        # Common UI
        'Sélectionner': 'Select', 'Création...': 'Creating...', 'Ajouter': 'Add',
        'Supprimer': 'Delete', 'Modifier': 'Edit', 'Enregistrer': 'Save',
        'Annuler': 'Cancel', 'Fermer': 'Close', 'Ouvrir': 'Open',
        'Retour': 'Back', 'Suivant': 'Next', 'Précédent': 'Previous',
        'Rechercher': 'Search', 'Filtrer': 'Filter', 'Trier': 'Sort',
        'Charger': 'Load', 'Chargement...': 'Loading...', 'Chargement': 'Loading',
        'Envoyer': 'Send', 'Enregistrement...': 'Saving...', 'Copier': 'Copy',
        'Coller': 'Paste', 'Confirmer': 'Confirm', 'Valider': 'Validate',
        'Télécharger': 'Download', 'Importer': 'Import', 'Exporter': 'Export',
        'Actualiser': 'Refresh', 'Réinitialiser': 'Reset', 'Tout': 'All',
        'Aucun': 'None', 'Oui': 'Yes', 'Non': 'No', 'Ou': 'Or', 'Et': 'And',
        'Plus': 'More', 'Moins': 'Less', 'Voir': 'View', 'Détails': 'Details',
        'Actions': 'Actions', 'Statut': 'Status', 'Type': 'Type', 'Nom': 'Name',
        'Description': 'Description', 'Date': 'Date', 'Note': 'Note', 'Notes': 'Notes',
        'Titre': 'Title', 'Catégorie': 'Category', 'Priorité': 'Priority',
        'Total': 'Total', 'Résultat': 'Result', 'Résultats': 'Results',
        'Paramètres': 'Settings', 'Configuration': 'Configuration',
        'Tableau de bord': 'Dashboard', 'Accueil': 'Home', 'Profil': 'Profile',
        'Compte': 'Account', 'Connexion': 'Login', 'Déconnexion': 'Logout',
        'Inscription': 'Sign up', 'Mot de passe': 'Password',
        'Email': 'Email', 'Utilisateur': 'User', 'Admin': 'Admin',
        'Aide': 'Help', 'Contact': 'Contact', 'À propos': 'About',
        'Gratuit': 'Free', 'Premium': 'Premium', 'Pro': 'Pro',
        'Abonnement': 'Subscription', 'Facturation': 'Billing',
        'Succès': 'Success', 'Erreur': 'Error', 'Attention': 'Warning',
        'Information': 'Information', 'Terminé': 'Completed', 'En cours': 'In progress',
        'En attente': 'Pending', 'Actif': 'Active', 'Inactif': 'Inactive',
        'Activé': 'Enabled', 'Désactivé': 'Disabled', 'Archivé': 'Archived',
        'Brouillon': 'Draft', 'Publié': 'Published', 'Planifié': 'Scheduled',
        'Élevé': 'High', 'Moyen': 'Medium', 'Faible': 'Low', 'Critique': 'Critical',
        'Obligatoire': 'Required', 'Optionnel': 'Optional',
        'Commencer': 'Start', 'Continuer': 'Continue', 'Terminer': 'Finish',
        'Recommencer': 'Restart', 'Abandonner': 'Quit', 'Passer': 'Skip',
        'Partager': 'Share', 'Inviter': 'Invite', 'Collaborer': 'Collaborate',
        'Dupliquer': 'Duplicate', 'Déplacer': 'Move', 'Renommer': 'Rename',
        'Analyser': 'Analyze', 'Comparer': 'Compare', 'Évaluer': 'Evaluate',
        'Générer': 'Generate', 'Calculer': 'Calculate', 'Simuler': 'Simulate',
        'Planifier': 'Plan', 'Organiser': 'Organize', 'Optimiser': 'Optimize',
        # Days
        'Dim': 'Sun', 'Lun': 'Mon', 'Mar': 'Tue', 'Mer': 'Wed',
        'Jeu': 'Thu', 'Ven': 'Fri', 'Sam': 'Sat',
        # Months
        'Janvier': 'January', 'Février': 'February', 'Mars': 'March',
        'Avril': 'April', 'Mai': 'May', 'Juin': 'June',
        'Juillet': 'July', 'Août': 'August', 'Septembre': 'September',
        'Octobre': 'October', 'Novembre': 'November', 'Décembre': 'December',
        # Calendar
        "Aujourd'hui": 'Today', 'À venir': 'Upcoming', 'En retard': 'Overdue',
        'Complétées': 'Completed', 'Complété': 'Completed',
        # Common phrases
        'Voir plus': 'See more', 'Voir tout': 'See all', 'En savoir plus': 'Learn more',
        'Pas encore de': 'No', 'Aucun résultat': 'No results',
        'Essayer gratuitement': 'Try for free', 'Commencer gratuitement': 'Start for free',
        'mois': 'month', 'an': 'year', 'ans': 'years', 'jour': 'day', 'jours': 'days',
        'heure': 'hour', 'heures': 'hours', 'minute': 'minute', 'minutes': 'minutes',
        'semaine': 'week', 'semaines': 'weeks',
        'pays': 'country', 'Pays': 'Country', 'Monde': 'World',
        'Risque': 'Risk', 'Risques': 'Risks', 'Opportunité': 'Opportunity',
        'Avantage': 'Advantage', 'Avantages': 'Advantages',
        'Inconvénient': 'Disadvantage', 'Inconvénients': 'Disadvantages',
        'Points forts': 'Strengths', 'Points faibles': 'Weaknesses',
        'Recommandation': 'Recommendation', 'Recommandations': 'Recommendations',
        'Score': 'Score', 'Classement': 'Ranking', 'Rang': 'Rank',
        'Indice': 'Index', 'Moyenne': 'Average', 'Médiane': 'Median',
        'Tendance': 'Trend', 'Évolution': 'Evolution', 'Progression': 'Progress',
        'Preuves': 'Evidence', 'Preuve': 'Evidence',
        'Hypothèse': 'Hypothesis', 'Hypothèses': 'Hypotheses',
        'Modèles': 'Templates', 'Modèle': 'Template',
    },
    'de': {
        'Sélectionner': 'Auswählen', 'Création...': 'Erstellen...', 'Ajouter': 'Hinzufügen',
        'Supprimer': 'Löschen', 'Modifier': 'Bearbeiten', 'Enregistrer': 'Speichern',
        'Annuler': 'Abbrechen', 'Fermer': 'Schließen', 'Ouvrir': 'Öffnen',
        'Retour': 'Zurück', 'Suivant': 'Weiter', 'Précédent': 'Zurück',
        'Rechercher': 'Suchen', 'Filtrer': 'Filtern', 'Trier': 'Sortieren',
        'Charger': 'Laden', 'Chargement...': 'Laden...', 'Chargement': 'Laden',
        'Envoyer': 'Senden', 'Copier': 'Kopieren', 'Confirmer': 'Bestätigen',
        'Valider': 'Validieren', 'Télécharger': 'Herunterladen', 'Importer': 'Importieren',
        'Exporter': 'Exportieren', 'Actualiser': 'Aktualisieren', 'Réinitialiser': 'Zurücksetzen',
        'Tout': 'Alle', 'Aucun': 'Keine', 'Oui': 'Ja', 'Non': 'Nein',
        'Plus': 'Mehr', 'Moins': 'Weniger', 'Voir': 'Ansehen', 'Détails': 'Details',
        'Actions': 'Aktionen', 'Statut': 'Status', 'Type': 'Typ', 'Nom': 'Name',
        'Description': 'Beschreibung', 'Date': 'Datum', 'Note': 'Notiz', 'Notes': 'Notizen',
        'Titre': 'Titel', 'Catégorie': 'Kategorie', 'Priorité': 'Priorität',
        'Total': 'Gesamt', 'Résultat': 'Ergebnis', 'Résultats': 'Ergebnisse',
        'Paramètres': 'Einstellungen', 'Configuration': 'Konfiguration',
        'Tableau de bord': 'Dashboard', 'Accueil': 'Startseite', 'Profil': 'Profil',
        'Compte': 'Konto', 'Connexion': 'Anmeldung', 'Déconnexion': 'Abmelden',
        'Inscription': 'Registrierung', 'Mot de passe': 'Passwort',
        'Utilisateur': 'Benutzer', 'Admin': 'Admin', 'Aide': 'Hilfe',
        'Contact': 'Kontakt', 'À propos': 'Über uns', 'Gratuit': 'Kostenlos',
        'Abonnement': 'Abonnement', 'Facturation': 'Abrechnung',
        'Succès': 'Erfolg', 'Erreur': 'Fehler', 'Attention': 'Warnung',
        'Terminé': 'Abgeschlossen', 'En cours': 'In Bearbeitung', 'En attente': 'Ausstehend',
        'Actif': 'Aktiv', 'Inactif': 'Inaktiv', 'Activé': 'Aktiviert', 'Désactivé': 'Deaktiviert',
        'Élevé': 'Hoch', 'Moyen': 'Mittel', 'Faible': 'Niedrig', 'Critique': 'Kritisch',
        'Obligatoire': 'Erforderlich', 'Optionnel': 'Optional',
        'Commencer': 'Starten', 'Continuer': 'Fortfahren', 'Terminer': 'Beenden',
        'Partager': 'Teilen', 'Analyser': 'Analysieren', 'Comparer': 'Vergleichen',
        'Générer': 'Generieren', 'Calculer': 'Berechnen', 'Simuler': 'Simulieren',
        'Dim': 'So', 'Lun': 'Mo', 'Mar': 'Di', 'Mer': 'Mi', 'Jeu': 'Do', 'Ven': 'Fr', 'Sam': 'Sa',
        'Janvier': 'Januar', 'Février': 'Februar', 'Mars': 'März', 'Avril': 'April',
        'Mai': 'Mai', 'Juin': 'Juni', 'Juillet': 'Juli', 'Août': 'August',
        'Septembre': 'September', 'Octobre': 'Oktober', 'Novembre': 'November', 'Décembre': 'Dezember',
        "Aujourd'hui": 'Heute', 'À venir': 'Anstehend', 'En retard': 'Überfällig',
        'Risque': 'Risiko', 'Risques': 'Risiken', 'Avantage': 'Vorteil', 'Avantages': 'Vorteile',
        'Score': 'Punktzahl', 'Classement': 'Rangliste', 'Moyenne': 'Durchschnitt',
        'Tendance': 'Trend', 'Évolution': 'Entwicklung', 'Progression': 'Fortschritt',
        'Preuves': 'Beweise', 'Preuve': 'Beweis', 'Hypothèse': 'Hypothese',
        'Modèles': 'Vorlagen', 'Modèle': 'Vorlage',
        'pays': 'Land', 'Pays': 'Land', 'Monde': 'Welt',
        'Recommandation': 'Empfehlung', 'Recommandations': 'Empfehlungen',
    },
    'es': {
        'Sélectionner': 'Seleccionar', 'Création...': 'Creando...', 'Ajouter': 'Añadir',
        'Supprimer': 'Eliminar', 'Modifier': 'Editar', 'Enregistrer': 'Guardar',
        'Annuler': 'Cancelar', 'Fermer': 'Cerrar', 'Ouvrir': 'Abrir',
        'Retour': 'Volver', 'Suivant': 'Siguiente', 'Précédent': 'Anterior',
        'Rechercher': 'Buscar', 'Filtrer': 'Filtrar', 'Trier': 'Ordenar',
        'Charger': 'Cargar', 'Chargement...': 'Cargando...', 'Chargement': 'Cargando',
        'Envoyer': 'Enviar', 'Copier': 'Copiar', 'Confirmer': 'Confirmar',
        'Valider': 'Validar', 'Télécharger': 'Descargar', 'Importer': 'Importar',
        'Exporter': 'Exportar', 'Actualiser': 'Actualizar', 'Réinitialiser': 'Restablecer',
        'Tout': 'Todo', 'Aucun': 'Ninguno', 'Oui': 'Sí', 'Non': 'No',
        'Plus': 'Más', 'Moins': 'Menos', 'Voir': 'Ver', 'Détails': 'Detalles',
        'Actions': 'Acciones', 'Statut': 'Estado', 'Type': 'Tipo', 'Nom': 'Nombre',
        'Description': 'Descripción', 'Date': 'Fecha', 'Note': 'Nota', 'Notes': 'Notas',
        'Titre': 'Título', 'Catégorie': 'Categoría', 'Priorité': 'Prioridad',
        'Total': 'Total', 'Résultat': 'Resultado', 'Résultats': 'Resultados',
        'Paramètres': 'Configuración', 'Tableau de bord': 'Panel de control',
        'Accueil': 'Inicio', 'Profil': 'Perfil', 'Compte': 'Cuenta',
        'Connexion': 'Iniciar sesión', 'Déconnexion': 'Cerrar sesión',
        'Inscription': 'Registro', 'Mot de passe': 'Contraseña',
        'Utilisateur': 'Usuario', 'Aide': 'Ayuda', 'Contact': 'Contacto',
        'Gratuit': 'Gratis', 'Abonnement': 'Suscripción', 'Facturation': 'Facturación',
        'Succès': 'Éxito', 'Erreur': 'Error', 'Attention': 'Advertencia',
        'Terminé': 'Completado', 'En cours': 'En progreso', 'En attente': 'Pendiente',
        'Actif': 'Activo', 'Inactif': 'Inactivo', 'Élevé': 'Alto', 'Moyen': 'Medio',
        'Faible': 'Bajo', 'Critique': 'Crítico', 'Obligatoire': 'Obligatorio',
        'Commencer': 'Comenzar', 'Continuer': 'Continuar', 'Terminer': 'Finalizar',
        'Partager': 'Compartir', 'Analyser': 'Analizar', 'Comparer': 'Comparar',
        'Générer': 'Generar', 'Calculer': 'Calcular', 'Simuler': 'Simular',
        'Dim': 'Dom', 'Lun': 'Lun', 'Mar': 'Mar', 'Mer': 'Mié', 'Jeu': 'Jue', 'Ven': 'Vie', 'Sam': 'Sáb',
        'Janvier': 'Enero', 'Février': 'Febrero', 'Mars': 'Marzo', 'Avril': 'Abril',
        'Mai': 'Mayo', 'Juin': 'Junio', 'Juillet': 'Julio', 'Août': 'Agosto',
        'Septembre': 'Septiembre', 'Octobre': 'Octubre', 'Novembre': 'Noviembre', 'Décembre': 'Diciembre',
        "Aujourd'hui": 'Hoy', 'À venir': 'Próximamente', 'En retard': 'Atrasado',
        'Risque': 'Riesgo', 'Risques': 'Riesgos', 'Avantage': 'Ventaja', 'Avantages': 'Ventajas',
        'Score': 'Puntuación', 'Classement': 'Clasificación', 'Moyenne': 'Promedio',
        'Tendance': 'Tendencia', 'Évolution': 'Evolución', 'Progression': 'Progreso',
        'pays': 'país', 'Pays': 'País', 'Monde': 'Mundo',
        'Recommandation': 'Recomendación', 'Recommandations': 'Recomendaciones',
        'Modèles': 'Plantillas', 'Modèle': 'Plantilla',
    },
    'it': {
        'Sélectionner': 'Selezionare', 'Création...': 'Creazione...', 'Ajouter': 'Aggiungere',
        'Supprimer': 'Eliminare', 'Modifier': 'Modificare', 'Enregistrer': 'Salvare',
        'Annuler': 'Annullare', 'Fermer': 'Chiudere', 'Ouvrir': 'Aprire',
        'Retour': 'Indietro', 'Suivant': 'Avanti', 'Précédent': 'Precedente',
        'Rechercher': 'Cercare', 'Filtrer': 'Filtrare', 'Trier': 'Ordinare',
        'Chargement...': 'Caricamento...', 'Chargement': 'Caricamento',
        'Envoyer': 'Inviare', 'Copier': 'Copiare', 'Confirmer': 'Confermare',
        'Valider': 'Validare', 'Télécharger': 'Scaricare', 'Importer': 'Importare',
        'Exporter': 'Esportare', 'Actualiser': 'Aggiornare', 'Réinitialiser': 'Reimpostare',
        'Tout': 'Tutto', 'Aucun': 'Nessuno', 'Oui': 'Sì', 'Non': 'No',
        'Plus': 'Più', 'Moins': 'Meno', 'Voir': 'Vedere', 'Détails': 'Dettagli',
        'Actions': 'Azioni', 'Statut': 'Stato', 'Type': 'Tipo', 'Nom': 'Nome',
        'Description': 'Descrizione', 'Date': 'Data', 'Note': 'Nota', 'Notes': 'Note',
        'Titre': 'Titolo', 'Catégorie': 'Categoria', 'Priorité': 'Priorità',
        'Total': 'Totale', 'Résultat': 'Risultato', 'Résultats': 'Risultati',
        'Paramètres': 'Impostazioni', 'Tableau de bord': 'Dashboard',
        'Accueil': 'Home', 'Profil': 'Profilo', 'Compte': 'Account',
        'Connexion': 'Accesso', 'Déconnexion': 'Disconnessione',
        'Inscription': 'Registrazione', 'Mot de passe': 'Password',
        'Utilisateur': 'Utente', 'Aide': 'Aiuto', 'Contact': 'Contatto',
        'Gratuit': 'Gratuito', 'Abonnement': 'Abbonamento', 'Facturation': 'Fatturazione',
        'Succès': 'Successo', 'Erreur': 'Errore', 'Attention': 'Attenzione',
        'Terminé': 'Completato', 'En cours': 'In corso', 'En attente': 'In attesa',
        'Actif': 'Attivo', 'Inactif': 'Inattivo', 'Élevé': 'Alto', 'Moyen': 'Medio',
        'Faible': 'Basso', 'Critique': 'Critico', 'Obligatoire': 'Obbligatorio',
        'Commencer': 'Iniziare', 'Continuer': 'Continuare', 'Terminer': 'Terminare',
        'Partager': 'Condividere', 'Analyser': 'Analizzare', 'Comparer': 'Confrontare',
        'Générer': 'Generare', 'Calculer': 'Calcolare', 'Simuler': 'Simulare',
        'Dim': 'Dom', 'Lun': 'Lun', 'Mar': 'Mar', 'Mer': 'Mer', 'Jeu': 'Gio', 'Ven': 'Ven', 'Sam': 'Sab',
        'Janvier': 'Gennaio', 'Février': 'Febbraio', 'Mars': 'Marzo', 'Avril': 'Aprile',
        'Mai': 'Maggio', 'Juin': 'Giugno', 'Juillet': 'Luglio', 'Août': 'Agosto',
        'Septembre': 'Settembre', 'Octobre': 'Ottobre', 'Novembre': 'Novembre', 'Décembre': 'Dicembre',
        "Aujourd'hui": 'Oggi', 'À venir': 'Prossimi', 'En retard': 'In ritardo',
        'Risque': 'Rischio', 'Risques': 'Rischi', 'Avantage': 'Vantaggio', 'Avantages': 'Vantaggi',
        'pays': 'paese', 'Pays': 'Paese', 'Monde': 'Mondo',
        'Recommandation': 'Raccomandazione', 'Recommandations': 'Raccomandazioni',
        'Modèles': 'Modelli', 'Modèle': 'Modello',
    },
    'nl': {
        'Sélectionner': 'Selecteren', 'Création...': 'Aanmaken...', 'Ajouter': 'Toevoegen',
        'Supprimer': 'Verwijderen', 'Modifier': 'Bewerken', 'Enregistrer': 'Opslaan',
        'Annuler': 'Annuleren', 'Fermer': 'Sluiten', 'Ouvrir': 'Openen',
        'Retour': 'Terug', 'Suivant': 'Volgende', 'Précédent': 'Vorige',
        'Rechercher': 'Zoeken', 'Filtrer': 'Filteren', 'Trier': 'Sorteren',
        'Chargement...': 'Laden...', 'Chargement': 'Laden',
        'Envoyer': 'Verzenden', 'Copier': 'Kopiëren', 'Confirmer': 'Bevestigen',
        'Valider': 'Valideren', 'Télécharger': 'Downloaden', 'Importer': 'Importeren',
        'Exporter': 'Exporteren', 'Actualiser': 'Vernieuwen', 'Réinitialiser': 'Herstellen',
        'Tout': 'Alles', 'Aucun': 'Geen', 'Oui': 'Ja', 'Non': 'Nee',
        'Plus': 'Meer', 'Moins': 'Minder', 'Voir': 'Bekijken', 'Détails': 'Details',
        'Actions': 'Acties', 'Statut': 'Status', 'Type': 'Type', 'Nom': 'Naam',
        'Description': 'Beschrijving', 'Date': 'Datum', 'Note': 'Notitie', 'Notes': 'Notities',
        'Titre': 'Titel', 'Catégorie': 'Categorie', 'Priorité': 'Prioriteit',
        'Total': 'Totaal', 'Résultat': 'Resultaat', 'Résultats': 'Resultaten',
        'Paramètres': 'Instellingen', 'Tableau de bord': 'Dashboard',
        'Accueil': 'Startpagina', 'Profil': 'Profiel', 'Compte': 'Account',
        'Connexion': 'Inloggen', 'Déconnexion': 'Uitloggen',
        'Inscription': 'Registratie', 'Mot de passe': 'Wachtwoord',
        'Utilisateur': 'Gebruiker', 'Aide': 'Hulp', 'Contact': 'Contact',
        'Gratuit': 'Gratis', 'Abonnement': 'Abonnement', 'Facturation': 'Facturering',
        'Succès': 'Succes', 'Erreur': 'Fout', 'Attention': 'Waarschuwing',
        'Terminé': 'Voltooid', 'En cours': 'In uitvoering', 'En attente': 'In afwachting',
        'Actif': 'Actief', 'Inactif': 'Inactief', 'Élevé': 'Hoog', 'Moyen': 'Gemiddeld',
        'Faible': 'Laag', 'Critique': 'Kritiek', 'Obligatoire': 'Verplicht',
        'Commencer': 'Starten', 'Continuer': 'Doorgaan', 'Terminer': 'Beëindigen',
        'Partager': 'Delen', 'Analyser': 'Analyseren', 'Comparer': 'Vergelijken',
        'Générer': 'Genereren', 'Calculer': 'Berekenen', 'Simuler': 'Simuleren',
        'Dim': 'Zo', 'Lun': 'Ma', 'Mar': 'Di', 'Mer': 'Wo', 'Jeu': 'Do', 'Ven': 'Vr', 'Sam': 'Za',
        'Janvier': 'Januari', 'Février': 'Februari', 'Mars': 'Maart', 'Avril': 'April',
        'Mai': 'Mei', 'Juin': 'Juni', 'Juillet': 'Juli', 'Août': 'Augustus',
        'Septembre': 'September', 'Octobre': 'Oktober', 'Novembre': 'November', 'Décembre': 'December',
        "Aujourd'hui": 'Vandaag', 'À venir': 'Aanstaand', 'En retard': 'Verlaat',
        'Risque': 'Risico', 'Risques': "Risico's", 'Avantage': 'Voordeel', 'Avantages': 'Voordelen',
        'pays': 'land', 'Pays': 'Land', 'Monde': 'Wereld',
        'Recommandation': 'Aanbeveling', 'Recommandations': 'Aanbevelingen',
        'Modèles': 'Sjablonen', 'Modèle': 'Sjabloon',
    },
    'pt': {
        'Sélectionner': 'Selecionar', 'Création...': 'Criando...', 'Ajouter': 'Adicionar',
        'Supprimer': 'Excluir', 'Modifier': 'Editar', 'Enregistrer': 'Salvar',
        'Annuler': 'Cancelar', 'Fermer': 'Fechar', 'Ouvrir': 'Abrir',
        'Retour': 'Voltar', 'Suivant': 'Próximo', 'Précédent': 'Anterior',
        'Rechercher': 'Pesquisar', 'Filtrer': 'Filtrar', 'Trier': 'Ordenar',
        'Chargement...': 'Carregando...', 'Chargement': 'Carregando',
        'Envoyer': 'Enviar', 'Copier': 'Copiar', 'Confirmer': 'Confirmar',
        'Valider': 'Validar', 'Télécharger': 'Baixar', 'Importer': 'Importar',
        'Exporter': 'Exportar', 'Actualiser': 'Atualizar', 'Réinitialiser': 'Redefinir',
        'Tout': 'Tudo', 'Aucun': 'Nenhum', 'Oui': 'Sim', 'Non': 'Não',
        'Plus': 'Mais', 'Moins': 'Menos', 'Voir': 'Ver', 'Détails': 'Detalhes',
        'Actions': 'Ações', 'Statut': 'Status', 'Type': 'Tipo', 'Nom': 'Nome',
        'Description': 'Descrição', 'Date': 'Data', 'Note': 'Nota', 'Notes': 'Notas',
        'Titre': 'Título', 'Catégorie': 'Categoria', 'Priorité': 'Prioridade',
        'Total': 'Total', 'Résultat': 'Resultado', 'Résultats': 'Resultados',
        'Paramètres': 'Configurações', 'Tableau de bord': 'Painel',
        'Accueil': 'Início', 'Profil': 'Perfil', 'Compte': 'Conta',
        'Connexion': 'Entrar', 'Déconnexion': 'Sair',
        'Inscription': 'Cadastro', 'Mot de passe': 'Senha',
        'Utilisateur': 'Usuário', 'Aide': 'Ajuda', 'Contact': 'Contato',
        'Gratuit': 'Gratuito', 'Abonnement': 'Assinatura', 'Facturation': 'Faturamento',
        'Succès': 'Sucesso', 'Erreur': 'Erro', 'Attention': 'Atenção',
        'Terminé': 'Concluído', 'En cours': 'Em andamento', 'En attente': 'Pendente',
        'Actif': 'Ativo', 'Inactif': 'Inativo', 'Élevé': 'Alto', 'Moyen': 'Médio',
        'Faible': 'Baixo', 'Critique': 'Crítico', 'Obligatoire': 'Obrigatório',
        'Commencer': 'Começar', 'Continuer': 'Continuar', 'Terminer': 'Finalizar',
        'Partager': 'Compartilhar', 'Analyser': 'Analisar', 'Comparer': 'Comparar',
        'Générer': 'Gerar', 'Calculer': 'Calcular', 'Simuler': 'Simular',
        'Dim': 'Dom', 'Lun': 'Seg', 'Mar': 'Ter', 'Mer': 'Qua', 'Jeu': 'Qui', 'Ven': 'Sex', 'Sam': 'Sáb',
        'Janvier': 'Janeiro', 'Février': 'Fevereiro', 'Mars': 'Março', 'Avril': 'Abril',
        'Mai': 'Maio', 'Juin': 'Junho', 'Juillet': 'Julho', 'Août': 'Agosto',
        'Septembre': 'Setembro', 'Octobre': 'Outubro', 'Novembre': 'Novembro', 'Décembre': 'Dezembro',
        "Aujourd'hui": 'Hoje', 'À venir': 'Próximos', 'En retard': 'Atrasado',
        'Risque': 'Risco', 'Risques': 'Riscos', 'Avantage': 'Vantagem', 'Avantages': 'Vantagens',
        'pays': 'país', 'Pays': 'País', 'Monde': 'Mundo',
        'Recommandation': 'Recomendação', 'Recommandations': 'Recomendações',
        'Modèles': 'Modelos', 'Modèle': 'Modelo',
    },
    'zh': {
        'Sélectionner': '选择', 'Création...': '创建中...', 'Ajouter': '添加',
        'Supprimer': '删除', 'Modifier': '编辑', 'Enregistrer': '保存',
        'Annuler': '取消', 'Fermer': '关闭', 'Ouvrir': '打开',
        'Retour': '返回', 'Suivant': '下一步', 'Précédent': '上一步',
        'Rechercher': '搜索', 'Filtrer': '筛选', 'Trier': '排序',
        'Chargement...': '加载中...', 'Chargement': '加载',
        'Envoyer': '发送', 'Copier': '复制', 'Confirmer': '确认',
        'Valider': '验证', 'Télécharger': '下载', 'Importer': '导入',
        'Exporter': '导出', 'Actualiser': '刷新', 'Réinitialiser': '重置',
        'Tout': '全部', 'Aucun': '无', 'Oui': '是', 'Non': '否',
        'Plus': '更多', 'Moins': '更少', 'Voir': '查看', 'Détails': '详情',
        'Actions': '操作', 'Statut': '状态', 'Type': '类型', 'Nom': '名称',
        'Description': '描述', 'Date': '日期', 'Note': '备注', 'Notes': '备注',
        'Titre': '标题', 'Catégorie': '分类', 'Priorité': '优先级',
        'Total': '总计', 'Résultat': '结果', 'Résultats': '结果',
        'Paramètres': '设置', 'Tableau de bord': '仪表盘',
        'Accueil': '首页', 'Profil': '个人资料', 'Compte': '账户',
        'Connexion': '登录', 'Déconnexion': '退出',
        'Inscription': '注册', 'Mot de passe': '密码',
        'Utilisateur': '用户', 'Aide': '帮助', 'Contact': '联系',
        'Gratuit': '免费', 'Abonnement': '订阅', 'Facturation': '账单',
        'Succès': '成功', 'Erreur': '错误', 'Attention': '警告',
        'Terminé': '已完成', 'En cours': '进行中', 'En attente': '待处理',
        'Actif': '活跃', 'Inactif': '不活跃', 'Élevé': '高', 'Moyen': '中',
        'Faible': '低', 'Critique': '关键', 'Obligatoire': '必填',
        'Commencer': '开始', 'Continuer': '继续', 'Terminer': '完成',
        'Partager': '分享', 'Analyser': '分析', 'Comparer': '比较',
        'Générer': '生成', 'Calculer': '计算', 'Simuler': '模拟',
        'Dim': '日', 'Lun': '一', 'Mar': '二', 'Mer': '三', 'Jeu': '四', 'Ven': '五', 'Sam': '六',
        'Janvier': '一月', 'Février': '二月', 'Mars': '三月', 'Avril': '四月',
        'Mai': '五月', 'Juin': '六月', 'Juillet': '七月', 'Août': '八月',
        'Septembre': '九月', 'Octobre': '十月', 'Novembre': '十一月', 'Décembre': '十二月',
        "Aujourd'hui": '今天', 'À venir': '即将到来', 'En retard': '已逾期',
        'Risque': '风险', 'Risques': '风险', 'Avantage': '优势', 'Avantages': '优势',
        'pays': '国家', 'Pays': '国家', 'Monde': '世界',
        'Recommandation': '建议', 'Recommandations': '建议',
        'Modèles': '模板', 'Modèle': '模板',
    },
    'ar': {
        'Sélectionner': 'اختيار', 'Création...': 'جارٍ الإنشاء...', 'Ajouter': 'إضافة',
        'Supprimer': 'حذف', 'Modifier': 'تعديل', 'Enregistrer': 'حفظ',
        'Annuler': 'إلغاء', 'Fermer': 'إغلاق', 'Ouvrir': 'فتح',
        'Retour': 'رجوع', 'Suivant': 'التالي', 'Précédent': 'السابق',
        'Rechercher': 'بحث', 'Filtrer': 'تصفية', 'Trier': 'ترتيب',
        'Chargement...': 'جارٍ التحميل...', 'Chargement': 'تحميل',
        'Envoyer': 'إرسال', 'Copier': 'نسخ', 'Confirmer': 'تأكيد',
        'Valider': 'تحقق', 'Télécharger': 'تنزيل', 'Importer': 'استيراد',
        'Exporter': 'تصدير', 'Actualiser': 'تحديث', 'Réinitialiser': 'إعادة تعيين',
        'Tout': 'الكل', 'Aucun': 'لا شيء', 'Oui': 'نعم', 'Non': 'لا',
        'Plus': 'المزيد', 'Moins': 'أقل', 'Voir': 'عرض', 'Détails': 'تفاصيل',
        'Actions': 'إجراءات', 'Statut': 'الحالة', 'Type': 'النوع', 'Nom': 'الاسم',
        'Description': 'الوصف', 'Date': 'التاريخ', 'Note': 'ملاحظة', 'Notes': 'ملاحظات',
        'Titre': 'العنوان', 'Catégorie': 'الفئة', 'Priorité': 'الأولوية',
        'Total': 'المجموع', 'Résultat': 'النتيجة', 'Résultats': 'النتائج',
        'Paramètres': 'الإعدادات', 'Tableau de bord': 'لوحة التحكم',
        'Accueil': 'الرئيسية', 'Profil': 'الملف الشخصي', 'Compte': 'الحساب',
        'Connexion': 'تسجيل الدخول', 'Déconnexion': 'تسجيل الخروج',
        'Inscription': 'التسجيل', 'Mot de passe': 'كلمة المرور',
        'Utilisateur': 'المستخدم', 'Aide': 'المساعدة', 'Contact': 'اتصل بنا',
        'Gratuit': 'مجاني', 'Abonnement': 'اشتراك', 'Succès': 'نجاح', 'Erreur': 'خطأ',
        'Terminé': 'مكتمل', 'En cours': 'قيد التنفيذ', 'En attente': 'قيد الانتظار',
        'Élevé': 'مرتفع', 'Moyen': 'متوسط', 'Faible': 'منخفض', 'Critique': 'حرج',
        'Commencer': 'ابدأ', 'Continuer': 'متابعة', 'Terminer': 'إنهاء',
        'Partager': 'مشاركة', 'Analyser': 'تحليل', 'Comparer': 'مقارنة',
        'Générer': 'إنشاء', 'Calculer': 'حساب', 'Simuler': 'محاكاة',
        "Aujourd'hui": 'اليوم', 'Risque': 'خطر', 'Risques': 'مخاطر',
        'pays': 'بلد', 'Pays': 'البلد', 'Monde': 'العالم',
        'Recommandation': 'توصية', 'Recommandations': 'توصيات',
    },
    'hi': {
        'Sélectionner': 'चुनें', 'Création...': 'बना रहे हैं...', 'Ajouter': 'जोड़ें',
        'Supprimer': 'हटाएं', 'Modifier': 'संपादित करें', 'Enregistrer': 'सहेजें',
        'Annuler': 'रद्द करें', 'Fermer': 'बंद करें', 'Ouvrir': 'खोलें',
        'Retour': 'वापस', 'Suivant': 'अगला', 'Précédent': 'पिछला',
        'Rechercher': 'खोजें', 'Chargement...': 'लोड हो रहा है...',
        'Envoyer': 'भेजें', 'Confirmer': 'पुष्टि करें',
        'Tout': 'सभी', 'Aucun': 'कोई नहीं', 'Oui': 'हाँ', 'Non': 'नहीं',
        'Plus': 'अधिक', 'Moins': 'कम', 'Voir': 'देखें', 'Détails': 'विवरण',
        'Nom': 'नाम', 'Description': 'विवरण', 'Date': 'तारीख',
        'Titre': 'शीर्षक', 'Total': 'कुल', 'Résultat': 'परिणाम', 'Résultats': 'परिणाम',
        'Paramètres': 'सेटिंग्स', 'Tableau de bord': 'डैशबोर्ड',
        'Accueil': 'होम', 'Profil': 'प्रोफ़ाइल', 'Compte': 'खाता',
        'Connexion': 'लॉग इन', 'Déconnexion': 'लॉग आउट',
        'Inscription': 'पंजीकरण', 'Mot de passe': 'पासवर्ड',
        'Gratuit': 'मुफ़्त', 'Succès': 'सफलता', 'Erreur': 'त्रुटि',
        'Terminé': 'पूर्ण', 'En cours': 'प्रगति में', 'En attente': 'लंबित',
        'Élevé': 'उच्च', 'Moyen': 'मध्यम', 'Faible': 'निम्न', 'Critique': 'गंभीर',
        'Commencer': 'शुरू करें', 'Continuer': 'जारी रखें',
        'Analyser': 'विश्लेषण', 'Comparer': 'तुलना',
        "Aujourd'hui": 'आज', 'Risque': 'जोखिम', 'Risques': 'जोखिम',
        'pays': 'देश', 'Pays': 'देश', 'Monde': 'विश्व',
    },
    'bn': {
        'Sélectionner': 'নির্বাচন করুন', 'Ajouter': 'যোগ করুন',
        'Supprimer': 'মুছুন', 'Modifier': 'সম্পাদনা করুন', 'Enregistrer': 'সংরক্ষণ করুন',
        'Annuler': 'বাতিল', 'Fermer': 'বন্ধ করুন', 'Ouvrir': 'খুলুন',
        'Retour': 'ফিরে যান', 'Suivant': 'পরবর্তী', 'Précédent': 'আগের',
        'Rechercher': 'অনুসন্ধান', 'Chargement...': 'লোড হচ্ছে...',
        'Tout': 'সব', 'Aucun': 'কোনোটিই নয়', 'Oui': 'হ্যাঁ', 'Non': 'না',
        'Nom': 'নাম', 'Description': 'বিবরণ', 'Date': 'তারিখ',
        'Titre': 'শিরোনাম', 'Total': 'মোট', 'Résultat': 'ফলাফল',
        'Paramètres': 'সেটিংস', 'Accueil': 'হোম', 'Profil': 'প্রোফাইল',
        'Connexion': 'লগ ইন', 'Gratuit': 'বিনামূল্যে',
        'Succès': 'সফল', 'Erreur': 'ত্রুটি', 'Commencer': 'শুরু করুন',
        "Aujourd'hui": 'আজ', 'pays': 'দেশ', 'Pays': 'দেশ', 'Monde': 'বিশ্ব',
    },
    'ru': {
        'Sélectionner': 'Выбрать', 'Création...': 'Создание...', 'Ajouter': 'Добавить',
        'Supprimer': 'Удалить', 'Modifier': 'Редактировать', 'Enregistrer': 'Сохранить',
        'Annuler': 'Отмена', 'Fermer': 'Закрыть', 'Ouvrir': 'Открыть',
        'Retour': 'Назад', 'Suivant': 'Далее', 'Précédent': 'Назад',
        'Rechercher': 'Поиск', 'Filtrer': 'Фильтр', 'Trier': 'Сортировка',
        'Chargement...': 'Загрузка...', 'Chargement': 'Загрузка',
        'Envoyer': 'Отправить', 'Copier': 'Копировать', 'Confirmer': 'Подтвердить',
        'Valider': 'Проверить', 'Télécharger': 'Скачать', 'Importer': 'Импорт',
        'Exporter': 'Экспорт', 'Actualiser': 'Обновить', 'Réinitialiser': 'Сбросить',
        'Tout': 'Все', 'Aucun': 'Нет', 'Oui': 'Да', 'Non': 'Нет',
        'Plus': 'Ещё', 'Moins': 'Меньше', 'Voir': 'Просмотр', 'Détails': 'Подробности',
        'Actions': 'Действия', 'Statut': 'Статус', 'Type': 'Тип', 'Nom': 'Имя',
        'Description': 'Описание', 'Date': 'Дата', 'Note': 'Заметка', 'Notes': 'Заметки',
        'Titre': 'Заголовок', 'Catégorie': 'Категория', 'Priorité': 'Приоритет',
        'Total': 'Итого', 'Résultat': 'Результат', 'Résultats': 'Результаты',
        'Paramètres': 'Настройки', 'Tableau de bord': 'Панель управления',
        'Accueil': 'Главная', 'Profil': 'Профиль', 'Compte': 'Аккаунт',
        'Connexion': 'Вход', 'Déconnexion': 'Выход',
        'Inscription': 'Регистрация', 'Mot de passe': 'Пароль',
        'Utilisateur': 'Пользователь', 'Aide': 'Помощь', 'Contact': 'Контакт',
        'Gratuit': 'Бесплатно', 'Abonnement': 'Подписка',
        'Succès': 'Успех', 'Erreur': 'Ошибка', 'Attention': 'Внимание',
        'Terminé': 'Завершено', 'En cours': 'В процессе', 'En attente': 'Ожидание',
        'Actif': 'Активный', 'Élevé': 'Высокий', 'Moyen': 'Средний',
        'Faible': 'Низкий', 'Critique': 'Критический',
        'Commencer': 'Начать', 'Continuer': 'Продолжить', 'Terminer': 'Завершить',
        'Partager': 'Поделиться', 'Analyser': 'Анализировать', 'Comparer': 'Сравнить',
        'Générer': 'Сгенерировать', 'Calculer': 'Рассчитать', 'Simuler': 'Симулировать',
        'Dim': 'Вс', 'Lun': 'Пн', 'Mar': 'Вт', 'Mer': 'Ср', 'Jeu': 'Чт', 'Ven': 'Пт', 'Sam': 'Сб',
        'Janvier': 'Январь', 'Février': 'Февраль', 'Mars': 'Март', 'Avril': 'Апрель',
        'Mai': 'Май', 'Juin': 'Июнь', 'Juillet': 'Июль', 'Août': 'Август',
        'Septembre': 'Сентябрь', 'Octobre': 'Октябрь', 'Novembre': 'Ноябрь', 'Décembre': 'Декабрь',
        "Aujourd'hui": 'Сегодня', 'À venir': 'Предстоящие', 'En retard': 'Просрочено',
        'Risque': 'Риск', 'Risques': 'Риски', 'Avantage': 'Преимущество', 'Avantages': 'Преимущества',
        'pays': 'страна', 'Pays': 'Страна', 'Monde': 'Мир',
        'Recommandation': 'Рекомендация', 'Recommandations': 'Рекомендации',
        'Modèles': 'Шаблоны', 'Modèle': 'Шаблон',
    },
    'ur': {
        'Sélectionner': 'منتخب کریں', 'Ajouter': 'شامل کریں',
        'Supprimer': 'حذف کریں', 'Modifier': 'ترمیم کریں', 'Enregistrer': 'محفوظ کریں',
        'Annuler': 'منسوخ', 'Fermer': 'بند کریں', 'Ouvrir': 'کھولیں',
        'Retour': 'واپس', 'Suivant': 'اگلا', 'Précédent': 'پچھلا',
        'Rechercher': 'تلاش', 'Chargement...': 'لوڈ ہو رہا ہے...',
        'Tout': 'سب', 'Aucun': 'کوئی نہیں', 'Oui': 'ہاں', 'Non': 'نہیں',
        'Nom': 'نام', 'Description': 'تفصیل', 'Date': 'تاریخ',
        'Titre': 'عنوان', 'Total': 'کل', 'Résultat': 'نتیجہ',
        'Paramètres': 'ترتیبات', 'Accueil': 'ہوم', 'Profil': 'پروفائل',
        'Connexion': 'لاگ ان', 'Gratuit': 'مفت',
        'Succès': 'کامیابی', 'Erreur': 'خرابی', 'Commencer': 'شروع کریں',
        "Aujourd'hui": 'آج', 'pays': 'ملک', 'Pays': 'ملک', 'Monde': 'دنیا',
    },
}

def translate_text(text, lang, en_text=None):
    """Translate a French text to the target language."""
    if not isinstance(text, str):
        return text

    d = DICT.get(lang, {})

    # Exact match first
    if text in d:
        return d[text]

    # If we have an English translation available and the target is EN-derivable
    if en_text and isinstance(en_text, str) and lang == 'en':
        return en_text

    # Try to translate using word-by-word replacement for simple cases
    result = text
    for fr_word, translated in sorted(d.items(), key=lambda x: -len(x[0])):
        if fr_word in result:
            result = result.replace(fr_word, translated)

    # If translation changed significantly, use it
    if result != text and len(result) > 0:
        return result

    # Fallback: return English if available, otherwise French
    if en_text and isinstance(en_text, str):
        return en_text
    return text


def set_nested(obj, key_path, value):
    """Set a value in a nested dict using dot-notation key."""
    keys = key_path.split('.')
    current = obj
    for k in keys[:-1]:
        if k not in current or not isinstance(current[k], dict):
            current[k] = {}
        current = current[k]
    if isinstance(current, dict):
        current[keys[-1]] = value


def get_nested(obj, key_path):
    """Get a value from a nested dict using dot-notation key."""
    keys = key_path.split('.')
    current = obj
    for k in keys:
        if not isinstance(current, dict) or k not in current:
            return None
        current = current[k]
    return current


def get_flat(obj, prefix=''):
    """Flatten a nested dict to dot-notation keys."""
    result = {}
    for k, v in obj.items():
        full = f'{prefix}.{k}' if prefix else k
        if isinstance(v, dict):
            result.update(get_flat(v, full))
        else:
            result[full] = v
    return result


def main():
    # Load reference (French)
    with open('src/locales/fr.json', 'r', encoding='utf-8') as f:
        fr = json.load(f)
    fr_flat = get_flat(fr)

    # Load English for fallback
    with open('src/locales/en.json', 'r', encoding='utf-8') as f:
        en_data = json.load(f)
    en_flat = get_flat(en_data)

    for lang in LANGS:
        filepath = f'src/locales/{lang}.json'
        with open(filepath, 'r', encoding='utf-8') as f:
            lang_data = json.load(f)

        lang_flat = get_flat(lang_data)
        missing_keys = [k for k in fr_flat if k not in lang_flat]

        if not missing_keys:
            print(f'{lang}: already complete')
            continue

        added = 0
        for key in missing_keys:
            fr_val = fr_flat[key]
            en_val = en_flat.get(key)

            if isinstance(fr_val, list):
                # Translate list items
                translated_list = []
                for item in fr_val:
                    if isinstance(item, str):
                        translated_list.append(translate_text(item, lang, None))
                    else:
                        translated_list.append(item)
                set_nested(lang_data, key, translated_list)
            elif isinstance(fr_val, str):
                translated = translate_text(fr_val, lang, en_val)
                set_nested(lang_data, key, translated)
            else:
                # Numbers, booleans, etc. - keep as-is
                set_nested(lang_data, key, fr_val)
            added += 1

        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(lang_data, f, ensure_ascii=False, indent=2)
            f.write('\n')

        print(f'{lang}: added {added} keys')

    print('\nDone! All translations generated.')


if __name__ == '__main__':
    main()
