export const getMostFrequentedRoutes = () => {
    const savedRoutes = JSON.parse(localStorage.getItem('frequentedRoutes') || '[]');
    savedRoutes.sort((a: any, b: any) => b.frequency - a.frequency);
    return savedRoutes;
};