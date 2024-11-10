import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import SubwayIcon from '@mui/icons-material/Subway';
import TrainIcon from '@mui/icons-material/Train';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';

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
      default:
        return <DirectionsWalkIcon className="text-white" />;
    }
  };