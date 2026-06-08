import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storage } from '../utils/localStorage';
import { notificationService } from '../utils/notificationService';
import '../styles/DataExport.css';

const DataExport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const exportUserData = async () => {
    setIsLoading(true);

    try {
      const userData = {
        profile: storage.getProfile(),
        favorites: storage.getFavorites(),
        weekMenu: storage.getWeekMenu(),
        progress: storage.getProgress(),
        nutrition: storage.getNutrition(),
        goals: storage.getGoals(),
        workouts: storage.getWorkouts(),
        shoppingList: storage.getShoppingList()
      };
      const jsonData = JSON.stringify(userData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `fitness-planet-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notificationService.success('Gegevens geexporteerd', 'Je gegevens zijn succesvol geexporteerd');
    } catch {
      notificationService.error('Fout bij exporteren', 'Er is een fout opgetreden bij het exporteren van je gegevens');
    } finally {
      setIsLoading(false);
    }
  };

  const requestAccountDeletion = async () => {
    const shouldDelete = window.confirm(
      'Weet je zeker dat je je account wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.'
    );

    if (!shouldDelete) return;

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      storage.clearAll();
      notificationService.success('Account verwijderd', 'Je account is succesvol verwijderd');
      navigate('/login', { replace: true });
    } catch {
      notificationService.error('Fout bij verwijderen', 'Er is een fout opgetreden bij het verwijderen van je account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="data-export-container">
      <h2>Je privacy en gegevens</h2>

      <p className="data-export-description">
        Volgens de Algemene Verordening Gegevensbescherming (AVG) heb je recht op inzage, correctie,
        verwijdering en export van je persoonlijke gegevens.
      </p>

      <div className="data-export-actions">
        <button
          onClick={exportUserData}
          disabled={isLoading}
          className="export-button"
        >
          {isLoading ? 'Bezig...' : 'Exporteer mijn gegevens (JSON)'}
        </button>

        <button
          onClick={requestAccountDeletion}
          disabled={isLoading}
          className="delete-button"
        >
          {isLoading ? 'Bezig...' : 'Verwijder mijn account'}
        </button>
      </div>

      <div className="data-privacy-info">
        <h3>Welke gegevens slaan we op?</h3>
        <ul>
          <li><strong>Profiel:</strong> Je basisgegevens zoals naam, gewicht en lengte</li>
          <li><strong>Favorieten:</strong> Recepten die je hebt opgeslagen</li>
          <li><strong>Voortgang:</strong> Je gewichtstracking en trainingslogboeken</li>
          <li><strong>Voeding:</strong> Gemaakte weekmenu's en maaltijdplanningen</li>
        </ul>

        <p>
          Voor meer informatie, zie ons <Link to="/privacy-beleid">privacybeleid</Link>.
        </p>
      </div>
    </div>
  );
};

export default DataExport;
