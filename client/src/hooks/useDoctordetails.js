
import axios from "axios";
import { useState, useEffect } from "react";

const BECKAND_URL="http://localhost:8080"




export function useDoctorDetails() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        axios.get(`${BECKAND_URL}/doctordetails`)
            .then(response => {
                setDoctors(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching doctors:', error);
                setLoading(false);
            });
    }, []);
    return { doctors, loading };
}
