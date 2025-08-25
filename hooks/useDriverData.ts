import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { getLocalDateString } from '../lib/dateUtils';

interface DriverData {
    coconutsCarried: number;
    changeAmount: number;
}

const DRIVER_DATA_KEY = 'driverData';

export const useDriverData = (driverId: string | undefined) => {
    const { driverDailySetup } = useData();
    const [data, setData] = useState<DriverData>({
        coconutsCarried: 0,
        changeAmount: 0,
    });

    // Load data from Supabase/localStorage when component mounts
    useEffect(() => {
        if (!driverId) return;
        
        // Coba ambil data hari ini dari Supabase terlebih dahulu
        const todayStr = getLocalDateString();
        const setupData = driverDailySetup.find(
            setup => setup.driver_id === driverId && setup.date === todayStr
        );

        if (setupData) {
            // Jika ada data di Supabase, gunakan itu
            setData({
                coconutsCarried: setupData.coconuts_carried,
                changeAmount: setupData.change_amount,
            });
            // Simpan juga ke localStorage
            localStorage.setItem(`${DRIVER_DATA_KEY}_${driverId}`, JSON.stringify({
                coconutsCarried: setupData.coconuts_carried,
                changeAmount: setupData.change_amount,
            }));
        } else {
            // Jika tidak ada di Supabase, cek localStorage
            const savedData = localStorage.getItem(`${DRIVER_DATA_KEY}_${driverId}`);
            if (savedData) {
                try {
                    const parsedData = JSON.parse(savedData);
                    setData(parsedData);
                } catch (error) {
                    console.error('Error parsing driver data:', error);
                }
            }
        }
    }, [driverId, driverDailySetup]); // Tambahkan driverDailySetup sebagai dependency

    // Save data to localStorage whenever it changes
    const updateData = (newData: Partial<DriverData>) => {
        if (!driverId) return;

        const updatedData = { ...data, ...newData };
        setData(updatedData);
        localStorage.setItem(`${DRIVER_DATA_KEY}_${driverId}`, JSON.stringify(updatedData));
    };

    return {
        data,
        updateData,
    };
};
