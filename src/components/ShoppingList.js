import React, { useState, useEffect, useRef } from 'react';
import { storage } from '../utils/localStorage';
import { notificationService } from '../utils/notificationService';
import html2pdf from 'html2pdf.js';
import '../styles/ShoppingList.css';

const ShoppingList = () => {
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const shoppingListRef = useRef(null);

  useEffect(() => {
    loadShoppingList();
  }, []);

  const loadShoppingList = () => {
    setLoading(true);
    try {
      // Haal de boodschappenlijst op uit localStorage
      const savedShoppingList = storage.getShoppingList();
      if (savedShoppingList && savedShoppingList.length > 0) {
        setShoppingList(savedShoppingList);
      } else {
        setShoppingList([]);
      }
      setError(null);
    } catch (error) {
      console.error('Error loading shopping list:', error);
      setError('Er is een fout opgetreden bij het laden van de boodschappenlijst');
      notificationService.error('Fout bij laden boodschappenlijst', error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateShoppingList = async () => {
    setIsGenerating(true);
    try {
      // Haal het weekmenu op uit localStorage
      const weekMenu = storage.getWeekMenu();
      
      // Als er geen weekmenu is, toon een melding
      if (!weekMenu || Object.keys(weekMenu).length === 0) {
        notificationService.warning('Geen weekmenu gevonden', 'Maak eerst een weekmenu om een boodschappenlijst te genereren');
        return;
      }

      // Extraheer alle recepten uit het weekmenu
      const allRecipes = [];
      Object.keys(weekMenu).forEach(day => {
        if (weekMenu[day] && weekMenu[day].length > 0) {
          weekMenu[day].forEach(meal => {
            if (meal.recipe) {
              allRecipes.push(meal.recipe);
            }
          });
        }
      });

      // Als er geen recepten zijn gevonden, toon een melding
      if (allRecipes.length === 0) {
        notificationService.warning('Geen recepten gevonden', 'Voeg recepten toe aan je weekmenu');
        return;
      }

      // Extracteer en combineer ingrediënten
      const ingredientMap = new Map();
      
      allRecipes.forEach(recipe => {
        if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
          recipe.ingredients.forEach(ingredient => {
            // Veronderstelt dat ingrediënten een naam en hoeveelheid hebben
            const name = ingredient.name || ingredient;
            const amount = ingredient.amount || '';
            const unit = ingredient.unit || '';
            
            if (ingredientMap.has(name)) {
              // Als het ingrediënt al bestaat, voeg de hoeveelheid toe (als het numeriek is)
              const existing = ingredientMap.get(name);
              if (!isNaN(parseFloat(existing.amount)) && !isNaN(parseFloat(amount))) {
                existing.amount = (parseFloat(existing.amount) + parseFloat(amount)).toString();
              } else {
                // Als niet numeriek, concatenate de waardes
                existing.amount = `${existing.amount}, ${amount}`;
              }
            } else {
              ingredientMap.set(name, { name, amount, unit, checked: false });
            }
          });
        } else if (recipe.ingredients && typeof recipe.ingredients === 'string') {
          // Als ingrediënten een string is, splits het op komma's
          const ingredientsList = recipe.ingredients.split(',').map(i => i.trim());
          ingredientsList.forEach(name => {
            if (!ingredientMap.has(name)) {
              ingredientMap.set(name, { name, amount: '', unit: '', checked: false });
            }
          });
        }
      });
      
      // Zet de Map om naar een array
      const newShoppingList = Array.from(ingredientMap.values());
      
      // Sorteer op categorieën (voorbeeldimplementatie)
      const categorizedList = categorizeIngredients(newShoppingList);
      
      // Update state en sla op in localStorage
      setShoppingList(categorizedList);
      storage.setShoppingList(categorizedList);
      
      notificationService.success('Boodschappenlijst gegenereerd', `${categorizedList.length} ingrediënten toegevoegd`);
    } catch (error) {
      console.error('Error generating shopping list:', error);
      notificationService.error('Fout bij genereren boodschappenlijst', error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const categorizeIngredients = (ingredients) => {
    // Eenvoudige categorisatie (in een echte app zou dit uitgebreider zijn)
    const categories = {
      'Groenten & Fruit': ['appel', 'banaan', 'tomaat', 'sla', 'ui', 'wortel', 'paprika', 'komkommer'],
      'Vlees & Vis': ['kip', 'rund', 'varken', 'zalm', 'tonijn', 'gehakt', 'filet'],
      'Zuivel': ['melk', 'kaas', 'yoghurt', 'boter', 'room'],
      'Droogwaren': ['pasta', 'rijst', 'meel', 'suiker', 'zout', 'peper', 'kruiden'],
      'Overig': []
    };
    
    // Categoriseer ingrediënten
    return ingredients.map(ingredient => {
      const name = ingredient.name.toLowerCase();
      let category = 'Overig';
      
      for (const [cat, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => name.includes(keyword))) {
          category = cat;
          break;
        }
      }
      
      return { ...ingredient, category };
    }).sort((a, b) => {
      // Sorteer eerst op categorie, dan op naam
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
  };

  const toggleItemChecked = (index) => {
    const updatedList = [...shoppingList];
    updatedList[index].checked = !updatedList[index].checked;
    setShoppingList(updatedList);
    storage.setShoppingList(updatedList);
  };

  const removeItem = (index) => {
    const updatedList = [...shoppingList];
    updatedList.splice(index, 1);
    setShoppingList(updatedList);
    storage.setShoppingList(updatedList);
    notificationService.info('Item verwijderd');
  };

  const clearList = () => {
    if (window.confirm('Weet je zeker dat je de hele boodschappenlijst wilt wissen?')) {
      setShoppingList([]);
      storage.setShoppingList([]);
      notificationService.info('Boodschappenlijst gewist');
    }
  };

  const printList = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
  };

  const downloadAsPdf = () => {
    const element = shoppingListRef.current;
    const filename = `boodschappenlijst_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
    
    const opt = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    notificationService.info('PDF wordt gegenereerd...', 'Even geduld a.u.b.');
    
    html2pdf().from(element).set(opt).save()
      .then(() => {
        notificationService.success('PDF gedownload', `Bestand: ${filename}`);
      })
      .catch((error) => {
        console.error('Error generating PDF:', error);
        notificationService.error('Fout bij genereren PDF', error.message);
      });
  };

  const addCustomItem = (event) => {
    event.preventDefault();
    const form = event.target;
    const name = form.itemName.value;
    const amount = form.itemAmount.value;
    const unit = form.itemUnit.value;
    
    if (!name.trim()) return;
    
    const newItem = {
      name: name.trim(),
      amount: amount.trim(),
      unit: unit.trim(),
      checked: false,
      category: 'Overig'
    };
    
    const updatedList = [...shoppingList, newItem];
    const categorizedList = categorizeIngredients(updatedList);
    
    setShoppingList(categorizedList);
    storage.setShoppingList(categorizedList);
    notificationService.success('Item toegevoegd');
    
    form.reset();
  };

  const renderShoppingList = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Boodschappenlijst laden...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={loadShoppingList} className="retry-button">Probeer opnieuw</button>
        </div>
      );
    }

    if (shoppingList.length === 0) {
      return (
        <div className="empty-list">
          <div className="empty-icon">🛒</div>
          <h3>Je boodschappenlijst is leeg</h3>
          <p>Genereer een boodschappenlijst op basis van je weekmenu of voeg handmatig items toe.</p>
        </div>
      );
    }

    // Groepeer items per categorie
    const categorizedItems = shoppingList.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    return (
      <div className="shopping-list" ref={shoppingListRef}>
        <div className="list-header">
          <h2>Boodschappenlijst</h2>
          <p>Gegenereerd op: {new Date().toLocaleDateString()}</p>
        </div>
        
        {Object.entries(categorizedItems).map(([category, items]) => (
          <div key={category} className="category-section">
            <h3 className="category-title">{category}</h3>
            <ul className="item-list">
              {items.map((item, index) => {
                const actualIndex = shoppingList.findIndex(i => 
                  i.name === item.name && i.amount === item.amount && i.category === item.category
                );
                
                return (
                  <li 
                    key={`${item.name}-${index}`} 
                    className={`list-item ${item.checked ? 'checked' : ''}`}
                  >
                    <div className="item-checkbox-container">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleItemChecked(actualIndex)}
                        className="item-checkbox"
                        id={`item-${actualIndex}`}
                      />
                      <label htmlFor={`item-${actualIndex}`} className="checkbox-label">
                        <span className="checkbox-custom"></span>
                      </label>
                    </div>
                    
                    <div className="item-details">
                      <span className="item-name">{item.name}</span>
                      {(item.amount || item.unit) && (
                        <span className="item-quantity">
                          {item.amount} {item.unit}
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => removeItem(actualIndex)}
                      className="remove-item-btn"
                      aria-label="Verwijder item"
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`shopping-list-container ${isPrinting ? 'printing' : ''}`}>
      <div className="shopping-list-content">
        <div className="shopping-list-header">
          <h1>Boodschappenlijst</h1>
          <div className="action-buttons">
            <button
              onClick={generateShoppingList}
              className="action-button generate-btn"
              disabled={isGenerating}
            >
              {isGenerating ? 'Genereren...' : 'Genereer vanuit weekmenu'}
            </button>
            <button
              onClick={printList}
              className="action-button print-btn"
              disabled={shoppingList.length === 0}
            >
              Afdrukken
            </button>
            <button
              onClick={downloadAsPdf}
              className="action-button download-btn"
              disabled={shoppingList.length === 0}
            >
              Download PDF
            </button>
            <button
              onClick={clearList}
              className="action-button clear-btn"
              disabled={shoppingList.length === 0}
            >
              Wis alles
            </button>
          </div>
        </div>
        
        <div className="add-item-form-container">
          <h2>Voeg item toe</h2>
          <form onSubmit={addCustomItem} className="add-item-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="itemName">Product</label>
                <input 
                  type="text" 
                  id="itemName" 
                  name="itemName" 
                  required 
                  placeholder="bijv. Appels"
                />
              </div>
              <div className="form-group">
                <label htmlFor="itemAmount">Hoeveelheid</label>
                <input 
                  type="text" 
                  id="itemAmount" 
                  name="itemAmount" 
                  placeholder="bijv. 5"
                />
              </div>
              <div className="form-group">
                <label htmlFor="itemUnit">Eenheid</label>
                <input 
                  type="text" 
                  id="itemUnit" 
                  name="itemUnit" 
                  placeholder="bijv. stuks"
                />
              </div>
              <button type="submit" className="add-item-btn">Toevoegen</button>
            </div>
          </form>
        </div>
        
        {renderShoppingList()}
      </div>
    </div>
  );
};

export default ShoppingList;