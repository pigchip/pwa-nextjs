export const getMostFrequentedRoutes = () => {
    const savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
    savedRoutes.sort((a: any, b: any) => b.frequency - a.frequency);
    return savedRoutes;
};