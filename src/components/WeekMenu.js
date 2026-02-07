import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storage } from '../utils/localStorage';
import { notificationService } from '../utils/notificationService';
import CalorieCalculator from '../utils/calorieCalculator';
import '../styles/WeekMenu.css';

const WeekMenu = () => {
  const [weekMenu, setWeekMenu] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedMenus, setSavedMenus] = useState([]);
  const [newMenuName, setNewMenuName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const navigate = useNavigate();

  // Dagen van de week
  const weekDays = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
  
  // Maaltijdmomenten
  const mealTypes = ['ontbijt', 'lunch', 'diner', 'snack'];

  useEffect(() => {
    loadWeekMenu();
    loadSavedMenus();
  }, []);

  const loadWeekMenu = () => {
    setLoading(true);
    try {
      const savedWeekMenu = storage.getWeekMenu();
      if (savedWeekMenu && Object.keys(savedWeekMenu).length > 0) {
        setWeekMenu(savedWeekMenu);
      } else {
        // Initialiseer een leeg weekmenu als er niets is opgeslagen
        const emptyMenu = {};
        weekDays.forEach(day => {
          emptyMenu[day] = {};
          mealTypes.forEach(mealType => {
            emptyMenu[day][mealType] = null;
          });
        });
        setWeekMenu(emptyMenu);
      }
      setError(null);
    } catch (error) {
      console.error('Error loading week menu:', error);
      setError('Er is een fout opgetreden bij het laden van het weekmenu');
      notificationService.error('Fout bij laden weekmenu', error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedMenus = () => {
    try {
      const saved = localStorage.getItem('fitnessapp_saved_weekmenus');
      const parsedMenus = saved ? JSON.parse(saved) : [];
      setSavedMenus(parsedMenus);
    } catch (error) {
      console.error('Error loading saved menus:', error);
      notificationService.error('Fout bij laden opgeslagen menu\'s', error.message);
    }
  };

  const saveMenu = () => {
    if (!newMenuName.trim()) {
      notificationService.warning('Voer een naam in', 'Geef je weekmenu een naam om het op te slaan');
      return;
    }

    try {
      const menuToSave = {
        id: Date.now(),
        name: newMenuName,
        createdAt: new Date().toISOString(),
        menu: { ...weekMenu }
      };

      const updatedMenus = [...savedMenus, menuToSave];
      localStorage.setItem('fitnessapp_saved_weekmenus', JSON.stringify(updatedMenus));
      setSavedMenus(updatedMenus);
      setNewMenuName('');
      setShowSaveModal(false);
      notificationService.success('Weekmenu opgeslagen', `"${newMenuName}" is succesvol opgeslagen`);
    } catch (error) {
      console.error('Error saving week menu:', error);
      notificationService.error('Fout bij opslaan weekmenu', error.message);
    }
  };

  const loadSavedMenu = (menu) => {
    if (window.confirm(`Weet je zeker dat je "${menu.name}" wilt laden? Het huidige weekmenu wordt overschreven.`)) {
      setWeekMenu(menu.menu);
      storage.saveWeekMenu(menu.menu);
      notificationService.success('Weekmenu geladen', `"${menu.name}" is geladen`);
    }
  };

  const deleteSavedMenu = (id, name) => {
    if (window.confirm(`Weet je zeker dat je "${name}" wilt verwijderen?`)) {
      try {
        const updatedMenus = savedMenus.filter(menu => menu.id !== id);
        localStorage.setItem('fitnessapp_saved_weekmenus', JSON.stringify(updatedMenus));
        setSavedMenus(updatedMenus);
        notificationService.info('Weekmenu verwijderd', `"${name}" is verwijderd`);
      } catch (error) {
        console.error('Error deleting saved menu:', error);
        notificationService.error('Fout bij verwijderen weekmenu', error.message);
      }
    }
  };

  const clearWeekMenu = () => {
    if (window.confirm('Weet je zeker dat je het huidige weekmenu wilt wissen?')) {
      const emptyMenu = {};
      weekDays.forEach(day => {
        emptyMenu[day] = {};
        mealTypes.forEach(mealType => {
          emptyMenu[day][mealType] = null;
        });
      });
      
      setWeekMenu(emptyMenu);
      storage.saveWeekMenu(emptyMenu);
      notificationService.info('Weekmenu gewist', 'Het weekmenu is leeggemaakt');
    }
  };

  const addRecipeToMenu = (day, mealType, recipe) => {
    if (!day || !mealType || !recipe) return;
    
    const updatedMenu = { ...weekMenu };
    if (!updatedMenu[day]) updatedMenu[day] = {};
    updatedMenu[day][mealType] = recipe;
    
    setWeekMenu(updatedMenu);
    storage.saveWeekMenu(updatedMenu);
    notificationService.success('Recept toegevoegd', `${recipe.title} toegevoegd aan ${day} - ${mealType}`);
  };

  const removeRecipeFromMenu = (day, mealType) => {
    if (!day || !mealType) return;
    
    const updatedMenu = { ...weekMenu };
    if (updatedMenu[day] && updatedMenu[day][mealType]) {
      updatedMenu[day][mealType] = null;
      setWeekMenu(updatedMenu);
      storage.saveWeekMenu(updatedMenu);
      notificationService.info('Recept verwijderd uit weekmenu');
    }
  };

  const openRecipeDetails = (recipe) => {
    if (recipe && recipe.id) {
      navigate(`/recept/${recipe.id}`, { state: { recipe } });
    }
  };

  const generateAutomaticMenu = async () => {
    setIsGenerating(true);
    try {
      // Haal gebruikersdoelen op
      const userGoals = storage.getGoals();
      const userProfile = storage.getProfile();
      const dailyCalories = userGoals?.dailyCalories || 2000;
      const goalType = userProfile?.goal || 'maintenance';

      const goalConfigs = {
        weightLoss: { calorieMultiplier: 0.9, proteinMin: 15, proteinBoost: 1.4 },
        maintenance: { calorieMultiplier: 1, proteinMin: 10, proteinBoost: 1.1 },
        weightGain: { calorieMultiplier: 1.1, proteinMin: 8, proteinBoost: 0.8 }
      };

      const goalConfig = goalConfigs[goalType] || goalConfigs.maintenance;
      
      // Simuleer het genereren van een weekmenu (in een echte app zou dit via AI/API gaan)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Haal alle beschikbare recepten op
      let allRecipes = storage.getRecipes();
      if (!allRecipes || allRecipes.length < 10) {
        // Als er niet genoeg recepten zijn, gebruik dan dummy recepten
        allRecipes = getDummyRecipes();
      }

      const getMealTypeRecipes = (recipes, mealTypeKey) => (
        recipes.filter(r => (
          r.mealType === mealTypeKey || r.tags?.includes(mealTypeKey)
        ))
      );

      const getCalorieTargets = (mealTypeKey) => {
        const targets = CalorieCalculator.getMealCalorieTargets(dailyCalories, mealTypeKey);
        return {
          min: Math.round(targets.min * goalConfig.calorieMultiplier),
          max: Math.round(targets.max * goalConfig.calorieMultiplier),
          target: Math.round(targets.target * goalConfig.calorieMultiplier)
        };
      };

      const pickBestRecipe = (recipes, targetCalories) => {
        if (!recipes || recipes.length === 0) return null;

        const scored = recipes.map(recipe => {
          const calories = recipe.calories || 0;
          const protein = recipe.macros?.protein || recipe.protein || 0;
          const calorieScore = calories ? Math.abs(calories - targetCalories) : targetCalories;
          const proteinScore = protein * goalConfig.proteinBoost;
          return { recipe, score: calorieScore - proteinScore };
        });

        scored.sort((a, b) => a.score - b.score);
        return scored[0].recipe;
      };

      const selectRecipeForMeal = (mealTypeKey) => {
        const mealTargets = getCalorieTargets(mealTypeKey);
        const mealRecipes = getMealTypeRecipes(allRecipes, mealTypeKey);

        const calorieFiltered = mealRecipes.filter(recipe => {
          const calories = recipe.calories;
          return typeof calories === 'number'
            && calories >= mealTargets.min
            && calories <= mealTargets.max;
        });

        const proteinFiltered = calorieFiltered.filter(recipe => {
          const protein = recipe.macros?.protein || recipe.protein || 0;
          return protein >= goalConfig.proteinMin;
        });

        const candidates = proteinFiltered.length
          ? proteinFiltered
          : calorieFiltered.length
            ? calorieFiltered
            : mealRecipes.length
              ? mealRecipes
              : allRecipes;

        return pickBestRecipe(candidates, mealTargets.target) || getRandomRecipe(allRecipes);
      };
      
      // Genereer weekmenu op basis van doelstellingen
      const generatedMenu = {};
      weekDays.forEach(day => {
        generatedMenu[day] = {};

        generatedMenu[day]['ontbijt'] = selectRecipeForMeal('breakfast');
        generatedMenu[day]['lunch'] = selectRecipeForMeal('lunch');
        generatedMenu[day]['diner'] = selectRecipeForMeal('dinner');
        generatedMenu[day]['snack'] = selectRecipeForMeal('snack');
      });
      
      setWeekMenu(generatedMenu);
      storage.saveWeekMenu(generatedMenu);
      notificationService.success('Weekmenu gegenereerd', 'Automatisch weekmenu is aangemaakt op basis van jouw doelen');
      
    } catch (error) {
      console.error('Error generating automatic menu:', error);
      notificationService.error('Fout bij genereren weekmenu', error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const getRandomRecipe = (recipes) => {
    if (!recipes || recipes.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * recipes.length);
    return recipes[randomIndex];
  };

  const getDummyRecipes = () => {
    return [
      {
        id: 'b1',
        title: 'Griekse Yoghurt met Fruit',
        description: 'Een proteïnerijke start van de dag met Griekse yoghurt en vers fruit',
        mealType: 'breakfast',
        tags: ['ontbijt', 'proteïnerijk'],
        image: 'https://source.unsplash.com/random/300x200/?greek,yogurt',
        calories: 280,
        macros: { protein: 20, carbs: 30, fat: 10 }
      },
      {
        id: 'b2',
        title: 'Havermout met Noten',
        description: 'Voedzame havermout met noten en honing voor langdurige energie',
        mealType: 'breakfast',
        tags: ['ontbijt', 'vezels'],
        image: 'https://source.unsplash.com/random/300x200/?oatmeal',
        calories: 350,
        macros: { protein: 12, carbs: 45, fat: 15 }
      },
      {
        id: 'b3',
        title: 'Eiwit Smoothie Bowl',
        description: 'Verfrissende smoothie bowl met proteïnepoeder en superfood toppings',
        mealType: 'breakfast',
        tags: ['ontbijt', 'proteïnerijk'],
        image: 'https://source.unsplash.com/random/300x200/?smoothie,bowl',
        calories: 320,
        macros: { protein: 25, carbs: 35, fat: 8 }
      },
      {
        id: 'l1',
        title: 'Quinoa Salade met Gegrilde Kip',
        description: 'Lichte quinoa salade met gegrilde kip en seizoensgroenten',
        mealType: 'lunch',
        tags: ['lunch', 'proteïnerijk'],
        image: 'https://source.unsplash.com/random/300x200/?quinoa,salad',
        calories: 420,
        macros: { protein: 28, carbs: 40, fat: 12 }
      },
      {
        id: 'l2',
        title: 'Volkoren Wrap met Hummus',
        description: 'Voedzame wrap met hummus, geroosterde groenten en feta',
        mealType: 'lunch',
        tags: ['lunch', 'vegetarisch'],
        image: 'https://source.unsplash.com/random/300x200/?wrap,hummus',
        calories: 380,
        macros: { protein: 15, carbs: 48, fat: 14 }
      },
      {
        id: 'l3',
        title: 'Japanse Miso Soep met Tofu',
        description: 'Lichte maar vullende miso soep met tofu, zeewier en paddenstoelen',
        mealType: 'lunch',
        tags: ['lunch', 'vegetarisch'],
        image: 'https://source.unsplash.com/random/300x200/?miso,soup',
        calories: 290,
        macros: { protein: 18, carbs: 25, fat: 12 }
      },
      {
        id: 'd1',
        title: 'Zalm met Zoete Aardappel',
        description: 'Gebakken zalm met geroosterde zoete aardappel en groene asperges',
        mealType: 'dinner',
        tags: ['diner', 'vis'],
        image: 'https://source.unsplash.com/random/300x200/?salmon,sweet,potato',
        calories: 520,
        macros: { protein: 35, carbs: 40, fat: 22 }
      },
      {
        id: 'd2',
        title: 'Kip Teriyaki met Bruine Rijst',
        description: 'Malse kip in teriyaki saus met bruine rijst en gestoomde broccoli',
        mealType: 'dinner',
        tags: ['diner', 'proteïnerijk'],
        image: 'https://source.unsplash.com/random/300x200/?chicken,teriyaki',
        calories: 580,
        macros: { protein: 40, carbs: 65, fat: 15 }
      },
      {
        id: 'd3',
        title: 'Vegetarische Chili',
        description: 'Hartige vegetarische chili met bonen, paprika en avocado',
        mealType: 'dinner',
        tags: ['diner', 'vegetarisch'],
        image: 'https://source.unsplash.com/random/300x200/?vegetarian,chili',
        calories: 450,
        macros: { protein: 22, carbs: 60, fat: 14 }
      },
      {
        id: 's1',
        title: 'Griekse Yoghurt met Honing',
        description: 'Eenvoudige Griekse yoghurt met een vleugje honing en walnoten',
        mealType: 'snack',
        tags: ['snack', 'proteïnerijk'],
        image: 'https://source.unsplash.com/random/300x200/?greek,yogurt,honey',
        calories: 180,
        macros: { protein: 15, carbs: 12, fat: 8 }
      },
      {
        id: 's2',
        title: 'Amandelen en Gedroogd Fruit',
        description: 'Mix van ongezouten amandelen en gedroogde abrikozen',
        mealType: 'snack',
        tags: ['snack', 'noten'],
        image: 'https://source.unsplash.com/random/300x200/?almonds,dried,fruit',
        calories: 160,
        macros: { protein: 6, carbs: 15, fat: 10 }
      },
      {
        id: 's3',
        title: 'Proteïne Balletjes',
        description: 'Huisgemaakte proteïne balletjes met dadels, noten en proteïnepoeder',
        mealType: 'snack',
        tags: ['snack', 'proteïnerijk'],
        image: 'https://source.unsplash.com/random/300x200/?protein,balls',
        calories: 150,
        macros: { protein: 10, carbs: 12, fat: 7 }
      }
    ];
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Weekmenu laden...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={loadWeekMenu} className="retry-button">Probeer opnieuw</button>
      </div>
    );
  }

  return (
    <div className="weekmenu-container">
      <div className="weekmenu-header">
        <h1>Jouw Weekmenu</h1>
        <div className="action-buttons">
          <button
            className="action-button generate-btn"
            onClick={generateAutomaticMenu}
            disabled={isGenerating}
          >
            {isGenerating ? 'Genereren...' : 'Automatisch weekmenu'}
          </button>
          <button
            className="action-button save-btn"
            onClick={() => setShowSaveModal(true)}
          >
            Weekmenu opslaan
          </button>
          <button
            className="action-button clear-btn"
            onClick={clearWeekMenu}
          >
            Weekmenu wissen
          </button>
        </div>
      </div>

      <div className="weekmenu-grid">
        <div className="weekmenu-row header-row">
          <div className="time-column"></div>
          {weekDays.map(day => (
            <div key={day} className="day-column">
              <h3 className="day-header">{day.charAt(0).toUpperCase() + day.slice(1)}</h3>
            </div>
          ))}
        </div>

        {mealTypes.map(mealType => (
          <div key={mealType} className="weekmenu-row">
            <div className="time-column">
              <h4 className="meal-type">{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h4>
            </div>
            
            {weekDays.map(day => {
              const recipe = weekMenu[day]?.[mealType];
              
              return (
                <div key={`${day}-${mealType}`} className="meal-cell">
                  {recipe ? (
                    <div className="meal-card">
                      <div className="meal-image-container">
                        <img 
                          src={recipe.image || "https://source.unsplash.com/random/300x200/?food"} 
                          alt={recipe.title} 
                          className="meal-image" 
                        />
                      </div>
                      <div className="meal-info">
                        <h5 className="meal-title">{recipe.title}</h5>
                        {recipe.calories && (
                          <p className="meal-calories">{recipe.calories} kcal</p>
                        )}
                        <div className="meal-actions">
                          <button 
                            className="meal-action view-btn"
                            onClick={() => openRecipeDetails(recipe)}
                            aria-label="Bekijk recept"
                            title="Bekijk recept"
                          >
                            👁️
                          </button>
                          <button 
                            className="meal-action remove-btn"
                            onClick={() => removeRecipeFromMenu(day, mealType)}
                            aria-label="Verwijder recept"
                            title="Verwijder recept"
                          >
                            ❌
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link to="/recepten" className="empty-meal">
                      <span className="add-icon">+</span>
                      <span className="add-text">Voeg een recept toe</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {savedMenus.length > 0 && (
        <div className="saved-menus-section">
          <h2>Opgeslagen weekmenu's</h2>
          <div className="saved-menus-list">
            {savedMenus.map(menu => (
              <div key={menu.id} className="saved-menu-card">
                <h3 className="saved-menu-title">{menu.name}</h3>
                <p className="saved-menu-date">
                  Opgeslagen op: {new Date(menu.createdAt).toLocaleDateString()}
                </p>
                <div className="saved-menu-actions">
                  <button 
                    className="saved-menu-action load-btn"
                    onClick={() => loadSavedMenu(menu)}
                  >
                    Laden
                  </button>
                  <button 
                    className="saved-menu-action delete-btn"
                    onClick={() => deleteSavedMenu(menu.id, menu.name)}
                  >
                    Verwijderen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Menu Modal */}
      {showSaveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Weekmenu opslaan</h3>
            <p>Geef je weekmenu een naam om het op te slaan</p>
            <div className="modal-form">
              <input
                type="text"
                value={newMenuName}
                onChange={(e) => setNewMenuName(e.target.value)}
                placeholder="Bijv. Sportweek of Vakantie"
              />
              <div className="modal-buttons">
                <button 
                  className="modal-btn cancel-btn"
                  onClick={() => setShowSaveModal(false)}
                >
                  Annuleren
                </button>
                <button 
                  className="modal-btn save-btn"
                  onClick={saveMenu}
                >
                  Opslaan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeekMenu;
