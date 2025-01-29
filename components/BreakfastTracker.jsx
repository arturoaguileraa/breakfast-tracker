"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { DeleteButton } from "../components/ui/deleteButton";

const initialPeople = ["Roman", "Arturo", "Luis", "Sergio"];

export default function BreakfastTracker() {
  const [people, setPeople] = useState(initialPeople);
  const [history, setHistory] = useState([]);
  const [selectedPeople, setSelectedPeople] = useState(new Set(initialPeople));
  const [selectedPayer, setSelectedPayer] = useState("");
  const [payments, setPayments] = useState({});
  const [invitations, setInvitations] = useState({});

  useEffect(() => {
    const savedHistory = localStorage.getItem("breakfastHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    const savedPayments = localStorage.getItem("payments");
    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    }
    const savedInvitations = localStorage.getItem("invitations");
    if (savedInvitations) {
      setInvitations(JSON.parse(savedInvitations));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("breakfastHistory", JSON.stringify(history));
    localStorage.setItem("payments", JSON.stringify(payments));
    localStorage.setItem("invitations", JSON.stringify(invitations));
  }, [history, payments, invitations]);

  useEffect(() => {
    const payerCounts = people.map(person => ({
      person,
      count: payments[person] || 0,
    })).sort((a, b) => a.count - b.count);
    setSelectedPayer(payerCounts[0]?.person || "");
  }, [history]);

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

  const recordPayment = () => {
    if (selectedPeople.size === 0 || !selectedPayer) return;
    const newHistory = [{
      date: new Date().toLocaleDateString(),
      payer: selectedPayer,
      participants: Array.from(selectedPeople) || []
    }, ...history];
    setHistory(newHistory);

    setPayments((prev) => ({
      ...prev,
      [selectedPayer]: (prev[selectedPayer] || 0) + 1,
    }));

    selectedPeople.forEach((person) => {
      setInvitations((prev) => ({
        ...prev,
        [person]: (prev[person] || 0) + 1,
      }));
    });
  };

  const deletePayment = (index) => {
    const entryToRemove = history[index];
    if (!entryToRemove) return;

    const newHistory = history.filter((_, i) => i !== index);
    setHistory(newHistory);

    setPayments((prev) => {
      const updatedPayments = { ...prev };
      if (updatedPayments[entryToRemove.payer]) {
        updatedPayments[entryToRemove.payer] = Math.max(0, updatedPayments[entryToRemove.payer] - 1);
      }
      return updatedPayments;
    });

    setInvitations((prev) => {
      const updatedInvitations = { ...prev };
      entryToRemove.participants.forEach((person) => {
        if (updatedInvitations[person]) {
          updatedInvitations[person] = Math.max(0, updatedInvitations[person] - 1);
        }
      });
      return updatedInvitations;
    });
  };

  const resetData = () => {
    localStorage.removeItem("breakfastHistory");
    localStorage.removeItem("payments");
    localStorage.removeItem("invitations");
  
    setHistory([]);
    setPayments({});
    setInvitations({});
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
                <li key={person} className="bg-gray-100 p-2 rounded-lg">
                  <strong>{person}</strong>
                  <div>Pagos: {payments[person] || 0}</div>
                  <div>Desayunos: {invitations[person] || 0}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold">Historial de Pagos</h2>
            <ul className="mt-2 space-y-1">
              {history.length === 0 ? (
                <li className="text-gray-500">No hay registros aún.</li>
              ) : (
                history.map((entry, index) => (
                  <li key={index} className="border-b py-1 flex justify-between items-center">
                    <span>{entry.date} - <strong>{entry.payer}</strong> pagó por {entry.participants ? entry.participants.join(", ") : "(Sin datos)"}</span>
                    <DeleteButton onClick={() => deletePayment(index)} />
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
        {/* <Card>
            <CardContent className="p-4">
                <h2 className="text-lg font-semibold">Resetear Todo</h2>
                <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
                onClick={resetData}
                >
                Resetear Datos
                </Button>
            </CardContent>
        </Card> */}

      </div>
    </div>
  );
}