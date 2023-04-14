# ESID Änderungshistorie

## vX.X.X-alpha
**Veröffentlichungsdatum:** TBD

### Neue Funktionen
- Die Änderungshistorie kann jetzt über das Burger-Menü in der oberen rechten Ecke angezeigt werden.

### Verbesserungen
- Ein Label wurde zum Szenarios-Starttag hinzugefügt.
- Alle Zahlen in der Szenarienübersicht werden nun als Ganzzahlen angezeigt.

### Fehlerbehebungen

---

## v0.2.0-alpha
**Veröffentlichungsdatum:** 27.02.2023

### Neue Funktionen
- Gruppenfilter
  - Es gibt einen neuen Button unterhalb der '+' Karte oben rechts namens 'Gruppen'.
  - Der Button öffnet den Gruppenfilter-Editor. Hier können Sie Gruppen erstellen, umschalten, bearbeiten und löschen.
    - Beispiel eines Gruppenfilters: "Alle Personen jedes Geschlechts im Alter von 35 oder weniger"
    - Beispiel eines Gruppenfilters: "Alle Personen jedes Geschlechts im Alter von 35 oder mehr"
    - Beispiel eines Gruppenfilters: "Alle Männer jeden Alters"
  - Die Szenarienkarten zeigen nun die aktiven Gruppenfilter als aufklappbare Erweiterung rechts an.
  - Das Liniendiagramm zeigt die Gruppenfilter mit unterschiedlichen Linienstilen an.

### Verbesserungen
- Alle Zahlen auf Szenariokarten werden jetzt nur als Ganzzahlen angezeigt.
- Die Karten sind jetzt größer, damit es weniger wahrscheinlich ist, dass Text überläuft.
- Die App speichert jetzt, ob die Infektionszustände zwischen den Sitzungen erweitert wurden.
- Der ausgewählte Bezirk wird auf der Bezirkskarte mit einer Kontur hervorgehoben.

### Fehlerbehebungen
- Es wurde ein Problem mit dem persistenten Cache behoben, bei dem die Website abstürzt wenn eine neue
  Eigenschaft zum persistenten Speicher hinzugefügt wurde, und ein Kommentar wurde hinzugefügt, um zukünftige Fehler zu
  verhindern.

---

## v0.1.0-alpha
**Veröffentlichungsdatum:** 01.01.2023

### Neue Funktionen
- Szenariokarten
  - auswählbare Infektionszustände
  - auswählbare Szenarien
  - Karten, die Szenariowerte, Änderungsrate im Vergleich zu den Fallzahlen des Startdatums und Trendpfeile anzeigen,
    die positive oder negative Veränderungen anzeigen
  - zusätzliche Infektionszustände nach den 4 Hauptzustäden sind hinter einem Erweiterungsbutton verborgen
- Liniendiagramm
  - auswählbares Datum mit Anzeige des ausgewählten Datums
  - zoombare X-Achse
  - Unsicherheit (25. - 75. Perzentil) des ausgewählten Szenarios wird durch halbtransparente Flächenfüllung angezeigt
  - Tooltip, der Fall- und Szenariodaten sowie 25. und 75. Perzentilwerte für das ausgewählte Szenario anzeigt
- Bezirkskarte
  - auswählbare Bezirke
  - Tooltip, der Bezirkstyp, Name und ausgewählten Infektionszustand anzeigt
  - Suchleiste für Bezirke mit Schreibvorschlägen
  - Heatmap-Legende
    - Auswahlmenü für voreingestellte Heatmap-Optionen
    - Umschalten zwischen festem und dynamischem Bereich basierend auf den Daten
- Schaltflächen zum Inkrementieren/Dekrementieren des ausgewählten Tages und zum kontinuierlichen Durchlauf von
  Szenariotagen mit einer Play-Taste, und um zwischen Vollbild- und Fensteransicht umzuschalten.
- Navigationsmenü mit Informationen über Impressum, Datenschutz, Barrierefreiheit und Urheberrecht.
