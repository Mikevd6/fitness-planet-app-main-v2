import ActionButton from '../ui/ActionButton';

const SavedRecipeCard = ({ recipe, onRemove }) => (
  <article className="saved-recipe">
    <img
      src={recipe.image || '/images/recipes/default-recipe.jpg'}
      alt={recipe.title}
      className="saved-recipe__image"
    />
    <div className="saved-recipe__details">
      <h3>{recipe.title}</h3>
      <p>{recipe.source || 'Opgeslagen recept'}</p>
      <div className="saved-recipe__meta">
        <span>{recipe.caloriesPerServing || recipe.calories} kcal</span>
        <span>{recipe.prepTime || 15} min</span>
      </div>
      {recipe.url && (
        <a href={recipe.url} target="_blank" rel="noreferrer" className="saved-recipe__link">
          Bekijk recept
        </a>
      )}
    </div>
    <ActionButton
      className="saved-recipe__remove"
      onClick={() => onRemove(recipe.id)}
      label="Verwijderen"
    />
  </article>
);

export default SavedRecipeCard;
