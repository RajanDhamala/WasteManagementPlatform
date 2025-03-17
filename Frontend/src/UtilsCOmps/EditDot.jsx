import React from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const Editdot = ({ onEdit = () => {}, onDelete = () => {}, showDetails = true }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-green-100 transition-colors">
        <MoreVertical className="h-5 w-5 text-green-700" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 bg-white border border-green-200 shadow-lg rounded-md p-1">
        {showDetails && (
          <>
            <DropdownMenuItem 
              onClick={onEdit}
              className="flex items-center gap-2 cursor-pointer text-green-700 hover:bg-green-50 rounded-sm py-1.5 px-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onDelete}
              className="flex items-center gap-2 cursor-pointer text-red-600 hover:bg-red-50 rounded-sm py-1.5 px-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Editdot;