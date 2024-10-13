
import { useState, useEffect } from 'react';
import axios from 'axios';
const BECKAND_URL="http://localhost:8080"

export const useInteractions = () => {
    const [interactions, setInteractions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchInteractions = async () => {
        try {
            const token = localStorage.getItem('token');
            const result = await axios.get(`${BECKAND_URL}/interactions`, {
                headers: { Authorization: token }
            });
            setInteractions(result.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching interactions:', error);
            setError('Error fetching interactions');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInteractions();
    }, []);

    return { interactions, loading, error };
};
