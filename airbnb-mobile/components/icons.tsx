import { LucideIcon } from 'lucide-react-native';
import { cssInterop } from 'nativewind';

function iconInterop(icon: LucideIcon) {
  cssInterop(icon, {
    className: {
      target: 'style',
      nativeStyleToProp: {
        color: true,
        width: 'size',
      },
    },
  });
}

import { 
  Home, 
  Search, 
  User, 
  Settings, 
  Heart, 
  Bell, 
  Plus, 
  Map as MapIcon,
  LogOut,
  ChevronRight,
  Star
} from 'lucide-react-native';

iconInterop(Home);
iconInterop(Search);
iconInterop(User);
iconInterop(Settings);
iconInterop(Heart);
iconInterop(Bell);
iconInterop(Plus);
iconInterop(MapIcon);
iconInterop(LogOut);
iconInterop(ChevronRight);
iconInterop(Star);

export { 
  Home, 
  Search, 
  User, 
  Settings, 
  Heart, 
  Bell, 
  Plus, 
  MapIcon as Map,
  LogOut,
  ChevronRight,
  Star
};
