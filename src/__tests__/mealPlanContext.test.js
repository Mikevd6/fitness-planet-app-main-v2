import React from 'react';
import { renderHook } from '@testing-library/react';
import { MealPlanProvider, useMealPlan } from '../contexts/MealPlanContext';

test('meal plan context provides default state', () => {
  const wrapper = ({ children }) => <MealPlanProvider>{children}</MealPlanProvider>;
  const { result } = renderHook(() => useMealPlan(), { wrapper });

  expect(result.current.weekMenu).toEqual({});
  expect(result.current.loading).toBe(false);
});
