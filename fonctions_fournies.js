// Constante du jeu
const NB_LETTRES_MOT = 5;

/**
 * Fonction qui retourne la case active du jeu,
 * ou alors NULL s'il n'y a pas de case active dans la grille.
 * Si jamais il y a plusieurs cases actives dans la grille (ce qui
 * correspondrait à un bug dans le jeu), la fonction retourne
 * la 1ère case active trouvée sans faire d'erreur.
 */
function retourneCaseActive() {
  let caseActive = document.querySelector(".case_active");
  if (caseActive) {
    return caseActive;
  } else {
    console.warn("Aucune case active !");
    return null;
  }
}

/**
 * Fonction qui retourne la ligne de la grille contenant la case active
 * (c'est-à-dire la ligne qui correspond à l'essai en cours)
 * ou alors NULL s'il n'y a pas de case active dans la grille.
 */
function retourneLigneActive() {
  let caseActive = retourneCaseActive();
  if (caseActive) {
    return caseActive.parentElement;
  } else {
    return null;
  }
}

/**
 * Fonction qui retourne la ligne qui suit celle passée en paramètre
 * ou alors NULL si la ligne passée en paramètre est la
 * dernière ligne de la grille
 */
function retourneLigneSuivante(ligne) {
  if(ligne){
    return ligne.nextElementSibling;
  } else {
    return null;
  }
}

/**
 * Fonction qui active la 1ère case de la ligne passée en paramètre
 * (La fonction ne vérifie pas s'il y a déjà une case active ou non)
 */
 function activePremiereCaseDeLaLigne(ligne){
  let premiereCase = ligne.querySelector("input");
  premiereCase.classList.add("case_active");
}

/**
 * Fonction qui décale la case active à celle juste à sa gauche.
 * S'il n'y a pas de case active ou que la case active n'a pas de case
 * à sa gauche, la fonction ne fait rien.
 */
function decaleCaseActiveAGauche() {
  let caseActive = retourneCaseActive();
  if (caseActive && caseActive.previousElementSibling) {
    caseActive.classList.remove("case_active");
    caseActive.previousElementSibling.classList.add("case_active");
  }
}

/**
 * Fonction qui décale la case active à celle juste à sa droite.
 * S'il n'y a pas de case active ou que la case active n'a pas de case
 * à sa droite, la fonction ne fait rien.
 */
function decaleCaseActiveADroite() {
  let caseActive = retourneCaseActive();
  if (caseActive && caseActive.nextElementSibling) {
    caseActive.classList.remove("case_active");
    caseActive.nextElementSibling.classList.add("case_active");
  }
}

/**
 * Fonction qui traite toutes les étapes de la validation
 * d'un mot et vérifie si on est sur une fin de partie ou pas.
 */
 function valideLeMot() {
  // Récupère la ligne active (et vérifie si on n'est pas déjà sur une partie finie)
  let ligneActive = retourneLigneActive();
  if (ligneActive === null) {
    // Partie déjà finie => On s'arrête !
    return;
  }

  // Cache tous les messages
  cacheTousLesMessages();

  // Vérifie si la ligne est complète (affiche un message si ce n'est pas le cas)
  let estMotComplet = verifieSiLigneComplete(ligneActive);
  if(!estMotComplet){
    // Mot incomplet => On s'arrête !
    return;
  }

  // Vérification du mot saisi
  let nbLettresBienPlacees = verifieLesLettresDeLaLigne(ligneActive, motMystere);

  // Récupère de la ligne suivante
  // Sachant que la vérification de l'existence de cette ligne suivante sera faite après
  let ligneSuivante = retourneLigneSuivante(ligneActive);

  // Désactive la case active (utile dans tous les cas)
  let caseActive = retourneCaseActive();
  if (caseActive !== null) {
    caseActive.classList.remove("case_active");
  }

  // Vérifie dans quel cas on est
  if (nbLettresBienPlacees === NB_LETTRES_MOT) {
    // Toutes les lettres sont bien placées => C'est gagné !
    gerePartieGagnee(ligneActive);

  } else if(ligneSuivante === null) {
    // Pas de ligne suivante => C'est perdu...
    gerePartiePerdue();

  } else {
    // Dans les autres cas => On continue avec la ligne suivante
    // (Fonction fournie)
    activePremiereCaseDeLaLigne(ligneSuivante);
  }
}

/**
 * Fonction qui permet de faire une requête AJAX de type GET
 * @param  callback : Fonction callback
 * @param  url : URL de la requête (qui doit contenir les différents paramètres d'URL)
 * @param  async : Booléen indiquant si la requête doit se faire en asynchrone ou en synchrone (asynchrone par défaut)
 */
 function ajax_get_request(callback, url, async = true) {
  // Instanciation d'un objet XHR
  var xhr = new XMLHttpRequest();

  // Définition de la fonction à exécuter à chaque changement d'état
  xhr.onreadystatechange = function () {
    if (
      callback &&
      xhr.readyState == XMLHttpRequest.DONE &&
      (xhr.status == 200 || xhr.status == 0)
    ) {
      // => On appelle la fonction callback en passant en paramètre
      //    les données récupérées sous forme de texte brut
      callback(xhr.responseText);
    }
  };

  // Initialisation de l'objet puis envoi de la requête
  xhr.open("GET", url, async);
  xhr.send();
}
