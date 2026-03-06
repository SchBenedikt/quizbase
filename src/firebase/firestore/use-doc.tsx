'use client';
    
import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/**
 * React hook to subscribe to a single Firestore document in real-time.
 * Handles nullable references.
 * 
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery or BAD THINGS WILL HAPPEN
 * use useMemo to memoize it per React guidence.  Also make sure that it's dependencies are stable
 * references
 *
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {DocumentReference<DocumentData> | null | undefined} docRef -
 * The Firestore DocumentReference. Waits if null/undefined.
 * @returns {UseDocResult<T>} Object with data, isLoading, error.
 */
export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedDocRef) {
      console.log('[useDoc] No document reference provided');
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    console.log('[useDoc] Setting up listener for:', memoizedDocRef.path);
    setIsLoading(true);
    setError(null);
    // Optional: setData(null); // Clear previous data instantly

    let unsubscribe: (() => void) | null = null;
    let isSubscribed = true;

    const setupListener = () => {
      if (!isSubscribed || !memoizedDocRef) return;
      
      unsubscribe = onSnapshot(
        memoizedDocRef,
        (snapshot: DocumentSnapshot<DocumentData>) => {
          if (!isSubscribed) return;
          
          if (snapshot.exists()) {
            console.log('[useDoc] Document exists:', {
              path: memoizedDocRef.path,
              id: snapshot.id,
              hasData: !!snapshot.data()
            });
            setData({ ...(snapshot.data() as T), id: snapshot.id });
          } else {
            console.log('[useDoc] Document does not exist:', memoizedDocRef.path);
            // Document does not exist - this is normal, not an error
            setData(null);
          }
          setError(null); // Clear any previous error on successful snapshot (even if doc doesn't exist)
          setIsLoading(false);
        },
        (error: FirestoreError) => {
          if (!isSubscribed) return;
          
          console.error('[useDoc] Firestore error:', {
            path: memoizedDocRef.path,
            code: error.code,
            message: error.message
          });
          
          const contextualError = new FirestorePermissionError({
            operation: 'get',
            path: memoizedDocRef.path,
          })

          setError(contextualError)
          setData(null)
          setIsLoading(false)

          // trigger global error propagation
          errorEmitter.emit('permission-error', contextualError);
        }
      );
    };

    setupListener();

    return () => {
      console.log('[useDoc] Cleaning up listener for:', memoizedDocRef.path);
      isSubscribed = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [memoizedDocRef]); // Re-run if the memoizedDocRef changes.

  return { data, isLoading, error };
}