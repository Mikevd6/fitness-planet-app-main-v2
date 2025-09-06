// Calorie and Macro Calculator using Mifflin-St Jeor Equation
class CalorieCalculator {
  // Activity level multipliers
  static ACTIVITY_LEVELS = {
    sedentary: 1.2,        // Little/no exercise
    light: 1.375,          // Light exercise 1-3 days/week
    moderate: 1.55,        // Moderate exercise 3-5 days/week
    active: 1.725,         // Hard exercise 6-7 days/week
    veryActive: 1.9        // Very hard exercise, physical job
  };

  // Goal adjustments
  static GOAL_ADJUSTMENTS = {
    maintain: 0,           // Maintain current weight
    lose: -500,            // Lose weight (1 lb/week = 500 cal deficit)
    gain: 500,             // Gain weight (1 lb/week = 500 cal surplus)
    loseFast: -750,        // Lose weight faster (1.5 lb/week)
    gainFast: 750          // Gain weight faster (1.5 lb/week)
  };

  // Macro distribution presets
  static MACRO_PRESETS = {
    balanced: { protein: 25, carbs: 45, fat: 30 },
    highProtein: { protein: 35, carbs: 35, fat: 30 },
    lowCarb: { protein: 30, carbs: 20, fat: 50 },
    lowFat: { protein: 25, carbs: 60, fat: 15 },
    keto: { protein: 25, carbs: 5, fat: 70 },
    athlete: { protein: 20, carbs: 55, fat: 25 }
  };

  /**
   * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
   * @param {Object} params - User parameters
   * @param {number} params.weight - Weight in kg
   * @param {number} params.height - Height in cm
   * @param {number} params.age - Age in years
   * @param {string} params.gender - 'male' or 'female'
   * @returns {number} BMR in calories
   */
  static calculateBMR({ weight, height, age, gender }) {
    if (!weight || !height || !age || !gender) {
      throw new Error('Missing required parameters for BMR calculation');
    }

    // Mifflin-St Jeor Equation
    // Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
    // Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
    
    const baseBMR = (10 * weight) + (6.25 * height) - (5 * age);
    
    if (gender.toLowerCase() === 'male') {
      return Math.round(baseBMR + 5);
    } else if (gender.toLowerCase() === 'female') {
      return Math.round(baseBMR - 161);
    } else {
      throw new Error('Gender must be either "male" or "female"');
    }
  }

  /**
   * Calculate Total Daily Energy Expenditure (TDEE)
   * @param {Object} params - User parameters
   * @param {string} params.activityLevel - Activity level key
   * @returns {number} TDEE in calories
   */
  static calculateTDEE(userParams) {
    const { activityLevel, ...bmrParams } = userParams;
    
    if (!activityLevel || !this.ACTIVITY_LEVELS[activityLevel]) {
      throw new Error('Invalid activity level');
    }

    const bmr = this.calculateBMR(bmrParams);
    const tdee = Math.round(bmr * this.ACTIVITY_LEVELS[activityLevel]);
    
    return tdee;
  }

  /**
   * Calculate daily calorie goal based on fitness goal
   * @param {Object} params - User parameters including goal
   * @returns {number} Daily calorie goal
   */
  static calculateCalorieGoal(userParams) {
    const { goal, ...tdeeParams } = userParams;
    
    if (!goal || this.GOAL_ADJUSTMENTS[goal] === undefined) {
      throw new Error('Invalid fitness goal');
    }

    const tdee = this.calculateTDEE(tdeeParams);
    const calorieGoal = Math.round(tdee + this.GOAL_ADJUSTMENTS[goal]);
    
    // Ensure minimum calorie intake (1200 for women, 1500 for men)
    const minCalories = userParams.gender.toLowerCase() === 'female' ? 1200 : 1500;
    
    return Math.max(calorieGoal, minCalories);
  }

  /**
   * Calculate macro targets based on calorie goal and distribution
   * @param {number} calorieGoal - Daily calorie goal
   * @param {Object} macroDistribution - Macro percentages
   * @returns {Object} Macro targets in grams
   */
  static calculateMacroTargets(calorieGoal, macroDistribution = this.MACRO_PRESETS.balanced) {
    const { protein, carbs, fat } = macroDistribution;
    
    // Validate percentages add up to 100
    if (protein + carbs + fat !== 100) {
      throw new Error('Macro percentages must add up to 100');
    }

    // Calculate calories for each macro
    const proteinCalories = (calorieGoal * protein) / 100;
    const carbCalories = (calorieGoal * carbs) / 100;
    const fatCalories = (calorieGoal * fat) / 100;

    // Convert to grams (protein: 4 cal/g, carbs: 4 cal/g, fat: 9 cal/g)
    return {
      protein: Math.round(proteinCalories / 4),
      carbs: Math.round(carbCalories / 4),
      fat: Math.round(fatCalories / 9),
      calories: {
        protein: Math.round(proteinCalories),
        carbs: Math.round(carbCalories),
        fat: Math.round(fatCalories),
        total: calorieGoal
      }
    };
  }

