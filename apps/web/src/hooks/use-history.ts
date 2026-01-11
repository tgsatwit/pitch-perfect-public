import { useState, useCallback, useRef } from 'react';

/**
 * A hook that provides undo/redo functionality for any state.
 * 
 * @param initialState The initial state to track
 * @returns Object containing current state, set state function, undo, redo, and can undo/redo flags
 */
export function useHistory<T>(initialState: T) {
  // Current state
  const [state, setState] = useState<T>(initialState);
  
  // History stacks
  const undoStack = useRef<T[]>([]);
  const redoStack = useRef<T[]>([]);
  
  // Current state setter that also updates history
  const updateState = useCallback((newState: T | ((prevState: T) => T)) => {
    setState(currentState => {
      // Determine the new state
      const nextState = typeof newState === 'function'
        ? (newState as ((prevState: T) => T))(currentState)
        : newState;
      
      // Only add to history if the state actually changed
      if (JSON.stringify(currentState) !== JSON.stringify(nextState)) {
        // Push current state to undo stack
        undoStack.current.push(currentState);
        // Clear redo stack since we're creating a new history branch
        redoStack.current = [];
      }
      
      return nextState;
    });
  }, []);
  
  // Undo function
  const undo = useCallback(() => {
    if (undoStack.current.length > 0) {
      // Get the previous state
      const previousState = undoStack.current.pop()!;
      // Save current state to redo stack
      redoStack.current.push(state);
      // Set state to previous state
      setState(previousState);
    }
  }, [state]);
  
  // Redo function
  const redo = useCallback(() => {
    if (redoStack.current.length > 0) {
      // Get the next state
      const nextState = redoStack.current.pop()!;
      // Save current state to undo stack
      undoStack.current.push(state);
      // Set state to next state
      setState(nextState);
    }
  }, [state]);
  
  // Determine if we can undo/redo
  const canUndo = undoStack.current.length > 0;
  const canRedo = redoStack.current.length > 0;
  
  return {
    state,
    setState: updateState,
    undo,
    redo,
    canUndo,
    canRedo
  };
} 