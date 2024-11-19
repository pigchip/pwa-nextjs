import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import SubwayIcon from '@mui/icons-material/Subway';
import TrainIcon from '@mui/icons-material/Train';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import { DirectionsRailwayFilled } from '@mui/icons-material';

export   const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'WALK':
        return <DirectionsWalkIcon className="text-white" />;
      case 'BUS':
        return <DirectionsBusIcon className="text-white" />;
      case 'SUBWAY':
        return <SubwayIcon className="text-white" />;
      case 'RAIL':
        return <TrainIcon className="text-white" />;
      case 'FERRY':
        return <DirectionsBoatIcon className="text-white" />;
      case 'TRAM':
        return <DirectionsRailwayFilled className="text-white" />;
      case 'GONDOLA':
        return <img src="/icons/cablebus.svg" alt="Gondola Icon" className="w-6 h-6" />;
      default:
        return <DirectionsWalkIcon className="text-white" />;
    }
  };