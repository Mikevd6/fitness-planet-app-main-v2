import EmptyState from '../ui/EmptyState';
import SavedRecipeCard from './SavedRecipeCard';
import './SavedRecipeList.css';

const SavedRecipeList = ({ recipes, onRemoveRecipe }) => {
  if (recipes.length === 0) {
    return (
      <EmptyState
        className="profile-settings__empty"
        message="Je hebt nog geen recepten opgeslagen. Ga naar Recepten om een favoriet te bewaren."
      />
    );
  }

  return (
    <div className="profile-settings__recipes">
      {recipes.map((recipe) => (
        <SavedRecipeCard key={recipe.id} recipe={recipe} onRemove={onRemoveRecipe} />
      ))}
    </div>
  );
};

export default SavedRecipeList;
