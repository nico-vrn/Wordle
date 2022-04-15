<?php
  $mots_possibles = array(
    "AROME", "ALBUM",
    "BARBE", "BIQUE",
    "CANOE", "CHIPS",
    "DINER", "DUELS",
    "ECRAN", "ENVOL",
    "FABLE", "FRIGO",
    "GEODE", "GODET",
    "HAYON", "HEBDO",
    "IMPRO", "INUIT",
    "JOUET", "JETON",
    "KOALA", "KAYAK",
    "LABOS", "LAMPE",
    "MANGA", "MEDIA",
    "NINJA", "NORME",
    "OGRES", "OSCAR",
    "PALME", "PHOTO",
    "QUADS", "QUOTA",
    "RAMPE", "REFUS",
    "SOMME", "SINGE",
    "TERRE", "TRACT",
    "USAGE", "UNION",
    "VOILE", "VERIN",
    "WAGON", "WRAPS",
    "XENON",
    "YACHT", "YOYOS",
    "ZEBRE", "ZESTE"
  );

  $i = rand(0, count($mots_possibles)-1);

  echo $mots_possibles[$i];
?>