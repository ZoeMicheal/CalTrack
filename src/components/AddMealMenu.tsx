import React from 'react';

interface Props {
    onSelectAI: () => void;
    onSelectManual: () => void;
    onSelectSaved: () => void;
}

export const AddMealMenu: React.FC<Props> = ({ onSelectAI, onSelectManual, onSelectSaved }) => {
    return (
        <div className="menu-options-vertical">
            <h3>Add Meal</h3>
            <button className="bubbly-menu-btn" onClick={onSelectAI}>
                Take Picture (AI)
            </button>
            <button className="bubbly-menu-btn" onClick={onSelectManual}>
                Manual Input
            </button>
            <button className="bubbly-menu-btn" onClick={onSelectSaved}>
                Select from Saved Meals
            </button>
        </div>
    );
};