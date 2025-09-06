import React from 'react';
import '../styles/PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-container">
      <h1>Privacybeleid</h1>
      <p>Laatst bijgewerkt: 23 augustus 2023</p>
      
      <section>
        <h2>1. Inleiding</h2>
        <p>
          Welkom bij Fitness Planet. We zetten ons in om uw privacy te beschermen en transparant te zijn 
          over hoe we uw gegevens verzamelen, gebruiken en delen.
        </p>
      </section>
      
      <section>
        <h2>2. Welke gegevens we verzamelen</h2>
        <ul>
          <li><strong>Accountgegevens:</strong> Naam, e-mailadres en wachtwoord</li>
          <li><strong>Profielgegevens:</strong> Leeftijd, geslacht, gewicht, lengte en fitnessdoelen</li>
          <li><strong>Activiteitsgegevens:</strong> Trainingsgegevens, voedingsregistratie en vooruitgang</li>
          <li><strong>Automatisch verzamelde gegevens:</strong> IP-adres, browsertype en apparaatgegevens</li>
        </ul>
      </section>
      
      <section>
        <h2>3. Hoe we uw gegevens gebruiken</h2>
        <ul>
          <li>Om de dienst aan u te leveren en te verbeteren</li>
          <li>Om persoonlijke voedings- en trainingsaanbevelingen te doen</li>
          <li>Om te communiceren over uw account en updates</li>
          <li>Om de algehele gebruikerservaring te verbeteren</li>
          <li>Om onze diensten te beschermen en fraude te voorkomen</li>
        </ul>
      </section>
      
      <section>
        <h2>4. Gegevensopslag en -beveiliging</h2>
        <p>
          Wij nemen de bescherming van uw gegevens serieus en hebben maatregelen genomen om 
          ongeoorloofde toegang, gebruik of openbaarmaking te voorkomen. Uw gegevens worden opgeslagen 
          in beveiligde databases en gecodeerd tijdens overdracht.
        </p>
      </section>
      
      <section>
        <h2>5. Uw rechten</h2>
        <p>
          Onder de AVG heeft u verschillende rechten met betrekking tot uw persoonlijke gegevens:
        </p>
        <ul>
          <li>Het recht op toegang tot uw gegevens</li>
          <li>Het recht op rectificatie van onjuiste gegevens</li>
          <li>Het recht op wissen van uw gegevens</li>
          <li>Het recht op beperking van verwerking</li>
          <li>Het recht op gegevensoverdraagbaarheid</li>
          <li>Het recht om bezwaar te maken tegen verwerking</li>
        </ul>
      </section>
      
      <section>
        <h2>6. Cookie-beleid</h2>
        <p>
          We gebruiken cookies om uw ervaring te verbeteren, instellingen te onthouden en voor analytische doeleinden.
          U kunt uw cookievoorkeuren op elk moment beheren via de instellingen van uw browser.
        </p>
      </section>
      
      <section>
        <h2>7. Contact</h2>
        <p>
          Als u vragen of zorgen heeft over dit privacybeleid of over hoe we omgaan met uw gegevens, 
          neem dan contact met ons op via <a href="mailto:privacy@fitnessplanet.nl">privacy@fitnessplanet.nl</a>.
        </p>
      </section>
      
      <section>
        <h2>8. Wijzigingen in dit beleid</h2>
        <p>
          We kunnen dit privacybeleid van tijd tot tijd bijwerken. We zullen u op de hoogte brengen van 
          eventuele materiële wijzigingen via e-mail of een melding op onze website.
        </p>
      </section>
      
      <div className="privacy-policy-footer">
        <p>© 2023 Fitness Planet. Alle rechten voorbehouden.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;