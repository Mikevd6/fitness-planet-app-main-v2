import React from 'react';
import { useMealPlan } from '../contexts/MealPlanContext';
import '../styles/MealPlan.css';

const MealPlanPage = () => {
	const { weekMenu } = useMealPlan();
	const days = Object.keys(weekMenu || {});

	return (
		<div className="meal-plan-page">
			<h1>Maaltijdplan</h1>
			{days.length === 0 ? (
				<p>Nog geen maaltijden gepland.</p>
			) : (
				<ul className="week-menu">
					{days.map(day => (
						<li key={day}>
							<h3>{day}</h3>
							<pre>{JSON.stringify(weekMenu[day], null, 2)}</pre>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default MealPlanPage;

