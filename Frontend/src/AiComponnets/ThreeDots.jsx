import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const ThreeDotMenu = ({ onEdit, onDelete, onReport, showDetails=true }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100">
        <MoreVertical className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {showDetails && (
          <>
            <DropdownMenuItem 
              onClick={onEdit}
              className="flex items-center gap-2 cursor-pointer"
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onDelete}
              className="flex items-center gap-2 cursor-pointer text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem 
          onClick={onReport}
          className="flex items-center gap-2 cursor-pointer"
        >
          Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThreeDotMenu;
