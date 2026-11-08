import { useSortable } from "@dnd-kit/react/sortable";
import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";

// function to drag and sort card within or between lists
export const SortableCard = ({ card, index, listId, children }) => {
    const { ref, isDragging } = useSortable({
        id: card._id,
        index,
        group: listId,
        type: "card",
        accept: "card",
    });

    return (
        <div
            ref={ref}
            className={`transition-opacity ${isDragging ? "opacity-40" : "opacity-100"}`}
        >
            {children}
        </div>
    );
};

export const DroppableList = ({ listId, children }) => {
    const { ref, isDropTarget } = useDroppable({
        id: listId,
        type: "list",
        accept: "card",
        collisionPriority: CollisionPriority.Low,
    });

    return (
        <div
            ref={ref}
            className={`min-h-12 rounded-md transition-colors ${isDropTarget ? "bg-blue-50" : ""}`}
        >
            {children}
        </div>
    );
};
