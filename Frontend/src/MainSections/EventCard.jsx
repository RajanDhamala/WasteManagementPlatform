import { Calendar, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const EventCard = ({
  title = 'Beach Cleanup Drive',
  date = 'Sat, Mar 15 • 9:00 AM',
  location = 'Biratnagar, Nepal',
  Peoples = '24',
  image='./defulthu.jpg',
  status = 'Active'
}) => {
  // Encode the title properly for the URL
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden 
      transform transition-all duration-300 ease-in-out
      hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1
      cursor-pointer" 
      
    >
      <div className="relative h-48 overflow-hidden">
        <img 
        draggable='false'
          loading='lazy'
          src={image || './default.jpg'}
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
        {/* Use encoded title in URL */}
        <Link draggable='false' to={`/events/${encodedTitle}`} className="text-xl font-bold mb-2 text-gray-800 transition-colors duration-200 hover:text-green-600">
          {title}
        </Link>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={18} />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={18} />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={18} />
            <span>{Peoples} volunteers joined</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => alert(`Some update ${title}`)} 
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            Join Event
          </button>
          <button 
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-500 hover:text-green-600"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
