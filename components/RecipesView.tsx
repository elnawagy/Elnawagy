
import React, { useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useSystem } from '../hooks/useSystem';
import type { Recipe, MenuItem, RecipeIngredient, InventoryItem } from '../types';
import { PlusIcon } from './icons';
import { Modal } from './Modal';
import { useNotifications } from '../hooks/useNotifications';
import { RecipeEditorModal } from './RecipeEditorModal';

// --- Helper Functions ---
const CONVERSION_FACTORS: { [key: string]: number } = {
    g: 1, kg: 1000, ml: 1, L: 1000, unit: 1,
};

const calculateInventoryIngredientCost = (ingredient: RecipeIngredient, inventoryItem: InventoryItem): number => {
    const inventoryBaseUnit = inventoryItem.unit in CONVERSION_FACTORS ? inventoryItem.unit : 'unit';
    const ingredientUnit = ingredient.unit in CONVERSION_FACTORS ? ingredient.unit : 'unit';

    const isWeight = ['g', 'kg'].includes(inventoryBaseUnit) && ['g', 'kg'].includes(ingredientUnit);
    const isVolume = ['ml', 'L'].includes(inventoryBaseUnit) && ['ml', 'L'].includes(ingredientUnit);
    const isUnit = inventoryBaseUnit === 'unit' && ingredientUnit === 'unit';

    if (!isWeight && !isVolume && !isUnit) return 0;

    const inventoryFactor = CONVERSION_FACTORS[inventoryBaseUnit];
    const ingredientFactor = CONVERSION_FACTORS[ingredientUnit];

    const pricePerBase = inventoryItem.costPerUnit / inventoryFactor;
    const totalBaseUnits = ingredient.quantity * ingredientFactor;

    return pricePerBase * totalBaseUnits;
};


// --- Sub-Components ---

const AllergenIcon: React.FC<{ allergen: string }> = ({ allergen }) => {
    const { t } = useLocalization();
    const allergenKey = allergen.toLowerCase() as any;
    return (
        <span className="text-xs bg-yellow-500/20 text-yellow-700 font-semibold px-2 py-0.5 rounded-full">
            {t(allergenKey, allergen)}
        </span>
    );
};


