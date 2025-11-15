

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useSystem } from '../hooks/useSystem';
import type { Recipe, RecipeIngredient, InventoryItem } from '../types';
import { TrashIcon, HRIcon, InventoryIcon } from './icons';
import { Modal } from './Modal';
import { useNotifications } from '../hooks/useNotifications';

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

const availableYieldUnits = ['portion', 'kg', 'g', 'L', 'ml', 'unit_piece'];
const availableIngredientUnits = ['g', 'kg', 'ml', 'L', 'unit'];


export const RecipeEditorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    recipeToEdit: Recipe | null;
}> = ({ isOpen, onClose, recipeToEdit }) => {
    const { t } = useLocalization();
    const { inventoryItems, recipes, addRecipe, updateRecipe, deleteRecipe } = useSystem();
    const { addNotification } = useNotifications();

    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
    const [isSubRecipe, setIsSubRecipe] = useState(false);
    const [wastagePercentage, setWastagePercentage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [productionYield, setProductionYield] = useState(1);
    const [yieldUnit, setYieldUnit] = useState('portion');
    const [instructions, setInstructions] = useState('');

    const categories = useMemo(() => [...new Set(recipes.map(r => r.category).filter(Boolean))], [recipes]);

    useEffect(() => {
        if (recipeToEdit) {
            setName(recipeToEdit.name);
            setCategory(recipeToEdit.category);
            setIngredients(recipeToEdit.ingredients.map(i => ({ ...i, yieldPercentage: i.yieldPercentage ?? 100 })));
            setIsSubRecipe(recipeToEdit.isSubRecipe);
            setWastagePercentage(recipeToEdit.wastagePercentage || 0);
            setProductionYield(recipeToEdit.productionYield || 1);
            setYieldUnit(recipeToEdit.yieldUnit && availableYieldUnits.includes(recipeToEdit.yieldUnit) ? recipeToEdit.yieldUnit : 'portion');
            setInstructions(recipeToEdit.instructions || '');
        } else {
            setName('');
            setCategory('');
            setIngredients([]);
            setIsSubRecipe(false);
            setWastagePercentage(0);
            setProductionYield(1);
            setYieldUnit('portion');
            setInstructions('');
        }
    }, [recipeToEdit, isOpen]);

    const searchableItems = useMemo(() => {
        const inventory = inventoryItems.map(i => ({ type: 'inventory' as const, id: i.id, name: i.name, item: i }));
        const subRecipes = recipes.filter(r => r.isSubRecipe && r.id !== recipeToEdit?.id).map(r => ({ type: 'sub-recipe' as const, id: r.id, name: r.name, item: r }));
        return [...inventory, ...subRecipes];
    }, [inventoryItems, recipes, recipeToEdit]);

    const filteredSearchableItems = useMemo(() => {
        if (!searchTerm) return [];
        const lowerSearchTerm = searchTerm.toLowerCase();
        const currentIngredientIds = new Set(ingredients.map(i => i.inventoryItemId || i.subRecipeId));
        return searchableItems.filter(item =>
            !currentIngredientIds.has(item.id) &&
            item.name.toLowerCase().includes(lowerSearchTerm)
        );
    }, [searchTerm, searchableItems, ingredients]);

    const handleAddItem = (item: (typeof searchableItems)[0]) => {
        let newIngredient: RecipeIngredient;
        if (item.type === 'inventory') {
            const inventoryItem = item.item as InventoryItem;
            newIngredient = {
                inventoryItemId: item.id,
                quantity: 1,
                unit: inventoryItem.unit === 'kg' ? 'g' : inventoryItem.unit === 'L' ? 'ml' : 'unit',
                yieldPercentage: 100
            };
        } else {
            const subRecipe = item.item as Recipe;
            newIngredient = {
                subRecipeId: item.id,
                quantity: 1,
                unit: subRecipe.yieldUnit || 'unit', // Use sub-recipe's yield unit
                yieldPercentage: 100
            };
        }
        setIngredients(prev => [...prev, newIngredient]);
        setSearchTerm('');
    };

    const handleIngredientChange = (index: number, field: keyof RecipeIngredient, value: string | number) => {
        const newIngredients = [...ingredients];
        (newIngredients[index] as any)[field] = value;
        setIngredients(newIngredients);
    };

    const handleRemoveIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const dataCalculation = useMemo(() => {
        // FIX: Explicitly type Maps to prevent TypeScript from inferring values as `unknown`.
        const recipeMap = new Map<string, Recipe>(recipes.map(r => [r.id, r]));
        const inventoryMap = new Map<string, InventoryItem>(inventoryItems.map(i => [i.id, i]));
        const costCache = new Map<string, number>();
        const allergenCache = new Map<string, string[]>();

        function getRecipeAllergens(recipeId: string): string[] {
             if (allergenCache.has(recipeId)) return allergenCache.get(recipeId)!;
             const recipe = recipeMap.get(recipeId);
             if (!recipe) return [];
             const allergens = new Set<string>();
             for (const ing of recipe.ingredients) {
                 if (ing.inventoryItemId) {
                     const item = inventoryMap.get(ing.inventoryItemId);
                     if (item?.allergens) item.allergens.forEach(a => allergens.add(a));
                 } else if (ing.subRecipeId) {
                     getRecipeAllergens(ing.subRecipeId).forEach(a => allergens.add(a));
                 }
             }
             const result = Array.from(allergens);
             allergenCache.set(recipeId, result);
             return result;
        }

        function calculateRecipeFinalCost(recipeId: string): number {
            if (costCache.has(recipeId)) return costCache.get(recipeId)!;
            
            const recipe = recipeMap.get(recipeId);
            if (!recipe) return 0;

            let totalEffectiveCost = recipe.ingredients.reduce((total, ing) => {
                 let ingredientBaseCost = 0;
                 if (ing.inventoryItemId) {
                    const item = inventoryMap.get(ing.inventoryItemId);
                    if(item) ingredientBaseCost = calculateInventoryIngredientCost(ing, item);
                 } else if (ing.subRecipeId) {
                    const subRecipe = recipeMap.get(ing.subRecipeId);
                    const subRecipeCostPerUnit = (subRecipe && subRecipe.productionYield > 0) 
                        ? calculateRecipeFinalCost(ing.subRecipeId) / subRecipe.productionYield
                        : calculateRecipeFinalCost(ing.subRecipeId);
                    ingredientBaseCost = subRecipeCostPerUnit * ing.quantity;
                 }
                 const yieldFactor = (ing.yieldPercentage || 100) / 100;
                 return total + (yieldFactor > 0 ? ingredientBaseCost / yieldFactor : 0);
            }, 0);
            
            const wastageFactor = 1 + ((recipe.wastagePercentage || 0) / 100);
            const finalCost = totalEffectiveCost * wastageFactor;
            costCache.set(recipeId, finalCost);
            return finalCost;
        }
        
        const ingredientsWithCosts = ingredients.map(ing => {
            let baseCost = 0;
            if (ing.inventoryItemId) {
                const item = inventoryMap.get(ing.inventoryItemId);
                if (item) baseCost = calculateInventoryIngredientCost(ing, item);
            } else if (ing.subRecipeId) {
                 const subRecipe = recipeMap.get(ing.subRecipeId);
                 const subRecipeCostPerUnit = (subRecipe && subRecipe.productionYield > 0)
                    ? calculateRecipeFinalCost(ing.subRecipeId) / subRecipe.productionYield
                    : calculateRecipeFinalCost(ing.subRecipeId);
                baseCost = subRecipeCostPerUnit * ing.quantity;
            }
            const yieldFactor = (ing.yieldPercentage || 100) / 100;
            const effectiveCost = yieldFactor > 0 ? baseCost / yieldFactor : 0;
            return { ...ing, baseCost, effectiveCost };
        });

        const totalEffectiveCost = ingredientsWithCosts.reduce((sum, ing) => sum + ing.effectiveCost, 0);
        const wastageFactor = 1 + (wastagePercentage / 100);
        const finalCost = totalEffectiveCost * wastageFactor;
        const costPerPortion = productionYield > 0 ? finalCost / productionYield : 0;

        const currentAllergens = new Set<string>();
        ingredients.forEach(ing => {
            if (ing.inventoryItemId) {
                const item = inventoryMap.get(ing.inventoryItemId);
                if (item?.allergens) item.allergens.forEach(a => currentAllergens.add(a));
            } else if (ing.subRecipeId) {
                getRecipeAllergens(ing.subRecipeId).forEach(a => currentAllergens.add(a));
            }
        });

        return { ingredientsWithCosts, finalCost, costPerPortion, allergens: Array.from(currentAllergens) };
    }, [ingredients, wastagePercentage, recipes, inventoryItems, productionYield]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalIngredients = ingredients.map(({ baseCost, effectiveCost, ...ing }: any) => ing);
        
        const newRecipe: Recipe = {
            id: recipeToEdit?.id || `rec-${Date.now()}`,
            name,
            category,
            ingredients: finalIngredients,
            isSubRecipe,
            wastagePercentage,
            productionYield,
            yieldUnit,
            instructions,
        };
        if (recipeToEdit) {
            updateRecipe(newRecipe);
        } else {
            addRecipe(newRecipe);
        }
        addNotification(t('recipe_saved_success'), 'success');
        onClose();
    };
    
    const handleDelete = () => {
        if (recipeToEdit) {
            deleteRecipe(recipeToEdit.id);
            addNotification(t('recipe_deleted_success'), 'success');
            onClose();
        }
    }

    if (!isOpen) return null;

    return (
        <Modal title={recipeToEdit ? t('edit_recipe') : t('add_recipe')} onClose={onClose} size="lg">
            <form onSubmit={handleSubmit}>
                <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('recipe_name')} className="block w-full bg-secondary border-border rounded-md p-2" required />
                        <div>
                           <input type="text" list="recipe-categories" value={category} onChange={e => setCategory(e.target.value)} placeholder={t('search_or_create_category')} className="block w-full bg-secondary border-border rounded-md p-2" required />
                           <datalist id="recipe-categories">
                                {categories.map(cat => <option key={cat} value={cat} />)}
                           </datalist>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-secondary p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                            <label htmlFor="isSubRecipeToggle" className="font-semibold">{t('mark_as_sub_recipe')}</label>
                            <input id="isSubRecipeToggle" type="checkbox" checked={isSubRecipe} onChange={e => setIsSubRecipe(e.target.checked)} className="h-5 w-5 rounded text-primary focus:ring-primary"/>
                        </div>
                        <p className="text-xs text-muted-foreground">{t('sub_recipe_explanation')}</p>
                     </div>
                    <div>
                        <h4 className="font-semibold mb-2">{t('ingredients')}</h4>
                        <div className="space-y-2">
                            {dataCalculation.ingredientsWithCosts.map((ing, index) => {
                                const item = searchableItems.find(i => i.id === (ing.inventoryItemId || ing.subRecipeId));
                                return (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 bg-secondary rounded-md">
                                        <span className="col-span-12 md:col-span-4 font-semibold text-sm truncate">{item?.name || '...'}</span>
                                        <input type="number" step="any" value={ing.quantity} onChange={e => handleIngredientChange(index, 'quantity', parseFloat(e.target.value) || 0)} className="col-span-3 md:col-span-2 bg-background border-border rounded p-1 text-sm text-center" />
                                        <select value={ing.unit} onChange={e => handleIngredientChange(index, 'unit', e.target.value)} className="col-span-3 md:col-span-1 bg-background border-border rounded p-1 text-sm">
                                            {availableIngredientUnits.map(unit => (
                                                <option key={unit} value={unit}>{unit}</option>
                                            ))}
                                        </select>
                                        <div className="col-span-3 md:col-span-2 flex items-center">
                                           <input type="number" value={ing.yieldPercentage} onChange={e => handleIngredientChange(index, 'yieldPercentage', parseInt(e.target.value) || 100)} className="w-full bg-background border-border rounded p-1 text-sm text-center" />
                                           <span className="text-xs ml-1">%</span>
                                        </div>
                                        <span className="col-span-2 md:col-span-2 text-right text-sm font-mono truncate" title={`Base: ${ing.baseCost.toFixed(2)}`}>EGP {ing.effectiveCost.toFixed(2)}</span>
                                        <button type="button" onClick={() => handleRemoveIngredient(index)} className="col-span-1 p-1 text-red-500 hover:bg-red-500/10 rounded-full"><TrashIcon /></button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="relative">
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('search_inventory_or_subrecipe')} className="w-full bg-secondary border-border rounded-md p-2" />
                        {filteredSearchableItems.length > 0 && (
                            <ul className="absolute z-10 w-full bg-card border border-border rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                                {filteredSearchableItems.map(item => (
                                    <li key={item.id} onClick={() => handleAddItem(item)} className="p-2 hover:bg-secondary cursor-pointer text-sm flex items-center gap-2">
                                        {item.type === 'inventory' ? <InventoryIcon/> : <HRIcon />}
                                        {item.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium">{t('production_yield')}</label>
                            <input type="number" value={productionYield} onChange={e => setProductionYield(parseFloat(e.target.value) || 1)} className="mt-1 block w-full bg-secondary border-border rounded-md p-2" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">{t('yield_unit')}</label>
                            <select value={yieldUnit} onChange={e => setYieldUnit(e.target.value)} className="mt-1 block w-full bg-secondary border-border rounded-md p-2">
                                {availableYieldUnits.map(unit => (
                                    <option key={unit} value={unit}>{t(unit as any, unit)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">{t('wastage_perc')}</label>
                            <input type="number" value={wastagePercentage} onChange={e => setWastagePercentage(parseFloat(e.target.value) || 0)} className="mt-1 block w-full bg-secondary border-border rounded-md p-2" />
                        </div>
                    </div>
                    
                    <div>
                         <label className="text-sm font-medium">{t('instructions')}</label>
                         <textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={5} placeholder="1. ..." className="mt-1 block w-full bg-secondary border-border rounded-md p-2 text-sm" />
                    </div>
                    
                    {dataCalculation.allergens.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold mb-2">{t('allergens')}</h4>
                            <div className="flex flex-wrap gap-2 p-3 bg-secondary rounded-md border border-dashed border-border">
                                {dataCalculation.allergens.map(allergen => (
                                    <span key={allergen} className="text-xs bg-yellow-500/20 text-yellow-700 font-semibold px-2 py-1 rounded-full">{t(allergen.toLowerCase() as any, allergen)}</span>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                <div className="p-4 bg-secondary/50 border-t border-border flex flex-wrap gap-4 justify-between items-center">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <div>
                            <span className="text-sm font-semibold">{t('total_batch_cost')}:</span>
                            <span className="text-lg font-bold text-red-500 ms-2">EGP {dataCalculation.finalCost.toFixed(2)}</span>
                        </div>
                         {!isSubRecipe && (
                            <div>
                                <span className="text-sm font-semibold">{t('cost_per_portion')}:</span>
                                <span className="text-lg font-bold text-primary ms-2">EGP {dataCalculation.costPerPortion.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3">
                         {recipeToEdit && <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600/20 text-red-700 dark:text-red-300 rounded-lg font-semibold hover:bg-red-600/30">{t('delete_recipe')}</button>}
                         <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-opacity">{t('save_recipe')}</button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};