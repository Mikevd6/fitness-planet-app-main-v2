const React = require('react');
const { renderHook, act } = require('@testing-library/react');
const { MealPlanProvider, useMealPlan } = require('../contexts/MealPlanContext');

const wrapper = ({ children }) => React.createElement(MealPlanProvider, null, children);

describe('MealPlanContext', () => {
  test('addMeal and removeMeal modify state', () => {
    const { result } = renderHook(() => useMealPlan(), { wrapper });

    act(() => {
      result.current.addMeal('Maandag', 'Ontbijt', { id:1, title:'Havermout', calories:300 });
    });
    expect(result.current.weekMenu['Maandag']['Ontbijt'][0].title).toBe('Havermout');

    act(() => {
      result.current.removeMeal('Maandag', 'Ontbijt', 0);
    });

    expect(result.current.weekMenu['Maandag']['Ontbijt'].length).toBe(0);
  });
});
