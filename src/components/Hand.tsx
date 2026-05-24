import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card as CardType } from '../logic/types';
import CardComponent from './Card';

// ─── Sortable card slot ───────────────────────────────────────────────────────

interface SortableCardSlotProps {
  card: CardType;
  index: number;
  isFocused: boolean;
  isSelected: boolean;
  isResult: boolean;
  selectionDepth: number;
  onCardClick: (cardId: string) => void;
  onFocusChange: (index: number) => void;
  isShaking: boolean;
  focusRef: (el: HTMLElement | null) => void;
  isDragActive: boolean; // true while any card is being dragged
}

const SortableCardSlot: React.FC<SortableCardSlotProps> = ({
  card,
  index,
  isFocused,
  isSelected,
  isResult,
  selectionDepth,
  onCardClick,
  onFocusChange,
  isShaking,
  focusRef,
  isDragActive,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  return (
    <Box
      ref={(el: HTMLElement | null) => {
        setNodeRef(el as HTMLElement);
        focusRef(el);
      }}
      onFocus={() => onFocusChange(index)}
      sx={{
        outline: 'none',
        flexShrink: 0,
        transform: CSS.Transform.toString(transform),
        transition: transition ?? 'transform 200ms ease',
        opacity: isDragging ? 0 : 1,
        cursor: isDragActive ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
        touchAction: 'none',
      }}
      {...attributes}
      {...listeners}
      tabIndex={isFocused ? 0 : -1}
    >
      <CardComponent
        card={card}
        isSelected={isSelected}
        isResult={isResult}
        isFocused={isFocused && !isDragActive}
        selectionDepth={isSelected ? selectionDepth : 0}
        onClick={() => {
          if (!isDragActive) onCardClick(card.id);
        }}
        size="normal"
        shake={isShaking && isSelected}
      />
    </Box>
  );
};

// ─── Hand ────────────────────────────────────────────────────────────────────

interface HandProps {
  hand: CardType[];
  selectedIds: Set<string>;
  resultCard: CardType | null;
  focusedIndex: number;
  selectionDepth: number;
  onCardClick: (cardId: string) => void;
  onFocusChange: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  isShaking: boolean;
}

const Hand: React.FC<HandProps> = ({
  hand,
  selectedIds,
  resultCard,
  focusedIndex,
  selectionDepth,
  onCardClick,
  onFocusChange,
  onReorder,
  isShaking,
}) => {
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // Roving focus: when focusedIndex changes, focus the right element
  useEffect(() => {
    const el = cardRefs.current[focusedIndex];
    if (el) el.focus();
  }, [focusedIndex]);

  // Sensors: require 5px movement before drag activates (so clicks still fire)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCardId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCardId(null);
    if (over && active.id !== over.id) {
      const fromIndex = hand.findIndex(c => c.id === active.id);
      const toIndex = hand.findIndex(c => c.id === over.id);
      if (fromIndex !== -1 && toIndex !== -1) {
        onReorder(fromIndex, toIndex);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveCardId(null);
  };

  const activeCard = activeCardId ? hand.find(c => c.id === activeCardId) : null;
  const isDragActive = activeCardId !== null;
  const cardIds = hand.map(c => c.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={cardIds} strategy={horizontalListSortingStrategy}>
        <Box
          role="group"
          aria-label="Your Hand"
          sx={{
            display: 'flex',
            gap: 1.5,
            alignItems: 'flex-end',
            justifyContent: 'center',
            minHeight: 116,
            flexWrap: 'nowrap',
            padding: '8px 12px',
          }}
        >
          {/* Render hand cards as sortable slots */}
          {hand.map((card, i) => (
            <SortableCardSlot
              key={card.id}
              card={card}
              index={i}
              isFocused={i === focusedIndex}
              isSelected={selectedIds.has(card.id)}
              isResult={card.id === resultCard?.id}
              selectionDepth={selectionDepth}
              onCardClick={onCardClick}
              onFocusChange={onFocusChange}
              isShaking={isShaking}
              focusRef={(el) => { cardRefs.current[i] = el; }}
              isDragActive={isDragActive}
            />
          ))}

          {/* Empty slot placeholders to keep 7-slot width */}
          {Array.from({ length: Math.max(0, 7 - hand.length) }).map((_, i) => (
            <Box
              key={`empty-${i}`}
              sx={{
                width: 72,
                height: 100,
                borderRadius: '6px',
                border: '1.5px dashed rgba(144,224,239,0.15)',
                flexShrink: 0,
              }}
            />
          ))}
        </Box>
      </SortableContext>

      {/* Drag overlay — floating card that follows the cursor */}
      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {activeCard ? (
          <Box sx={{ transform: 'rotate(3deg)', filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.5))' }}>
            <CardComponent
              card={activeCard}
              isSelected={selectedIds.has(activeCard.id)}
              isResult={activeCard.id === resultCard?.id}
              selectionDepth={selectedIds.has(activeCard.id) ? selectionDepth : 0}
              size="normal"
            />
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default Hand;
