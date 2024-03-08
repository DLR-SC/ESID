<!--
SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
SPDX-License-Identifier: CC-BY-4.0
-->

# ESID Änderungshistorie

## vX.X.X-alpha

**Veröffentlichungsdatum:** TBD

### Neue Funktionen

- Die Änderungshistorie kann jetzt über das Burger-Menü in der oberen rechten Ecke angezeigt werden.
- Die Sprache kann jetzt in der oberen Leiste zwischen Englisch und Deutsch gewechselt werden.
- Eine neue Karte für Falldaten wurde hinzugefügt:
  - Wenn diese Karte ausgewählt wird, werden die Falldaten dementsprechend im Rest der Anwendung angezeigt.
  - Es ist nun auch möglich die Falldaten alleine anzuzeigen, ohne dass ein Szenario aktiviert ist.
- Neben der Liste der Infektionszustände ist jetzt zu jedem Infektionszustand ein Infokästchen. Aktuell haben alle Zustände die gleiche Information.
- Der Referenztag ist nun einstellbar. Eine Linie wird zum Graphen gezeichnet, um so den Zusammenhang zu verdeutlichen.
- Die Zoom-Knöpfe der Karte haben eine weitere Schaltfläche bekommen, mit der die Kartenansicht zur ursprünglichen Übersicht zurückgesetzt werden kann.

### Verbesserungen

- Ein Label wurde zum Szenarios-Starttag hinzugefügt.
- Alle Zahlen werden nun als Ganzzahlen angezeigt.
- Der Gruppenfilter-Editor fragt jetzt nach einer Bestätigung, wenn der Benutzer einen anderen Gruppenfilter auswählt oder den Dialog schließt, ohne vorherige Änderungen zu speichern.
- Alle Texte sind nun in Englisch und in Deutsch verfügbar.
- Es wurden einige Verbesserungen gemacht, die das Laden der Seite beschleunigen.
- Wenn neue Funktionen zur Verfügung gestellt werden, wird der Browser-Cache nicht mehr verhindern, dass Benutzer:innen diese sehen.
- Das DLR-Logo wurde durch das LOKI-Logo ersetzt und verkleinert.
- Das Modul für das Liniendiagramm wurde von AmCharts 4 auf 5 gewechselt für eine bessere Leistung.
- Der ausgewählte Infektionszustand wird nun auch in den Szenariokarten farbig hervorgehoben.
- Das DLR-Logo in der Tableiste wurde durch das ESID-Logo ersetzt.
- Das LOKI-Logo verweist nun auf die LOKI-Pandemics Webseite, anstatt der DLR-Webseite.
- Es ist jetzt möglich einen beliebigen Tag mit Daten auszuwählen.
- "Falldaten" wurde in "Geschätzte Fälle" umbenannt und neue Übersetzungen für neue Infektionszustände wurden hinzugefügt.
- Die Textgröße in Tooltips wurden zur besseren Lesbarkeit angepasst.
- Es werden nur noch vier aggregierte Kompartimente angezeigt.
- Internes Build-System wurde durch Vite ersetzt, welches die Leistung der Webseite verbessert.

### Fehlerbehebungen

- Ein Fehler wurde behoben, der beim ersten Laden der Seite den Text in der Suchleiste nicht übersetzt hatte.
- Ein Fehler wurde behoben, der Landkreise mit fehlenden Daten verschwinden lies.
- Ein Fehler wurde behoben, der die Webseite abstürzen lässt, nachdem die zugrunde liegenden Daten aktualisiert wurden.
- Ein Fehler wurde behoben, der die Webseite abstürzen lässt, wenn ein Szenario aus der Datenbank entfernt wurde.

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