  /**
   * Calculate complete nutrition plan for a user
   * @param {Object} userProfile - Complete user profile
   * @returns {Object} Complete nutrition plan
   */
  static calculateNutritionPlan(userProfile) {
    const {
      weight,
      height,
      age,
      gender,
      activityLevel,
      goal,
      macroPreset = 'balanced',
      customMacros = null
    } = userProfile;

    try {
      // Calculate calorie goal
      const calorieGoal = this.calculateCalorieGoal({
        weight,
        height,
        age,
        gender,
        activityLevel,
        goal
      });

      // Calculate BMR and TDEE for reference
      const bmr = this.calculateBMR({ weight, height, age, gender });
      const tdee = this.calculateTDEE({ weight, height, age, gender, activityLevel });

      // Determine macro distribution
      const macroDistribution = customMacros || this.MACRO_PRESETS[macroPreset] || this.MACRO_PRESETS.balanced;

      // Calculate macro targets
      const macroTargets = this.calculateMacroTargets(calorieGoal, macroDistribution);

      return {
        success: true,
        plan: {
          bmr,
          tdee,
          calorieGoal,
          macroTargets,
          macroDistribution,
          weeklyGoal: this.getWeeklyGoalDescription(goal),
          recommendations: this.getRecommendations(userProfile, calorieGoal)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get weekly goal description
   * @param {string} goal - Fitness goal
   * @returns {string} Description
   */
  static getWeeklyGoalDescription(goal) {
    const descriptions = {
      maintain: 'Maintain current weight',
      lose: 'Lose 0.5 kg (1 lb) per week',
      gain: 'Gain 0.5 kg (1 lb) per week',
      loseFast: 'Lose 0.75 kg (1.5 lbs) per week',
      gainFast: 'Gain 0.75 kg (1.5 lbs) per week'
    };
    
    return descriptions[goal] || 'Maintain current weight';
  }

  /**
   * Get personalized recommendations
   * @param {Object} userProfile - User profile
   * @param {number} calorieGoal - Daily calorie goal
   * @returns {Array} Array of recommendations
   */
  static getRecommendations(userProfile, calorieGoal) {
    const recommendations = [];
    const { goal, activityLevel, age, gender } = userProfile;

    // Goal-specific recommendations
    if (goal === 'lose' || goal === 'loseFast') {
      recommendations.push('Focus on lean proteins and vegetables to feel fuller with fewer calories');
      recommendations.push('Consider strength training to preserve muscle mass during weight loss');
      recommendations.push('Stay hydrated - drink at least 8 glasses of water daily');
    } else if (goal === 'gain' || goal === 'gainFast') {
      recommendations.push('Include healthy fats like nuts, avocados, and olive oil for calorie-dense nutrition');
      recommendations.push('Eat frequently - aim for 5-6 smaller meals throughout the day');
      recommendations.push('Focus on strength training to build lean muscle mass');
    }

    // Activity level recommendations
    if (activityLevel === 'sedentary') {
      recommendations.push('Consider adding light exercise like walking to boost metabolism');
      recommendations.push('Take regular breaks from sitting to improve overall health');
    } else if (activityLevel === 'veryActive') {
      recommendations.push('Ensure adequate post-workout nutrition for recovery');
      recommendations.push('Consider timing carbohydrates around your workouts');
    }

    // Age-specific recommendations
    if (age >= 50) {
      recommendations.push('Focus on calcium and vitamin D for bone health');
      recommendations.push('Include adequate protein to maintain muscle mass');
    }

    // Gender-specific recommendations
    if (gender.toLowerCase() === 'female') {
      recommendations.push('Ensure adequate iron intake, especially if pre-menopausal');
      recommendations.push('Consider calcium needs for bone health');
    }

    // Calorie-specific recommendations
    if (calorieGoal < 1500) {
      recommendations.push('Consider a multivitamin to ensure nutrient needs are met');
      recommendations.push('Focus on nutrient-dense foods to maximize nutrition');
    }

    return recommendations;
  }

  /**
   * Calculate calories needed for meal planning
   * @param {number} dailyCalories - Total daily calories
   * @param {string} mealType - breakfast, lunch, dinner, snack
   * @returns {Object} Calorie ranges for the meal
   */
  static getMealCalorieTargets(dailyCalories, mealType) {
    const distributions = {
      breakfast: { min: 0.20, max: 0.25 },
      lunch: { min: 0.25, max: 0.35 },
      dinner: { min: 0.30, max: 0.40 },
      snack: { min: 0.05, max: 0.15 }
    };

    const distribution = distributions[mealType] || distributions.snack;
    
    return {
      min: Math.round(dailyCalories * distribution.min),
      max: Math.round(dailyCalories * distribution.max),
      target: Math.round(dailyCalories * ((distribution.min + distribution.max) / 2))
    };
  }

  /**
   * Calculate weekly calorie distribution for meal planning
   * @param {number} dailyCalories - Target daily calories
   * @returns {Object} Weekly meal calorie targets
   */
  static getWeeklyMealTargets(dailyCalories) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    
    const weeklyTargets = {};
    
    days.forEach(day => {
      weeklyTargets[day] = {};
      mealTypes.forEach(mealType => {
        weeklyTargets[day][mealType] = this.getMealCalorieTargets(dailyCalories, mealType);
      });
    });

    return weeklyTargets;
  }
}

export default CalorieCalculator;
