import React, { useState } from 'react';
import { useMealPlan } from '../contexts/MealPlanContext';
import AddMealModal from './AddMealModal';
import '../styles/MealPlan.css';

const MEAL_SLOTS = ['Ontbijt', 'Lunch', 'Diner', 'Snack'];

const MealPlanPage = () => {
		const { weekMenu, addMeal, removeMeal } = useMealPlan();
	const days = Object.keys(weekMenu || {});
		const [modalOpen, setModalOpen] = useState(false);
		const [selected, setSelected] = useState({ day: '', slot: '' });

		const openAdd = (day, slot) => {
			setSelected({ day, slot });
			setModalOpen(true);
		};

		const handleSaveMeal = (meal) => {
			addMeal(selected.day, selected.slot, meal);
			setModalOpen(false);
		};

	return (
		<div className="page meal-plan-page">
			<div className="page-header">
				<div>
					<h1 className="page-title">Maaltijdplan</h1>
					<p className="page-subtitle">Overzicht van je geplande maaltijden per dag.</p>
				</div>
			</div>

			{days.length === 0 ? (
				<div className="panel empty-meal-plan">Nog geen maaltijden gepland.</div>
			) : (
				<div className="panel meal-plan-wrapper">
					<div className="meal-plan-grid" role="table" aria-label="Week overzicht maaltijden">
						<div className="grid-header" role="row">
							<div className="corner" />
							{days.map(day => (
								<div key={day} className="day-col" role="columnheader">{day}</div>
							))}
						</div>
						{MEAL_SLOTS.map(slot => (
							<div key={slot} className="meal-row" role="row" aria-label={slot}>
								<div className="slot-header" role="rowheader">{slot}</div>
								{days.map(day => {
									const dayMeals = weekMenu[day] || {};
									const slotMeals = dayMeals[slot] || [];
									return (
										<div key={day+slot} className="meal-cell" role="cell">
											{slotMeals.length === 0 ? (
																		<button className="add-meal-btn" type="button" aria-label={`Voeg ${slot} toe voor ${day}`} onClick={()=> openAdd(day, slot)}>+</button>
											) : (
												<ul className="meal-list">
																			{slotMeals.map((m,i) => (
																				<li key={i} className="meal-item">
																					<span className="meal-title">{m.title || m.name || 'Maaltijd'}</span>
																					<div className="meal-right">
																						{m.calories && <span className="meal-kcal">{m.calories} kcal</span>}
																						<button type="button" className="remove-meal-btn" aria-label="Verwijder" onClick={()=> removeMeal(day, slot, i)}>×</button>
																					</div>
																				</li>
																			))}
												</ul>
											)}
										</div>
									);
								})}
							</div>
						))}
					</div>
				</div>
			)}
									<AddMealModal isOpen={modalOpen} onClose={()=> setModalOpen(false)} onSave={handleSaveMeal} day={selected.day} mealType={selected.slot} />
		</div>
	);
};

export default MealPlanPage;