const PricingModal: React.FC<{ recipe: Recipe & { foodCost: number }, onClose: () => void }> = ({ recipe, onClose }) => {
    const { t } = useLocalization();
    const { costingSettings, addMenuItem } = useSystem();
    const { addNotification } = useNotifications();

    const [itemName, setItemName] = useState(recipe.name);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(recipe.category);
    const [finalPrice, setFinalPrice] = useState('');

    const { laborCostPercentage, overheadCostPercentage, targetProfitMarginPercentage } = costingSettings;
    const targetFoodCostPercentage = 100 - (laborCostPercentage + overheadCostPercentage + targetProfitMarginPercentage);
    const suggestedPrice = recipe.foodCost > 0 && targetFoodCostPercentage > 0 ? recipe.foodCost / (targetFoodCostPercentage / 100) : 0;

    useEffect(() => {
        setFinalPrice(suggestedPrice.toFixed(2));
    }, [suggestedPrice]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newItem: MenuItem = {
            id: `menu-${Date.now()}`,
            name: itemName,
            description,
            price: parseFloat(finalPrice),
            category,
            recipeId: recipe.id,
        };
        addMenuItem(newItem);
        addNotification(t('item_added_to_menu_success'), 'success');
        onClose();
    };

    return (
        <Modal title={t('intelligent_pricing')} onClose={onClose} size="lg">
            <form onSubmit={handleSubmit} className="p-4 space-y-6">
                <div className="text-center border-b border-border pb-4">
                    <p className="text-sm text-muted-foreground">{t('based_on_recipe')}</p>
                    <h3 className="text-xl font-bold text-foreground">{recipe.name}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Left: Calculation Breakdown */}
                    <div className="space-y-4">
                         <div className="p-4 bg-secondary rounded-lg">
                            <p className="text-sm font-semibold text-muted-foreground">{t('recipe_food_cost')}</p>
                            <p className="text-3xl font-bold text-red-500">EGP {recipe.foodCost.toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-secondary rounded-lg">
                            <h4 className="font-bold mb-2">{t('how_price_was_calculated')}</h4>
                            <p className="text-xs text-muted-foreground mb-3">{t('price_calculation_explanation')}</p>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between"><span>{t('labor_cost_perc')}</span><span>{laborCostPercentage}%</span></div>
                                <div className="flex justify-between"><span>{t('overhead_cost_perc')}</span><span>{overheadCostPercentage}%</span></div>
                                <div className="flex justify-between"><span>{t('target_profit_margin')}</span><span>{targetProfitMarginPercentage}%</span></div>
                                <hr className="my-1 border-border"/>
                                <div className="flex justify-between font-bold"><span>{t('target_food_cost_perc')}</span><span>{targetFoodCostPercentage.toFixed(2)}%</span></div>
                            </div>
                            <p className="text-xs text-center mt-3 p-2 bg-background rounded-md font-mono">
                                {t('formula')}: ({recipe.foodCost.toFixed(2)} / {targetFoodCostPercentage.toFixed(2)}%)
                            </p>
                        </div>
                         <div className="p-4 bg-primary/10 border border-primary rounded-lg text-center">
                            <p className="text-sm font-semibold text-primary">{t('suggested_selling_price')}</p>
                            <p className="text-4xl font-bold text-primary">EGP {suggestedPrice.toFixed(2)}</p>
                        </div>
                    </div>
                    {/* Right: Menu Item Form */}
                    <div className="space-y-4">
                         <div>
                            <label className="text-sm font-medium">{t('menu_item_name')}</label>
                            <input type="text" value={itemName} onChange={e => setItemName(e.target.value)} className="mt-1 block w-full bg-secondary border-border rounded-md p-2" required />
                        </div>
                         <div>
                            <label className="text-sm font-medium">{t('description')}</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full bg-secondary border-border rounded-md p-2" />
                        </div>
                         <div>
                            <label className="text-sm font-medium">{t('category')}</label>
                            <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full bg-secondary border-border rounded-md p-2" required />
                        </div>
                         <div>
                            <label className="text-sm font-medium text-green-600">{t('final_price')}</label>
                            <input type="number" step="0.01" value={finalPrice} onChange={e => setFinalPrice(e.target.value)} className="mt-1 block w-full bg-secondary border-border rounded-md p-2 text-lg font-bold" required />
                        </div>
                    </div>
                </div>
                 <div className="flex justify-end pt-4 border-t border-border">
                    <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
                        <PlusIcon /> {t('add_to_menu')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};


const RecipeCard: React.FC<{ recipe: Recipe & { foodCost: number; costPerPortion: number; allergens: string[] }, onEdit: () => void, onCreateMenuItem: () => void }> = ({ recipe, onEdit, onCreateMenuItem }) => {
    const { t } = useLocalization();

    return (
        <div className="bg-card border border-border rounded-xl shadow-sm p-5 transition-all hover:shadow-md hover:-translate-y-1 flex flex-col">
            <div className="flex-grow">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-lg text-foreground break-words flex-1">{recipe.name}</h3>
                    {recipe.isSubRecipe && (
                        <span className="text-xs bg-blue-500/20 text-blue-600 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">{t('is_sub_recipe')}</span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">{recipe.category}</p>
                
                <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('total_batch_cost')}:</span>
                        <span className="font-semibold text-red-500">EGP {recipe.foodCost.toFixed(2)}</span>
                    </div>
                    {!recipe.isSubRecipe && recipe.productionYield > 0 && (
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">{t('cost_per_portion')}:</span>
                            <span className="font-bold text-lg text-primary">EGP {recipe.costPerPortion.toFixed(2)}</span>
                        </div>
                    )}
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('production_yield')}:</span>
                        <span className="font-semibold">{recipe.productionYield} {recipe.yieldUnit}</span>
                    </div>
                </div>

                {recipe.allergens.length > 0 && (
                    <div className="mt-3">
                        <h4 className="text-xs font-bold text-muted-foreground mb-1.5">{t('allergens')}</h4>
                        <div className="flex flex-wrap gap-1.5">
                            {recipe.allergens.map(allergen => <AllergenIcon key={allergen} allergen={allergen} />)}
                        </div>
                    </div>
                )}

            </div>
            <div className="mt-4 pt-4 border-t border-border flex gap-2">
                <button onClick={onEdit} className="w-full py-2 text-sm bg-secondary rounded-lg font-semibold hover:bg-accent transition-colors">{t('edit_short')}</button>
                {!recipe.isSubRecipe && (
                    <button onClick={onCreateMenuItem} className="w-full py-2 text-sm bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-colors">{t('create_menu_item')}</button>
                )}
            </div>
        </div>
    );
};

export const RecipesView: React.FC = () => {
    const { recipes, inventoryItems, loading } = useSystem();
    const { t } = useLocalization();
    
    const [isPricingModalOpen, setPricingModalOpen] = useState(false);
    const [isEditorModalOpen, setEditorModalOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<(Recipe & { foodCost: number; costPerPortion: number; allergens: string[] }) | null>(null);
    const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);

    const recipesWithData = useMemo(() => {
        // FIX: Explicitly type Maps to prevent TypeScript from inferring values as `unknown`.
        const recipeMap = new Map<string, Recipe>(recipes.map(r => [r.id, r]));
        const inventoryMap = new Map<string, InventoryItem>(inventoryItems.map(i => [i.id, i]));
        const costCache = new Map<string, number>();
        const allergenCache = new Map<string, string[]>();

        function getRecipeAllergens(recipeId: string): string[] {
            if (allergenCache.has(recipeId)) {
                return allergenCache.get(recipeId)!;
            }

            const recipe = recipeMap.get(recipeId);
            if (!recipe) return [];

            const allergens = new Set<string>();

            for (const ing of recipe.ingredients) {
                if (ing.inventoryItemId) {
                    const item = inventoryMap.get(ing.inventoryItemId);
                    if (item?.allergens) {
                        item.allergens.forEach(a => allergens.add(a));
                    }
                } else if (ing.subRecipeId) {
                    const subAllergens = getRecipeAllergens(ing.subRecipeId);
                    subAllergens.forEach(a => allergens.add(a));
                }
            }
            
            const result = Array.from(allergens);
            allergenCache.set(recipeId, result);
            return result;
        }

        function calculateCost(recipeId: string): number {
            if (costCache.has(recipeId)) {
                return costCache.get(recipeId)!;
            }

            const recipe = recipeMap.get(recipeId);
            if (!recipe) {
                return 0;
            }

            let totalEffectiveCost = 0;
            for (const ing of recipe.ingredients) {
                let ingredientBaseCost = 0;
                if (ing.inventoryItemId) {
                    const item = inventoryMap.get(ing.inventoryItemId);
                    if (item) {
                        ingredientBaseCost = calculateInventoryIngredientCost(ing, item);
                    }
                } else if (ing.subRecipeId) {
                    // Recursive call for sub-recipe cost
                    const subRecipe = recipeMap.get(ing.subRecipeId);
                    const subRecipeCostPerUnit = (subRecipe && subRecipe.productionYield > 0) 
                        ? calculateCost(ing.subRecipeId) / subRecipe.productionYield
                        : calculateCost(ing.subRecipeId); // Fallback to total cost if yield is 0

                    ingredientBaseCost = subRecipeCostPerUnit * ing.quantity;
                }
                
                const yieldFactor = (ing.yieldPercentage || 100) / 100;
                const effectiveCost = yieldFactor > 0 ? ingredientBaseCost / yieldFactor : 0;
                totalEffectiveCost += effectiveCost;
            }

            const wastageFactor = 1 + ((recipe.wastagePercentage || 0) / 100);
            const finalCost = totalEffectiveCost * wastageFactor;
            
            costCache.set(recipeId, finalCost);
            return finalCost;
        }

        return recipes.map(recipe => {
            const foodCost = calculateCost(recipe.id);
            const costPerPortion = (recipe.productionYield && recipe.productionYield > 0) ? foodCost / recipe.productionYield : 0;
            const allergens = getRecipeAllergens(recipe.id);
            return {
                ...recipe,
                foodCost,
                costPerPortion,
                allergens
            };
        });
    }, [recipes, inventoryItems]);

    const handleOpenPricingModal = (recipe: Recipe & { foodCost: number; costPerPortion: number; allergens: string[] }) => {
        setSelectedRecipe(recipe);
        setPricingModalOpen(true);
    };

    const handleOpenEditor = (recipe: Recipe | null) => {
        setRecipeToEdit(recipe);
        setEditorModalOpen(true);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {isPricingModalOpen && selectedRecipe && <PricingModal recipe={selectedRecipe} onClose={() => setPricingModalOpen(false)} />}
            <RecipeEditorModal isOpen={isEditorModalOpen} onClose={() => setEditorModalOpen(false)} recipeToEdit={recipeToEdit} />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground">{t('recipes_management')}</h1>
                    <p className="mt-2 text-muted-foreground">{t('recipes_subtitle')}</p>
                </div>
                <button onClick={() => handleOpenEditor(null)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
                    <PlusIcon />
                    {t('add_recipe')}
                </button>
            </div>
             <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    [...Array(8)].map((_, i) => (
                        <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
                            <div className="h-6 bg-secondary rounded w-3/4"></div>
                            <div className="h-4 bg-secondary rounded w-1/2 mt-2"></div>
                            <div className="h-4 bg-secondary rounded w-full mt-4"></div>
                            <div className="h-4 bg-secondary rounded w-full mt-2"></div>
                            <div className="h-9 bg-secondary rounded-lg w-full mt-4"></div>
                        </div>
                    ))
                ) : (
                    recipesWithData.map(recipe => 
                        <RecipeCard 
                            key={recipe.id} 
                            recipe={recipe} 
                            onEdit={() => handleOpenEditor(recipe)}
                            onCreateMenuItem={() => handleOpenPricingModal(recipe)} 
                        />
                    )
                )}
            </div>
        </div>
    );
};
