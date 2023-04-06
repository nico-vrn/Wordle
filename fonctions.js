// Constante du jeu
const NB_LETTRES_MOT = 5;

// Variables globales du jeu
let nbMotsTrouves // = 0;
let meilleurNbEssais = null;
let motMystere;

/**
 * Fonction qui initialise le jeu
 * (Fonction appelée automatiquement au chargement de la page)
 */
function init() {
  // Initialisation du mot mystère à retrouver
  motMystere = "CRANE";
  cacheTousLesMessages();
//si un bouton de classe "bouton_simple" est cliqué on appelle la fonction actionne()
  for (let i = 0; i < document.getElementsByClassName("bouton_simple").length; i++) {
    document.getElementsByClassName("bouton_simple")[i].addEventListener("click", function() {actionne(this);});
  }
  document.getElementById("bouton_effacer").addEventListener("click", effaceCaseActive);
  document.getElementById("bouton_valider").addEventListener("click", valideLeMot);
  document.getElementById("bouton_nouvelle_partie").addEventListener("click", lanceNouvellePartie);
  if (localStorage.nb_mots_trouves==undefined && localStorage.meilleur_nb_essais==undefined){
    console.log("Pas de données stockées");
    return;
  }
  else{
    nbMotsTrouves=localStorage.nb_mots_trouves;
    document.getElementById("nb_mots_trouves").innerHTML=localStorage.nb_mots_trouves;
    document.getElementById("meilleur_nb_essais").innerHTML=localStorage.meilleur_nb_essais;
  }
}



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



/**
 * Fonction qui cache tous les messages de la section 
 * "zone_messages".
 */
 function cacheTousLesMessages() {
    for (let i = 0; i < document.getElementById("zone_messages").children.length; i++) {
        //document.getElementById("zone_messages").children[i].style.display = "none";
        document.getElementById("zone_messages").children[i].classList.add("cache");
    }
}

/**
 * Fonction qui récupère la lettre présente sur le bouton passé en
 * paramètre, puis qui renseigne cette lettre dans la case active
 * et enfin décale la case active à droite (si cela est possible).
 * (Fonction qui se déclenche quand on clic sur un des
 * boutons du clavier du jeu)
 */
function actionne(bouton) {
  caseActive=retourneCaseActive();
  if (caseActive==null){
    return;
  }
  else{
    let lettre = bouton.innerHTML;
    caseActive.value=lettre;
    decaleCaseActiveADroite();
  }
}

/**
 * Fonction qui efface le contenu de la case active,
 * et qui décale ensuite la case active à gauche
 * (si le décalage est possible).
 */
function effaceCaseActive() {
  caseActive=retourneCaseActive();
  if (caseActive==null){
    return;
  }
  else{
    caseActive.value="";
    decaleCaseActiveAGauche();
  }
}

/**
 * Fonction qui retourne vrai si la ligne passée en paramètre est complète
 * (c'est-à-dire si les 5 cases <input> ont une lettre renseignée)
 */
function verifieSiLigneComplete(ligne){
  for (let i = 0; i < ligne.children.length; i++) {
    if (ligne.children[i].value==""){
      document.getElementById("message_mot_incomplet").classList.remove("cache");
      reponse= false;
    }
    else{
      document.getElementById("message_mot_incomplet").classList.add("cache");
      reponse= true;
    }
  }
    return reponse;
}

/**
 * Fonction qui compare le mot inscrit dans la ligne passée en paramètre
 * au mot mystère que le joueur doit retrouver (aussi passé en paramètre)
 * et renvoie le nombre de lettres bien placées.
 * Et, selon la lettre et sa position, la fonction va aussi appliquer
 * une classe différente à la case.
 * (La fonction ne se base pas sur la case active de la grille,
 * et ne modifie pas quelle est cette case active)
 */
