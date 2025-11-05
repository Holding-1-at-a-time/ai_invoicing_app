"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  setPersistence,
  inMemoryPersistence,
  signInWithCustomToken
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  where,
  Timestamp,
  setLogLevel
} from 'firebase/firestore';

// --- Icon Components ---
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
  </svg>
);

const XMarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
  </svg>
);

const PaperAirplaneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path d="M3.105 3.105a.75.75 0 0 1 .815-.17l14 4.5a.75.75 0 0 1 0 1.34l-14 4.5a.75.75 0 0 1-.98-.655V4.31a.75.75 0 0 1 .165-.475Z" />
    <path d="M3 3.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-13Z" />
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M10 2.5c.384 0 .737.04.99.082.253.042.486.11.688.2a.75.75 0 0 1 .06 1.483 4.953 4.953 0 0 0-.688-.2 5.012 5.012 0 0 0-.99-.082c-.384 0-.737.04-.99.082a4.953 4.953 0 0 0-.688.2.75.75 0 1 1 .06-1.483c.202-.09.435-.158.688-.2.253-.042.606-.082.99-.082ZM8.04 4.524a.75.75 0 0 1 1.047.51l.23 1.137a.75.75 0 0 1-1.442.29l-.23-1.137a.75.75 0 0 1 .4-1.001Zm4.322.51a.75.75 0 0 1 .4 1.001l-.23 1.137a.75.75 0 0 1-1.442-.29l.23-1.137a.75.75 0 0 1 1.045-.51Z" clipRule="evenodd" />
    <path d="M3.161 6.36a.75.75 0 0 1 .53 0l1.414 1.414a.75.75 0 0 1-1.06 1.06L2.63 7.42a.75.75 0 0 1 0-1.061Z" />
    <path d="M16.84 6.36a.75.75 0 0 1 0 1.06l-1.415 1.414a.75.75 0 1 1-1.06-1.06l1.414-1.414a.75.75 0 0 1 .531 0Z" />
    <path d="M17.25 10a.75.75 0 0 1-1.5 0 5.012 5.012 0 0 0-.082-.99 4.953 4.953 0 0 0-.2-.688.75.75 0 1 1 1.483.06 4.953 4.953 0 0 0 .2.688 5.012 5.012 0 0 0 .082.99ZM2.75 10a.75.75 0 0 1 1.5 0c0 .384.04.737.082.99.042.253.11.486.2.688a.75.75 0 1 1-1.483-.06 4.953 4.953 0 0 0-.2-.688A5.012 5.012 0 0 0 2.75 10Z" />
    <path d="M10 17.25c.384 0 .737-.04.99-.082.253-.042.486-.11.688-.2a.75.75 0 1 1 .06 1.483 4.953 4.953 0 0 0-.688.2 5.012 5.012 0 0 0-.99.082c-.384 0-.737-.04-.99-.082a4.953 4.953 0 0 0-.688-.2.75.75 0 1 1 .06-1.483c.202-.09.435-.158.688-.2.253-.042.606-.082.99-.082Z" />
    <path d="M11.96 15.476a.75.75 0 0 1-1.047-.51l-.23-1.137a.75.75 0 1 1 1.442-.29l.23 1.137a.75.75 0 0 1-.4.1Z" />
    <path d="M7.79 14.966a.75.75 0 0 1-.4-1.001l.23-1.137a.75.75 0 1 1 1.442.29l-.23 1.137a.75.75 0 0 1-1.045.51Z" />
    <path d="M17.37 12.58a.75.75 0 0 1 0 1.06l-1.414 1.414a.75.75 0 1 1-1.06-1.06l1.414-1.414a.75.75 0 0 1 1.06 0Z" />
    <path d="M2.63 12.58a.75.75 0 0 1 1.06 0l1.414 1.414a.75.75 0 0 1-1.06 1.06L2.63 13.64a.75.75 0 0 1 0-1.06Z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75V4.5h8V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 0a4.25 4.25 0 0 0-4.25 4.25V4.5h8.5V4.25A4.25 4.25 0 0 0 10 0ZM4.5 5.5a.75.75 0 0 0 0 1.5h11a.75.75 0 0 0 0-1.5h-11ZM5 8.25a.75.75 0 0 0 .75.75h8.5a.75.75 0 0 0 .75-.75V15a2.25 2.25 0 0 1-2.25 2.25h-5A2.25 2.25 0 0 1 5 15V8.25ZM6.5 8.25v6.75A.75.75 0 0 0 7.25 15h5a.75.75 0 0 0 .75-.75V8.25h-6.5Z" clipRule="evenodd" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
  </svg>
);

const ExclamationCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
  </svg>
);

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5ZM3.25 4.5a.75.75 0 0 0-.75.75v9.5c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-9.5a.75.75 0 0 0-.75-.75H3.25Z" clipRule="evenodd" />
    <path d="M10 6.75a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0v-5.5a.75.75 0 0 1 .75-.75Z" />
    <path d="M7.5 10a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75Z" />
    <path fillRule="evenodd" d="M6.25 10a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM7.75 10a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0Z" clipRule="evenodd" />
  </svg>
);


// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

if (!process.env.NEXT_PUBLIC_APP_ID) {
  throw new Error('NEXT_PUBLIC_APP_ID environment variable is required');
}
const appId = process.env.NEXT_PUBLIC_APP_ID;

// Initialize Firebase
let app;
let auth;
let db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  setLogLevel('debug');
  setPersistence(auth, inMemoryPersistence);
} catch (e) {
  console.error("Firebase initialization error:", e);
}

// --- Main App Component ---
export default function App() {
  const [userId, setUserId] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [reminderText, setReminderText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [invoicesCollectionPath, setInvoicesCollectionPath] = useState(null);

  // --- Authentication Effect ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        const initialAuthToken = process.env.NEXT_PUBLIC_INITIAL_AUTH_TOKEN;
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Firebase auth error:", error);
      }
    };

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        setUserId(uid);
        // Ensure proper user data isolation with validated appId
        const validatedAppId = process.env.NEXT_PUBLIC_APP_ID || 'default-app-id';
        setInvoicesCollectionPath(`/artifacts/${validatedAppId}/users/${uid}/invoices`);
      } else {
        setUserId(null);
        setInvoicesCollectionPath(null);
      }
      setIsAuthReady(true);
    });

    initAuth();
    return () => unsub();
  }, []);

  // --- Firestore Snapshot Listener Effect ---
  useEffect(() => {
    if (!isAuthReady || !invoicesCollectionPath) {
      setIsLoading(false);
      return;
    };

    setIsLoading(true);
    const q = query(collection(db, invoicesCollectionPath));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const invoicesData = [];
      querySnapshot.forEach((doc) => {
        invoicesData.push({ id: doc.id, ...doc.data() });
      });
      setInvoices(invoicesData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching invoices:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthReady, userId, invoicesCollectionPath]);

  // --- Invoice Calculations ---
  const invoiceSummary = useMemo(() => {
    const now = new Date();
    let totalOutstanding = 0;
    let totalOverdue = 0;
    let paidLast30Days = 0;

    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    invoices.forEach(invoice => {
      const status = getInvoiceStatus(invoice, new Date());
      if (status === 'Pending' || status === 'Overdue') {
        totalOutstanding += parseFloat(invoice.amount || 0);
      }
      if (status === 'Overdue') {
        totalOverdue += parseFloat(invoice.amount || 0);
      }
      if (status === 'Paid') {
        const paidDate = invoice.paidAt?.toDate();
        if (paidDate && paidDate > thirtyDaysAgo) {
          paidLast30Days += parseFloat(invoice.amount || 0);
        }
      }
    });
    return { totalOutstanding, totalOverdue, paidLast30Days };
  }, [invoices]);

  // --- Event Handlers ---
  const handleCreateInvoice = async (invoiceData) => {
    if (!invoicesCollectionPath) return;
    try {
      await addDoc(collection(db, invoicesCollectionPath), {
        ...invoiceData,
        amount: parseFloat(invoiceData.amount),
        dueDate: Timestamp.fromDate(new Date(invoiceData.dueDate)),
        createdAt: Timestamp.now(),
        status: 'Pending'
      });
      setShowInvoiceModal(false);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const updateInvoiceStatus = async (id, status) => {
    if (!invoicesCollectionPath) return;
    const invoiceRef = doc(db, invoicesCollectionPath, id);
    try {
      await updateDoc(invoiceRef, {
        status: status,
        paidAt: status === 'Paid' ? Timestamp.now() : null
      });
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!invoicesCollectionPath) return;
    const invoiceRef = doc(db, invoicesCollectionPath, id);
    try {
      await deleteDoc(invoiceRef);
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };

  const handleOpenReminderModal = (invoice) => {
    setCurrentInvoice(invoice);
    setReminderText('');
    setShowReminderModal(true);
  };

  // --- Gemini API Call ---
  const generateReminder = async () => {
    if (!currentInvoice) return;

    setIsGenerating(true);
    setReminderText('');

    const systemPrompt = "You are a friendly but professional assistant for an auto detailing business. Write a polite payment reminder email. The customer's name is {customerName}. The invoice is for {service} for ${amount}, and was due on {dueDate}. Keep it short and friendly, but clear.";
    const userQuery = systemPrompt
      .replace('{customerName}', currentInvoice.customerName)
      .replace('{service}', currentInvoice.serviceDescription)
      .replace('{amount}', currentInvoice.amount.toFixed(2))
      .replace('{dueDate}', currentInvoice.dueDate.toDate().toLocaleDateString());

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`API request failed: ${response.status}`);

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        setReminderText(text);
      } else {
        setReminderText("Sorry, I couldn't generate a reminder. Please try again.");
      }
    } catch (e) {
      console.error("Error generating reminder:", e);
      setReminderText(`Error: ${e.message}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Render ---
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Authenticating...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            AI Invoicing <span className="text-blue-600">Dashboard</span>
          </h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowChatModal(true)}
              className="px-4 py-2 rounded-md bg-gray-700 text-white text-sm font-medium hover:bg-gray-800 flex items-center space-x-2"
            >
              <SparklesIcon />
              <span>✨ Ask AI Analyst</span>
            </button>
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center space-x-2"
            >
              <PlusIcon />
              <span>New Invoice</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* --- Summary Cards --- */}
        <SummaryCards summary={invoiceSummary} />

        {/* --- Invoices Table --- */}
        <div className="mt-8 bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">All Invoices</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your customer invoices.</p>
          </div>
          <div className="border-t border-gray-200">
            {isLoading ? (
              <div className="text-center p-8 text-gray-500">Loading invoices...</div>
            ) : invoices.length === 0 ? (
              <div className="text-center p-8 text-gray-500">No invoices found. Create one to get started!</div>
            ) : (
              <InvoiceTable
                invoices={invoices}
                onUpdateStatus={updateInvoiceStatus}
                onDelete={handleDeleteInvoice}
                onSendReminder={handleOpenReminderModal}
              />
            )}
          </div>
        </div>
      </main>

      {/* --- Modals --- */}
      {showInvoiceModal && (
        <InvoiceFormModal
          onClose={() => setShowInvoiceModal(false)}
          onSubmit={handleCreateInvoice}
        />
      )}
      {showReminderModal && (
        <ReminderModal
          invoice={currentInvoice}
          reminderText={reminderText}
          isGenerating={isGenerating}
          onClose={() => setShowReminderModal(false)}
          onGenerate={generateReminder}
        />
      )}
      {showChatModal && (
        <ChatModal
          invoices={invoices}
          summary={invoiceSummary}
          onClose={() => setShowChatModal(false)}
        />
      )}
    </div>
  );
}

// --- Summary Cards Component ---
function SummaryCards({ summary }) {
  const formatCurrency = (value) => `$${value.toFixed(2)}`;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Outstanding</dt>
                <dd className="text-3xl font-semibold text-gray-900">{formatCurrency(summary.totalOutstanding)}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Overdue</dt>
                <dd className="text-3xl font-semibold text-red-600">{formatCurrency(summary.totalOverdue)}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Paid (Last 30d)</dt>
                <dd className="text-3xl font-semibold text-green-600">{formatCurrency(summary.paidLast30Days)}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Invoice Table Component ---
function InvoiceTable({ invoices, onUpdateStatus, onDelete, onSendReminder }) {
  const now = new Date();
  const sortedInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
  }, [invoices]);

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {sortedInvoices.map(invoice => (
          <InvoiceRow
            key={invoice.id}
            invoice={invoice}
            status={getInvoiceStatus(invoice, now)}
            onUpdateStatus={onUpdateStatus}
            onDelete={onDelete}
            onSendReminder={onSendReminder}
          />
        ))}
      </tbody>
    </table>
  );
}

// --- Invoice Row Component ---
function InvoiceRow({ invoice, status, onUpdateStatus, onDelete, onSendReminder }) {
  const statusColors = {
    Paid: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Overdue: 'bg-red-100 text-red-800',
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{invoice.customerName}</div>
        <div className="text-sm text-gray-500">{invoice.customerEmail}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 truncate max-w-xs">{invoice.serviceDescription}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">${invoice.amount.toFixed(2)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {invoice.dueDate.toDate().toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status]}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
        {status !== 'Paid' && (
          <button onClick={() => onUpdateStatus(invoice.id, 'Paid')} className="text-green-600 hover:text-green-900">Mark Paid</button>
        )}
        {status === 'Overdue' && (
          <button onClick={() => onSendReminder(invoice)} className="text-yellow-600 hover:text-yellow-900">✨ AI Reminder</button>
        )}
        <button onClick={() => onDelete(invoice.id)} className="text-red-600 hover:text-red-900">
          <TrashIcon className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
}

// --- Invoice Form Modal ---
function InvoiceFormModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    serviceDescription: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
  });
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);
  const [showServiceGenModal, setShowServiceGenModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleDescriptionGenerated = (description) => {
    setFormData(prev => ({ ...prev, serviceDescription: description }));
    setShowServiceGenModal(false);
  };

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const base64ImageData = await toBase64(file);
      await extractReceiptData(base64ImageData.split(',')[1]);
    } catch (err) {
      console.error("Error scanning receipt:", err);
      console.error("Error scanning receipt. Please try again or enter manually.");
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const extractReceiptData = async (base64ImageData) => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const prompt = "Analyze this receipt image. Extract 'serviceDescription' (e.g., vendor name or main items), 'amount' (the total, as a number), and 'date' (in YYYY-MM-DD format). Respond ONLY with a JSON object containing these fields. If a field is not found, set its value to null.";

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/png",
                data: base64ImageData
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            serviceDescription: { type: "STRING" },
            amount: { type: "NUMBER" },
            date: { type: "STRING" }
          }
        }
      }
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {

        const jsonText = result.candidates[0].content.parts[0].text;
        const parsedData = JSON.parse(jsonText);

        setFormData(prev => ({
          ...prev,
          serviceDescription: parsedData.serviceDescription || prev.serviceDescription,
          amount: parsedData.amount || prev.amount,
          dueDate: parsedData.date || prev.dueDate,
        }));

      } else {
        throw new Error("Invalid response structure from AI.");
      }

    } catch (e) {
      console.error("Error processing receipt:", e);
      console.error("AI could not read the receipt. Please enter the details manually.");
    }
  };


  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto bg-gray-500 bg-opacity-75">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative" role="dialog" aria-modal="true">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <XMarkIcon />
            </button>
            <h3 className="text-lg font-medium text-gray-900">New Invoice</h3>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={handleScanClick}
              disabled={isScanning}
              className="w-full mt-4 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center justify-center space-x-2 disabled:bg-gray-400"
            >
              <CameraIcon />
              <span>{isScanning ? 'Scanning Receipt...' : '✨ Scan Receipt with Camera'}</span>
            </button>

            {isScanning && (
              <div className="text-center text-sm text-gray-500 mt-2">Please wait...</div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Customer Name</label>
                <input type="text" name="customerName" id="customerName" value={formData.customerName} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">Customer Email</label>
                <input type="email" name="customerEmail" id="customerEmail" value={formData.customerEmail} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
              </div>

              {/* --- MODIFIED SERVICE DESCRIPTION FIELD --- */}
              <div>
                <div className="flex justify-between items-center">
                  <label htmlFor="serviceDescription" className="block text-sm font-medium text-gray-700">Service Description</label>
                  <button
                    type="button"
                    onClick={() => setShowServiceGenModal(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    <span>✨ Generate</span>
                  </button>
                </div>
                <textarea
                  name="serviceDescription"
                  id="serviceDescription"
                  value={formData.serviceDescription}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              {/* --- END MODIFIED FIELD --- */}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                  <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} required min="0.01" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input type="date" name="dueDate" id="dueDate" value={formData.dueDate} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-white text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* --- New Service Gen Modal --- */}
      {showServiceGenModal && (
        <ServiceGenModal
          onClose={() => setShowServiceGenModal(false)}
          onGenerate={handleDescriptionGenerated}
        />
      )}
    </>
  );
}

// --- NEW COMPONENT: AI Service Description Modal ---
function ServiceGenModal({ onClose, onGenerate }) {
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateClick = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setGeneratedText('');

    const systemPrompt = "You are an expert auto detailer. Write a professional, itemized service description for a customer invoice based on the user's request. Be concise, clear, and professional. Aim for 2-4 line items.";
    const userQuery = `Generate an invoice service description for: ${prompt}`;

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`API request failed: ${response.status}`);

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        setGeneratedText(text);
      } else {
        setGeneratedText("Sorry, I couldn't generate a description. Please try again.");
      }
    } catch (e) {
      console.error("Error generating description:", e);
      setGeneratedText(`Error: ${e.message}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseDescription = () => {
    onGenerate(generatedText);
  };

  return (
    <div className="fixed inset-0 z-20 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative" role="dialog" aria-modal="true">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <XMarkIcon />
          </button>
          <div className="flex items-center space-x-3">
            <span className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
              <SparklesIcon className="h-6 w-6 text-blue-600" />
            </span>
            <h3 className="text-lg font-medium text-gray-900">✨ AI Service Description</h3>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">Enter a simple service (e.g. "full detail suv")</label>
              <input
                type="text"
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <button
              onClick={handleGenerateClick}
              disabled={isGenerating || !prompt}
              className="w-full px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center justify-center disabled:bg-gray-400"
            >
              <SparklesIcon className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Description'}
            </button>

            {generatedText && (
              <div className="space-y-4">
                <textarea
                  readOnly
                  value={generatedText}
                  rows="5"
                  className="w-full p-3 rounded-md border-gray-300 shadow-sm bg-gray-50 text-sm text-gray-800"
                ></textarea>
                <button
                  onClick={handleUseDescription}
                  className="w-full px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700"
                >
                  Use This Description
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- AI Reminder Modal ---
function ReminderModal({ invoice, reminderText, isGenerating, onClose, onGenerate }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Uses document.execCommand for iFrame compatibility
    const textarea = document.createElement('textarea');
    textarea.value = reminderText;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
    document.body.removeChild(textarea);
  };

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative" role="dialog" aria-modal="true">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <XMarkIcon />
          </button>
          <div className="flex items-center space-x-3">
            <span className="flex-shrink-0 bg-yellow-100 p-2 rounded-full">
              <SparklesIcon className="h-6 w-6 text-yellow-600" />
            </span>
            <h3 className="text-lg font-medium text-gray-900">✨ AI Payment Reminder</h3>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Generate a polite, professional follow-up email for {invoice.customerName} regarding invoice #{invoice.id.substring(0, 6)}.
          </p>

          <div className="mt-6">
            {!reminderText && !isGenerating && (
              <button
                onClick={onGenerate}
                className="w-full px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center justify-center"
              >
                <SparklesIcon />
                <span className="ml-2">Generate Reminder</span>
              </button>
            )}

            {isGenerating && (
              <div className="text-center p-4 rounded-md bg-gray-50 text-gray-600">
                Generating AI reminder...
              </div>
            )}

            {reminderText && (
              <div className="space-y-4">
                <textarea
                  readOnly
                  value={reminderText}
                  rows="10"
                  className="w-full p-3 rounded-md border-gray-300 shadow-sm bg-gray-50 text-sm text-gray-800"
                ></textarea>
                <button
                  onClick={handleCopy}
                  className="w-full px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700"
                >
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- AI Chat Modal ---
function ChatModal({ invoices, summary, onClose }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isThinking) return;

    const userMessage = { role: 'user', text: message };
    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setIsThinking(true);

    // Prepare data context
    const invoicesContext = invoices.map(inv => ({
      id: inv.id.substring(0, 6),
      status: getInvoiceStatus(inv, new Date()),
      amount: inv.amount,
      customer: inv.customerName,
      due: inv.dueDate.toDate().toLocaleDateString()
    }));

    const context = `
      Current Summary:
      - Total Outstanding: $${summary.totalOutstanding.toFixed(2)}
      - Total Overdue: $${summary.totalOverdue.toFixed(2)}
      - Paid (Last 30d): $${summary.paidLast30Days.toFixed(2)}
      
      All Invoices (${invoices.length} total):
      ${JSON.stringify(invoicesContext, null, 2)}
    `;

    const systemPrompt = "You are a helpful business analyst for an auto detailer. Your name is 'Dash'. Answer questions based *only* on the provided JSON data and summary. Be friendly and concise. Do not make up information. If the user asks for data you don't have (e.g., 'who is my best customer?'), explain that you can only see invoice totals and statuses.";
    const userQuery = `
      CONTEXT:
      ${context}
      
      USER QUESTION:
      ${message}
    `;

    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`API request failed: ${response.status}`);

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        setChatHistory(prev => [...prev, { role: 'model', text }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'model', text: "Sorry, I had trouble thinking of a response." }]);
      }
    } catch (e) {
      console.error("Error in chat:", e);
      setChatHistory(prev => [...prev, { role: 'model', text: `Sorry, an error occurred: ${e.message}` }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-white rounded-lg shadow-xl p-0 w-full max-w-lg relative flex flex-col" style={{ height: '70vh' }} role="dialog" aria-modal="true">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              <span className="flex-shrink-0 bg-gray-700 p-2 rounded-full">
                <SparklesIcon className="h-5 w-5 text-white" />
              </span>
              <h3 className="text-lg font-medium text-gray-900">✨ AI Business Analyst</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center text-gray-500 p-4">
                Hi! I'm Dash. Ask me questions about your invoice data, like "How much is overdue?" or "Do I have any pending invoices for Jane Doe?"
              </div>
            )}
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-lg max-w-xs ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="p-3 rounded-lg bg-gray-100 text-gray-500">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about your invoices..."
              className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              disabled={isThinking}
            />
            <button
              type="submit"
              className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
              disabled={isThinking || !message.trim()}
            >
              <PaperAirplaneIcon />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- Utility Functions ---
function getInvoiceStatus(invoice, now) {
  if (invoice.status === 'Paid') return 'Paid';
  const dueDate = invoice.dueDate.toDate();
  if (dueDate < now) return 'Overdue';
  return 'Pending';
}