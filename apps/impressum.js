function renderImpressumView() {
  return `
    <div class="impressum-content">
      <h2>Impressum</h2>
      <p><strong>Angaben gemäß § 5 TMG:</strong></p>
      <p>Patrick, Schmidt<br>
      Brüggerweg 7<br>
      59964 Medebach<br>
      Deutschland</p>
      <p><strong>Kontakt:</strong><br>
      Telefon: 017685937800<br>
      E-Mail: kontakt@patrick-schmidt.info</p>
      <p><strong>Haftungsausschluss:</strong><br>
      Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.</p>
      <p><strong>Urheberrecht:</strong><br>
      Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.</p>
      <p>Quelle: <a href="https://www.e-recht24.de/impressum-generator.html" target="_blank">eRecht24 Impressum Generator</a></p>
    </div>
  `;
}

function initImpressum(win) {
  // Keine spezielle Initialisierung nötig – statischer Inhalt
  // Hier könntest du z.B. Links anklickbar machen oder Animationen hinzufügen
}

window.renderImpressumView = window.renderImpressumView || renderImpressumView;
window.initImpressum = window.initImpressum || initImpressum;