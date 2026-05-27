import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import {
  type CollisionDetection,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import {
  SortableContext,
  rectSortingStrategy,
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
  cardSize: 'normal' | 'small';
  onCardClick: (cardId: string) => void;
  onFocusChange: (index: number) => void;
  isShaking: boolean;
  focusRef: (el: HTMLElement | null) => void;
  isDragActive: boolean;
  showFocusOutline: boolean;
  isKeyboardReordering: boolean;
}

const SortableCardSlot: React.FC<SortableCardSlotProps> = ({
  card,
  index,
  isFocused,
  isSelected,
  isResult,
  selectionDepth,
  cardSize,
  onCardClick,
  onFocusChange,
  isShaking,
  focusRef,
  isDragActive,
  showFocusOutline,
  isKeyboardReordering,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const sortableTransform = CSS.Transform.toString(transform);
  const visualTransform = [
    sortableTransform,
    isKeyboardReordering ? 'translateY(-12px)' : '',
  ].filter(Boolean).join(' ');

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
        position: 'relative',
        transform: visualTransform || undefined,
        transition: transition ?? 'transform 200ms ease',
        // Show a faint ghost in the slot so the gap is visible but the card
        // doesn't fully disappear — the DragOverlay is the "real" dragging card
        opacity: isDragging ? 0.18 : 1,
        cursor: isDragActive ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
        touchAction: 'none',
        zIndex: isKeyboardReordering ? 3 : 'auto',
        '&::before': isKeyboardReordering
          ? {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: '8px',
            backgroundColor: 'rgba(3, 4, 94, 0.38)',
            filter: 'blur(1px)',
            transform: 'translate(7px, 14px)',
            zIndex: -1,
          }
          : {},
      }}
      {...attributes}
      {...listeners}
      tabIndex={isFocused ? 0 : -1}
    >
      <CardComponent
        card={card}
        isSelected={isSelected}
        isResult={isResult}
        isFocused={isFocused && showFocusOutline && !isDragActive}
        selectionDepth={isSelected ? selectionDepth : 0}
        onClick={() => {
          if (!isDragActive) onCardClick(card.id);
        }}
        size={cardSize}
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
  showFocusOutline: boolean;
  keyboardReorderActive: boolean;
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
  showFocusOutline,
  keyboardReorderActive,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const cardSize = isMobile ? 'small' : 'normal';

  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const slotRefs = useRef(new Map<string, HTMLElement>());
  const previousRects = useRef(new Map<string, DOMRect>());
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  useLayoutEffect(() => {
    const nextRects = new Map<string, DOMRect>();

    hand.forEach((card) => {
      const el = slotRefs.current.get(card.id);
      if (!el) return;

      const nextRect = el.getBoundingClientRect();
      const previousRect = previousRects.current.get(card.id);
      nextRects.set(card.id, nextRect);

      if (!previousRect) return;

      const deltaX = previousRect.left - nextRect.left;
      const deltaY = previousRect.top - nextRect.top;
      if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return;

      el.animate(
        [
          { transform: `translate(${deltaX}px, ${deltaY}px)` },
          { transform: 'translate(0, 0)' },
        ],
        {
          duration: 180,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
        }
      );
    });

    previousRects.current = nextRects;
  }, [hand]);

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

  // Pointer-first collisions make wrapped multi-row reordering feel natural on touch.
  const collisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;
    return closestCenter(args);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={cardIds} strategy={rectSortingStrategy}>
        <Box
          role="group"
          aria-label="Your Hand"
          sx={{
            display: 'flex',
            gap: { xs: 1, sm: 1.5 },
            alignItems: 'flex-end',
            justifyContent: 'center',
            flexWrap: 'wrap',        // allows multi-row on narrow screens
            padding: { xs: '6px 8px', sm: '8px 12px' },
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
              cardSize={cardSize}
              onCardClick={onCardClick}
              onFocusChange={onFocusChange}
              isShaking={isShaking}
              focusRef={(el) => {
                cardRefs.current[i] = el;
                if (el) {
                  slotRefs.current.set(card.id, el);
                } else {
                  slotRefs.current.delete(card.id);
                }
              }}
              isDragActive={isDragActive}
              showFocusOutline={showFocusOutline}
              isKeyboardReordering={keyboardReorderActive && i === focusedIndex}
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

      {/* Drag overlay — appears exactly where the grab started, stays in hand */}
      <DragOverlay
        modifiers={[restrictToParentElement]}
        dropAnimation={{ duration: 150, easing: 'ease-out' }}
        style={{ cursor: 'grabbing' }}
      >
        {activeCard ? (
          <Box sx={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.7))', lineHeight: 0 }}>
            <CardComponent
              card={activeCard}
              isSelected={selectedIds.has(activeCard.id)}
              isResult={activeCard.id === resultCard?.id}
              selectionDepth={selectedIds.has(activeCard.id) ? selectionDepth : 0}
              size={cardSize}
            />
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default Hand;
