"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { DeleteButton } from "../components/ui/deleteButton";
import { db, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "../app/firebase.js";


const initialPeople = ["Roman", "Arturo", "Luis", "Sergio", "Juanma"];

export default function BreakfastTracker() {
  const [people, setPeople] = useState(initialPeople);
  const [history, setHistory] = useState([]);
  const [selectedPeople, setSelectedPeople] = useState(new Set(initialPeople));
  const [selectedPayer, setSelectedPayer] = useState(initialPeople[0]);
  const [selectedDate, setSelectedDate] = useState("");
  const [payments, setPayments] = useState({});
  const [invitations, setInvitations] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editPayer, setEditPayer] = useState("");
  const [editParticipants, setEditParticipants] = useState(new Set());

  const startEditing = (entry) => {
    setEditingId(entry.id);
    setEditPayer(entry.payer);
    setEditParticipants(new Set(entry.participants || []));
  };

  const saveEdit = async () => {
    const updatedEntry = {
      payer: editPayer,
      participants: Array.from(editParticipants)
    };

    try {
      await updateDoc(doc(db, "payments", editingId), updatedEntry);

      setHistory(prev =>
        prev.map(entry =>
          entry.id === editingId ? { ...entry, ...updatedEntry } : entry
        )
      );

      setEditingId(null);
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
    }
  };



  useEffect(() => {
    const fetchData = async () => {
      const paymentsSnap = await getDocs(collection(db, "payments"));
      let historyData = paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      historyData = historyData.sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split("/");
        const [dayB, monthB, yearB] = b.date.split("/");
      
        const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
        const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));
      
        return dateB - dateA;
      });
      
  
      setHistory(historyData);
  
      const paymentCount = {};
      const inviteCount = {};
  
      historyData.forEach(entry => {
        paymentCount[entry.payer] = (paymentCount[entry.payer] || 0) + 1;
        if (Array.isArray(entry.participants)) {
          entry.participants.forEach(person => {
            inviteCount[person] = (inviteCount[person] || 0) + 1;
          });
        }
      });
  
      setPayments(paymentCount);
      setInvitations(inviteCount);
    };
  
    fetchData();
  }, []); // Se mantiene [] como dependencia fija
  

  useEffect(() => {
    if (!history || history.length === 0 || selectedPeople.size === 0) return;
  
    const payerCounts = Array.from(selectedPeople).map(person => ({
      person,
      ratio: (payments[person] || 0) / Math.max(1, invitations[person] || 1), // Evita división por 0
    })).sort((a, b) => a.ratio - b.ratio);
  
    setSelectedPayer(payerCounts[0]?.person || Array.from(selectedPeople)[0]);
  }, [history.length, Object.keys(payments).length, selectedPeople]);
  
  
  

  const handleCheckboxChange = (name) => {
    setSelectedPeople((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date();
    return date.toLocaleDateString("es-ES"); // Formato DD/MM/YYYY
  };
  
  const recordPayment = async () => {
    if (selectedPeople.size === 0 || !selectedPayer) return;
    
    const newEntry = {
      date: formatDate(selectedDate),
      payer: selectedPayer,
      participants: Array.from(selectedPeople) || []
    };
  
    try {
      const docRef = await addDoc(collection(db, "payments"), newEntry);
      setHistory(prev => [{ id: docRef.id, ...newEntry }, ...prev].sort((a, b) => new Date(b.date.split("/").reverse().join("-")) - new Date(a.date.split("/").reverse().join("-"))));
  
      setPayments(prev => {
        const updated = { ...prev };
        updated[selectedPayer] = (updated[selectedPayer] || 0) + 1;
        return updated;
      });
  
      selectedPeople.forEach(person => {
        setInvitations(prev => {
          const updated = { ...prev };
          updated[person] = (updated[person] || 0) + 1;
          return updated;
        });
      });
    } catch (error) {
      console.error("Error al registrar el pago:", error);
    }
  };
  

  const deletePayment = async (id, payer, participants) => {
    await deleteDoc(doc(db, "payments", id));
    
    setHistory(prev => {
      const updatedHistory = prev.filter(entry => entry.id !== id);
      return [...updatedHistory];
    });
    
    setPayments(prev => {
      const updated = { ...prev };
      if (updated[payer]) {
        updated[payer] = Math.max(0, updated[payer] - 1);
      }
      return { ...updated };
    });
    
    if (Array.isArray(participants)) {
      setInvitations(prev => {
        const updated = { ...prev };
        participants.forEach(person => {
          if (updated[person]) {
            updated[person] = Math.max(0, updated[person] - 1);
          }
        });
        return { ...updated };
      });
    }
  };



  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-6 max-w-lg mx-auto space-y-4 md:max-w-xl lg:max-w-2xl text-center">
        <h1 className="text-2xl font-bold">Gestor de Desayunos ☕</h1>
        <Card>
          <CardContent className="p-4 space-y-2">
            <h2 className="text-lg font-semibold">Selecciona quién desayunó hoy:</h2>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {initialPeople.map((person) => (
                <label key={person} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedPeople.has(person)}
                    onCheckedChange={() => handleCheckboxChange(person)}
                  />
                  <span>{person}</span>
                </label>
              ))}
            </div>
            <h2 className="text-lg font-semibold mt-4">Selecciona la fecha del pago:</h2>
            <input
              type="date"
              className="w-full border p-2 rounded"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <h2 className="text-lg font-semibold mt-4">Recomendado para pagar hoy:</h2>
            <select
              className="w-full border p-2 rounded"
              value={selectedPayer}
              onChange={(e) => setSelectedPayer(e.target.value)}
            >
              {people.map((person) => (
                <option key={person} value={person}>{person}</option>
              ))}
            </select>
            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg" onClick={recordPayment}>
              Registrar Pago
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2">
            <h2 className="text-lg font-semibold">Pagos y desayunos totales</h2>
            <ul className="grid grid-cols-2 gap-4 text-center">
              {people.map((person) => (
                <li key={person} className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-black dark:text-white">
                  <strong>{person}</strong>
                  <div>Pagos: {payments[person] || 0}</div>
                  <div>Desayunos: {invitations[person] || 0}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>


        <Card>
          <CardContent className="p-4 space-y-2">
            <h2 className="text-lg font-semibold">Historial de Pagos</h2>
            <ul className="mt-2 space-y-1">
              {history.length === 0 ? (
                <li className="text-gray-500">No hay registros aún.</li>
              ) : (
                history.map((entry) => (
                  <li key={entry.id} className="border-b py-2 flex flex-col gap-1">
                    {editingId === entry.id ? (
                      <div className="space-y-2">
                        <select
                          value={editPayer}
                          onChange={(e) => setEditPayer(e.target.value)}
                          className="w-full border p-1 rounded"
                        >
                          {people.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                        <div className="flex flex-wrap gap-3">
                          {people.map((p) => (
                            <label key={p} className="flex items-center space-x-1">
                              <input
                                type="checkbox"
                                checked={editParticipants.has(p)}
                                onChange={() =>
                                  setEditParticipants((prev) => {
                                    const newSet = new Set(prev);
                                    newSet.has(p) ? newSet.delete(p) : newSet.add(p);
                                    return newSet;
                                  })
                                }
                              />
                              <span>{p}</span>
                            </label>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={saveEdit}>Guardar</Button>
                          <Button variant="outline" onClick={() => setEditingId(null)}>Cancelar</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span
                          onClick={() => startEditing(entry)}
                          className="cursor-pointer hover:underline text-left"
                        >
                          {(() => {
  const d = new Date(entry.date.split("/").reverse().join("-"));
  const dia = d.toLocaleDateString("es-ES", { weekday: "long" });
  const fecha = d.toLocaleDateString("es-ES");
  return `${dia.charAt(0).toUpperCase() + dia.slice(1)} ${fecha}`;
})()} -{" "}

                          <strong>{entry.payer}</strong> pagó por {entry.participants?.join(", ") || "(Sin datos)"}
                        </span>
                        <DeleteButton onClick={() => deletePayment(entry.id, entry.payer, entry.participants)} />
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}