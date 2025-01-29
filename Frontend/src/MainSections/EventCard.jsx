import { Camera, Calendar, MapPin, Users, X, Search, Menu } from 'lucide-react';

const EventCard = ({
  title = 'Beach Cleanup Drive',
  date = 'Sat, Mar 15 • 9:00 AM',
  location = 'Biratnagar, Nepal',
  Peoples = '24',
  image,
  status='Active'  
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden 
      transform transition-all duration-300 ease-in-out
      hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1
      cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          loading='lazy'
          src={image || './defult.jpg'}
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-300"
          onError={(e) => {
            e.target.src = '/images/default-event.jpg';
          }}
        />
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm
          transform transition-transform duration-200 hover:scale-105"
        >
          {status}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-gray-800 transition-colors duration-200 hover:text-green-600">
          {title}
        </h3>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={18} className="transition-colors duration-200 group-hover:text-green-500" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={18} className="transition-colors duration-200 group-hover:text-green-500" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={18} className="transition-colors duration-200 group-hover:text-green-500" />
            <span>{Peoples} volunteers joined</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={(e)=>alert(`soom update ${title}`)} 
            className="flex-1 bg-green-600 text-white py-2 rounded-lg 
              transform transition-all duration-200 
              hover:bg-green-700 hover:shadow-lg hover:scale-[1.02]
              active:scale-95"
          >
            Join Event
          </button>
          <button 
            className="px-4 py-2 border border-gray-200 rounded-lg
              transform transition-all duration-200
              hover:bg-gray-50 hover:border-green-500 hover:text-green-600
              active:scale-95"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;