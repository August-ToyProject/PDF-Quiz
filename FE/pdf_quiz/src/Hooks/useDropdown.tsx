import { useState } from 'react';

export const useDropdown = () => {
    const [dropdownOpen, setDropdownOpen] = useState<{ [key: number]: boolean }>({});

    const toggleDropdown = (id: number) => {
        setDropdownOpen(prevState => ({
            ...prevState,
            [id]: !prevState[id]
        }));
    };

    return { dropdownOpen, toggleDropdown };
};
