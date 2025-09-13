import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { MealPlanProvider, useMealPlan } from '../contexts/MealPlanContext';

const wrapper = ({ children }) => <MealPlanProvider>{children}</MealPlanProvider>;

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