function verifieLesLettresDeLaLigne(ligne, motMystere){
  let nbLettresBienPlacees = 0;
  for (let i = 0; i < ligne.children.length; i++) {
    if (ligne.children[i].value==motMystere[i]){
      ligne.children[i].classList.add("bien_place");
      nbLettresBienPlacees++;
    }
    else if(motMystere.includes(ligne.children[i].value)){
      ligne.children[i].classList.add("pas_bien_place");
    }
    else{
      ligne.children[i].classList.add("pas_dans_mot");
    }
  }

  //extension:

  /*
  let mots="";

  for (let i = 0; i < ligne.children.length; i++) {
    mots+=ligne.children[i].value;
  }
  console.log("mets mots"+mots);
  //chercher si mots est dans liste_mots
  if (liste_mots.includes(mots)){
    console.log("c'estbon");
  }
  else{
    document.getElementById("message_mot_pas_fr").classList.remove("cache");
    console.log(retourneLigneActive());
    //supprimer le contenu des cases de la ligne active et met la case active au debut de la ligne
    for (let i = 0; i < ligne.children.length; i++) {
      ligne.children[i].value="";
    }
    activePremiereCaseDeLaLigne(ligne);
    console.log("c'est pas bon");
  }*/

  return nbLettresBienPlacees;
}

/**
 * Fonction qui gère le cas où la partie est perdue
 * en affichant le message correspondant.
 */
 function gerePartiePerdue(){
  document.getElementById("message_partie_perdue").classList.remove("cache");
}


/**
 * Fonction qui gère le cas où la partie est gagnée
 * en mettant à jour les différentes infos (variable globale
 * et LocalStorage) et en affichant le message correspondant.
 */
function gerePartieGagnee(ligneDernierEssai){
  nbMotsTrouves++;
  nb_essais=ligneDernierEssai.getAttribute("data-num-essai");
  document.getElementById("nb_mots_trouves").innerHTML=nbMotsTrouves;
  document.getElementById("nb_essais").innerHTML=nb_essais;
  document.getElementById("message_partie_gagnee").classList.remove("cache");
  localStorage.nb_mots_trouves=nbMotsTrouves;
  document.getElementById("nb_mots_trouves").innerHTML=localStorage.nb_mots_trouves;
  if (localStorage.meilleur_nb_essais==undefined || localStorage.meilleur_nb_essais>nb_essais){
    localStorage.meilleur_nb_essais=nb_essais;
    document.getElementById("meilleur_nb_essais").innerHTML=localStorage.meilleur_nb_essais;
  }
}

/**
 * Fonction qui réinitialise le jeu en cachant
 * tous les messages possiblement affichés
 * et en ré-initialisant la grille de jeu.
 */
 function reinitialiseLeJeu() {
  cacheTousLesMessages();
  //parcours toutes les lignes pour vider les cases
  for (let i = 0; i < document.getElementById("grille_jeu").children.length; i++) {
    for (let j = 0; j < document.getElementById("grille_jeu").children[i].children.length; j++) {
      document.getElementById("grille_jeu").children[i].children[j].value="";
      document.getElementById("grille_jeu").children[i].children[j].classList.remove("case_active");
      document.getElementById("grille_jeu").children[i].children[j].classList.remove("bien_place");
      document.getElementById("grille_jeu").children[i].children[j].classList.remove("pas_bien_place");
      document.getElementById("grille_jeu").children[i].children[j].classList.remove("pas_dans_mot");
    }
  }
  activePremiereCaseDeLaLigne(document.getElementById("grille_jeu").children[0]);
}

/**
 * Fonction qui lance une nouvelle partie en ré-initialisant
 * le jeu et faisant un appel AJAX pour tirer au hasard
 * un nouveau mot mystère.
 */
function lanceNouvellePartie() {
  if (confirm("Voulez-vous vraiment lancer une nouvelle partie ?")){
    reinitialiseLeJeu();
    ajax_get_request(majMotMystere,"genere_nouveau_mot.php");
  }
  else{
    return;
  }
}

/**
 * Fonction callback qui prend en paramètre la réponse de l'appel AJAX
 * et met à jour le mot mystère.
 */
function majMotMystere(res) {
  motMystere=res;
  console.log(motMystere);
}


 let liste_mots=['KOALA']