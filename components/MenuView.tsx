

import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { generateMenuItems } from '../services/geminiService';
import type { MenuItem } from '../types';

const MenuItemCard: React.FC<{ item: MenuItem }> = ({ item }) => (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden transition-transform hover:scale-105">
        <img src={`https://picsum.photos/seed/${item.name.replace(/\s/g, '')}/400/200`} alt={item.name} className="w-full h-40 object-cover" />
        <div className="p-4">
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-foreground">{item.name}</h3>
                <span className="text-primary font-semibold">EGP {item.price}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{item.category}</p>
            <p className="text-sm text-foreground mt-3">{item.description}</p>
        </div>
    </div>
);

export const MenuView: React.FC = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useLocalization();

    const handleGenerateIdeas = async () => {
        setIsLoading(true);
        const newItems = await generateMenuItems();
        setMenuItems(prevItems => [...prevItems, ...newItems]);
        setIsLoading(false);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground">{t('menu')}</h1>
                    <p className="mt-2 text-muted-foreground">Manage your menu items and generate new ideas.</p>
                </div>
                <button
                    onClick={handleGenerateIdeas}
                    disabled={isLoading}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait w-full sm:w-auto"
                >
                    {isLoading ? t('generating_ideas') : t('generate_menu_ideas')}
                </button>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Mock existing item */}
                <MenuItemCard item={{ id: 'menu-mock-koshary', name: "Classic Koshary", description: "The traditional Egyptian staple, perfectly layered and spiced.", price: 75, category: "Main Course" }} />

                {menuItems.map((item, index) => (
                    <MenuItemCard key={`${item.id}-${index}`} item={item} />
                ))}
            </div>

            {menuItems.length === 0 && !isLoading && (
                 <div className="mt-16 text-center">
                    <p className="text-muted-foreground">Your generated menu ideas will appear here.</p>
                 </div>
            )}
        </div>
    );
};