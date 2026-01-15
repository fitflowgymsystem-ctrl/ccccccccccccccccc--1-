import { User, InBodyMeasurement, ActivityLevel, FitnessGoalType, CalorieCalculation, Gender } from '../types';
import { apiClient } from './apiClient';
import { load, save, getCurrentGymId } from './storage';

/**
 * Add a new InBody measurement for a user
 */
export const addInBodyMeasurement = async (userId: number, measurement: Omit<InBodyMeasurement, 'id'>): Promise<void> => {
    const users = load<User[]>('users', []);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) throw new Error('User not found');

    const newMeasurement: InBodyMeasurement = {
        ...measurement,
        id: Date.now()
    };

    if (!users[userIndex].inbodyMeasurements) {
        users[userIndex].inbodyMeasurements = [];
    }

    users[userIndex].inbodyMeasurements.push(newMeasurement);

    // Update latest weight and fat percentage on user profile
    users[userIndex].weight = measurement.weight;
    users[userIndex].fatPercentage = measurement.fatPercentage;

    save('users', users);

    // Sync with API
    try {
        await apiClient.post('/users', users[userIndex]);
    } catch (error) {
        console.error('Failed to sync InBody measurement with API:', error);
    }
};

/**
 * Update an existing InBody measurement
 */
export const updateInBodyMeasurement = async (userId: number, measurement: InBodyMeasurement): Promise<void> => {
    const users = load<User[]>('users', []);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) throw new Error('User not found');
    if (!users[userIndex].inbodyMeasurements) throw new Error('No measurements found');

    const measurementIndex = users[userIndex].inbodyMeasurements.findIndex(m => m.id === measurement.id);
    if (measurementIndex === -1) throw new Error('Measurement not found');

    users[userIndex].inbodyMeasurements[measurementIndex] = measurement;

    save('users', users);

    try {
        await apiClient.post('/users', users[userIndex]);
    } catch (error) {
        console.error('Failed to sync InBody measurement update with API:', error);
    }
};

/**
 * Delete an InBody measurement
 */
export const deleteInBodyMeasurement = async (userId: number, measurementId: number): Promise<void> => {
    const users = load<User[]>('users', []);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) throw new Error('User not found');
    if (!users[userIndex].inbodyMeasurements) throw new Error('No measurements found');

    users[userIndex].inbodyMeasurements = users[userIndex].inbodyMeasurements.filter(m => m.id !== measurementId);

    save('users', users);

    try {
        await apiClient.post('/users', users[userIndex]);
    } catch (error) {
        console.error('Failed to sync InBody measurement deletion with API:', error);
    }
};

/**
 * Update user's activity level and fitness goal
 */
export const updateUserFitnessSettings = async (
    userId: number,
    activityLevel: ActivityLevel,
    fitnessGoalType: FitnessGoalType
): Promise<void> => {
    const users = load<User[]>('users', []);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) throw new Error('User not found');

    users[userIndex].activityLevel = activityLevel;
    users[userIndex].fitnessGoalType = fitnessGoalType;

    save('users', users);

    try {
        await apiClient.post('/users', users[userIndex]);
    } catch (error) {
        console.error('Failed to sync fitness settings with API:', error);
    }
};

/**
 * Activity level multipliers for TDEE calculation
 */
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
    sedentary: 1.2,    // Little or no exercise
    light: 1.375,       // Light exercise 1-3 days/week
    moderate: 1.55,     // Moderate exercise 3-5 days/week
    active: 1.725,      // Heavy exercise 6-7 days/week
    extra: 1.9          // Very heavy exercise, physical job
};

/**
 * Calorie adjustments based on fitness goal
 */
const GOAL_ADJUSTMENTS: Record<FitnessGoalType, number> = {
    maintain: 0,
    lose_slow: -250,    // ~0.5 kg/week loss
    lose_fast: -500,    // ~1 kg/week loss
    gain_slow: 250,     // ~0.5 kg/week gain
    gain_fast: 500      // ~1 kg/week gain
};

/**
 * Calculate BMR using Mifflin-St Jeor equation (most accurate for most people)
 */
export const calculateBMR = (
    weight: number,     // kg
    height: number,     // cm
    age: number,        // years
    gender: Gender
): number => {
    // Mifflin-St Jeor Equation
    const baseBMR = (10 * weight) + (6.25 * height) - (5 * age);

    if (gender === Gender.MALE) {
        return Math.round(baseBMR + 5);
    } else {
        return Math.round(baseBMR - 161);
    }
};

/**
 * Calculate full calorie breakdown based on InBody data
 */
export const calculateCalories = (
    weight: number,
    height: number,
    age: number,
    gender: Gender,
    activityLevel: ActivityLevel = 'moderate',
    fitnessGoal: FitnessGoalType = 'maintain',
    fatPercentage?: number,
    basalMetabolicRate?: number // If provided from InBody machine
): CalorieCalculation => {
    // Use InBody machine's BMR if available, otherwise calculate
    let bmr = basalMetabolicRate;

    if (!bmr) {
        // Use Katch-McArdle formula if we have fat percentage (more accurate)
        if (fatPercentage && fatPercentage > 0) {
            const leanBodyMass = weight * (1 - fatPercentage / 100);
            bmr = Math.round(370 + (21.6 * leanBodyMass));
        } else {
            bmr = calculateBMR(weight, height, age, gender);
        }
    }

    // Calculate TDEE (Total Daily Energy Expenditure)
    const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);

    // Adjust for fitness goal
    const targetCalories = Math.max(1200, tdee + GOAL_ADJUSTMENTS[fitnessGoal]);

    // Calculate macros (using balanced approach)
    // Protein: 2g per kg of bodyweight for active individuals
    // Fat: 25% of calories
    // Carbs: remaining calories
    const protein = Math.round(weight * 2);
    const proteinCalories = protein * 4;

    const fatCalories = Math.round(targetCalories * 0.25);
    const fats = Math.round(fatCalories / 9);

    const carbCalories = targetCalories - proteinCalories - fatCalories;
    const carbs = Math.round(carbCalories / 4);

    return {
        bmr,
        tdee,
        targetCalories,
        protein,
        carbs,
        fats
    };
};

/**
 * Get the latest InBody measurement for a user
 */
export const getLatestMeasurement = (user: User): InBodyMeasurement | null => {
    if (!user.inbodyMeasurements || user.inbodyMeasurements.length === 0) {
        return null;
    }

    // Sort by date descending and return the first one
    const sorted = [...user.inbodyMeasurements].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return sorted[0];
};

/**
 * Get measurement progress (comparing latest to first measurement)
 */
export const getMeasurementProgress = (user: User): {
    weightChange: number;
    fatChange: number;
    muscleChange: number;
    totalMeasurements: number;
} | null => {
    if (!user.inbodyMeasurements || user.inbodyMeasurements.length < 2) {
        return null;
    }

    const sorted = [...user.inbodyMeasurements].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const first = sorted[0];
    const latest = sorted[sorted.length - 1];

    return {
        weightChange: Number((latest.weight - first.weight).toFixed(1)),
        fatChange: Number((latest.fatPercentage - first.fatPercentage).toFixed(1)),
        muscleChange: Number((latest.muscleMass - first.muscleMass).toFixed(1)),
        totalMeasurements: sorted.length
    };
};
