// src/context/auth-context.tsx
"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, query, getDocs, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import type { Item } from '@/lib/data';
import { items as initialItems, type InstitutionID } from '@/lib/data';

interface AuthContextType {
  isVerified: boolean;
  verifiedInstitution: InstitutionID | null;
  setVerified: (isVerified: boolean, institution: InstitutionID | null) => void;
  items: Item[];
  addItem: (item: Omit<Item, 'id' | 'resolved' | 'userId'>) => Promise<void>;
  toggleItemResolved: (itemId: string) => void;
  userId: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getUserId = () => {
  if (typeof window !== 'undefined') {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('userId', userId);
    }
    return userId;
  }
  return '';
};


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerifiedState] = useState(false);
  const [verifiedInstitution, setVerifiedInstitution] = useState<InstitutionID | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Verification status from localStorage
    const storedStatus = localStorage.getItem('isVerified');
    const storedInstitution = localStorage.getItem('verifiedInstitution') as InstitutionID | null;
    if (storedStatus) {
      const isVerifiedParsed = JSON.parse(storedStatus);
      setIsVerifiedState(isVerifiedParsed);
      if(isVerifiedParsed && storedInstitution) {
        setVerifiedInstitution(storedInstitution);
      }
    }
    
    // User ID from localStorage
    setUserId(getUserId());
    
    // Set up real-time listener for items from Firestore
    const q = query(collection(db, "items"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const itemsData: Item[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        itemsData.push({ id: doc.id, ...doc.data() } as Item);
      });
      setItems(itemsData);
    }, (error) => {
      console.error("Error fetching items from Firestore:", error);
      // Fallback to local data if firestore fails
      setItems(initialItems);
    });

    // Seed initial data if collection is empty
    const seedData = async () => {
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        console.log("No items found in Firestore, seeding initial data...");
        initialItems.forEach(async (item) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...itemData } = item;
          try {
            await addDoc(collection(db, "items"), itemData);
          } catch (e) {
            console.error("Error adding document: ", e);
          }
        });
      }
    };

    seedData();

    // Cleanup subscription on unmount
    return () => unsubscribe();

  }, []);

  const setVerified = (status: boolean, institution: InstitutionID | null) => {
    localStorage.setItem('isVerified', JSON.stringify(status));
    setIsVerifiedState(status);
    if(status && institution) {
      localStorage.setItem('verifiedInstitution', institution);
      setVerifiedInstitution(institution);
    } else {
      localStorage.removeItem('verifiedInstitution');
      setVerifiedInstitution(null);
    }
  };

  const addItem = async (itemData: Omit<Item, 'id' | 'resolved' | 'userId'>) => {
    try {
      await addDoc(collection(db, "items"), {
        ...itemData,
        resolved: false,
        userId: getUserId(),
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const toggleItemResolved = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      const itemRef = doc(db, "items", itemId);
      try {
        await updateDoc(itemRef, {
          resolved: !item.resolved
        });
      } catch (e) {
        console.error("Error updating document: ", e);
      }
    }
  };

  const contextValue = useMemo(() => ({
    isVerified,
    verifiedInstitution,
    setVerified,
    items,
    addItem,
    toggleItemResolved,
    userId,
  }), [isVerified, verifiedInstitution, items, userId]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
